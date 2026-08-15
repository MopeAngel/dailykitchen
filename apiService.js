/**
 * ============================================================================
 * KAGGLE 64K DISHES — AI BACKEND SERVICE MODULE (apiService.js)
 * Dataset: https://www.kaggle.com/datasets/prashantsingh001/recipes-dataset-64k-dishes
 *
 * Handles all HTTP communication between the frontend and the Flask backend.
 * The backend runs at localhost:5000 and manages:
 *   - Kaggle dataset loading
 *   - Allergen hard-filtering
 *   - Ingredient match % calculation
 *   - OpenAI ranking and explanation
 *
 * The AI API key is NEVER in this file — it lives in the backend .env only.
 * ============================================================================
 */

const KAGGLE_AI_CONFIG = {
    // New unified endpoint for real AI + Kaggle recommendations
    API_ENDPOINT: 'http://localhost:5000/api/recommend-recipes',
    HEALTH_ENDPOINT: 'http://localhost:5000/api/health',
    DATASET_REF: 'prashantsingh001/recipes-dataset-64k-dishes',
    TIMEOUT_MS: 30000, // 30s — OpenAI may take a moment on first call
};

/**
 * Main entry point called by script.js.
 * Sends ingredients, allergies, and special requests to the Flask backend.
 * Returns an array of up to 5 recipe objects from the Kaggle dataset,
 * ranked and explained by OpenAI.
 *
 * @param {Object} inputData - { ingredients: string[], allergies: string[], specialRequests: string }
 * @returns {Promise<{ recipes: Object[], totalCandidates: number, aiUsed: boolean }>}
 */
async function fetchAIRecipesFromBackend(inputData) {
    console.log('[AI Service] Sending request to Flask backend:', inputData);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), KAGGLE_AI_CONFIG.TIMEOUT_MS);

    try {
        const response = await fetch(KAGGLE_AI_CONFIG.API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            signal: controller.signal,
            body: JSON.stringify({
                ingredients: inputData.ingredients || [],
                allergies: inputData.allergies || [],
                specialRequests: inputData.specialRequests || '',
            }),
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errBody = await response.json().catch(() => ({}));
            throw new Error(errBody.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        const jsonResult = await response.json();
        console.log('[AI Service] Backend response received:', jsonResult);

        // Map each recipe from backend schema to frontend app schema
        const mappedRecipes = (jsonResult.recipes || []).map(parseBackendRecipe);

        return {
            recipes: mappedRecipes,
            totalCandidates: jsonResult.total_candidates || 0,
            aiUsed: jsonResult.ai_used || false,
        };

    } catch (error) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
            throw new Error(
                'Request timed out. The backend may be processing the Kaggle dataset. ' +
                'Please wait a moment and try again.'
            );
        }

        console.error('[AI Service] Backend error:', error.message);
        throw new Error(
            `Cannot reach the Flask backend at ${KAGGLE_AI_CONFIG.API_ENDPOINT}. ` +
            'Make sure you ran: python app.py'
        );
    }
}

/**
 * Convert a single recipe object from the Flask backend schema
 * into the frontend recipe card schema.
 *
 * Backend fields:
 *   id, recipe_name, category, description, cook_time_minutes, calories,
 *   protein_g, carbs_g, fat_g, image_url, ingredients (list of {name,amount,unit}),
 *   instructions (list of strings), nutri_score, match_percent,
 *   missing_ingredients, missing_count, ai_explanation, is_from_real_ai
 *
 * Frontend recipe card fields:
 *   id, title, category, description, prepTime, calories, protein, carbs, fat,
 *   nutriScore, image, ingredients, steps, matchPercent, missingIngredients,
 *   aiReason, isFromRealAPI, dietTags, difficulty
 */
