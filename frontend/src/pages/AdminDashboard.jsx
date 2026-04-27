import React, { useContext, useState } from "react";
import { UserContext } from "../context/UserContext";
import AdminSidebar from "../components/admin/AdminSidebar";
import UserManagement from "./admin/UserManagement";
import RecipeManagement from "./admin/RecipeManagement";
import PendingApproval from "./admin/PendingApproval";

const AdminDashboard = () => {
  const { user } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState("users");

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff5e6]">
        <div className="text-center">
          <p className="text-xl text-[#1a3b5d]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fff5e6]">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="absolute left-0 md:left-64 right-0 top-0 bottom-0 pl-14 md:pl-0">
        <div className="h-full overflow-y-auto">
          <div className="p-4 md:p-8 pt-16 md:pt-8">
            {activeTab === "users" && <UserManagement />}
            {activeTab === "recipes" && <RecipeManagement />}
            {activeTab === "pending" && <PendingApproval />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
