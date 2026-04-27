const asyncHandler = require("express-async-handler");
const SavedRecipe = require("../models/savedRecipeModel");
const Recipe = require("../models/recipeModel");

// ----------------- Controllers -----------------

// Save a recipe
//@route POST /api/recipes/:id/save
//@access private
const saveRecipe = asyncHandler(async (req, res) => {
    const recipeId = req.params.id;
    const userId = req.user.id;

    // Check if recipe exists and is approved
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
        return res.status(404).json({
            title: "Not Found",
            message: "Recipe not found",
        });
    }

    // Only allow saving approved recipes
    if (recipe.approvalStatus !== "approved") {
        return res.status(400).json({
            title: "Validation Failed",
            message: "Only approved recipes can be saved",
        });
    }

    // Check for duplicate save
    const alreadySaved = await SavedRecipe.findOne({
        user_id: userId,
        recipe_id: recipeId,
    });

    if (alreadySaved) {
        return res.status(400).json({
            title: "Validation Failed",
            message: "Recipe already saved",
        });
    }

    // Save recipe
    const savedRecipe = await SavedRecipe.create({
        user_id: userId,
        recipe_id: recipeId,
    });

    // Increase save count
    recipe.saveCount = (recipe.saveCount || 0) + 1;
    await recipe.save();

    return res.status(201).json({
        message: "Recipe saved successfully",
        savedRecipe,
    });
});


// Unsave a recipe
//@route DELETE /api/recipes/:id/unsave
//@access private
const unsaveRecipe = asyncHandler(async (req, res) => {
    const recipeId = req.params.id;
    const userId = req.user.id;

    const removed = await SavedRecipe.findOneAndDelete({
        user_id: userId,
        recipe_id: recipeId,
    });

    if (!removed) {
        return res.status(404).json({
            title: "Not Found",
            message: "Recipe not saved",
        });
    }

    // Decrease save count
    await Recipe.findByIdAndUpdate(recipeId, { $inc: { saveCount: -1 } });

    return res.status(200).json({
        message: "Recipe unsaved successfully",
    });
});


// Get all saved recipes of current user
//@route GET /api/recipes/saved
//@access private
const getSavedRecipes = asyncHandler(async (req, res) => {
    const savedRecipes = await SavedRecipe.find({
        user_id: req.user.id,
    }).populate("recipe_id");

    res.status(200).json({
        message: "Saved recipes fetched successfully",
        count: savedRecipes.length,
        recipes: savedRecipes.map(item => item.recipe_id),
    });
});

// ----------------- Exports -----------------
module.exports = {
    saveRecipe,
    unsaveRecipe,
    getSavedRecipes,
};