function parseBackendRecipe(backendData) {
    // Determine diet tags heuristically from category and title
    const titleLower = (backendData.recipe_name || '').toLowerCase();
    const categoryLower = (backendData.category || '').toLowerCase();
    const ingredientText = (backendData.ingredients || [])
        .map(i => (typeof i === 'string' ? i : i.name || ''))
        .join(' ')
        .toLowerCase();

    const dietTags = [];
    if (backendData.protein_g >= 25 || titleLower.includes('protein')) dietTags.push('high-protein');
    if (backendData.calories > 0 && backendData.calories <= 350) dietTags.push('low-calorie');
    const meatKeywords = ['chicken', 'beef', 'pork', 'fish', 'shrimp', 'salmon', 'meat', 'bacon'];
    if (!meatKeywords.some(k => ingredientText.includes(k))) dietTags.push('vegetarian');
    if (categoryLower.includes('keto') || (backendData.carbs_g > 0 && backendData.carbs_g <= 15)) {
        dietTags.push('keto');
    }
    const glutenKeywords = ['wheat', 'flour', 'bread', 'pasta', 'terigu'];
    if (!glutenKeywords.some(k => ingredientText.includes(k))) dietTags.push('gluten-free');
    if (dietTags.length === 0) dietTags.push('high-protein');

    // Determine difficulty
    const prepTime = backendData.cook_time_minutes || 30;
    let difficulty = 'Mudah';
    if (prepTime <= 15) difficulty = 'Sangat Mudah';
    else if (prepTime <= 25) difficulty = 'Mudah';
    else if (prepTime <= 40) difficulty = 'Sedang';
    else difficulty = 'Butuh Waktu';

    // Pick a fallback image based on ingredients/title if no image in dataset
    const image = backendData.image_url || chooseFallbackImage(titleLower, ingredientText);

    // Format ingredients
    const ingredients = (backendData.ingredients || []).map(ing => {
        if (typeof ing === 'string') return { name: ing, amount: 1, unit: 'serving' };
        return {
            name: ing.name || ing,
            amount: ing.amount || 1,
            unit: ing.unit || 'serving',
        };
    });

    return {
        id: backendData.id || `kg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: backendData.recipe_name || 'Unknown Recipe',
        category: backendData.category || 'AI Recommendation',
        description: backendData.description || 'A recipe recommended by AI from the Kaggle dataset.',
        prepTime: prepTime,
        calories: backendData.calories || 0,
        protein: backendData.protein_g || 0,
        carbs: backendData.carbs_g || 0,
        fat: backendData.fat_g || 0,
        nutriScore: backendData.nutri_score || 'Nutri-Score B',
        image: image,
        ingredients: ingredients,
        steps: backendData.instructions || [],
        matchPercent: backendData.match_percent ?? 0,
        missingIngredients: backendData.missing_ingredients || [],
        missingCount: backendData.missing_count || 0,
        aiReason: backendData.ai_explanation || '',
        isFromRealAPI: backendData.is_from_real_ai || false,
        isFromKaggle: backendData.is_from_kaggle || false,
        dietTags: dietTags,
        difficulty: difficulty,
    };
}

/**
 * Pick a thematic Unsplash fallback image when the dataset has no image_url.
 */
function chooseFallbackImage(titleLower, ingredientText) {
    const combined = titleLower + ' ' + ingredientText;
    if (combined.match(/salmon|tuna|fish|seafood/)) {
        return 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80';
    }
    if (combined.match(/chicken|ayam|poultry/)) {
        return 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?auto=format&fit=crop&w=600&q=80';
    }
    if (combined.match(/salad|spinach|bayam|green/)) {
        return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
    }
    if (combined.match(/soup|sup|broth|stew/)) {
        return 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80';
    }
    if (combined.match(/oat|oatmeal|breakfast|cereal/)) {
        return 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=600&q=80';
    }
    if (combined.match(/beef|steak|sapi|daging/)) {
        return 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80';
    }
    if (combined.match(/tofu|tahu|tempe|tempeh|vegetarian|vegan/)) {
        return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80';
    }
    if (combined.match(/egg|telur|omelet|omelette/)) {
        return 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80';
    }
    // Default healthy food
    return 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80';
}

/**
 * Legacy compatibility wrapper — called by old script.js code paths.
 * Adapts single-recipe API call pattern to new multi-recipe backend.
 */
async function fetchAIRecipeFromKaggleAPI(inputData) {
    const result = await fetchAIRecipesFromBackend({
        ingredients: inputData.ingredients || [],
        allergies: inputData.allergies || [],
        specialRequests: (inputData.preferences || []).join(', '),
    });
    // Return first recipe in legacy single-recipe format
    if (result.recipes && result.recipes.length > 0) {
        return { ...result.recipes[0], _allRecipes: result.recipes, _meta: result };
    }
    throw new Error('No recipes returned from backend.');
}
