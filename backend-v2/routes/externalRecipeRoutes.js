const express = require("express");
const router = express.Router();
const validateToken = require("../middleware/validateTokenHandler");

const {
    searchExternalRecipes,
    getRandomExternalRecipe
} = require("../controllers/externalRecipeController");

// Protect all routes
router.use(validateToken);

// ----------------- External API Routes -----------------
// @route GET /api/recipes/external/search?q=chicken
// @desc Search TheMealDB for recipes by name
// @access private
router.get("/search", searchExternalRecipes);

// @route GET /api/recipes/external/random
// @desc Get a random meal from TheMealDB
// @access private
router.get("/random", getRandomExternalRecipe);

module.exports = router;
