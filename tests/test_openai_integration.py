import os
import sys
import unittest

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, ROOT)

import app


class OpenAIIntegrationTests(unittest.TestCase):
    def test_backend_uses_openai_env_var(self):
        self.assertTrue(hasattr(app, "OPENAI_API_KEY"), "Backend should define OPENAI_API_KEY from environment")
        self.assertFalse(hasattr(app, "GEMINI_API_KEY"), "Legacy Gemini env var should no longer be used")

    def test_openai_ranking_falls_back_to_dataset_order_when_ai_is_unavailable(self):
        candidates = [
            {"recipe_title": "Lower Match", "ingredients_list": ["egg", "spinach"], "match_percent": 50, "missing": ["onion"]},
            {"recipe_title": "Higher Match", "ingredients_list": ["egg", "spinach", "cheese"], "match_percent": 90, "missing": []},
        ]

        ranked = app.rank_with_openai(candidates, ["egg", "spinach", "cheese"], [], "quick")

        self.assertEqual(len(ranked), 2)
        self.assertEqual(ranked[0]["recipe_title"], "Higher Match")
        self.assertIn("ai_explanation", ranked[0])


if __name__ == "__main__":
    unittest.main()
