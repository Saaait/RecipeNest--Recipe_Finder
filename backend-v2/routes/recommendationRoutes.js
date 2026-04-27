const express = require("express");
const router = express.Router();
const validateToken = require("../middleware/validateTokenHandler");

const {
    recommendByTags,
    recommendByIngredients,
    recommendFromUserRecipes,
    recommendPopular,
    recommendRecent,
    recommendForUser
} = require("../controllers/recommendationController");

// Must be authenticated
router.use(validateToken);

// Rule-based recommendation endpoints
router.get("/tags", recommendByTags);
router.get("/ingredients", recommendByIngredients);
router.get("/similar", recommendFromUserRecipes);
router.get("/popular", recommendPopular);
router.get("/recent", recommendRecent);

// Main mixed recommendation
router.get("/", recommendForUser);

module.exports = router;