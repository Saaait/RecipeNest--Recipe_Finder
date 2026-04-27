const Fuse = require('fuse.js');

/**
 * FUSE.JS SEARCH UTILITY
 * 
 * This utility provides fuzzy search capabilities using fuse.js.
 * It's designed to work alongside your custom algorithms:
 * - Jaccard Similarity (for ingredients/tags)
 * - Tag matching
 * - Weighted scoring
 * 
 * Note: Your custom recommendation algorithms in recommendationController.js
 * remain UNCHANGED. This utility only enhances the basic search functionality.
 */

/**
 * Configuration for recipe search
 * Optimized for finding recipes by title, description, tags, and ingredients
 */
const recipeFuseConfig = {
    keys: [
        { name: 'title', weight: 0.4 },
        { name: 'description', weight: 0.3 },
        { name: 'tags', weight: 0.2 },
        { name: 'ingredients', weight: 0.1 }
    ],
    threshold: 0.4,        // Lower = more strict, Higher = more fuzzy (0-1)
    includeScore: true,
    minMatchCharLength: 2,
    ignoreLocation: true,
    useExtendedSearch: true,
    shouldSort: true,
    findAllMatches: false,
    distance: 100
};

/**
 * Configuration for user search
 * Optimized for finding users by username and email
 */
const userFuseConfig = {
    keys: [
        { name: 'username', weight: 0.6 },
        { name: 'email', weight: 0.4 }
    ],
    threshold: 0.3,
    includeScore: true,
    minMatchCharLength: 2,
    ignoreLocation: true,
    shouldSort: true
};

/**
 * Perform fuzzy search on recipes
 * @param {Array} recipes - Array of recipe documents from MongoDB
 * @param {String} searchTerm - The search query
 * @returns {Array} - Sorted and filtered recipes
 */
const searchRecipes = (recipes, searchTerm) => {
    if (!searchTerm || searchTerm.trim().length === 0) {
        return recipes;
    }

    const fuse = new Fuse(recipes, recipeFuseConfig);
    const results = fuse.search(searchTerm);

    // Return the original recipe objects with score metadata
    return results.map(result => ({
        ...result.item,
        _searchScore: result.score,
        _searchMethod: 'fuse'
    }));
};

/**
 * Perform fuzzy search on users
 * @param {Array} users - Array of user documents from MongoDB
 * @param {String} searchTerm - The search query
 * @returns {Array} - Sorted and filtered users
 */
const searchUsers = (users, searchTerm) => {
    if (!searchTerm || searchTerm.trim().length === 0) {
        return users;
    }

    const fuse = new Fuse(users, userFuseConfig);
    const results = fuse.search(searchTerm);

    return results.map(result => ({
        ...result.item,
        _searchScore: result.score,
        _searchMethod: 'fuse'
    }));
};

/**
 * Advanced search with multiple filters
 * @param {Array} recipes - Array of recipe documents
 * @param {Object} filters - Search filters including:
 *   - searchTerm: String (text search)
 *   - tags: Array[String] (tag filters)
 *   - minIngredients: Number (minimum ingredients)
 *   - maxIngredients: Number (maximum ingredients)
 *   - approvalStatus: String (approved, pending, etc.)
 * @returns {Array} - Filtered recipes
 */
const advancedRecipeSearch = (recipes, filters = {}) => {
    let results = [...recipes];

    // Apply text search if provided
    if (filters.searchTerm && filters.searchTerm.trim().length > 0) {
        results = searchRecipes(results, filters.searchTerm);
    }

    // Apply tag filter if provided
    if (filters.tags && filters.tags.length > 0) {
        results = results.filter(recipe => {
            const recipeTags = recipe.tags || [];
            return filters.tags.some(tag => 
                recipeTags.some(rt => rt.toLowerCase().includes(tag.toLowerCase()))
            );
        });
    }

    // Apply ingredient count filter if provided
    if (filters.minIngredients !== undefined) {
        results = results.filter(recipe => 
            recipe.ingredients && recipe.ingredients.length >= filters.minIngredients
        );
    }

    if (filters.maxIngredients !== undefined) {
        results = results.filter(recipe => 
            recipe.ingredients && recipe.ingredients.length <= filters.maxIngredients
        );
    }

    // Apply approval status filter if provided
    if (filters.approvalStatus) {
        results = results.filter(recipe => 
            recipe.approvalStatus === filters.approvalStatus
        );
    }

    // Sort by save count if requested
    if (filters.sortByPopular) {
        results = results.sort((a, b) => (b.saveCount || 0) - (a.saveCount || 0));
    }

    return results;
};

/**
 * Search within a specific field with custom config
 * Useful for field-specific searches
 */
const searchField = (data, searchTerm, fieldName, customConfig = {}) => {
    if (!searchTerm || searchTerm.trim().length === 0) {
        return data;
    }

    const config = {
        keys: [{ name: fieldName, weight: 1.0 }],
        threshold: 0.4,
        ...customConfig
    };

    const fuse = new Fuse(data, config);
    const results = fuse.search(searchTerm);

    return results.map(result => result.item);
};

module.exports = {
    searchRecipes,
    searchUsers,
    advancedRecipeSearch,
    searchField,
    recipeFuseConfig,
    userFuseConfig
};