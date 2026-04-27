// src/components/AdminRoute.jsx
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";

const AdminRoute = ({ children }) => {
    const { user, loading } = useContext(UserContext);

    if (loading) return null; // Wait for user data to load
    if (!user || !user.role) return <Navigate to="/login" />; // Not logged in
    if (user.role !== "admin") return <Navigate to="/" />; // Not admin

    return children;
};

export default AdminRoute;
