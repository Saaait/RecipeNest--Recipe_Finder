const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const validateToken = require("../middleware/validateTokenHandler");
const admin = require("../middleware/adminMiddleware");

const {
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
} = require("../controllers/recipeController");

// ----------------- Recipe CRUD Routes -----------------

// ----------------- PUBLIC ROUTES -----------------
router.get("/", getRecipes);
router.get("/:id", getRecipe);

// Protect routes from here onwards
router.use(validateToken);

// ----------------- PROTECTED ROUTES -----------------
router.route("/")
  .post(upload.single("image"), createRecipe);
// Get current user's recipes (including pending/rejected)
router.get("/user/my-recipes", getUserRecipes);
// ----------------- ADMIN ROUTES (Approval) -----------------
// Admin routes (require authentication AND admin role)
router.get("/admin/pending", admin, getPendingRecipes);
router.get("/admin/all", admin, getAllRecipesForAdmin);
router.put("/admin/:id/approve", admin, approveRecipe);
router.put("/admin/:id/reject", admin, rejectRecipe);
router.put("/admin/:id/unapprove", admin, unapproveRecipe);

// Update and delete routes (protected)
router.route("/:id")
  .put(upload.single("image"), updateRecipe)
  .delete(deleteRecipe);

module.exports = router;
