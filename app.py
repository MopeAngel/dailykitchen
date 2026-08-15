"""
================================================================================
HEALTHY RECIPE AI — FLASK BACKEND
================================================================================
Architecture:
  Frontend (HTML + JS)
      ↓ POST /api/recommend-recipes
  Flask Backend
      ↓ 1. Load Kaggle 64k dataset (prashantsingh001/recipes-dataset-64k-dishes)
      ↓ 2. Candidate filtering by ingredient overlap (Python / pandas)
      ↓ 3. Hard-remove allergen violations
      ↓ 4. Hard-remove special-request violations
      ↓ 5. Calculate exact match percentage per candidate
      ↓ 6. Take top 20 candidates → send to OpenAI
      ↓ 7. OpenAI ranks, selects best 5, writes explanation
      ↓ 8. Backend enriches with full dataset row data
      ↓ 9. Return 5 structured recipe objects to frontend
================================================================================

AI API Key setup:
  1. Copy .env.example to .env
  2. Set OPENAI_API_KEY=your_key_here
  3. Get an API key at https://platform.openai.com/api-keys

Run:
  python app.py
  → Starts on http://localhost:5000
================================================================================
"""

import os
import re
import ast
import json
import logging

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import kagglehub
from dotenv import load_dotenv

# ── Load environment variables ──────────────────────────────────────────────
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# ── OpenAI client setup ───────────────────────────────────────────────────
openai_client = None
if OPENAI_API_KEY:
    try:
        from openai import OpenAI
        openai_client = OpenAI(api_key=OPENAI_API_KEY)
        print("[SUCCESS] OpenAI initialized successfully.")
    except Exception as e:
        print(f"[WARNING] OpenAI initialization failed: {e}")
        print("   Recommendations will use dataset-only ranking (no AI explanation).")
else:
    print("[WARNING] No OPENAI_API_KEY found in .env - AI ranking disabled.")
    print("   Set OPENAI_API_KEY in your .env file to enable real AI.")

# ── Flask app setup ──────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── Load Kaggle dataset ──────────────────────────────────────────────────────
print("[INFO] Downloading / locating Kaggle dataset...")
try:
    dataset_path = kagglehub.dataset_download("prashantsingh001/recipes-dataset-64k-dishes")
    csv_path = os.path.join(dataset_path, "1_Recipe_csv.csv")
    print(f"[INFO] Dataset path: {csv_path}")

    df = pd.read_csv(csv_path)
    print(f"[SUCCESS] Loaded {len(df)} recipes from Kaggle dataset.")
except Exception as e:
    print(f"[ERROR] Failed to load dataset: {e}")
    df = pd.DataFrame()

# ── Parse ingredient / direction columns ────────────────────────────────────
def _parse_list_col(val):
    """Convert a stringified list like "['a', 'b']" into an actual list."""
    if isinstance(val, list):
        return val
    if isinstance(val, str):
        try:
            result = ast.literal_eval(val)
            if isinstance(result, list):
                return result
        except Exception:
            pass
        # Fallback: split by common delimiters
        return [s.strip() for s in re.split(r"[,;]", val) if s.strip()]
    return []

if not df.empty:
    df["ingredients_list"] = df["ingredients"].apply(_parse_list_col)
    df["directions_list"] = df["directions"].apply(_parse_list_col)
    df["recipe_title"] = df["recipe_title"].fillna("Unknown Recipe")
    df["category"] = df["category"].fillna("General") if "category" in df.columns else "General"
    df["description"] = df["description"].fillna("") if "description" in df.columns else ""
    # Reset index for reliable .iloc access
    df = df.reset_index(drop=True)

