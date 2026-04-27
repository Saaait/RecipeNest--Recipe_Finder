import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { ChefHat, TrendingUp, Clock, Star, ArrowRight, Sparkles, AlertCircle, Search } from "lucide-react";
import recipeAPI from "../api/recipeAPI";
import { getImageUrl } from "../utils/imageHelper";
import Recommendations from "../components/Recommendations";

const Home = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRandomRecipes();
  }, []);

  const fetchRandomRecipes = async () => {
    try {
      const res = await recipeAPI.getRecipes();

      const recipes = Array.isArray(res.data?.recipes) 
        ? res.data.recipes 
        : Array.isArray(res.data) 
          ? res.data 
          : [];

      if (recipes.length > 0) {
        // Shuffle and get 3 random recipes
        const shuffled = [...recipes].sort(() => Math.random() - 0.5);
        setFeaturedRecipes(shuffled.slice(0, 3));
      } else {
        setFeaturedRecipes([]);
      }
    } catch (err) {
      console.error("Failed to fetch random recipes:", err);
      console.error("Error details:", {
        message: err.message,
        code: err.code,
        response: err.response?.data
      });
      setError(err.message || "Failed to load recipes");
      setFeaturedRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Sparkles size={32} className="text-[#ff7043]" />,
      title: "Culinary Excellence",
      description: "Explore an extensive collection of handcrafted recipes from talented chefs and home cooks worldwide.",
    },
    {
      icon: <TrendingUp size={32} className="text-[#ff7043]" />,
      title: "Smart Suggestions",
      description: "Our intelligent system recommends recipes based on your tastes, dietary preferences, and cooking history.",
    },
    {
      icon: <Clock size={32} className="text-[#ff7043]" />,
      title: "Effortless Cooking",
      description: "Master every dish with clear, step-by-step instructions that make cooking a delightful experience.",
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#1a3b5d] to-[#2d5a8f] text-white py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-[#ff7043] p-4 rounded-full">
              <ChefHat size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Discover Delicious Recipes & Share Your Culinary Creations
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join a vibrant community of food enthusiasts. Find daily inspiration, share your signature dishes, and transform every meal into a memorable experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/explore")}
              className="flex items-center justify-center gap-2 bg-[#ff7043] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#e66038] transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Search size={20} />
              Discover Recipes
            </button>
            <button
              onClick={() => user ? navigate("/add-recipe") : navigate("/login")}
              className="flex items-center justify-center gap-2 bg-white text-[#1a3b5d] px-8 py-4 rounded-full font-semibold hover:bg-blue-50 transition-all shadow-lg transform hover:scale-105"
            >
              <ArrowRight size={20} />
              {user ? "Share Your Creations" : "Start Cooking Now"}
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20 px-4 md:px-6 bg-[#fff5e6]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a3b5d] text-center mb-4">
            Why Food Enthusiasts Love RecipeNest
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Experience the perfect blend of convenience, creativity, and community
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100"
              >
                <div className="bg-[#fff5e6] p-4 rounded-xl w-fit mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-[#1a3b5d] mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Something to Cook Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-[#1a3b5d] text-center mb-4">
            Something to Cook?
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Explore a curated collection of mouth-watering recipes crafted by our passionate community
          </p>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#ff7043]"></div>
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <AlertCircle size={64} className="text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#1a3b5d] mb-2">
                Oops! Something went wrong
              </h3>
              <p className="text-gray-600 text-lg mb-6">
                {error}
              </p>
              <button
                onClick={fetchRandomRecipes}
                className="inline-flex items-center gap-2 bg-[#1a3b5d] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#2d5a8f] transition-all transform hover:scale-105"
              >
                Try Again
              </button>
            </div>
          ) : featuredRecipes.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <ChefHat size={64} className="text-[#1a3b5d] mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-[#1a3b5d] mb-2">
                Start the Culinary Journey
              </h3>
              <p className="text-gray-600 text-lg mb-6">
                Be the first to share your delicious creation and inspire others!
              </p>
              <a
                href="/add-recipe"
                className="inline-flex items-center gap-2 bg-[#ff7043] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#e66038] transition-all transform hover:scale-105"
              >
                <ArrowRight size={20} />
                Share Your Recipe
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredRecipes.map((recipe) => (
                <div
                  key={recipe._id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer overflow-hidden border border-gray-100"
                  onClick={() => navigate(`/recipe/${recipe._id}`)}
                >
                  {recipe.image && (
                    <img
                      src={getImageUrl(recipe.image)}
                      alt={recipe.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}
                  {!recipe.image && (
                    <div className="w-full h-48 bg-gradient-to-br from-[#ff7043] to-[#e66038] flex items-center justify-center">
                      <ChefHat size={48} className="text-white" />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#1a3b5d] mb-2">
                      {recipe.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {recipe.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        By {recipe.user_id?.username || "Unknown"}
                      </span>
                      <div className="flex items-center gap-1 text-[#ff7043]">
                        <Star size={16} fill="currentColor" />
                        <span className="text-sm font-medium">
                          {recipe.saveCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <button
              onClick={() => navigate("/explore")}
              className="inline-flex items-center gap-2 text-[#ff7043] font-semibold hover:underline text-lg"
            >
              View All Recipes <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Personalized Recommendations Section */}
      {user && <Recommendations />}

      {/* CTA Section */}
      <section className="py-16 md:py-20 px-4 md:px-6 bg-[#1a3b5d]">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Share Your Recipes?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of cooks and share your culinary creations with the
            world.
          </p>
          <button
            onClick={() => user ? navigate("/add-recipe") : navigate("/login")}
            className="inline-flex items-center gap-2 bg-[#ff7043] text-white px-10 py-4 rounded-full font-semibold hover:bg-[#e66038] transition-all shadow-lg hover:shadow-xl text-lg"
          >
            <Sparkles size={24} />
            {user ? "Add Your Recipe Now" : "Login to Get Started"}
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;