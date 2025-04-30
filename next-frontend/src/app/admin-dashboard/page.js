"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FiHome, FiPlusCircle, FiLogOut } from "react-icons/fi"; // Import icons

export default function AdminDashboard() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      localStorage.removeItem("admin");
      router.push("/admin-login");
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar (Remains Dark Always) */}
      <aside className="w-64 bg-[#1e1e2e] p-6 flex flex-col shadow-lg">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <img src="/logo.webp" alt="Logo" width={120} height={80} className="rounded-lg shadow-md" />
        </div>

        {/* Navigation */}
        <nav className="flex flex-col space-y-4 text-white">
          <button
            onClick={() => router.push("/admin-dashboard")}
            className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg bg-gray-800 hover:bg-red-500 transition-transform transform hover:scale-105"
          >
            <FiHome size={20} />
            Dashboard
          </button>

          <button
            onClick={() => router.push("/admin/add-movie")}
            className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg bg-gray-800 hover:bg-red-500 transition-transform transform hover:scale-105"
          >
            <FiPlusCircle size={20} />
            Add Movies
          </button>
        </nav>
      </aside>

      {/* Main Content (Light/Dark Mode Applies Here) */}
      <main
        className={`flex-1 p-8 relative transition-colors duration-300 ${
          darkMode ? "bg-[#121212] text-white" : "bg-gray-100 text-black"
        }`}
      >
        {/* Top Right Controls */}
        <div className="absolute top-4 right-4 flex space-x-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="px-3 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-transform transform hover:scale-105"
          >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-transform transform hover:scale-105"
          >
            <FiLogOut size={20} />
            Logout
          </button>
        </div>

        {/* Centered Admin Dashboard Heading */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-red-500">Admin Dashboard</h1>
        </div>

        {/* Project Overview Section */}
        <div
          className={`mb-6 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow ${
            darkMode ? "bg-gray-800 text-gray-300" : "bg-white text-black border border-gray-300"
          }`}
        >
          <h2 className="text-2xl font-semibold text-red-500">Project Overview</h2>
          <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
            This system is designed to efficiently manage movie ticket bookings. Admins can add, update, and delete movies, manage user bookings, and oversee system performance.
          </p>
          
        </div>

        {/* Dashboard Content */}
        <div
          className={`mt-6 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow ${
            darkMode ? "bg-gray-800 text-gray-300" : "bg-white text-black border border-gray-300"
          }`}
        >
          <h2 className="text-2xl font-semibold text-red-500">Manage Movies</h2>
          <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
            Add, update, or remove movies from the system.
          </p>
          <button
            onClick={() => router.push("/admin/add-movie")}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-transform transform hover:scale-105"
          >
            Add Movie
          </button>
        </div>
      </main>
    </div>
  );
}
