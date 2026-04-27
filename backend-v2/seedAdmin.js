const User = require("./models/userModel");
const bcrypt = require("bcrypt");

async function seedAdmin() {
    try {
        // Check if there’s already an admin user
        const adminExists = await User.findOne({ role: "admin" });

        if (!adminExists) {
            const hashedPassword = await bcrypt.hash("recipenest123", 10);
            await User.create({
                username: "SuperAdmin_RecipeNest",
                email: "recipenest@gmail.com",
                password: hashedPassword,
                role: "admin",
            });
            console.log("Admin user created: recipenest@gmail.com / recipenest123");
        } else {
            console.log("Admin already exists. Skipping admin creation.");
        }
    } catch (error) {
        console.error("Error seeding admin:", error);
    }
}

module.exports = seedAdmin;
