const mongoose = require("mongoose");

// Saved Recipe Schema
// Stores which user saved which recipe
const savedRecipeSchema = mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        recipe_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Recipe",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate saves (same user saving same recipe twice)
savedRecipeSchema.index(
    { user_id: 1, recipe_id: 1 },
    { unique: true }
);

module.exports = mongoose.model("SavedRecipe", savedRecipeSchema);
