import React, { useContext, useState } from "react";
import chefHat from "../assets/chef-hat.svg";
import { User, Menu, X } from "lucide-react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";

const Nav = () => {
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = async () => {
        try {
            const refreshToken = localStorage.getItem("refreshToken");

            if (refreshToken) {
                await api.post("/api/users/logout", { token: refreshToken });
            }

            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            setUser(null);
            navigate("/");
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/explore", label: "Discover" },
        { href: "/add-recipe", label: "Share Recipe" },
        ...(user && user.role === "admin" ? [
            { href: "/admin", label: "Admin Hub", isBold: true }
        ] : [])
    ];

    return (
        <header className="sticky top-0 left-0 w-full bg-[var(--bg-color)] shadow-md z-50">
            <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
                {/* Logo */}
                <a href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <div className="bg-[#ff7043] p-2 rounded-full">
                        <img src={chefHat} alt="RecipeNest logo" className="w-6 h-6" />
                    </div>
                    <span className="text-2xl sm:text-4xl font-bold text-[var(--text-color)]">RecipeNest</span>
                </a>

                {/* Desktop Navigation */}
                <ul className="hidden md:flex space-x-4 lg:space-x-8 text-base lg:text-xl text-[var(--text-color)] font-semibold">
                    {navLinks.map((link) => (
                        <li key={link.href}>
                            <a href={link.href} className={`hover:text-[var(--primary-color)] ${link.isBold ? 'font-bold' : ''}`}>
                                {link.label}
                            </a>
                        </li>
                    ))}
                </ul>

                {/* Desktop Auth Buttons */}
                <div className="hidden md:flex ml-6">
                    {!user ? (
                        <a href="/login" className="px-4 py-2 rounded-full bg-[var(--primary-color)] text-white font-semibold hover:opacity-90 text-sm lg:text-base">
                            Login
                        </a>
                    ) : (
                        <div className="flex items-center space-x-3">
                            <a href="/profile" className="flex items-center gap-2 text-[var(--text-color)] font-medium hover:text-[var(--primary-color)] text-sm lg:text-base">
                                <User size={18} />
                                <span className="hidden lg:inline">{user.username}</span>
                            </a>
                            <button
                                onClick={handleLogout}
                                className="text-sm text-[var(--primary-color)] hover:underline"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-[var(--text-color)] hover:text-[var(--primary-color)] transition-colors"
                    >
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            <div className={`md:hidden ${isOpen ? 'block' : 'hidden'} bg-[var(--bg-color)] border-t border-gray-200`}>
                <div className="px-4 py-4 space-y-3">
                    {/* Navigation Links */}
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className={`block py-2 text-[var(--text-color)] font-semibold hover:text-[var(--primary-color)] ${link.isBold ? 'font-bold text-lg' : 'text-base'}`}
                            onClick={() => setIsOpen(false)}
                        >
                            {link.label}
                        </a>
                    ))}

                    {/* Separator */}
                    <hr className="border-gray-200 my-3" />

                    {/* Auth Section */}
                    {!user ? (
                        <a
                            href="/login"
                            className="block py-3 text-center bg-[var(--primary-color)] text-white font-semibold rounded-lg"
                            onClick={() => setIsOpen(false)}
                        >
                            Login
                        </a>
                    ) : (
                        <div className="space-y-2">
                            <a
                                href="/profile"
                                className="flex items-center gap-3 py-2 text-[var(--text-color)] font-medium hover:text-[var(--primary-color)]"
                                onClick={() => setIsOpen(false)}
                            >
                                <User size={20} />
                                {user.username}
                            </a>
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setIsOpen(false);
                                }}
                                className="w-full py-2 text-left text-[var(--primary-color)] font-semibold hover:underline"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Nav;
