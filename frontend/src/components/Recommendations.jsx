import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { Sparkles, ChefHat } from "lucide-react";
import recommendationAPI from "../api/recommendationAPI";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../utils/imageHelper";

const Recommendations = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState("");

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  const fetchRecommendations = async () => {
    try {
      const res = await recommendationAPI.getRecommendations();
      let data = null;

      // Handle different response formats
      if (res.data?.recipes) {
        data = res.data.recipes;
        setMethod(res.data.message || "Based on your preferences");
      } else if (Array.isArray(res.data)) {
        data = res.data;
        setMethod("Personalized recommendations");
      }

      setRecommendations(Array.isArray(data) ? data.slice(0, 6) : []);
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  if (!user || recommendations.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-6 bg-[#fff5e6]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-[#ff7043] p-3 rounded-xl">
            <Sparkles size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[#1a3b5d]">
              Recommended for You
            </h2>
            <p className="text-gray-600">{method}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#ff7043]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((recipe) => (
              <div
                key={recipe._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer overflow-hidden border border-gray-100"
                onClick={() => navigate(`/recipe/${recipe._id}`)}
              >
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
                  <h3 className="text-lg font-bold text-[#1a3b5d] mb-2">
                    {recipe.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {recipe.description}
                  </p>
                  
                  {/* Show recommendation reason if available */}
                  {recipe._matchReason && (
                    <div className="mb-3 p-2 bg-[#fff5e6] border border-[#ff7043]/20 rounded-lg">
                      <p className="text-xs text-[#1a3b5d] flex items-start gap-1">
                        <Sparkles size={12} className="text-[#ff7043] mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{recipe._matchReason.explanation}</span>
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>By {recipe.user_id?.username || "Unknown"}</span>
                    <span>{recipe.saveCount || 0} saves</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Recommendations;