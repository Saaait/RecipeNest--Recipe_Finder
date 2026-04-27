import api from "./axiosInstance";

export const recommendationAPI = {
  // Get personalized recommendations
  getRecommendations: () => {
    return api.get("/api/recommend/");
  },

  // Recommend by tags
  getByTags: () => {
    return api.get("/api/recommend/tags");
  },

  // Recommend by ingredients
  getByIngredients: () => {
    return api.get("/api/recommend/ingredients");
  },

  // Get similar recipes
  getSimilar: () => {
    return api.get("/api/recommend/similar");
  },

  // Get popular recipes
  getPopular: () => {
    return api.get("/api/recommend/popular");
  },

  // Get recent recipes
  getRecent: () => {
    return api.get("/api/recommend/recent");
  },
};

export default recommendationAPI;