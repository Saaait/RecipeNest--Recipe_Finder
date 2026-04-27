import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { ChefHat, Clock, Calendar, User, ArrowLeft, Share2, BookmarkPlus, Bookmark } from "lucide-react";
import recipeAPI from "../api/recipeAPI";
import { getImageUrl } from "../utils/imageHelper";

const RecipeDetail = () => {
  const { id } = useParams();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    setLoading(true);
    try {
      const res = await recipeAPI.getRecipe(id);
      setRecipe(res.data);

      if (user) {
        try {
          const savedRes = await recipeAPI.getSavedRecipes();
          const savedRecipes = Array.isArray(savedRes.data?.recipes)
            ? savedRes.data.recipes
            : Array.isArray(savedRes.data)
              ? savedRes.data
              : [];
          const isSaved = savedRecipes.some(r => r._id === id);
          setSaved(isSaved);
        } catch (err) {
          setSaved(false);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load recipe");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      if (saved) {
        await recipeAPI.unsaveRecipe(id);
      } else {
        await recipeAPI.saveRecipe(id);
      }
      setSaved(!saved);
    } catch (err) {
      console.error("Failed to toggle save:", err);
      alert(err.response?.data?.message || "Failed to save recipe");
    }
  };

  const saveButtonClass = saved
    ? "bg-[#ff7043] text-white hover:bg-[#e66038]"
    : "bg-white border-2 border-[#ff7043] text-[#ff7043] hover:bg-[#fff5e6]";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#ff7043]"></div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ChefHat size={64} className="text-[#1a3b5d] mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold text-[#1a3b5d] mb-2">
            Recipe Not Found
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/explore")}
            className="inline-flex items-center gap-2 bg-[#ff7043] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#e66038] transition-all"
          >
            <ArrowLeft size={20} />
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#1a3b5d] hover:text-[#ff7043] mb-4 md:mb-6 font-medium"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {/* Recipe Image */}
        {recipe.image ? (
          <img
            src={getImageUrl(recipe.image)}
            alt={recipe.title}
            className="w-full h-[300px] md:h-[400px] object-cover rounded-2xl shadow-lg"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-[300px] md:h-[400px] bg-gradient-to-br from-[#ff7043] to-[#e66038] rounded-2xl shadow-lg flex items-center justify-center">
            <ChefHat size={100} className="text-white opacity-50" />
          </div>
        )}

        {/* Recipe Header */}
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1a3b5d] mb-4">
              {recipe.title}
            </h1>
            {/* Description removed from header to avoid duplication with instructions */}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className={`${saveButtonClass} self-start sm:ml-4 flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl`}
          >
            {saved ? (
              <Bookmark fill="currentColor" size={22} />
            ) : (
              <BookmarkPlus size={22} />
            )}
            {saved ? "Saved" : "Save Recipe"}
          </button>
        </div>

        {/* Meta Info */}
        <div className="flex flex-wrap gap-6 mb-8">
          <div className="flex items-center gap-2 text-gray-600">
            <User size={20} className="text-[#ff7043]" />
            <span className="font-medium">
              {recipe.user_id?.username || "Unknown"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar size={20} className="text-[#ff7043]" />
            <span className="font-medium">
              {new Date(recipe.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <BookmarkPlus
              size={20}
              className={saved ? "text-[#ff7043]" : "text-gray-400"}
            />
            <span className="font-medium">{recipe.saveCount || 0} Saves</span>
          </div>
        </div>

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {recipe.tags.map((tag, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-[#fff5e6] text-[#1a3b5d] rounded-full text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Ingredients */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-[#1a3b5d] mb-4 flex items-center gap-2">
                <span className="bg-[#ff7043] p-2 rounded-lg">
                  <Clock size={20} className="text-white" />
                </span>
                Ingredients
              </h2>
              {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 ? (
                <ul className="space-y-3">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-gray-700"
                    >
                      <span className="flex-shrink-0 w-2 h-2 bg-[#ff7043] rounded-full mt-2" />
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No ingredients listed</p>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-[#1a3b5d] mb-6">
                Instructions
              </h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {recipe.instructions}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;