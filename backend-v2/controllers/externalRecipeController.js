const asyncHandler = require("express-async-handler");
const axios = require("axios");

const MEALDB_BASE = process.env.MEALDB_BASE;
// const SPOONACULAR_KEY = process.env.SPOONACULAR_KEY; // optional: for future external API integration

// ----------------- Utility Functions -----------------
// tala API bata fetch bhayeko data manage garna (i.e match w/ the schema or Cleans and converts it into your Recipe format)

// Normalize a TheMealDB meal object to your Recipe model shape
// @desc Convert TheMealDB meal data to a unified recipe format
function normalizeMealToRecipe(meal) {
    if (!meal) return null;

    // Collect ingredient fields strIngredient1..20 and combine with measures
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        const ing = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ing && ing.trim()) {
            const item =
                measure && measure.trim()
                    ? `${measure.trim()} ${ing.trim()}`
                    : ing.trim();
            ingredients.push(item);
        }
    }

    // Tags: TheMealDB uses strTags as comma-separated string
    const tags = meal.strTags
        ? meal.strTags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

    // Create a recipe-like object compatible with your frontend expected shape
    return {
        external: true, // helpful flag so frontend knows it's external
        external_source: "themealdb",
        external_id: meal.idMeal,
        title: meal.strMeal || "Untitled",
        description: meal.strCategory
            ? `${meal.strCategory} • ${meal.strArea || ""}`.trim()
            : meal.strCategory || "",
        ingredients,
        instructions: meal.strInstructions || "",
        tags,
        image: meal.strMealThumb || undefined,
        raw: meal, // optional raw object for debugging
    };
}

// ----------------- External API Helpers -----------------
// Fetch bhayeko data lai fiter garna (i.e Fetches raw data from TheMealDB)

// Fetch meals from TheMealDB by name
// @desc Fetch meals matching a search query from TheMealDB
// @access public (used internally by backend)
async function fetchExternalMealsByName(query) {
    if (!query) return [];
    try {
        const url = `${MEALDB_BASE}/search.php?s=${encodeURIComponent(query)}`;
        const { data } = await axios.get(url);
        const meals = data?.meals || [];
        return meals.map(normalizeMealToRecipe).filter(Boolean);
    } catch (err) {
        console.error("Error fetching from TheMealDB:", err.message);
        return [];
    }
}

// Fetch multiple random meals from TheMealDB
// @desc Fetch N random meal suggestions from TheMealDB
// @access public (used internally by backend)
async function fetchRandomMeal(count = 1) {
    try {
        // Create an array of promises
        const requests = Array.from({ length: count }, () =>
            axios.get(`${MEALDB_BASE}/random.php`)
        );

        // Wait for all requests to finish
        const results = await Promise.all(requests);

        // Extract meals and normalize
        const meals = results
            .map(res => res.data?.meals[0]) // each response has one meal
            .map(normalizeMealToRecipe)
            .filter(Boolean);

        return meals;
    } catch (err) {
        console.error("Error fetching random meals from TheMealDB:", err.message);
        return [];
    }
}


// ----------------- Controllers -----------------

// Search external recipes only (no DB recipes)
// @route GET /api/recipes/external/search?q=chicken
// @access private
const searchExternalRecipes = asyncHandler(async (req, res) => {
    const { q } = req.query;
    if (!q)
        return res.status(400).json({ message: "Missing query parameter 'q'" });

    const external = await fetchExternalMealsByName(q);
    res.status(200).json({ count: external.length, recipes: external });
});

// Get a random external recipe
// @route GET /api/recipes/external/random or random?count=5 for 5 recipes
// @access private
const getRandomExternalRecipe = asyncHandler(async (req, res) => {
    const count = parseInt(req.query.count) || 1; // default 1
    const recipes = await fetchRandomMeal(count);
    res.status(200).json({ count: recipes.length, recipes });
});


module.exports = {
    searchExternalRecipes,
    getRandomExternalRecipe,
    // also export helper functions in case main controller needs them
    fetchExternalMealsByName,
    fetchRandomMeal,
    normalizeMealToRecipe,
};