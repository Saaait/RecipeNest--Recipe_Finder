import api from "./axiosInstance";

const recipeAPI = {
  // Get all approved recipes
  getRecipes: (search = "") => {
    return api.get(`/api/recipes${search ? `?search=${search}` : ""}`);
  },

  // Get single recipe
  getRecipe: (id) => {
    return api.get(`/api/recipes/${id}`);
  },

  // Create new recipe
  createRecipe: (formData) => {
    return api.post("/api/recipes", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Update recipe
  updateRecipe: (id, formData) => {
    return api.put(`/api/recipes/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Delete recipe
  deleteRecipe: (id) => {
    return api.delete(`/api/recipes/${id}`);
  },

  // Get current user's recipes (including pending/rejected)
  getUserRecipes: () => {
    return api.get("/api/recipes/user/my-recipes");
  },

  // Admin: Get pending recipes
  getPendingRecipes: () => {
    return api.get("/api/recipes/admin/pending");
  },

  // Admin: Get all recipes with approval status
  getAllRecipesForAdmin: () => {
    return api.get("/api/recipes/admin/all");
  },

  // Admin: Approve recipe
  approveRecipe: (id) => {
    return api.put(`/api/recipes/admin/${id}/approve`);
  },

  // Admin: Reject recipe
  rejectRecipe: (id) => {
    return api.put(`/api/recipes/admin/${id}/reject`);
  },

  // Admin: Unapprove recipe (set back to pending)
  unapproveRecipe: (id) => {
    return api.put(`/api/recipes/admin/${id}/unapprove`);
  },

  // Save a recipe
  saveRecipe: (id) => {
    return api.post(`/api/recipes/${id}/save`);
  },

  // Unsave a recipe
  unsaveRecipe: (id) => {
    return api.delete(`/api/recipes/${id}/unsave`);
  },

  // Get user's saved recipes
  getSavedRecipes: () => {
    return api.get("/api/recipes/user/saved");
  },
};

export default recipeAPI;