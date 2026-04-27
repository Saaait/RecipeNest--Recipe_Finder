// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import Nav from "./components/Nav";
import AuthPage from "./pages/AuthPage";
import Profile from "./pages/Profile";
import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./pages/AdminDashboard";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import AddRecipe from "./pages/AddRecipe";
import RecipeDetail from "./pages/RecipeDetail";

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname === "/admin";

  const isHome = location.pathname === "/";

  return (
    <>
      {!isAdminRoute && <Nav />}
      {/* add padding top for pages except home so content isn’t too close to the navbar */}
      <div className={isHome ? "" : "pt-16 md:pt-20"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/add-recipe" element={<AddRecipe />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
}

export default App;