# ── Normalization helpers ────────────────────────────────────────────────────
_IND_TO_ENG = {
    "ayam": "chicken", "telur": "egg", "bayam": "spinach", "tahu": "tofu",
    "tempe": "tempeh", "tomat": "tomato", "brokoli": "broccoli",
    "bawang putih": "garlic", "bawang merah": "onion", "salmon": "salmon",
    "alpukat": "avocado", "wortel": "carrot", "beras merah": "brown rice",
    "oatmeal": "oat", "oat": "oat", "jamur": "mushroom", "keju": "cheese",
    "udang": "shrimp", "kentang": "potato", "lemon": "lemon",
    "daging sapi": "beef", "sapi": "beef", "susu": "milk",
    "biji chia": "chia", "chia": "chia", "madu": "honey",
    "apel": "apple", "cabai": "chili", "cabe": "chili", "quinoa": "quinoa",
    "kacang tanah": "peanut", "kacang": "peanut",
    "udang": "shrimp", "ikan": "fish", "kepiting": "crab", "lobster": "lobster",
}

# Allergen synonyms — maps common names to ingredient keywords to block
_ALLERGEN_SYNONYMS = {
    "peanut": ["peanut", "groundnut", "kacang tanah", "kacang"],
    "peanuts": ["peanut", "groundnut", "kacang tanah", "kacang"],
    "shrimp": ["shrimp", "prawn", "udang"],
    "shellfish": ["shrimp", "prawn", "crab", "lobster", "clam", "oyster", "udang", "kepiting"],
    "seafood": ["shrimp", "prawn", "crab", "lobster", "fish", "salmon", "tuna", "cod", "halibut",
                "udang", "ikan", "kepiting"],
    "fish": ["fish", "salmon", "tuna", "cod", "tilapia", "ikan"],
    "milk": ["milk", "dairy", "cream", "butter", "cheese", "yogurt", "susu", "keju"],
    "dairy": ["milk", "dairy", "cream", "butter", "cheese", "yogurt", "susu", "keju"],
    "egg": ["egg", "telur"],
    "eggs": ["egg", "telur"],
    "gluten": ["wheat", "flour", "bread", "pasta", "gluten", "terigu"],
    "wheat": ["wheat", "flour", "bread", "pasta", "terigu"],
    "soy": ["soy", "tofu", "tempeh", "tahu", "tempe", "edamame"],
    "nuts": ["walnut", "almond", "cashew", "pecan", "pistachio", "hazelnut", "macadamia",
             "kacang"],
    "tree nuts": ["walnut", "almond", "cashew", "pecan", "pistachio", "hazelnut", "macadamia"],
}

# Special request keyword groups — maps to ingredient / title keywords to block
_SPECIAL_REQUEST_BLOCKS = {
    "no fried": {
        "title_keywords": ["fried", "fry", "goreng", "deep fry"],
        "ingredient_keywords": [],
    },
    "no deep fried": {
        "title_keywords": ["fried", "fry", "goreng", "deep fry"],
        "ingredient_keywords": [],
    },
    "no frying": {
        "title_keywords": ["fried", "fry", "goreng"],
        "ingredient_keywords": [],
    },
    "tidak mau gorengan": {
        "title_keywords": ["fried", "fry", "goreng"],
        "ingredient_keywords": [],
    },
    "vegetarian": {
        "title_keywords": [],
        "ingredient_keywords": ["chicken", "beef", "pork", "lamb", "fish", "salmon", "tuna",
                                "shrimp", "prawn", "crab", "meat", "bacon", "ham",
                                "ayam", "sapi", "babi", "ikan", "udang"],
    },
    "vegan": {
        "title_keywords": [],
        "ingredient_keywords": ["chicken", "beef", "pork", "lamb", "fish", "salmon", "tuna",
                                "shrimp", "prawn", "crab", "meat", "bacon", "ham",
                                "milk", "dairy", "cream", "butter", "cheese", "yogurt",
                                "egg", "telur", "susu", "keju"],
    },
    "no seafood": {
        "title_keywords": [],
        "ingredient_keywords": ["shrimp", "prawn", "crab", "lobster", "fish", "salmon", "tuna",
                                "cod", "tilapia", "udang", "ikan", "kepiting"],
    },
    "tidak mau seafood": {
        "title_keywords": [],
        "ingredient_keywords": ["shrimp", "prawn", "crab", "lobster", "fish", "salmon", "tuna",
                                "udang", "ikan"],
    },
    "no spicy": {
        "title_keywords": ["spicy", "pedas", "hot"],
        "ingredient_keywords": ["chili", "jalapeno", "habanero", "cayenne", "sriracha",
                                "cabai", "cabe"],
    },
    "tidak mau pedas": {
        "title_keywords": ["spicy", "pedas"],
        "ingredient_keywords": ["chili", "jalapeno", "cabai", "cabe"],
    },
}


