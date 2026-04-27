import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import api from "../api/axiosInstance";

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
    const [message, setMessage] = useState({ type: "", text: "" });
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setMessage({ type: "", text: "" });
    };

    const handleSubmit = async e => {
        e.preventDefault();

        if (!form.email || !form.password || (!isLogin && !form.username)) {
            setMessage({ type: "error", text: "Please fill all required fields" });
            return;
        }

        try {
            if (isLogin) {
                // LOGIN
                const res = await api.post("/api/users/login", {
                    email: form.email,
                    password: form.password,
                });

                const { accessToken, refreshToken } = res.data;

                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);

                const userRes = await api.get("/api/users/current");
                setUser(userRes.data);
                setMessage({ type: "success", text: "Login successful!" });

                setTimeout(() => {
                    if (userRes.data.role === "admin") navigate("/admin");
                    else navigate("/");
                }, 1000);
            } else {
                // SIGNUP
                if (form.password !== form.confirm) {
                    setMessage({ type: "error", text: "Passwords do not match" });
                    return;
                }

                await api.post("/api/users/register", {
                    username: form.username,
                    email: form.email,
                    password: form.password,
                });

                setMessage({ type: "success", text: "Signup successful! You can now log in." });
                setIsLogin(true);
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Something went wrong.";
            setMessage({ type: "error", text: errorMsg });
        }
    };

    return (
        <div className="flex items-center justify-center h-[calc(100vh-80px)] bg-[var(--bg-color)] px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
                {/* Tabs */}
                <div className="flex justify-around mb-6">
                    <button
                        className={`pb-2 text-lg font-semibold ${isLogin ? "text-[var(--primary-color)] border-b-2 border-[var(--primary-color)]" : "text-gray-500"}`}
                        onClick={() => setIsLogin(true)}
                    >
                        Sign In
                    </button>
                    <button
                        className={`pb-2 text-lg font-semibold ${!isLogin ? "text-[var(--primary-color)] border-b-2 border-[var(--primary-color)]" : "text-gray-500"}`}
                        onClick={() => setIsLogin(false)}
                    >
                        Create Account
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Username</label>
                            <input
                                type="text"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                placeholder="Enter your username"
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                            <input
                                type="password"
                                name="confirm"
                                value={form.confirm}
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                    )}
                    <button
                        type="submit"
                        className="w-full bg-[var(--primary-color)] text-white py-2 rounded-lg hover:opacity-90"
                    >
                        {isLogin ? "Access Your Account" : "Join Our Community"}
                    </button>
                    {message.text && (
                        <p className={`text-center mt-3 ${message.type === "error" ? "text-red-500" : "text-green-600"}`}>
                            {message.text}
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default AuthPage;
