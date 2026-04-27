import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "../../context/UserContext";
import { Search, Shield, Trash2, Check, X, User as UserIcon } from "lucide-react";

const UserManagement = () => {
  const { user: currentUser } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found. Please login.");
        setLoading(false);
        return;
      }

      const res = await axios.get(`${API_BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter((user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const highlightText = (text, highlight) => {
    if (!text || !highlight) return text;
    
    const parts = text.toString().split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, idx) => 
      part.toLowerCase() === highlight.toLowerCase() 
        ? <span key={idx} className="bg-yellow-300 text-[#1a3b5d] px-1 rounded font-semibold">{part}</span>
        : part
    );
  };

  // Change role
  const handleRoleChange = async (userId, newRole) => {
    if (userId === currentUser?._id) return;
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.put(
        `${API_BASE_URL}/api/users/${userId}`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: res.data.role } : u))
      );
    } catch (err) {
      console.error("Failed to update role:", err);
    }
  };

  // Delete user
  const handleDelete = async (userId, username) => {
    if (userId === currentUser?._id) return;
    if (!window.confirm(`Are you sure you want to delete "${username}"?`)) return;

    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`${API_BASE_URL}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff7043]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#1a3b5d] mb-2">
          Community Members
        </h2>
        <p className="text-gray-600">Oversee and nurture your culinary community</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold text-[#1a3b5d] mt-1">
                {users.length}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Shield size={24} className="text-[#1a3b5d]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Admins</p>
              <p className="text-3xl font-bold text-[#ff7043] mt-1">
                {users.filter((u) => u.role === "admin").length}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Check size={24} className="text-[#ff7043]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Regular Users</p>
              <p className="text-3xl font-bold text-[#1a3b5d] mt-1">
                {users.filter((u) => u.role === "user").length}
              </p>
            </div>
            <div className="bg-[#fff5e6] p-3 rounded-lg">
              <UserIcon size={24} className="text-[#1a3b5d]" />
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
            placeholder="Search users by name or email..."
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
              {filteredUsers.length > 0 && (
                <span className="text-gray-400">• Found {filteredUsers.length} result{filteredUsers.length !== 1 ? 's' : ''}</span>
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

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p>No users found matching your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => {
                const isCurrentUser = currentUser?.id && user?._id && user._id.toString() === currentUser.id.toString();
                const isAdmin = user.role === "admin";

                return (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${isAdmin ? "bg-[#ff7043]" : "bg-[#1a3b5d]"}`}>
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-[#1a3b5d]">
                            {searchTerm ? highlightText(user.username, searchTerm) : user.username}
                          </p>
                          {isCurrentUser && (
                            <span className="text-xs text-[#ff7043]">(You)</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{searchTerm ? highlightText(user.email, searchTerm) : user.email}</td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${isAdmin ? "bg-[#fff5e6] text-[#ff7043]" : "bg-gray-100 text-gray-600"}`}>
                          <span className={`w-2 h-2 rounded-full mr-2 ${isAdmin ? "bg-[#ff7043]" : "bg-gray-400"}`} />
                          {isAdmin ? "Admin" : "User"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {!isCurrentUser && (
                          <>
                            <button
                              onClick={() =>
                                handleRoleChange(
                                  user._id,
                                  user.role === "admin" ? "user" : "admin"
                                )
                              }
                              className="p-2 text-[#1a3b5d] hover:text-[#ff7043] hover:bg-[#fff5e6] rounded-lg transition-colors"
                              title={user.role === "admin" ? "Make User" : "Make Admin"}
                            >
                              <Shield size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(user._id, user.username)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete User"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                        {isCurrentUser && (
                          <span className="text-xs text-gray-400">No actions</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;