def normalize_ingredient(word: str) -> str:
    """Lowercase + strip + map Indonesian synonyms."""
    w = word.lower().strip()
    w = _IND_TO_ENG.get(w, w)
    # Remove trailing 's' for basic plural handling
    if w.endswith("s") and len(w) > 3:
        singular = w[:-1]
        if singular in _IND_TO_ENG.values():
            w = singular
    return w


def extract_allergen_keywords(allergies: list) -> list:
    """Expand allergy names to the ingredient keywords to block."""
    blocked = []
    for a in allergies:
        a_lower = a.lower().strip()
        # Check synonym map first
        expanded = _ALLERGEN_SYNONYMS.get(a_lower)
        if expanded:
            blocked.extend(expanded)
        else:
            # Fall back to the raw normalized word
            blocked.append(normalize_ingredient(a_lower))
    return list(set(blocked))


def recipe_violates_allergens(ing_text: str, title_lower: str, allergen_keywords: list) -> bool:
    """Return True if the recipe contains any allergen keyword."""
    for kw in allergen_keywords:
        if kw in ing_text or kw in title_lower:
            return True
    return False


def recipe_violates_special_requests(ing_text: str, title_lower: str, special_requests: str) -> bool:
    """Return True if recipe violates any special request."""
    sr_lower = special_requests.lower()
    for phrase, rules in _SPECIAL_REQUEST_BLOCKS.items():
        if phrase in sr_lower:
            for kw in rules.get("title_keywords", []):
                if kw in title_lower:
                    return True
            for kw in rules.get("ingredient_keywords", []):
                if kw in ing_text:
                    return True
    return False


def calculate_match(recipe_ingredients: list, user_ingredients: list):
    """
    Calculate match percentage.
    match_percent = (# of recipe ingredients the user has) / (total recipe ingredients) * 100
    Also returns list of missing ingredient strings.
    """
    if not recipe_ingredients:
        return 0, []

    matched_count = 0
    missing = []

    for ing_str in recipe_ingredients:
        ing_lower = ing_str.lower()
        found = False
        for u_ing in user_ingredients:
            if u_ing and (u_ing in ing_lower or ing_lower.startswith(u_ing)):
                found = True
                break
        if found:
            matched_count += 1
        else:
            # Truncate long ingredient lines to a readable snippet
            words = ing_str.split()
            snippet = " ".join(words[:6]) if len(words) > 6 else ing_str
            missing.append(snippet)

    match_percent = round((matched_count / len(recipe_ingredients)) * 100)
    return match_percent, missing


# ── OpenAI ranking ────────────────────────────────────────────────────────
def rank_with_openai(candidates: list, user_ingredients: list,
                     allergies: list, special_requests: str) -> list:
    """
    Send top candidate recipes to OpenAI for natural-language understanding
    and ranking. Returns ordered list of recipe dicts with AI explanation added.

    If OpenAI is unavailable, returns candidates as-is (sorted by match_percent).
    """
    if openai_client is None or not candidates:
        # Fallback: pure Python ranking — return top 5 sorted by match %
        sorted_cands = sorted(candidates, key=lambda x: x["match_percent"], reverse=True)
        for c in sorted_cands[:5]:
            c["ai_explanation"] = (
                f"{c['match_percent']}% of ingredients matched. "
                "No AI explanation available — set OPENAI_API_KEY in .env to enable real AI."
            )
        return sorted_cands[:5]

    # Build a compact recipe summary for the prompt (index + name + match + key ingredients)
    recipe_summaries = []
    for i, c in enumerate(candidates):
        # Limit ingredient list to first 10 for prompt brevity
        ing_preview = c["ingredients_list"][:10]
        recipe_summaries.append(
            f"[{i}] {c['recipe_title']} | "
            f"Match: {c['match_percent']}% | "
            f"Missing: {len(c['missing'])} ingredients | "
            f"Ingredients: {'; '.join(ing_preview)}"
        )

    candidate_block = "\n".join(recipe_summaries)

    prompt = f"""You are an expert culinary AI assistant. A user has provided:

INGREDIENTS THEY HAVE: {', '.join(user_ingredients) if user_ingredients else 'not specified'}
FOOD ALLERGIES (HARD RESTRICTION — must NEVER appear in recommendations): {', '.join(allergies) if allergies else 'none'}
SPECIAL REQUESTS: {special_requests if special_requests else 'none'}

Below are {len(candidates)} candidate recipes pre-filtered from a 64,000-recipe dataset. They have already been screened to exclude allergens and hard restrictions. Your job is to:

1. Select the BEST 5 recipes that most closely match the user's ingredients and preferences.
2. Consider the match percentage AND the special requests (e.g., "vegetarian", "quick recipe", "no fried food", "low calorie", "healthy breakfast").
3. For each selected recipe, write a concise 1-2 sentence explanation of why it is a great match for this user.

CANDIDATE RECIPES:
{candidate_block}

Respond ONLY with a valid JSON array of exactly 5 objects (no markdown, no code fences). Each object must have:
- "index": the candidate index number from the list above (integer)
- "explanation": your explanation string (why this recipe suits the user)

Example format:
[
  {{"index": 3, "explanation": "Perfect match — you have all major ingredients and it's quick to prepare."}},
  {{"index": 7, "explanation": "Great vegetarian option using your spinach and cheese."}},
  ...
]

If fewer than 5 candidates are available, include all of them.
Only return the JSON array. Do not include any other text."""

    try:
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful culinary assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        raw_text = response.choices[0].message.content.strip()

        # Strip markdown code fences if present
        raw_text = re.sub(r"^```(?:json)?\s*", "", raw_text)
        raw_text = re.sub(r"\s*```$", "", raw_text)

        ai_selections = json.loads(raw_text)

        # Merge AI selections back with full candidate data
        result = []
        for sel in ai_selections:
            idx = sel.get("index")
            explanation = sel.get("explanation", "")
            if isinstance(idx, int) and 0 <= idx < len(candidates):
                rec = candidates[idx].copy()
                rec["ai_explanation"] = explanation
                result.append(rec)

        # If OpenAI returned fewer than 5 for some reason, pad with remaining candidates
        selected_indices = {sel.get("index") for sel in ai_selections}
        for i, c in enumerate(candidates):
            if len(result) >= 5:
                break
            if i not in selected_indices:
                c_copy = c.copy()
                c_copy["ai_explanation"] = f"{c['match_percent']}% ingredient match."
                result.append(c_copy)

        logger.info(f"[SUCCESS] OpenAI returned {len(result)} ranked recipes.")
        return result[:5]

    except json.JSONDecodeError as e:
        logger.error(f"OpenAI returned invalid JSON: {e}. Raw: {raw_text[:300]}")
    except Exception as e:
        logger.error(f"OpenAI API error: {e}")

    # Fallback on any error
    for c in candidates[:5]:
        c["ai_explanation"] = (
            f"{c['match_percent']}% ingredient match. "
            "(AI explanation unavailable due to API error.)"
        )
    return candidates[:5]


# ── Utility: safe column value ───────────────────────────────────────────────
def _safe(val, default=""):
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return default
    return val


