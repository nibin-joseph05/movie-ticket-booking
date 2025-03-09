"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCrosshairs } from "react-icons/fa";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem("user");
    if (user) setIsLoggedIn(true);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8080/user/logout", {
        method: "POST",
        credentials: "include",
      });

      localStorage.removeItem("user");
      setIsLoggedIn(false);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <header className="bg-gray-900 text-white py-5 shadow-lg">
      <div className="container mx-auto flex justify-between items-center px-6">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <Image src="/logo.webp" alt="Logo" width={50} height={50} />
          <span className="text-2xl font-extrabold bg-gradient-to-r from-red-500 to-pink-500 text-transparent bg-clip-text drop-shadow-lg tracking-wide">
            MovieFlix
          </span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 mx-6 max-w-lg hidden sm:block">
          <input
            type="text"
            placeholder="🔍 Search for Movies, Events, Plays..."
            className="w-full px-5 py-3 text-black bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 shadow-md text-md"
          />
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex space-x-6 text-lg">
          <a href="/" className="hover:text-red-500 transition-all duration-200">Home</a>
          <a href="#" className="hover:text-red-500 transition-all duration-200">Movies</a>
          <a href="#" className="hover:text-red-500 transition-all duration-200">Stream</a>
          <a href="#" className="hover:text-red-500 transition-all duration-200">Events</a>
          <a href="#" className="hover:text-red-500 transition-all duration-200">Plays</a>
          <a href="#" className="hover:text-red-500 transition-all duration-200">Sports</a>
        </nav>

        {/* User Actions & Find Theaters Button */}
        <div className="flex items-center space-x-4">
          {/* Find Theaters Button */}
          <button
            onClick={() => router.push("/theatre")}
            className="flex items-center bg-blue-600 border-2 border-white px-4 py-2 rounded-full text-sm font-semibold shadow-md transition-all duration-300 hover:bg-blue-700 hover:shadow-lg transform hover:scale-105"
          >
            <FaCrosshairs className="mr-2 text-base" />
            Find Theaters
          </button>


          {/* Sign In / Logout */}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 border-2 border-white px-4 py-2 rounded-full text-sm font-semibold shadow-md transition-all duration-300 hover:bg-red-700 hover:shadow-lg transform hover:scale-105"
            >
              Logout
            </button>
          ) : (
            <Link href="/login">
              <button className="flex items-center bg-gradient-to-r from-red-500 to-pink-500 border-2 border-white px-4 py-2 rounded-full text-sm font-semibold shadow-md transition-all duration-300 hover:from-pink-500 hover:to-red-500 hover:shadow-lg transform hover:scale-105">
                Sign In
              </button>
            </Link>
          )}


          {/* Mobile Menu Button */}
          <button className="md:hidden">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
