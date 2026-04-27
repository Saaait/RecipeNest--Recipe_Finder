const asyncHandler = require("express-async-handler");
const Recipe = require("../models/recipeModel");
const SavedRecipe = require("../models/savedRecipeModel");


// Recommend recipes based on user's saved tags
// @route GET /api/recommend/tags
// @access private
const recommendByTags = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const saved = await SavedRecipe.find({ user_id: userId })
        .populate("recipe_id", "tags");

    // Get IDs of all saved recipes to exclude them
    const allSavedRecipes = await SavedRecipe.find({ user_id: userId }).select('recipe_id');
    const savedRecipeIds = allSavedRecipes.map(s => s.recipe_id.toString());

    const tags = new Set();
    saved.forEach(s => {
        s.recipe_id?.tags?.forEach(t => tags.add(t.trim()));
    });

    if (tags.size === 0) {
        return res.status(200).json({
            message: "No tags found in your saved recipes",
            recipes: [],
        });
    }

    const recipes = await Recipe.find({
        tags: { $in: [...tags] },
        user_id: { $ne: userId },
        _id: { $nin: savedRecipeIds }, // Exclude saved recipes
        approvalStatus: "approved",
    }).sort({ saveCount: -1 });

    res.status(200).json({
        message: "Recommended based on your saved recipe tags",
        tags: [...tags],
        count: recipes.length,
        recipes,
    });
});


// Recommend recipes based on saved recipe ingredients
// @route GET /api/recipes/recommend/ingredients
// @access private
const recommendByIngredients = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Helper function to normalize ingredient strings
    const normalize = str => str.toLowerCase().trim();

    // 1️ - Get saved recipes for the user
    const savedRecipes = await SavedRecipe.find({ user_id: userId }).populate('recipe_id');

    if (!savedRecipes.length) {
        return res.status(200).json({
            message: "No saved recipes yet",
            count: 0,
            recipes: [],
        });
    }

    // 2️ - Build a set of normalized ingredients from saved recipes
    const ingredientSet = new Set();
    savedRecipes.forEach(saved => {
        saved.recipe_id.ingredients.forEach(i => ingredientSet.add(normalize(i)));
    });

    // 3️ - Fetch all recipes except the ones already saved by the user
    const allRecipes = await Recipe.find({
        _id: { $nin: savedRecipes.map(r => r.recipe_id._id) },
        approvalStatus: "approved",
    });

    // 4️ - Filter recipes that share at least one ingredient
    const recommended = allRecipes.filter(recipe => {
        const normalizedIngredients = recipe.ingredients.map(normalize);
        return normalizedIngredients.some(i => ingredientSet.has(i));
    });

    // 5️ - Optional: sort by number of overlapping ingredients (more relevant first)
    const scored = recommended.map(recipe => {
        const matchCount = recipe.ingredients
            .map(normalize)
            .filter(i => ingredientSet.has(i)).length;
        return { recipe, matchCount };
    }).sort((a, b) => b.matchCount - a.matchCount);

    // 6️ - Return top results
    res.status(200).json({
        message: "Recommended based on your saved recipe ingredients",
        count: scored.length,
        recipes: scored.map(s => s.recipe),
    });
});

// Recommend recipes similar to user's own recipes
// @route GET /api/recommend/similar
// @access private
const recommendFromUserRecipes = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const userRecipes = await Recipe.find({ user_id: userId });

    // Get IDs of all saved recipes to exclude them
    const allSavedRecipes = await SavedRecipe.find({ user_id: userId }).select('recipe_id');
    const savedRecipeIds = allSavedRecipes.map(s => s.recipe_id.toString());

    const userTags = new Set();
    userRecipes.forEach(r => r.tags?.forEach(t => userTags.add(t)));

    const recipes = await Recipe.find({
        user_id: { $ne: userId },
        _id: { $nin: savedRecipeIds }, // Exclude saved recipes
        tags: { $in: [...userTags] },
        approvalStatus: "approved",
    }).limit(20);

    res.status(200).json({
        message: "Recommendations similar to your recipes",
        userTags: [...userTags],
        count: recipes.length,
        recipes,
    });
});



// Popular recipes based on saveCount
// @route GET /api/recommend/popular
// @access private
const recommendPopular = asyncHandler(async (req, res) => {
    const recipes = await Recipe.find({ approvalStatus: "approved" })
        .sort({ saveCount: -1 })
        .limit(20);

    res.status(200).json({
        message: "Popular recipes",
        count: recipes.length,
        recipes,
    });
});



