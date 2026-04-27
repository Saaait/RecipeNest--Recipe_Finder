import React, { useContext } from "react";
import { Building2, User, LogOut } from "lucide-react";
import { UserContext } from "../../context/UserContext";
import api from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

const AdminHeader = ({ user }) => {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        await api.post("/api/users/logout", { token: refreshToken });
      }

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed right-0 left-64 top-0 z-20">
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#ff7043] p-2 rounded-lg">
            <Building2 size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1a3b5d]">
              Administration Hub
            </h1>
            <p className="text-sm text-gray-500">Manage Your Culinary Community</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#fff5e6] px-4 py-2 rounded-lg">
            <User size={18} className="text-[#ff7043]" />
            <span className="font-medium text-[#1a3b5d]">{user?.username}</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-[#ff7043] text-white px-5 py-2 rounded-lg hover:bg-[#e66038] transition-colors font-medium"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;