def build_recipe_response(candidate: dict) -> dict:
    """Convert internal candidate dict to the JSON shape the frontend expects."""
    ings = candidate.get("ingredients_list", [])
    steps = candidate.get("directions_list", [])

    # Format ingredients as objects { name, amount, unit } for frontend compatibility
    ing_objects = []
    for ing_str in ings:
        ing_objects.append({
            "name": ing_str,
            "amount": 1,
            "unit": "serving"
        })

    # Get nutrition columns if they exist in the dataset
    calories = _safe(candidate.get("calories"), 0)
    try:
        calories = int(float(calories)) if calories else 0
    except (ValueError, TypeError):
        calories = 0

    protein = _safe(candidate.get("protein_g"), 0)
    try:
        protein = round(float(protein), 1) if protein else 0
    except (ValueError, TypeError):
        protein = 0

    carbs = _safe(candidate.get("carbs_g"), 0)
    try:
        carbs = round(float(carbs), 1) if carbs else 0
    except (ValueError, TypeError):
        carbs = 0

    fat = _safe(candidate.get("fat_g"), 0)
    try:
        fat = round(float(fat), 1) if fat else 0
    except (ValueError, TypeError):
        fat = 0

    cook_time = _safe(candidate.get("cook_time_minutes"), 30)
    try:
        cook_time = int(float(cook_time)) if cook_time else 30
    except (ValueError, TypeError):
        cook_time = 30

    image_url = _safe(candidate.get("image_url"), "")
    if not image_url:
        # Generic food image from Unsplash as fallback
        image_url = "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80"

    missing = candidate.get("missing", [])
    missing_display = missing[:5]  # Show max 5 missing ingredients

    return {
        "id": f"kg-{candidate.get('_row_idx', 0)}-{candidate.get('recipe_title', '')[:10].replace(' ', '')}",
        "recipe_name": candidate.get("recipe_title", "Unknown Recipe"),
        "category": _safe(candidate.get("category"), "General"),
        "description": _safe(candidate.get("description"), "A delicious recipe from the Kaggle dataset."),
        "cook_time_minutes": cook_time,
        "calories": calories,
        "protein_g": protein,
        "carbs_g": carbs,
        "fat_g": fat,
        "image_url": image_url,
        "ingredients": ing_objects,
        "instructions": steps,
        "nutri_score": "Nutri-Score B",
        "match_percent": candidate.get("match_percent", 0),
        "missing_ingredients": missing_display,
        "missing_count": len(missing),
        "ai_explanation": candidate.get("ai_explanation", ""),
        "is_from_real_ai": True,
        "is_from_kaggle": True,
    }


