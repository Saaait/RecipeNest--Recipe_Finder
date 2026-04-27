import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../context/UserContext";
import {
  User,
  Mail,
  Edit,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Bookmark,
  Heart,
  ArrowRight,
  ChefHat,
} from "lucide-react";
import recipeAPI from "../api/recipeAPI";
import { getImageUrl } from "../utils/imageHelper";

const Profile = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", email: "" });
  const [updated, setUpdated] = useState(false);
  const [activeTab, setActiveTab] = useState("recipes");
  const [myRecipes, setMyRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    if (user) {
      setFormData({ username: user.username || "", email: user.email || "" });
      fetchRecipes();
    }
  }, [user]);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const recipesRes = await recipeAPI.getUserRecipes();
      const recipes = Array.isArray(recipesRes.data?.recipes)
        ? recipesRes.data.recipes
        : Array.isArray(recipesRes.data)
          ? recipesRes.data
          : [];
      setMyRecipes(recipes);

      const savedRes = await recipeAPI.getSavedRecipes();
      const savedRecipesData = Array.isArray(savedRes.data?.recipes)
        ? savedRes.data.recipes
        : Array.isArray(savedRes.data)
          ? savedRes.data
          : [];
      setSavedRecipes(savedRecipesData);
    } catch (err) {
      console.error("Error fetching recipes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!user) return;

    const token = localStorage.getItem("accessToken");
    try {
      await axios.put(
        `${API_BASE_URL}/api/users/${user.id}`,
        { username: formData.username, email: formData.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const res = await axios.get(`${API_BASE_URL}/api/users/current`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data);
      setFormData({ username: res.data.username, email: res.data.email });
      setUpdated(true);

      setTimeout(() => setUpdated(false), 3000);
    } catch (err) {
      console.error("Update failed:", err);
      alert("Update failed");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
    };
    return styles[status] || styles.pending;
  };

  if (!user) return <p className="text-center">Loading...</p>;

  return (
    <div className="min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 sticky top-24">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-[#ff7043] to-[#e66038] rounded-full flex items-center justify-center mx-auto mb-4">
                  <User size={48} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#1a3b5d]">
                  {user.username}
                </h2>
                <p className="text-gray-600">{user.email}</p>
              </div>

              <div className="space-y-3">
                <a
                  href="/add-recipe"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-[#ff7043] text-white rounded-xl font-medium hover:bg-[#e66038] transition-all"
                >
                  <Plus size={20} />
                  Add New Recipe
                </a>
              </div>

              {/* Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#1a3b5d]">
                    {myRecipes.length}
                  </p>
                  <p className="text-sm text-gray-600">Your Creations</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#1a3b5d]">
                    {savedRecipes.length}
                  </p>
                  <p className="text-sm text-gray-600">Saved</p>
                </div>
              </div>

              {/* Edit Profile Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-[#1a3b5d] mb-4 flex items-center gap-2">
                  <Edit size={20} />
                  Edit Profile
                </h3>
                <div className="space-y-3">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7043]"
                      placeholder="Username"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7043]"
                      placeholder="Email"
                    />
                  </div>
                  <button
                    onClick={handleUpdate}
                    className="w-full bg-[#1a3b5d] text-white py-2 rounded-lg font-medium hover:bg-blue-800 transition-all"
                  >
                    Update Profile
                  </button>
                  {updated && (
                    <p className="text-green-600 text-center text-sm">
                      Profile updated successfully ✅
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recipes Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              {/* Tabs */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setActiveTab("recipes")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    activeTab === "recipes"
                      ? "bg-[#1a3b5d] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <ChefHat size={18} />
                  My Creations
                </button>
                <button
                  onClick={() => setActiveTab("saved")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    activeTab === "saved"
                      ? "bg-[#1a3b5d] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Bookmark size={18} />
                  Saved Favorites
                </button>
              </div>

              {/* Content */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff7043]"></div>
                </div>
              ) : activeTab === "recipes" ? (
                myRecipes.length === 0 ? (
                  <div className="text-center py-12">
                    <ChefHat size={64} className="text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      No recipes yet
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Start by adding your first recipe!
                    </p>
                    <a
                      href="/add-recipe"
                      className="inline-flex items-center gap-2 bg-[#ff7043] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#e66038] transition-all"
                    >
                      <Plus size={20} />
                      Add Recipe
                    </a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myRecipes.map((recipe) => (
                      <div
                        key={recipe._id}
                        className="bg-[#fff5e6] rounded-xl p-4 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => navigate(`/recipe/${recipe._id}`)}
                      >
                        <div className="flex gap-4">
                          {recipe.image && (
                            <img
                              src={getImageUrl(recipe.image)}
                              alt={recipe.title}
                              className="w-20 h-20 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-[#1a3b5d] mb-1">
                              {recipe.title}
                            </h4>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                              {recipe.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                                  recipe.approvalStatus
                                )}`}
                              >
                                {recipe.approvalStatus === "pending" && (
                                  <Clock size={12} className="inline mr-1" />
                                )}
                                {recipe.approvalStatus === "approved" && (
                                  <CheckCircle size={12} className="inline mr-1" />
                                )}
                                {recipe.approvalStatus === "rejected" && (
                                  <XCircle size={12} className="inline mr-1" />
                                )}
                                {recipe.approvalStatus.charAt(0).toUpperCase() +
                                  recipe.approvalStatus.slice(1)}
                              </span>
                              <p className="text-sm text-gray-500">
                                {recipe.saveCount || 0} saves
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/recipe/${savedRecipe._id}`);
                            }}
                            className="self-center text-[#ff7043] hover:text-[#e66038]"
                          >
                            <ArrowRight size={24} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : savedRecipes.length === 0 ? (
                <div className="text-center py-12">
                  <Heart size={64} className="text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No saved favorites yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Start exploring and save your favorites!
                  </p>
                  <a
                    href="/explore"
                    className="inline-flex items-center gap-2 bg-[#1a3b5d] text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800 transition-all"
                  >
                    <ArrowRight size={20} />
                    Explore Recipes
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedRecipes.map((savedRecipe) => (
                    <div
                      key={savedRecipe._id}
                      className="bg-[#fff5e6] rounded-xl p-4 hover:shadow-md transition-all cursor-pointer"
                      onClick={() =>
                        navigate(`/recipe/${savedRecipe._id}`)
                      }
                    >
                      <div className="flex gap-4">
                        {savedRecipe.image && (
                          <img
                            src={getImageUrl(savedRecipe.image)}
                            alt={savedRecipe.title}
                            className="w-20 h-20 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-[#1a3b5d] mb-1">
                            {savedRecipe.title || "Unknown Recipe"}
                          </h4>
                          <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                            {savedRecipe.description}
                          </p>
                          <p className="text-sm text-gray-500">
                            By {savedRecipe.user_id?.username || "Unknown"}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/recipe/${savedRecipe.recipe_id._id}`);
                          }}
                          className="self-center text-[#ff7043] hover:text-[#e66038]"
                        >
                          <ArrowRight size={24} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
