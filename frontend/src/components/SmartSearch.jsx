import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { ChefHat } from "lucide-react";
import recommendationAPI from "../api/recommendationAPI";
import recipeAPI from "../api/recipeAPI";
import { getImageUrl } from "../utils/imageHelper";
import { useNavigate } from "react-router-dom";

const SmartSearch = () => {
  const { user } = useContext(UserContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMethod, setSearchMethod] = useState("");
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e?.preventDefault();
    
    if (!searchTerm.trim()) {
      setResults([]);
      setSearchMethod("");
      return;
    }

    setIsSearching(true);

    try {
      const res = await recipeAPI.getRecipes(searchTerm);
      let searchResults = [];
      let method = "Database search";

      if (res.data?.recipes) {
        searchResults = res.data.recipes;
      } else if (Array.isArray(res.data)) {
        searchResults = res.data;
      }

      if (user && searchResults.length > 0) {
        try {
          const recRes = await recommendationAPI.getRecommendations();
          let recommendations = [];

          if (recRes.data?.recipes) {
            recommendations = recRes.data.recipes;
          } else if (Array.isArray(recRes.data)) {
            recommendations = recRes.data;
          }

          const boostSet = new Set(recommendations.map(r => r._id));
          const boosted = searchResults.map(recipe => ({
            ...recipe,
            _matchScore: boostSet.has(recipe._id) ? (recipe.saveCount || 0) + 10 : (recipe.saveCount || 0)
          }));

          boosted.sort((a, b) => b._matchScore - a._matchScore);
          
          searchResults = boosted;
          method = "Personalized search results";
        } catch (err) {
          // Fallback to regular search if personalization fails
        }
      }

      if (searchResults.length === 0 && user) {
        try {
          const tagRes = await recommendationAPI.getByTags();
          let tagResults = [];

          if (tagRes.data?.recipes) {
            tagResults = tagRes.data.recipes;
          } else if (Array.isArray(tagRes.data)) {
            tagResults = tagRes.data;
          }

          const filtered = tagResults.filter(r => 
            r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
          );

          if (filtered.length > 0) {
            searchResults = filtered;
            method = "Suggested from your saved recipe tags";
          }
        } catch (err) {
          // Fallback to next suggestion method
        }
      }

      if (searchResults.length === 0 && user) {
        try {
          const ingRes = await recommendationAPI.getByIngredients();
          let ingResults = [];

          if (ingRes.data?.recipes) {
            ingResults = ingRes.data.recipes;
          } else if (Array.isArray(ingRes.data)) {
            ingResults = ingRes.data;
          }

          const filtered = ingResults.filter(r => 
            r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.ingredients?.some(i => i.toLowerCase().includes(searchTerm.toLowerCase()))
          );

          if (filtered.length > 0) {
            searchResults = filtered;
            method = "Suggested from your saved recipe ingredients";
          }
        } catch (err) {
          // Fallback to regular search
        }
      }

      setResults(searchResults.slice(0, 15));
      setSearchMethod(method);
    } catch (err) {
      console.error("Search failed:", err);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length >= 2) {
        handleSearch();
      } else if (searchTerm.length === 0) {
        setResults([]);
        setSearchMethod("");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search recipes, ingredients, or tags..."
          className="w-full px-6 py-4 pl-14 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ff7043] focus:border-transparent text-lg shadow-lg"
        />
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {isSearching && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#ff7043]"></div>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[600px] overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-[#fff5e6]">
            <p className="text-sm text-gray-600">
              {searchMethod} • {results.length} results
            </p>
          </div>
          <div className="overflow-y-auto max-h-[500px] p-2">
            {results.map((recipe) => (
              <div
                key={recipe._id}
                onClick={() => navigate(`/recipe/${recipe._id}`)}
                className="flex gap-4 p-3 hover:bg-[#fff5e6] rounded-xl cursor-pointer transition-all"
              >
                {recipe.image ? (
                  <img
                    src={getImageUrl(recipe.image)}
                    alt={recipe.title}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-[#ff7043] to-[#e66038] rounded-lg flex items-center justify-center flex-shrink-0">
                    <ChefHat size={28} className="text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-[#1a3b5d] truncate">
                    {recipe.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {recipe.description}
                  </p>
                  {recipe._matchScore && recipe._matchScore > 10 && (
                    <span className="inline-flex items-center mt-1 text-xs bg-[#ff7043] text-white px-2 py-1 rounded-full">
                      ★ Recommended for you
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {searchTerm && results.length === 0 && !isSearching && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
          <p className="text-gray-600">No recipes found</p>
          <p className="text-sm text-gray-500 mt-1">
            Try different keywords or browse all recipes
          </p>
        </div>
      )}
    </div>
  );
};

export default SmartSearch;