import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { ChefHat, Search, TrendingUp, Clock, Sparkles, Star, Grid3X3, List, ChefHat as Chef, AlertCircle, Heart, Flame } from "lucide-react";
import recipeAPI from "../api/recipeAPI";
import recommendationAPI from "../api/recommendationAPI";
import { getImageUrl } from "../utils/imageHelper";

const Explore = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  const [filterType, setFilterType] = useState("all"); // "all", "recommend", "popular", "recent"
  const [stats, setStats] = useState({
    total: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [recipesPerPage] = useState(6);

  useEffect(() => {
    fetchRecipes();
  }, []);

  useEffect(() => {
    applyFilter();
    setCurrentPage(1); // Reset to first page when filters change
  }, [filterType, recipes, searchTerm]);

  // Calculate paginated recipes
  const paginatedRecipes = () => {
    const startIndex = (currentPage - 1) * recipesPerPage;
    const endIndex = startIndex + recipesPerPage;
    return filteredRecipes.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredRecipes.length / recipesPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate pagination page numbers with ellipses
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if there are few
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first three pages
      pages.push(1);
      pages.push(2);
      pages.push(3);

      // Check if current page is in the middle area
      if (currentPage >= 4 && currentPage < totalPages) {
        // Show ellipsis, current page, ellipsis before last page
        pages.push('...');
        pages.push(currentPage);
        pages.push('...');
      } else if (totalPages > maxVisible) {
        // Show just ellipsis before last page
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const fetchRecipes = async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (user && filterType === "recommend") {
        const res = await recommendationAPI.getRecommendations();
        data = res.data;
      } else if (filterType === "popular") {
        const res = await recommendationAPI.getPopular();
        data = res.data;
      } else if (filterType === "recent") {
        const res = await recommendationAPI.getRecent();
        data = res.data;
      } else {
        const res = await recipeAPI.getRecipes();
        data = res.data;
      }

      const fetchedRecipes = Array.isArray(data?.recipes) 
        ? data.recipes 
        : Array.isArray(data) 
          ? data 
          : [];

      setRecipes(fetchedRecipes);
      setFilteredRecipes(fetchedRecipes);
      setStats({
        total: fetchedRecipes.length,
      });
    } catch (err) {
      console.error("Failed to fetch recipes:", err);
      console.error("Error details:", {
        message: err.message,
        code: err.code,
        response: err.response?.data
      });
      setError(err.message || "Failed to load recipes");
      
      // Fallback to basic recipes
      try {
        const res = await recipeAPI.getRecipes();
        const fallbackRecipes = Array.isArray(res.data?.recipes)
          ? res.data.recipes
          : Array.isArray(res.data)
            ? res.data
            : [];
        setRecipes(fallbackRecipes);
        setFilteredRecipes(fallbackRecipes);
        setError(null); // Clear error if fallback succeeds
      } catch (fallbackErr) {
        console.error("Fallback also failed:", fallbackErr);
        setRecipes([]);
        setFilteredRecipes([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async (type) => {
    if (type === "tags" || type === "ingredients") {
      // These filters have been removed
      return;
    }

    setFilterType(type);
    setLoading(true);

    try {
      let res;
      switch (type) {
        case "popular":
          res = await recommendationAPI.getPopular();
          break;
        case "recent":
          res = await recommendationAPI.getRecent();
          break;
        case "recommend":
          if (!user) {
            alert("Please login to see personalized recommendations");
            setFilterType("all");
            res = await recipeAPI.getRecipes();
          } else {
            res = await recommendationAPI.getRecommendations();
          }
          break;
        default:
          res = await recipeAPI.getRecipes();
      }

      const fetchedRecipes = res.data?.recipes || res.data || [];
      setRecipes(fetchedRecipes);
      setFilteredRecipes(
        searchTerm
          ? fetchedRecipes.filter(
              (r) =>
                r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.tags?.some((t) =>
                  t.toLowerCase().includes(searchTerm.toLowerCase())
                )
            )
          : fetchedRecipes
      );
    } catch (err) {
      console.error("Filter failed:", err);
      const FallbackRes = await recipeAPI.getRecipes();
      const fallbackRecipes = FallbackRes.data?.recipes || FallbackRes.data || [];
      setRecipes(fallbackRecipes);
      setFilteredRecipes(fallbackRecipes);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    if (!searchTerm) {
      setFilteredRecipes(recipes);
      return;
    }

    const filtered = recipes.filter(
      (recipe) =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.tags?.some((t) =>
          t.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
    setFilteredRecipes(filtered);
  };

  const highlightText = (text, highlight) => {
    if (!text || !highlight) return text;
    
    const parts = text.toString().split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, idx) => 
      part.toLowerCase() === highlight.toLowerCase() 
        ? <span key={idx} className="bg-yellow-300 text-[#1a3b5d] px-1 rounded font-semibold">{part}</span>
        : part
    );
  };

  const filters = [
    {
      id: "all",
      label: "Full Collection",
      icon: Grid3X3,
      description: "Browse our entire recipe archive"
    },
    {
      id: "recommend",
      label: "Curated For You",
      icon: Sparkles,
      requireAuth: true,
      description: "Handpicked selections based on your preferences"
    },
    {
      id: "popular",
      label: "Trending Now",
      icon: Heart,
      description: "Most-loved recipes from our community"
    },
    {
      id: "recent",
      label: "Fresh Arrivals",
      icon: Clock,
      description: "Newest additions to our culinary family"
    },
  ];

  return (
    <div className="pb-16 pt-6">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-[#ff7043] p-3 rounded-lg">
              <ChefHat size={32} className="text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1a3b5d]">
              Discover Culinary Treasures
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Explore an irresistible collection of recipes. From trending favorites to personalized suggestions, find your next masterpiece here.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Find your next favorite dish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff7043] focus:border-[#ff7043] transition-all"
              />
            </div>
            <div className="flex gap-2 justify-center sm:justify-start">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-[#ff7043] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Grid3X3 size={20} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-[#ff7043] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
          {searchTerm && (
            <div className="mt-3 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Search size={16} className="text-[#ff7043]" />
                <span>
                  Searching for: <span className="font-semibold text-[#1a3b5d]">"{searchTerm}"</span>
                </span>
                {filteredRecipes.length > 0 && (
                  <span className="text-gray-400">• Found {filteredRecipes.length} result{filteredRecipes.length !== 1 ? 's' : ''}</span>
                )}
              </div>
              <button
                onClick={() => setSearchTerm("")}
                className="text-[#ff7043] hover:text-[#e66038] font-medium"
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {filters.map((filter) => {
              const Icon = filter.icon;
              const isAuthRequired = filter.requireAuth && !user;
              return (
                <button
                  key={filter.id}
                  onClick={() => !isAuthRequired && handleFilterChange(filter.id)}
                  disabled={isAuthRequired}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    filterType === filter.id
                      ? "bg-[#ff7043] text-white shadow-lg"
                      : isAuthRequired
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-[#1a3b5d] hover:bg-gray-50 shadow-md border border-gray-200"
                  }`}
                  title={filter.description}
                >
                  <Icon size={18} />
                  <span>{filter.label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">
            {filters.find(f => f.id === filterType)?.description}
          </p>
        </div>

        {/* Current View Info */}
        <div className="bg-gradient-to-r from-[#1a3b5d] to-[#2d5a8f] text-white p-6 rounded-xl mb-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Showing</p>
              <p className="text-3xl font-bold mt-1">{filteredRecipes.length} recipes</p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">View</p>
              <p className="text-xl font-bold mt-1 capitalize">{filters.find(f => f.id === filterType)?.label}</p>
            </div>
          </div>
        </div>

        {/* Recipes Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#ff7043]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <AlertCircle size={80} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-[#1a3b5d] mb-2">
              Oops! Something went wrong
            </h3>
            <p className="text-gray-600 mb-6">
              {error}
            </p>
            <button
              onClick={fetchRecipes}
              className="inline-flex items-center gap-2 bg-[#1a3b5d] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2d5a8f] transition-all"
            >
              Try Again
            </button>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <ChefHat size={80} className="text-[#1a3b5d] mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-bold text-[#1a3b5d] mb-2">
              No Recipes Found
            </h3>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              {searchTerm
                ? "Try different search terms or browse all recipes"
                : filterType === "recommend"
                ? "Save more recipes to get personalized recommendations based on your taste!"
                : filterType === "popular"
                ? "Save recipes you like to see them appear in the popular list!"
                : filterType === "recent"
                ? "Be the first to share a recipe with the community!"
                : "Be the first to share a recipe!"}
            </p>
            <button
              onClick={() => user ? navigate("/explore") : navigate("/login")}
              className="inline-flex items-center gap-2 bg-[#ff7043] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#e66038] transition-all shadow-lg"
            >
              {user ? "Browse All Recipes" : "Login to Share Recipes"}
            </button>
          </div>
        ) : (
          <>
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {paginatedRecipes().map((recipe) => (
              <div
                key={recipe._id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer border border-gray-100 overflow-hidden"
                onClick={() => navigate(`/recipe/${recipe._id}`)}
              >
                {viewMode === "grid" ? (
                  <>
                    {recipe.image ? (
                      <img
                        src={getImageUrl(recipe.image)}
                        alt={recipe.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-[#ff7043] to-[#e66038] flex items-center justify-center">
                        <ChefHat size={48} className="text-white" />
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-[#1a3b5d] mb-2">
                        {searchTerm ? highlightText(recipe.title, searchTerm) : recipe.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {searchTerm ? highlightText(recipe.description, searchTerm) : recipe.description}
                      </p>
                      
                      {/* Show recommendation reason if available */}
                      {filterType === "recommend" && recipe._matchReason && (
                        <div className="mb-3 p-2 bg-[#fff5e6] border border-[#ff7043]/20 rounded-lg">
                          <p className="text-xs text-[#1a3b5d] flex items-start gap-1">
                            <Sparkles size={14} className="text-[#ff7043] mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{recipe._matchReason.explanation}</span>
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          By {recipe.user_id?.username || "Unknown"}
                        </span>
                        <div className="flex items-center gap-1 text-[#ff7043]">
                          <Star size={16} fill="currentColor" />
                          <span className="text-sm font-medium">
                            {recipe.saveCount || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex gap-4 p-4">
                    {recipe.image ? (
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gradient-to-br from-[#ff7043] to-[#e66038] flex items-center justify-center rounded-lg">
                        <ChefHat size={32} className="text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[#1a3b5d] mb-2">
                        {searchTerm ? highlightText(recipe.title, searchTerm) : recipe.title}
                      </h3>
                      <p className="text-gray-600 mb-2 line-clamp-2">
                        {searchTerm ? highlightText(recipe.description, searchTerm) : recipe.description}
                      </p>
                      
                      {/* Show recommendation reason if available */}
                      {filterType === "recommend" && recipe._matchReason && (
                        <div className="mb-2 p-2 bg-[#fff5e6] border border-[#ff7043]/20 rounded-lg">
                          <p className="text-xs text-[#1a3b5d] flex items-start gap-1">
                            <Sparkles size={14} className="text-[#ff7043] mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{recipe._matchReason.explanation}</span>
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          By {recipe.user_id?.username || "Unknown"}
                        </span>
                        <div className="flex items-center gap-2">
                          {recipe.tags?.slice(0, 2).map((tag, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-1 text-xs rounded-full ${
                                searchTerm && tag.toLowerCase().includes(searchTerm.toLowerCase())
                                  ? 'bg-[#ff7043] text-white font-semibold'
                                  : 'bg-[#fff5e6] text-[#1a3b5d]'
                              }`}
                            >
                              {searchTerm ? highlightText(tag, searchTerm) : tag}
                            </span>
                          ))}
                          <div className="flex items-center gap-1 text-[#ff7043]">
                            <Star size={14} fill="currentColor" />
                            <span className="text-sm font-medium">
                              {recipe.saveCount || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8 mb-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-[#1a3b5d] text-white hover:bg-[#2d5a8f]"
                }`}
              >
                Previous
              </button>

              {getPageNumbers().map((page, index) => {
                if (page === '...') {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-4 py-2 text-[#1a3b5d] font-semibold"
                    >
                      ...
                    </span>
                  );
                }

                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      currentPage === page
                        ? "bg-[#ff7043] text-white"
                        : "bg-white text-[#1a3b5d] hover:bg-[#fff5e6] border border-gray-200"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-[#1a3b5d] text-white hover:bg-[#2d5a8f]"
                }`}
              >
                Next
              </button>
            </div>
          )}
          </>
        )}
      </div>
    </div>
  );
};

export default Explore;