// Recently added recipes
// @route GET /api/recommend/recent
// @access private
const recommendRecent = asyncHandler(async (req, res) => {
    const recipes = await Recipe.find({ approvalStatus: "approved" })
        .sort({ createdAt: -1 })
        .limit(20);

    res.status(200).json({
        message: "Recently added recipes",
        count: recipes.length,
        recipes,
    });
});



// Utility: normalize ingredient strings
const normalize = (str) =>
    str
        .toLowerCase()
        .split("-")[0]      // remove quantity/units
        .trim()
        .replace(/[^a-z\s]/g, ""); // remove punctuation

// Mixed rule-based personalized recommendations (top 5 recent ingredients)
// @route GET /api/recommend
// @access private
const recommendForUser = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Get user's top 5 most recently saved recipes
    const saved = await SavedRecipe.find({ user_id: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("recipe_id", "tags ingredients");

    // Get IDs of all saved recipes to exclude them from recommendations
    const allSavedRecipes = await SavedRecipe.find({ user_id: userId }).select('recipe_id');
    const savedRecipeIds = allSavedRecipes.map(s => s.recipe_id.toString());

    // Collect tags and ingredients from these 5 recipes
    let tags = new Set();
    let ingredients = new Set();
    saved.forEach(s => {
        s.recipe_id?.tags?.forEach(t => tags.add(t));
        s.recipe_id?.ingredients?.forEach(i => ingredients.add(normalize(i)));
    });

    // Fetch recipes NOT created by user AND NOT already saved by user
    const allRecipes = await Recipe.find({
        user_id: { $ne: userId },
        _id: { $nin: savedRecipeIds }, // Exclude saved recipes
        approvalStatus: "approved",
    });

    // Score recipes based on tag & ingredient matches
    const scored = allRecipes.map(recipe => {
        let matchCount = 0;
        let matchedTags = [];
        let matchedIngredients = [];

        // Tag matches
        if (recipe.tags?.length) {
            const matches = recipe.tags.filter(t => tags.has(t));
            matchCount += matches.length;
            matchedTags = matches;
        }

        // Ingredient matches
        if (recipe.ingredients?.length) {
            const normalizedIngredients = recipe.ingredients.map(normalize);
            const matches = normalizedIngredients.filter(i => ingredients.has(i));
            matchCount += matches.length;
            matchedIngredients = matches;
        }

        return { 
            recipe, 
            matchCount,
            matchedTags,
            matchedIngredients
        };
    });

    // Only keep recipes with at least 1 match
    const filtered = scored.filter(s => s.matchCount > 0);

    // Sort by match count first, then saveCount
    filtered.sort((a, b) => b.matchCount - a.matchCount || b.recipe.saveCount - a.recipe.saveCount);

    // Take top 20 recommendations and add match reason
    const recommended = filtered.slice(0, 20).map(s => ({
        ...s.recipe.toObject(),
        _matchReason: {
            score: s.matchCount,
            matchedTags: s.matchedTags,
            matchedIngredients: s.matchedIngredients,
            explanation: `Recommended because ${
                s.matchedTags.length > 0 && s.matchedIngredients.length > 0
                    ? `it matches your saved tags (${s.matchedTags.join(', ')}) and ingredients (${s.matchedIngredients.slice(0, 3).join(', ')}${s.matchedIngredients.length > 3 ? '...' : ''})`
                    : s.matchedTags.length > 0
                    ? `it matches your saved tags: ${s.matchedTags.join(', ')}`
                    : `it uses ingredients you like: ${s.matchedIngredients.slice(0, 3).join(', ')}${s.matchedIngredients.length > 3 ? '...' : ''}`
            }`
        }
    }));

    // Fallback → popular recipes (also exclude saved ones)
    if (recommended.length === 0) {
        const popularRecipes = await Recipe.find({ 
            approvalStatus: "approved",
            _id: { $nin: savedRecipeIds }
        }).sort({ saveCount: -1 }).limit(20);
        
        return res.status(200).json({
            message: "No personalized matches found. Showing popular recipes you haven't saved yet.",
            tags: [...tags],
            ingredients: [...ingredients],
            count: popularRecipes.length,
            recipes: popularRecipes,
            fallback: true
        });
    }

    res.status(200).json({
        message: "Recommended based on your top 5 recently saved recipes",
        tags: [...tags],
        ingredients: [...ingredients],
        count: recommended.length,
        recipes: recommended,
        fallback: false
    });
});

module.exports = {
    recommendByTags,
    recommendByIngredients,
    recommendFromUserRecipes,
    recommendPopular,
    recommendRecent,
    recommendForUser,
};