const express = require("express");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");
const connectDb = require("./config/dbConnection");
const dotenv = require("dotenv").config();
const seedAdmin = require("./seedAdmin");

connectDb().then(async () => {
    const app = express();

    const port = process.env.PORT || 5000;

    // ✅ Enable CORS
    app.use(cors({
        origin: "http://localhost:5173", // frontend URL
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }));

    // Parse JSON body
    app.use(express.json());

    // Serve static files from uploads directory
    app.use("/uploads", express.static("uploads"));

    // ----------------- Routes -----------------

    // Seed admin user after DB connection
    await seedAdmin();

    // Users
    app.use("/api/users", require("./routes/userRoutes"));

    // User recipes CRUD
    app.use("/api/recipes", require("./routes/recipeRoutes"));

    // Saved recipes
    app.use("/api/recipes", require("./routes/savedRecipeRoutes"));

    // External API (will not use if possible)      
    app.use("/api/recipes/external", require("./routes/externalRecipeRoutes"));

    // Recommendations
    app.use("/api/recommend", require("./routes/recommendationRoutes"));

    // Start server
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
});
