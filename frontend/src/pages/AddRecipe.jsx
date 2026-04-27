import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { ChefHat, Upload, X, Plus, CheckCircle, AlertCircle } from "lucide-react";
import recipeAPI from "../api/recipeAPI";

const AddRecipe = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ingredients: [""],
    instructions: "",
    tags: "",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleInstructionsChange = (e) => {
    setFormData({ ...formData, instructions: e.target.value });
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const addIngredient = () => {
    setFormData({ ...formData, ingredients: [...formData.ingredients, ""] });
  };

  const removeIngredient = (index) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image: null });
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!formData.title.trim()) {
      setError("Please enter a recipe title");
      setLoading(false);
      return;
    }
    if (!formData.description.trim()) {
      setError("Please enter a description");
      setLoading(false);
      return;
    }
    const validIngredients = formData.ingredients.filter((i) => i.trim() !== "");
    if (validIngredients.length === 0) {
      setError("Please add at least one ingredient");
      setLoading(false);
      return;
    }
    if (!formData.instructions.trim()) {
      setError("Please enter cooking instructions");
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append("title", formData.title.trim());
      data.append("description", formData.description.trim());
      data.append("ingredients", JSON.stringify(validIngredients));
      data.append("instructions", formData.instructions.trim());
      data.append("tags", formData.tags.split(",").map((tag) => tag.trim()).filter(tag => tag));

      if (formData.image) {
        data.append("image", formData.image);
      }

      await recipeAPI.createRecipe(data);

      setSuccess(true);
      setTimeout(() => {
        navigate("/profile");
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create recipe. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-2xl shadow-lg max-w-md">
          <CheckCircle size={80} className="text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-[#1a3b5d] mb-4">
            Recipe Submitted Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Your recipe is being reviewed by our admin team. It will be
            published once approved.
          </p>
          <p className="text-sm text-[#ff7043]">
            Redirecting to your profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-16 px-4 md:px-0">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-[#1a3b5d] text-white p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-4">
            <div className="bg-[#ff7043] p-3 rounded-lg">
              <ChefHat size={24} />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl md:text-3xl font-bold">Share Your Culinary Masterpiece</h1>
              <p className="text-blue-100 mt-1 text-sm md:text-base">
                Inspire food lovers around the world with your unique recipe
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 md:p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div className="mb-6">
            <label className="block text-[#1a3b5d] font-semibold mb-2">
              Recipe Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff7043] focus:border-[#ff7043] transition-all"
              placeholder="e.g., Grandma's Apple Pie"
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-[#1a3b5d] font-semibold mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff7043] focus:border-[#ff7043] transition-all resize-none"
              placeholder="Describe your recipe in a few sentences..."
            />
          </div>

          {/* Ingredients */}
          <div className="mb-6">
            <label className="block text-[#1a3b5d] font-semibold mb-2">
              Ingredients *
            </label>
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={ingredient}
                  onChange={(e) => handleIngredientChange(index, e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff7043] focus:border-[#ff7043] transition-all"
                  placeholder="Ingredient..."
                />
                {formData.ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="px-4 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addIngredient}
              className="flex items-center gap-2 text-[#ff7043] font-medium hover:underline mt-2"
            >
              <Plus size={20} />
              Add Another Ingredient
            </button>
          </div>

          {/* Instructions */}
          <div className="mb-6">
            <label className="block text-[#1a3b5d] font-semibold mb-2">
              Cooking Instructions *
            </label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleInputChange}
              required
              rows="8"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff7043] focus:border-[#ff7043] transition-all resize-none"
              placeholder="Add step-by-step cooking instructions..."
            />
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label className="block text-[#1a3b5d] font-semibold mb-2">
              Tags (comma separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff7043] focus:border-[#ff7043] transition-all"
              placeholder="e.g., Breakfast, Vegan, Quick"
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter tags separated by commas (e.g., Breakfast, Vegan, Quick)
            </p>
          </div>

          {/* Image Upload */}
          <div className="mb-8">
            <label className="block text-[#1a3b5d] font-semibold mb-2">
              Recipe Image
            </label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-all"
                >
                  <X size={20} className="text-[#1a3b5d]" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#ff7043] transition-all cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload size={48} className="text-[#ff7043] mb-4" />
                  <p className="text-[#1a3b5d] font-medium">
                    Click to upload image
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    PNG, JPG up to 5MB
                  </p>
                </label>
              </div>
            )}
          </div>

          {/* Approval Notice */}
          <div className="bg-[#fff5e6] border border-[#ff7043]/30 p-4 rounded-lg mb-6">
            <CheckCircle size={20} className="text-[#ff7043] inline mr-2" />
            <span className="text-[#1a3b5d]">
              Your recipe will be reviewed by an admin before being published.
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#ff7043] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#e66038] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : (
              <>
                <Plus size={20} />
                Submit Recipe for Review
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddRecipe;