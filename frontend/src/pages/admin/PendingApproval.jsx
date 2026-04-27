import React, { useState, useEffect } from "react";
import recipeAPI from "../../api/recipeAPI";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  ChefHat,
  ArrowRight,
  Search,
  Filter,
  Undo,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../utils/imageHelper";

const PendingApproval = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (filterStatus === "pending") {
      fetchPendingRecipes();
    } else {
      fetchAllRecipes();
    }
  }, [filterStatus]);

  const fetchPendingRecipes = async () => {
    setLoading(true);
    try {
      const res = await recipeAPI.getPendingRecipes();
      const recipes = Array.isArray(res.data?.recipes)
        ? res.data.recipes
        : Array.isArray(res.data)
          ? res.data
          : [];
      setRecipes(recipes);
    } catch (err) {
      console.error("Error fetching pending recipes:", err);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRecipes = async () => {
    setLoading(true);
    try {
      const res = await recipeAPI.getAllRecipesForAdmin();
      const recipes = Array.isArray(res.data?.recipes)
        ? res.data.recipes
        : Array.isArray(res.data)
          ? res.data
          : [];
      setRecipes(recipes);
    } catch (err) {
      console.error("Error fetching all recipes:", err);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to approve this recipe?")) return;

    try {
      await recipeAPI.approveRecipe(id);
      if (filterStatus === "pending") {
        fetchPendingRecipes();
      } else {
        fetchAllRecipes();
      }
    } catch (err) {
      console.error("Error approving recipe:", err);
      alert("Failed to approve recipe");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this recipe?")) return;

    try {
      await recipeAPI.rejectRecipe(id);
      if (filterStatus === "pending") {
        fetchPendingRecipes();
      } else {
        fetchAllRecipes();
      }
    } catch (err) {
      console.error("Error rejecting recipe:", err);
      alert("Failed to reject recipe");
    }
  };

  const handleUnapprove = async (id) => {
    if (!window.confirm("Are you sure you want to unapprove this recipe? It will be moved back to pending status.")) return;

    try {
      await recipeAPI.unapproveRecipe(id);
      if (filterStatus === "pending") {
        fetchPendingRecipes();
      } else {
        fetchAllRecipes();
      }
    } catch (err) {
      console.error("Error unapproving recipe:", err);
      alert("Failed to unapprove recipe");
    }
  };

  const handleViewRecipe = (recipe) => {
    setSelectedRecipe(recipe);
  };

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      recipe.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.user_id?.username?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === "all" || recipe.approvalStatus === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const highlightText = (text, highlight) => {
    if (!text || !highlight) return text;
    
    const parts = text.toString().split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, idx) => 
      part.toLowerCase() === highlight.toLowerCase() 
        ? <span key={idx} className="bg-yellow-300 text-[#1a3b5d] px-1 rounded font-semibold">{part}</span>
        : part
    );
  };

  const stats = {
    pending: recipes.filter((r) => r.approvalStatus === "pending").length,
    approved: recipes.filter((r) => r.approvalStatus === "approved").length,
    rejected: recipes.filter((r) => r.approvalStatus === "rejected").length,
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4">
      <h1 className="text-2xl md:text-3xl font-bold text-[#1a3b5d] mb-6">
        Recipe Approvals
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-[#1a3b5d] to-[#2d5a8f] text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm font-medium mb-1">Pending</p>
              <p className="text-3xl font-bold">{stats.pending}</p>
            </div>
            <Clock size={40} className="text-[#ff7043]" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm font-medium mb-1">Approved</p>
              <p className="text-3xl font-bold">{stats.approved}</p>
            </div>
            <CheckCircle size={40} className="text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-600 to-red-700 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-200 text-sm font-medium mb-1">Rejected</p>
              <p className="text-3xl font-bold">{stats.rejected}</p>
            </div>
            <XCircle size={40} className="text-red-200" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by recipe title or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7043] focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-12 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7043] focus:border-transparent appearance-none bg-white"
            >
              <option value="pending">Pending Only</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="all">All Statuses</option>
            </select>
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

      {/* Recipe List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff7043]"></div>
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-12 text-center">
          <ChefHat size={64} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No recipes found
          </h3>
          <p className="text-gray-500">
            {filterStatus === "all"
              ? "You have no recipes in the system"
              : filterStatus === "pending"
              ? "You have no pending recipes to review"
              : filterStatus === "approved"
              ? "You have no approved recipes"
              : "You have no rejected recipes"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRecipes.map((recipe) => (
            <div
              key={recipe._id}
              className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Recipe Image */}
                <div className="flex-shrink-0">
                  {recipe.image ? (
                    <img
                      src={getImageUrl(recipe.image)}
                      alt={recipe.title}
                      className="w-32 h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-[#ff7043] to-[#e66038] rounded-lg flex items-center justify-center">
                      <ChefHat size={40} className="text-white opacity-50" />
                    </div>
                  )}
                </div>

                {/* Recipe Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-[#1a3b5d] mb-1">
                        {searchTerm ? highlightText(recipe.title, searchTerm) : recipe.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <User size={16} />
                          {searchTerm ? highlightText(recipe.user_id?.username || "Unknown", searchTerm) : recipe.user_id?.username || "Unknown"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={16} />
                          {new Date(recipe.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {/* Status Badge */}
                    <span
                      className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                        recipe.approvalStatus === "approved"
                          ? "bg-green-100 text-green-700"
                          : recipe.approvalStatus === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {recipe.approvalStatus.charAt(0).toUpperCase() +
                        recipe.approvalStatus.slice(1)}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {recipe.description}
                  </p>

                  {/* Recipe Source Badge */}
                  <div className="mb-3">
                    <span className="px-3 py-1 bg-[#fff5e6] text-[#ff7043] rounded-full text-xs font-medium">
                      {recipe.isExternal
                        ? "External Recipe"
                        : recipe.user_id
                        ? "User Created Recipe"
                        : "Unknown Source"}
                    </span>
                    {recipe.user_id?.email && !recipe.isExternal && (
                      <span className="ml-2 text-xs text-gray-500">
                        ({recipe.user_id.email})
                      </span>
                    )}
                  </div>

                  {recipe.tags && recipe.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {recipe.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-[#fff5e6] text-[#1a3b5d] rounded-full text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                      {recipe.tags.length > 3 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                          +{recipe.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-end md:flex-shrink-0">
                  <button
                    onClick={() => handleViewRecipe(recipe)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1a3b5d] text-white rounded-lg font-medium hover:bg-blue-800 transition-all text-sm"
                  >
                    View Details
                    <ArrowRight size={16} />
                  </button>
                  {recipe.approvalStatus === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(recipe._id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all text-sm"
                      >
                        <CheckCircle size={16} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(recipe._id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all text-sm"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </>
                  )}
                  {recipe.approvalStatus === "approved" && (
                    <button
                      onClick={() => handleUnapprove(recipe._id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-all text-sm"
                    >
                      <Undo size={16} />
                      Unapprove
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recipe Details Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl md:max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
              <div className="flex items-start justify-between">
                <h2 className="text-2xl font-bold text-[#1a3b5d]">
                  {selectedRecipe.title}
                </h2>
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <XCircle size={24} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {selectedRecipe.image ? (
                <img
                  src={selectedRecipe.image}
                  alt={selectedRecipe.title}
                  className="w-full h-64 object-cover rounded-xl mb-6"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-[#ff7043] to-[#e66038] rounded-xl flex items-center justify-center mb-6">
                  <ChefHat size={80} className="text-white opacity-50" />
                </div>
              )}

              {/* Recipe Source & Status */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="px-4 py-2 bg-[#fff5e6] text-[#ff7043] rounded-full text-sm font-medium">
                  {selectedRecipe.isExternal
                    ? "External Recipe"
                    : selectedRecipe.user_id
                    ? "User Created Recipe"
                    : "Unknown Source"}
                </span>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    selectedRecipe.approvalStatus === "approved"
                      ? "bg-green-100 text-green-700"
                      : selectedRecipe.approvalStatus === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {selectedRecipe.approvalStatus.charAt(0).toUpperCase() + selectedRecipe.approvalStatus.slice(1)}
                </span>
              </div>

              {/* User Details */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-[#1a3b5d] mb-2 flex items-center gap-2">
                  <User size={18} />
                  User Information
                </h4>
                <div className="space-y-2 text-gray-600">
                  <div>
                    <span className="font-medium">Username:</span>{" "}
                    {selectedRecipe.user_id?.username || "Unknown User"}
                  </div>
                  {selectedRecipe.user_id?.email && (
                    <div>
                      <span className="font-medium">Email:</span> {selectedRecipe.user_id.email}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Created:</span>{" "}
                    {new Date(selectedRecipe.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#1a3b5d] mb-2">
                  Description
                </h3>
                <p className="text-gray-600">{selectedRecipe.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#1a3b5d] mb-2">
                  Ingredients
                </h3>
                <ul className="space-y-2">
                  {Array.isArray(selectedRecipe.ingredients) &&
                    selectedRecipe.ingredients.map((ing, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-600">
                        <span className="flex-shrink-0 w-2 h-2 bg-[#ff7043] rounded-full mt-2" />
                        {ing}
                      </li>
                    ))}
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#1a3b5d] mb-2">
                  Instructions
                </h3>
                <p className="text-gray-600 whitespace-pre-line">
                  {selectedRecipe.instructions}
                </p>
              </div>

              {selectedRecipe.tags && selectedRecipe.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-[#1a3b5d] mb-2">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecipe.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[#fff5e6] text-[#1a3b5d] rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              {selectedRecipe.approvalStatus === "pending" && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      handleApprove(selectedRecipe._id);
                      setSelectedRecipe(null);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all"
                  >
                    <CheckCircle size={20} />
                    Approve Recipe
                  </button>
                  <button
                    onClick={() => {
                      handleReject(selectedRecipe._id);
                      setSelectedRecipe(null);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all"
                  >
                    <XCircle size={20} />
                    Reject Recipe
                  </button>
                </div>
              )}
              {selectedRecipe.approvalStatus === "approved" && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      handleUnapprove(selectedRecipe._id);
                      setSelectedRecipe(null);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-all"
                  >
                    <Undo size={20} />
                    Unapprove Recipe
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingApproval;