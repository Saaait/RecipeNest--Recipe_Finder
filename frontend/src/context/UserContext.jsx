import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchUser = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            setUser(null);
            setLoading(false);
            return null;
        }
        try {
            const res = await axios.get(`${API_BASE_URL}/api/users/current`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(res.data);
            setLoading(false);
            return res.data;
        } catch (err) {
            console.error("fetchUser error:", err);
            setUser(null);
            setLoading(false);
            return null;
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, fetchUser, loading }}>
            {children}
        </UserContext.Provider>
    );
};
