import React, { useState } from "react";
import { Users, BookOpen, LogOut, Home, ChefHat, Clock, X, Menu } from "lucide-react";

const AdminSidebar = ({ activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false);

  const tabs = [
    { id: "users", label: "Community Members", icon: Users },
    { id: "recipes", label: "All Recipes", icon: BookOpen },
    { id: "pending", label: "Awaiting Review", icon: Clock },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setIsOpen(false); // Close sidebar on mobile after clicking a tab
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-[#1a3b5d] text-white p-2 rounded-lg shadow-lg hover:bg-[#244d7a] transition-colors"
      >
        <Menu size={24} />
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-screen z-50 shadow-2xl transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-64'}
        bg-[#1a3b5d] flex flex-col`}>
        {/* Header with close button */}
        <div className="px-6 py-4 border-b border-blue-700/50 hover:bg-blue-800/30 transition-colors">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <span className="text-2xl">🍳</span>
              <h2 className="text-xl font-bold text-white">RecipeNest</h2>
            </a>
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden text-white hover:text-gray-300 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <p className="text-xs text-blue-200 ml-8 mt-1">Administration Hub</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <nav className="space-y-2 px-3 pt-4 pb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-[#ff7043] to-[#e66038] text-white shadow-lg"
                      : "text-gray-400 hover:bg-blue-800/40 hover:text-white"
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="px-3 pt-4 pb-4 border-t border-blue-700/50">
          <a
            href="/"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-blue-900/50 hover:text-white transition-all duration-200"
          >
            <Home size={20} />
            <span className="font-medium">Back to Home</span>
          </a>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;