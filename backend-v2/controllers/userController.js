const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { searchUsers } = require("../utils/searchUtility");

// Register a User
//@route POST /api/users/register
//@access public
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        res.status(400);
        throw new Error("All fields are required");
    }
    const userAvailable = await User.findOne({ email });
    if (userAvailable) {
        res.status(400);
        throw new Error("User exist");
    }

    //Hash password 
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        username,
        email,
        password: hashedPassword,
        role: "user", // default role
    });

    if (user) {
        res.status(201).json({ message: "Registered successful", _id: user.id, email: user.email });
    } else {
        res.status(400);
        throw new Error("User data not valid");
    }
});

// Login a User
//@route POST /api/users/login
//@access public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400);
        throw new Error("All fields are required");
    }

    const user = await User.findOne({ email }).select("+role");
    if (user && (await bcrypt.compare(password, user.password))) {

        // Access token
        const accessToken = jwt.sign(
            {
                user: {
                    username: user.username,
                    email: user.email,
                    id: user.id,
                    role: user.role,
                },
            },
            process.env.ACCESS_TOKEN_SECERT,
            { expiresIn: "30m" }
        );

        // Refresh token
        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" }
        );

        // Optionally, store refreshToken in DB or in-memory for revocation
        user.refreshToken = refreshToken;
        await user.save();

        res.status(200).json({
            message: "Login successful",
            accessToken,
            refreshToken,
        });
    } else {
        res.status(401);
        throw new Error("Email or Password is not valid");
    }
});


//@route POST /api/users/refresh
//@access public
const refreshToken = asyncHandler(async (req, res) => {
    const { token } = req.body; // old refresh token
    if (!token) {
        res.status(401);
        throw new Error("Refresh token missing");
    }

    // Find user with the refresh token
    const user = await User.findOne({ refreshToken: token });
    if (!user) {
        res.status(403);
        throw new Error("Invalid refresh token");
    }

    // Verify old refresh token
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
        if (err) {
            // Clear the token in DB if verification fails
            user.refreshToken = "";
            await user.save();
            res.status(403);
            throw new Error("Invalid refresh token");
        }

        // Issue a new access token
        const accessToken = jwt.sign(
            {
                user: {
                    username: user.username,
                    email: user.email,
                    id: user.id,
                    role: user.role,
                },
            },
            process.env.ACCESS_TOKEN_SECERT,
            { expiresIn: "30m" }
        );

        // 🔄 Rotate refresh token
        const newRefreshToken = jwt.sign(
            { id: user.id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" }
        );

        // Store new refresh token in DB
        user.refreshToken = newRefreshToken;
        await user.save();

        // Send both tokens to client
        res.json({ accessToken, refreshToken: newRefreshToken });
    });
});


//@route POST /api/users/logout
//@access public
const logoutUser = asyncHandler(async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.sendStatus(204); // No content
    }

    const user = await User.findOne({ refreshToken: token });
    if (user) {
        user.refreshToken = ""; // clear refresh token
        await user.save();
    }

    res.sendStatus(204).json({ message: "Logged out successfully" });
});


// Current User
//@route GET /api/users/current
//@access private
const currentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select("+role -password");
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
    });
});


// Get All Users
//@route GET /api/users
//@queryparam {string} search - optional search term (uses fuse.js fuzzy search)
//@access private (Admin only)
const getAllUsers = asyncHandler(async (req, res) => {
    if (req.user.role !== "admin") {
        res.status(403);
        throw new Error("Access denied: Admins only");
    }

    const { search } = req.query;

    // Get all users first
    const users = await User.find().select("-password +role");

    // Convert to plain objects for fuse.js processing
    let resultUsers = users.map(u => u.toObject());

    // Apply fuzzy search if search term is provided
    if (search && search.trim().length > 0) {
        resultUsers = searchUsers(resultUsers, search);
    }

    res.status(200).json(resultUsers);
});

// Update a User
//@route PUT /api/users/:id
//@access private (Admin or user themselves)
const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Find target user including role
    const user = await User.findById(id).select("+role");
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    // Fetch requester to verify permissions
    const requester = await User.findById(req.user.id).select("+role");
    if (!requester) {
        res.status(401);
        throw new Error("Unauthorized");
    }

    // Allow update if admin or same user
    if (requester.role !== "admin" && requester.id !== id) {
        res.status(403);
        throw new Error("Access denied: You can only update your own account");
    }

    const { username, email, password, role } = req.body;
    let updatedFields = {};

    if (username) updatedFields.username = username;
    if (email) updatedFields.email = email;
    if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updatedFields.password = hashedPassword;
    }

    // Only admin can change roles
    if (requester.role === "admin" && role) {
        updatedFields.role = role;
    }

    // Update user and include role in response
    const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: updatedFields },
        { new: true }
    ).select("-password +role");

    res.status(200).json(updatedUser);
});

// Delete a User
//@route DELETE /api/users/:id
//@access private (Admin only)
const deleteUser = asyncHandler(async (req, res) => {
    if (req.user.role !== "admin") {
        res.status(403);
        throw new Error("Access denied: Admins only");
    }

    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: `User ${user.username} deleted successfully` });
});

module.exports = {
    registerUser,
    loginUser,
    refreshToken,
    logoutUser,
    currentUser,
    getAllUsers,
    updateUser,
    deleteUser,
};
