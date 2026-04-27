const asyncHandler = require("express-async-handler");
const axios = require("axios");
const Recipe = require("../models/recipeModel");
const { searchRecipes, advancedRecipeSearch } = require("../utils/searchUtility");

// ----------------- Controllers -----------------

// Get all recipes (public)
// @route GET /api/recipes
// @queryparam {string} search - optional search term (uses fuse.js fuzzy search)
// @queryparam {string} tags - optional tag filter
// @queryparam {string} sortByPopular - sort by save count
// @example /api/recipes?search=chicken&tags=spicy&sortByPopular=true
// @access public
const getRecipes = asyncHandler(async (req, res) => {
    const { search, tags, sortByPopular } = req.query;

    // Get all approved recipes (search will be done with fuse.js)
    const recipes = await Recipe.find({ approvalStatus: "approved" })
        .populate("user_id", "username email");

    // Convert to plain objects for fuse.js processing
    const plainRecipes = recipes.map(r => r.toObject());

    // Apply fuzzy search using fuse.js
    let results;
    if (search || tags || sortByPopular) {
        results = advancedRecipeSearch(plainRecipes, {
            searchTerm: search,
            tags: tags ? tags.split(',').map(t => t.trim()) : [],
            sortByPopular: sortByPopular === 'true'
        });
    } else {
        results = plainRecipes;
    }

    // Normalize external flag
    const normalized = results.map(r => ({
        ...r,
        external: !!r.isExternal
    }));

    res.status(200).json({
        message: "Recipes fetched successfully",
        count: normalized.length,
        recipes: normalized,
    });
});


// Get individual recipe (public)
// @route   GET /api/recipes/:id
// @access  public
const getRecipe = asyncHandler(async (req, res) => {
    const recipe = await Recipe.findById(req.params.id).populate("user_id", "username email");

    if (!recipe) {
        res.status(404);
        throw new Error("Recipe not found");
    }

    // Normalize
    const normalized = recipe.toObject();
    normalized.external = !!normalized.isExternal;

    res.status(200).json(normalized);
});

// Get current user's recipes (including pending/rejected)
// @route GET /api/recipes/user/my-recipes
// @access private
const getUserRecipes = asyncHandler(async (req, res) => {
    const recipes = await Recipe.find({ user_id: req.user.id })
        .populate("user_id", "username email")
        .sort({ createdAt: -1 });

    // Normalize same as getRecipes
    const normalized = recipes.map(r => {
        const obj = r.toObject();
        obj.external = !!obj.isExternal;
        return obj;
    });

    res.status(200).json({
        message: "User recipes fetched successfully",
        count: normalized.length,
        recipes: normalized,
    });
});


// Create a new recipe
// @route POST /api/recipes
// @access private
const createRecipe = asyncHandler(async (req, res) => {
    const { title, description, ingredients, instructions, tags } = req.body;

    if (!title || !description || !ingredients || !instructions) {
        res.status(400);
        throw new Error("All fields except image and tags are required!");
    }

    const recipe = await Recipe.create({
        user_id: req.user.id,
        title,
        description,
        ingredients: Array.isArray(ingredients)
            ? ingredients
            : ingredients.split(","),
        instructions,
        tags: tags
            ? Array.isArray(tags)
                ? tags.map(t => t.trim())
                : tags.split(",").map(t => t.trim())
            : [],
        image: req.file ? req.file.path : undefined,
    });

    res.status(201).json({ message: "Recipe created successfully", recipe });
});


