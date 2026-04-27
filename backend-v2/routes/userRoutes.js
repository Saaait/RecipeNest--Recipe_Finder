const express = require("express");
const {
    registerUser,
    loginUser,
    refreshToken,
    logoutUser,
    currentUser,
    getAllUsers,
    updateUser,
    deleteUser,
} = require("../controllers/userController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

// Public Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshToken);
router.post("/logout", logoutUser);

// Private Routes (user must be logged in)
router.get("/current", validateToken, currentUser);

// Admin + User Routes
router.get("/", validateToken, getAllUsers);
router.put("/:id", validateToken, updateUser);
router.delete("/:id", validateToken, deleteUser);

module.exports = router;