# ── Main endpoint ────────────────────────────────────────────────────────────
@app.route("/api/recommend-recipes", methods=["POST"])
def recommend_recipes():
    """
    POST body:
    {
        "ingredients":    ["egg", "spinach", "cheese"],
        "allergies":      ["peanuts"],
        "specialRequests": "no deep fried food, vegetarian"
    }

    Returns:
    {
        "recipes": [ ...up to 5 recipe objects... ],
        "total_candidates": 1842,
        "ai_used": true
    }
    """
    if df.empty:
        return jsonify({"error": "Dataset not loaded. Check server logs."}), 500

    data = request.get_json(force=True, silent=True) or {}

    # ── Parse incoming fields ────────────────────────────────────────────────
    raw_ingredients = data.get("ingredients", [])
    raw_allergies = data.get("allergies", [])
    raw_special = data.get("specialRequests", "")

    # Normalize ingredients
    user_ingredients = [
        normalize_ingredient(i) for i in raw_ingredients if str(i).strip()
    ]

    # Normalize allergies
    allergies_normalized = [a.lower().strip() for a in raw_allergies if str(a).strip()]
    allergen_keywords = extract_allergen_keywords(allergies_normalized)

    special_requests = raw_special.strip()

    logger.info(f"Request — ingredients: {user_ingredients} | "
                f"allergens: {allergen_keywords} | special: {special_requests}")

    # ── Step 1: Candidate selection ──────────────────────────────────────────
    # We iterate over the dataset and keep recipes where at least one user
    # ingredient appears in the ingredients text (broad candidate pool).
    candidates = []

    for idx, row in df.iterrows():
        ing_list = row["ingredients_list"]
        if not ing_list:
            continue

        ing_text = " ".join(ing_list).lower()
        title_lower = str(row["recipe_title"]).lower()

        # ── Hard filter: allergens ───────────────────────────────────────────
        if allergen_keywords and recipe_violates_allergens(ing_text, title_lower, allergen_keywords):
            continue

        # ── Hard filter: special requests ────────────────────────────────────
        if special_requests and recipe_violates_special_requests(ing_text, title_lower, special_requests):
            continue

        # ── Calculate ingredient match ────────────────────────────────────────
        if user_ingredients:
            match_percent, missing = calculate_match(ing_list, user_ingredients)
            # Only include if at least 1 ingredient matches
            if match_percent == 0:
                continue
        else:
            # No ingredients specified — include everything that passed filters
            match_percent = 0
            missing = []

        # ── Score = match % minus penalty for missing ingredients ─────────────
        missing_penalty = len(missing) * 1.5
        score = match_percent - missing_penalty

        candidates.append({
            "_row_idx": idx,
            "recipe_title": row["recipe_title"],
            "category": row.get("category", "General"),
            "description": row.get("description", ""),
            "calories": row.get("calories", None),
            "protein_g": row.get("protein_g", None),
            "carbs_g": row.get("carbs_g", None),
            "fat_g": row.get("fat_g", None),
            "cook_time_minutes": row.get("cook_time_minutes", None),
            "image_url": row.get("image_url", ""),
            "ingredients_list": ing_list,
            "directions_list": row["directions_list"],
            "match_percent": match_percent,
            "missing": missing,
            "_score": score,
        })

    total_candidates = len(candidates)
    logger.info(f"Candidates after filtering: {total_candidates}")

    if total_candidates == 0:
        return jsonify({
            "recipes": [],
            "total_candidates": 0,
            "ai_used": False,
            "message": "No recipes found matching your ingredients and restrictions. Try fewer restrictions or different ingredients."
        }), 200

    # ── Step 2: Sort and take top 20 for AI ──────────────────────────────────
    candidates.sort(key=lambda x: x["_score"], reverse=True)
    top_candidates = candidates[:20]

    # ── Step 3: OpenAI ranking ─────────────────────────────────────────────
    ranked = rank_with_openai(
        top_candidates,
        user_ingredients,
        allergies_normalized,
        special_requests
    )

    # ── Step 4: Build response ────────────────────────────────────────────────
    response_recipes = [build_recipe_response(r) for r in ranked]

    return jsonify({
        "recipes": response_recipes,
        "total_candidates": total_candidates,
        "ai_used": openai_client is not None,
    })


# ── Legacy endpoint alias (for backwards compatibility) ──────────────────────
@app.route("/api/v1/generate-recipe", methods=["POST"])
def generate_recipe_legacy():
    """Redirect legacy calls to the new recommend-recipes endpoint."""
    return recommend_recipes()


# ── Health check ─────────────────────────────────────────────────────────────
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "dataset_loaded": not df.empty,
        "recipe_count": len(df),
        "ai_enabled": openai_client is not None,
    })


# ── Run ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("[APP] Healthy Recipe AI Backend")
    print("=" * 60)
    print(f"   Dataset:  {'[SUCCESS] Loaded' if not df.empty else '[ERROR] Not loaded'} ({len(df)} recipes)")
    print(f"   OpenAI:   {'[SUCCESS] Enabled' if openai_client else '[WARNING] Disabled (set OPENAI_API_KEY)'}")
    print(f"   Endpoint: POST http://localhost:5000/api/recommend-recipes")
    print(f"   Health:   GET  http://localhost:5000/api/health")
    print("=" * 60 + "\n")
    app.run(port=5000, debug=False)
