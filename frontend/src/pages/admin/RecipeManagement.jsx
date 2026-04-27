import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "../../context/UserContext";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  ChefHat,
  Tag,
  X,
  Save,
  ImagePlus,
  AlertTriangle,
} from "lucide-react";

const RecipeManagement = () => {
  const { user: currentUser } = useContext(UserContext);
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("view"); // "view", "edit"
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ingredients: "",
    instructions: "",
    tags: "",
  });
  const [error, setError] = useState("");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found.");
        setLoading(false);
        return;
      }

      // Use admin endpoint to get all recipes including pending and rejected
      const res = await axios.get(`${API_BASE_URL}/api/recipes/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecipes(res.data.recipes || []);
      setFilteredRecipes(res.data.recipes || []);
    } catch (err) {
      console.error("Failed to fetch recipes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  useEffect(() => {
    const filtered = recipes.filter(
      (recipe) =>
        recipe.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.tags?.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
    setFilteredRecipes(filtered);
  }, [searchTerm, recipes]);

  const highlightText = (text, highlight) => {
    if (!text || !highlight) return text;
    
    const parts = text.toString().split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, idx) => 
      part.toLowerCase() === highlight.toLowerCase() 
        ? <span key={idx} className="bg-yellow-300 text-[#1a3b5d] px-1 rounded font-semibold">{part}</span>
        : part
    );
  };

  const handleView = (recipe) => {
    setSelectedRecipe(recipe);
    setModalMode("view");
    setShowModal(true);
  };

  const handleEdit = (recipe) => {
    setSelectedRecipe(recipe);
    setFormData({
      title: recipe.title || "",
      description: recipe.description || "",
      ingredients: Array.isArray(recipe.ingredients)
        ? recipe.ingredients.join(", ")
        : recipe.ingredients || "",
      instructions: recipe.instructions || "",
      tags: Array.isArray(recipe.tags)
        ? recipe.tags.join(", ")
        : recipe.tags || "",
    });
    setModalMode("edit");
    setShowModal(true);
  };

  const handleDelete = async (recipeId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`${API_BASE_URL}/api/recipes/${recipeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecipes((prev) => prev.filter((r) => r._id !== recipeId));
      setShowModal(false);
    } catch (err) {
      console.error("Failed to delete recipe:", err);
      setError(err.response?.data?.message || "Failed to delete recipe");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title || !formData.description || !formData.ingredients || !formData.instructions) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const recipeData = {
        title: formData.title,
        description: formData.description,
        ingredients: formData.ingredients
          .split(",")
          .map((i) => i.trim())
          .filter((i) => i),
        instructions: formData.instructions,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t),
      };

      const res = await axios.put(
        `${API_BASE_URL}/api/recipes/${selectedRecipe._id}`,
        recipeData,
        {
          headers: { Authorization: `Bearer ${token}` },
          "Content-Type": "application/json",
        }
      );

      setRecipes((prev) =>
        prev.map((r) => (r._id === selectedRecipe._id ? res.data.recipe : r))
      );
      setShowModal(false);
      setError("");
    } catch (err) {
      console.error("Failed to update recipe:", err);
      setError(
        err.response?.data?.message || "Failed to update recipe. Please try again."
      );
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff7043]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1a3b5d] mb-2">
          Recipe Management
        </h2>
        <p className="text-gray-600">View, edit, and manage all recipes</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Recipes</p>
              <p className="text-3xl font-bold text-[#1a3b5d] mt-1">
                {recipes.length}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <ChefHat size={24} className="text-[#ff7043]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">By Admins</p>
              <p className="text-3xl font-bold text-[#ff7043] mt-1">
                {recipes.filter((r) => r.user_id?.role === "admin").length}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Tag size={24} className="text-[#1a3b5d]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">By Users</p>
              <p className="text-3xl font-bold text-[#1a3b5d] mt-1">
                {recipes.filter((r) => r.user_id?.role === "user").length}
              </p>
            </div>
            <div className="bg-[#fff5e6] p-3 rounded-lg">
              <Plus size={24} className="text-[#1a3b5d]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">With Images</p>
              <p className="text-3xl font-bold text-[#1a3b5d] mt-1">
                {recipes.filter((r) => r.image).length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <ImagePlus size={24} className="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search recipes by title, description, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7043] focus:border-transparent"
          />
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

      {/* Recipes Grid */}
      {filteredRecipes.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center text-gray-500">
          <ChefHat size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No recipes found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <div
              key={recipe._id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              {recipe.image && (
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-48 object-cover"
                />
              )}
              {!recipe.image && (
                <div className="w-full h-48 bg-[#fff5e6] flex items-center justify-center">
                  <ChefHat size={48} className="text-[#ff7043]" />
                </div>
              )}

              <div className="p-5">
                <h3 className="font-bold text-lg text-[#1a3b5d] mb-2 line-clamp-1">
                  {searchTerm ? highlightText(recipe.title, searchTerm) : recipe.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {searchTerm ? highlightText(recipe.description, searchTerm) : recipe.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {recipe.tags?.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className={`px-2 py-1 text-xs rounded-full ${
                        searchTerm && tag.toLowerCase().includes(searchTerm.toLowerCase())
                          ? 'bg-[#ff7043] text-white font-semibold'
                          : 'bg-[#fff5e6] text-[#1a3b5d]'
                      }`}
                    >
                      {searchTerm ? highlightText(tag, searchTerm) : tag}
                    </span>
                  ))}
                  {recipe.tags?.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{recipe.tags.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>{formatDate(recipe.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChefHat size={14} />
                    <span>{recipe.user_id?.username || "Unknown"}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleView(recipe)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-[#1a3b5d] text-white rounded-lg hover:bg-[#132e4a] transition-colors text-sm font-medium"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(recipe)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-[#ff7043] text-white rounded-lg hover:bg-[#e66038] transition-colors text-sm font-medium"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(recipe._id, recipe.title)}
                    className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recipe Modal */}
      {showModal && selectedRecipe && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl md:max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#1a3b5d] px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                {modalMode === "view" ? "Recipe Details" : "Edit Recipe"}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedRecipe(null);
                  setError("");
                }}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {modalMode === "view" ? (
                <div>
                  {selectedRecipe.image && (
                    <img
                      src={selectedRecipe.image}
                      alt={selectedRecipe.title}
                      className="w-full h-64 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h2 className="text-2xl font-bold text-[#1a3b5d] mb-2">
                    {selectedRecipe.title}
                  </h2>
                  <p className="text-gray-600 mb-4">{selectedRecipe.description}</p>

                  <div className="mb-4">
                    <h4 className="font-semibold text-[#1a3b5d] mb-2">Ingredients:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      {Array.isArray(selectedRecipe.ingredients) ? (
                        selectedRecipe.ingredients.map((ing, i) => (
                          <li key={i}>{ing}</li>
                        ))
                      ) : (
                        <li>{selectedRecipe.ingredients}</li>
                      )}
                    </ul>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-[#1a3b5d] mb-2">Instructions:</h4>
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {selectedRecipe.instructions}
                    </p>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-[#1a3b5d] mb-2">Tags:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRecipe.tags?.map((tag, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-[#fff5e6] text-[#1a3b5d] text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">
                    <p>Created by: {selectedRecipe.user_id?.username}</p>
                    <p>Created: {formatDate(selectedRecipe.createdAt)}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1a3b5d] mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7043]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#1a3b5d] mb-1">
                        Description *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7043]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#1a3b5d] mb-1">
                        Ingredients * (comma separated)
                      </label>
                      <textarea
                        value={formData.ingredients}
                        onChange={(e) =>
                          setFormData({ ...formData, ingredients: e.target.value })
                        }
                        rows={3}
                        placeholder="e.g., Chicken, Rice, Tomato, Onion"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7043]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#1a3b5d] mb-1">
                        Instructions *
                      </label>
                      <textarea
                        value={formData.instructions}
                        onChange={(e) =>
                          setFormData({ ...formData, instructions: e.target.value })
                        }
                        rows={5}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7043]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#1a3b5d] mb-1">
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) =>
                          setFormData({ ...formData, tags: e.target.value })
                        }
                        placeholder="e.g., dinner, healthy, quick"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7043]"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-2 bg-[#ff7043] text-white rounded-lg hover:bg-[#e66038] transition-colors font-medium"
                    >
                      <Save size={18} />
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setSelectedRecipe(null);
                        setError("");
                      }}
                      className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium text-[#1a3b5d]"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeManagement;