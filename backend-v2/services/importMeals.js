require("dotenv").config();
console.log("DB:", process.env.CONNECTION_STRING);
const mongoose = require("mongoose");
const axios = require("axios");
const Recipe = require("../models/recipeModel");
const User = require("../models/userModel");

// 1. CONNECT TO MONGO THROUGH .env
async function connectDB() {
    try {
        await mongoose.connect(process.env.CONNECTION_STRING, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB Connected");
    } catch (err) {
        console.error("MongoDB Connection Error:", err);
        process.exit(1);
    }
}

// Get or create admin user ID for imported recipes
async function getAdminUserId() {
    let adminUser = await User.findOne({ role: "admin" });
    
    if (!adminUser) {
        const bcrypt = require("bcrypt");
        const hashedPassword = await bcrypt.hash("recipenest123", 10);
        adminUser = await User.create({
            username: "SuperAdmin_RecipeNest",
            email: "recipenest@gmail.com",
            password: hashedPassword,
            role: "admin",
        });
        console.log("Created admin user for imported recipes");
    }
    
    console.log(`Using admin user: ${adminUser.username} (ID: ${adminUser._id})`);
    return adminUser._id;
}

// 2. Extract ingredients from TheMealDB
function extractIngredients(meal) {
    const ingredients = [];

    for (let i = 1; i <= 20; i++) {
        const ing = meal[`strIngredient${i}`];
        const meas = meal[`strMeasure${i}`];

        if (ing && ing.trim() !== "") {
            ingredients.push(`${ing} - ${meas || ""}`.trim());
        }
    }

    return ingredients;
}

// 3. Fetch all meals A–Z
async function fetchAllMeals() {
    let allMeals = [];

    for (let letter of "abcdefghijklmnopqrstuvwxyz") {
        try {
            const res = await axios.get(
                `https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`
            );

            if (res.data.meals) {
                allMeals = allMeals.concat(res.data.meals);
            }
        } catch (error) {
            console.log(`Error fetching '${letter}':`, error.message);
        }
    }

    return allMeals;
}

// 4. Normalize + Save
async function importMeals() {
    await connectDB();
    
    // Get admin user ID dynamically
    const adminUserId = await getAdminUserId();

    const meals = await fetchAllMeals();
    console.log(`Fetched ${meals.length} meals from MealDB`);

    for (const meal of meals) {
        const ingredients = extractIngredients(meal);

        // UPDATED BLOCK - Use dynamic admin user ID
        const recipeData = {
            user_id: adminUserId,
            title: meal.strMeal,
            description: meal.strInstructions || "No description provided.",
            ingredients,
            instructions: meal.strInstructions,
            image: meal.strMealThumb,
            tags: meal.strTags ? meal.strTags.split(",").map(t => t.trim()) : [],
            isExternal: true, // Mark as imported
        };

        try {
            // Avoid duplicates
            const exists = await Recipe.findOne({ title: meal.strMeal });
            if (exists) {
                console.log(`Skipping duplicate: ${meal.strMeal}`);
                continue;
            }

            const recipe = new Recipe(recipeData);
            await recipe.save();
            console.log(`Saved: ${meal.strMeal}`);
        } catch (err) {
            console.log(`Error saving ${meal.strMeal}:`, err.message);
        }
    }

    console.log("Import complete!");
    mongoose.connection.close();
}

importMeals();
