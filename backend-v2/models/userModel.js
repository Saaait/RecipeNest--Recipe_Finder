const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Please add the user name"],
            trim: true,
            minlength: [3, 'Name must be at least 3 characters long'],
            maxlength: [30, 'Name cannot exceed 30 characters'],
        },
        email: {
            type: String,
            required: [true, "Please add the email"],
            unique: [true, "Email already taken"],
            lowercase: true,
            trim: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
        },
        password: {
            type: String,
            required: [true, "Please add the password"],
            minlength: [6, 'Password must be at least 6 characters long'],
            // chiyo bhanee!!
            // validate: {
            //     validator: function (value) {
            //         // Must contain at least one uppercase letter, one lowercase letter, one number, and one special character
            //         return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/.test(value);
            //     },
            //     message:
            //         "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
            // },
        },
        // role exists internally but is hidden by default
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
            select: false, // <-- Hide from normal query results
        },
        refreshToken: { type: String, default: "" },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);
