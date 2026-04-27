import React, { useState } from "react";

export default function Home({ isLoggedIn = false }) {
    const [menuOpen, setMenuOpen] = useState(false);

    const categories = ["Breakfast", "Vegan", "Desserts", "Quick Meals", "Healthy"];
    const trendingRecipes = [
        {
            id: 1,
            title: "Spaghetti Carbonara",
            img:
                "https://images.unsplash.com/photo-1603133872878-684f0be2a3e8?auto=format&fit=crop&w=800&q=80",
        },
        {
            id: 2,
            title: "Avocado Toast",
            img:
                "https://images.unsplash.com/photo-1559622214-67a5d31b7c52?auto=format&fit=crop&w=800&q=80",
        },
        {
            id: 3,
            title: "Berry Smoothie Bowl",
            img:
                "https://images.unsplash.com/photo-1606755962773-0e4b23bc37cb?auto=format&fit=crop&w=800&q=80",
        },
        {
            id: 4,
            title: "Classic Pancakes",
            img:
                "https://images.unsplash.com/photo-1587731502849-ccf38fd54e06?auto=format&fit=crop&w=800&q=80",
        },
        {
            id: 5,
            title: "Mushroom Risotto",
            img:
                "https://images.unsplash.com/photo-1617196034796-73dfa5c7c9b2?auto=format&fit=crop&w=800&q=80",
        },
        {
            id: 6,
            title: "Vegan Curry",
            img:
                "https://images.unsplash.com/photo-1532634896-26909d0d3726?auto=format&fit=crop&w=800&q=80",
            // changed to another image for variety
        },
    ];

    return (
        <div className="bg-[#FFF8F2] text-[#333] font-inter min-h-screen">
            {/* Navbar */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-[#F97316]">🍳 RecipeNest</h1>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex gap-6 text-sm font-medium">
                        <a href="#" className="hover:text-[#F97316] transition">
                            Home
                        </a>
                        <a href="#" className="hover:text-[#F97316] transition">
                            Recipes
                        </a>
                        <a href="#" className="hover:text-[#F97316] transition">
                            Categories
                        </a>
                        <a href="#" className="hover:text-[#F97316] transition">
                            About
                        </a>
                    </nav>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex gap-3">
                        {isLoggedIn ? (
                            <button className="bg-[#F97316] text-white px-5 py-2 rounded-lg hover:bg-[#ea660a] transition">
                                My Profile
                            </button>
                        ) : (
                            <>
                                <button className="border border-[#F97316] text-[#F97316] px-4 py-2 rounded-lg hover:bg-[#F97316] hover:text-white transition">
                                    Login
                                </button>
                                <button className="bg-[#F97316] text-white px-4 py-2 rounded-lg hover:bg-[#ea660a] transition">
                                    Sign Up
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden p-2 rounded-lg text-[#F97316] border border-[#F97316]"
                    >
                        ☰
                    </button>
                </div>

                {/* Mobile Nav Menu */}
                {menuOpen && (
                    <div className="md:hidden bg-[#FFF1E6] border-t border-[#F97316]/20 py-4">
                        <nav className="flex flex-col items-center gap-4">
                            <a href="#" className="hover:text-[#F97316] transition">
                                Home
                            </a>
                            <a href="#" className="hover:text-[#F97316] transition">
                                Recipes
                            </a>
                            <a href="#" className="hover:text-[#F97316] transition">
                                Categories
                            </a>
                            <a href="#" className="hover:text-[#F97316] transition">
                                About
                            </a>
                            <div className="flex gap-3 mt-4">
                                <button className="border border-[#F97316] text-[#F97316] px-4 py-2 rounded-lg hover:bg-[#F97316] hover:text-white transition">
                                    Login
                                </button>
                                <button className="bg-[#F97316] text-white px-4 py-2 rounded-lg hover:bg-[#ea660a] transition">
                                    Sign Up
                                </button>
                            </div>
                        </nav>
                    </div>
                )}
            </header>

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <h2 className="text-5xl font-semibold text-[#F97316] leading-tight">
                        Cook, Create, and Share the Joy.
                    </h2>
                    <p className="mt-4 text-lg text-[#555]">
                        Discover recipes you’ll love — or share your own with our community
                        of passionate home chefs.
                    </p>
                    <div className="mt-8 flex gap-4">
                        <button className="bg-[#F97316] hover:bg-[#ea660a] text-white rounded-lg px-6 py-3 transition">
                            Explore Recipes
                        </button>
                        <button className="border border-[#F97316] text-[#F97316] hover:bg-[#F97316] hover:text-white rounded-lg px-6 py-3 transition">
                            Upload Yours
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <img
                        src="https://images.unsplash.com/photo-1604152135912-04a652c0f68c?auto=format&fit=crop&w=400&q=80"
                        alt="Dish"
                        className="rounded-2xl shadow-md"
                    />
                    <img
                        src="https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=400&q=80"
                        alt="Dish"
                        className="rounded-2xl shadow-md mt-8"
                    />
                    <img
                        src="https://images.unsplash.com/photo-1603133872878-684f0be2a3e8?auto=format&fit=crop&w=800&q=80"
                        alt="Dish"
                        className="rounded-2xl shadow-md col-span-2"
                    />
                </div>
            </section>

            {/* Category Chips */}
            <section className="bg-[#FFF1E6] py-16">
                <div className="max-w-7xl mx-auto px-6">
                    <h3 className="text-3xl font-semibold mb-6 text-center text-[#F97316]">
                        Explore by Category
                    </h3>
                    <div className="flex gap-4 overflow-x-auto justify-center">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                className="px-5 py-2 bg-white text-[#F97316] border border-[#F97316]/30 rounded-full hover:bg-[#F97316] hover:text-white transition"
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trending Recipes */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <h3 className="text-3xl font-semibold mb-10 text-center text-[#F97316]">
                        Trending This Week 🍽️
                    </h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {trendingRecipes.map((r) => (
                            <div
                                key={r.id}
                                className="rounded-xl overflow-hidden shadow hover:shadow-lg transition relative group bg-white"
                            >
                                <img
                                    src={r.img}
                                    alt={r.title}
                                    className="w-full h-52 object-cover"
                                />
                                <div className="p-4">
                                    <h4 className="font-semibold text-lg">{r.title}</h4>
                                </div>
                                <div className="absolute inset-0 bg-white/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                    <button className="bg-[#F97316] text-white rounded-lg px-5 py-2">
                                        View Recipe
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Personalized / Guest CTA */}
            {isLoggedIn ? (
                <section className="bg-[#FFF1E6] py-20">
                    <div className="max-w-7xl mx-auto px-6 text-center">
                        <h3 className="text-3xl font-semibold mb-8 text-[#F97316]">
                            Your Personalized Picks 🍲
                        </h3>
                        <p className="text-[#666] mb-12">
                            Based on your saved favorites and cooking history.
                        </p>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {trendingRecipes.slice(0, 3).map((r) => (
                                <div
                                    key={r.id}
                                    className="rounded-xl overflow-hidden shadow bg-white"
                                >
                                    <img
                                        src={r.img}
                                        alt={r.title}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="p-4">
                                        <h4 className="font-semibold text-lg">{r.title}</h4>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            ) : (
                <section className="bg-gradient-to-r from-[#FFF8F2] to-[#FFF1E6] py-20 text-center">
                    <h3 className="text-3xl font-semibold mb-4 text-[#F97316]">
                        Want recipes made just for you?
                    </h3>
                    <p className="text-[#555] mb-8">
                        Sign up to save favorites and get personalized recommendations.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button className="bg-[#F97316] text-white px-6 py-3 rounded-lg hover:bg-[#ea660a] transition">
                            Sign Up Free
                        </button>
                        <button className="border border-[#F97316] text-[#F97316] hover:bg-[#F97316] hover:text-white px-6 py-3 rounded-lg transition">
                            Browse as Guest
                        </button>
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="bg-[#1E293B] text-white py-12">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
                    <div>
                        <h4 className="font-semibold text-xl mb-3 text-[#FECBA1]">About</h4>
                        <ul className="space-y-1 text-sm opacity-90">
                            <li>Our Story</li>
                            <li>Blog</li>
                            <li>Careers</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-xl mb-3 text-[#FECBA1]">Support</h4>
                        <ul className="space-y-1 text-sm opacity-90">
                            <li>Help Center</li>
                            <li>Contact</li>
                            <li>FAQ</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-xl mb-3 text-[#FECBA1]">Follow Us</h4>
                        <div className="flex gap-3 text-2xl">
                            <span>📸</span>
                            <span>▶️</span>
                            <span>📌</span>
                        </div>
                    </div>
                </div>
                <div className="text-center text-sm mt-8 opacity-60">
                    © 2025 RecipeNest. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