// Update recipe
// @route PUT /api/recipes/:id
// @access private (admin or owner)
const updateRecipe = asyncHandler(async (req, res) => {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
        res.status(404);
        throw new Error("Recipe not found");
    }

    // Authorization check - allow admin or owner
    const isOwner = recipe.user_id.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";
    
    if (!isOwner && !isAdmin) {
        res.status(403);
        throw new Error("User does not have access to update this recipe");
    }

    // Update fields
    const updatedData = {
        ...req.body,
        ingredients: req.body.ingredients
            ? Array.isArray(req.body.ingredients)
                ? req.body.ingredients.map(i => i.trim())
                : req.body.ingredients.split(",").map(i => i.trim())
            : recipe.ingredients,
        tags: req.body.tags
            ? Array.isArray(req.body.tags)
                ? req.body.tags.map(t => t.trim())
                : req.body.tags.split(",").map(t => t.trim())
            : recipe.tags,
    };

    if (req.file) updatedData.image = req.file.path;

    const updatedRecipe = await Recipe.findByIdAndUpdate(
        req.params.id,
        updatedData,
        { new: true }
    );

    res.status(200).json(updatedRecipe);
});


// Delete recipe
// @route DELETE /api/recipes/:id
// @access private (admin or owner)
const deleteRecipe = asyncHandler(async (req, res) => {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
        res.status(404);
        throw new Error("Recipe not found");
    }

    // Authorization check - allow admin or owner
    const isOwner = recipe.user_id.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
        res.status(403);
        throw new Error("User does not have access to delete this recipe");
    }

    await Recipe.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Recipe deleted", recipe });
});

// Get pending recipes (admin only)
// @route GET /api/recipes/admin/pending
// @access private (admin)
const getPendingRecipes = asyncHandler(async (req, res) => {
    const recipes = await Recipe.find({ approvalStatus: "pending" })
        .populate("user_id", "username email")
        .sort({ createdAt: -1 });

    res.status(200).json({
        message: "Pending recipes fetched",
        count: recipes.length,
        recipes,
    });
});

// Get all recipes with approval status (admin only)
// @route GET /api/recipes/admin/all
// @access private (admin)
const getAllRecipesForAdmin = asyncHandler(async (req, res) => {
    const recipes = await Recipe.find({})
        .populate("user_id", "username email role")
        .sort({ createdAt: -1 });

    res.status(200).json({
        message: "All recipes fetched",
        count: recipes.length,
        recipes,
    });
});

// Approve recipe (admin only)
// @route PUT /api/recipes/admin/:id/approve
// @access private (admin)
const approveRecipe = asyncHandler(async (req, res) => {
    const recipe = await Recipe.findByIdAndUpdate(
        req.params.id,
        { approvalStatus: "approved" },
        { new: true, runValidators: true }
    );

    if (!recipe) {
        res.status(404);
        throw new Error("Recipe not found");
    }

    res.status(200).json({ message: "Recipe approved", recipe });
});

// Reject recipe (admin only)
// @route PUT /api/recipes/admin/:id/reject
// @access private (admin)
const rejectRecipe = asyncHandler(async (req, res) => {
    const recipe = await Recipe.findByIdAndUpdate(
        req.params.id,
        { approvalStatus: "rejected" },
        { new: true, runValidators: true }
    );

    if (!recipe) {
        res.status(404);
        throw new Error("Recipe not found");
    }

    res.status(200).json({ message: "Recipe rejected", recipe });
});

// Unapprove recipe (set back to pending, admin only)
// @route PUT /api/recipes/admin/:id/unapprove
// @access private (admin)
const unapproveRecipe = asyncHandler(async (req, res) => {
    const recipe = await Recipe.findByIdAndUpdate(
        req.params.id,
        { approvalStatus: "pending" },
        { new: true, runValidators: true }
    );

    if (!recipe) {
        res.status(404);
        throw new Error("Recipe not found");
    }

    res.status(200).json({ message: "Recipe set to pending", recipe });
});

module.exports = {
    getRecipes,
    createRecipe,
    getRecipe,
    updateRecipe,
    deleteRecipe,
    getPendingRecipes,
    getAllRecipesForAdmin,
    approveRecipe,
    rejectRecipe,
    unapproveRecipe,
    getUserRecipes
};
