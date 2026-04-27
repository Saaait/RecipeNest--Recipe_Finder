const express = require("express");
const router = express.Router();
const validateToken = require("../middleware/validateTokenHandler");

const {
    saveRecipe,
    unsaveRecipe,
    getSavedRecipes,
} = require("../controllers/savedRecipeController");

// ----------------- Routes -----------------

// Get all saved recipes for current user
//@route GET /api/recipes/saved
//@access private
router.get("/user/saved", validateToken, getSavedRecipes);
// added /user/saved cuz express is treating "saved" as a recipe ID

// Save a recipe
//@route POST /api/recipes/:id/save
//@access private
router.post("/:id/save", validateToken, saveRecipe);

// Unsave a recipe
//@route DELETE /api/recipes/:id/unsave
//@access private
router.delete("/:id/unsave", validateToken, unsaveRecipe);


module.exports = router;
