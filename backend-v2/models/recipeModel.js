const mongoose = require("mongoose");

const recipeSchema = mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        title: {
            type: String,
            required: [true, "Please add the recipe title"],
        },
        description: {
            type: String,
            required: [true, "Please add a description"],
        },
        ingredients: {
            type: [String],
            required: [true, "Please add ingredients"],
        },
        instructions: {
            type: String,
            required: [true, "Please add cooking instructions"],
        },
        image: {
            type: String, // URL or file path
        },
        tags: {
            type: [String], // e.g., ["Breakfast", "Vegan"]
        },
        isExternal: {
            type: Boolean,
            default: false,
        },
        approvalStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },

        // 🔥 Popularity count (used for recommendations)
        saveCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Recipe", recipeSchema);
