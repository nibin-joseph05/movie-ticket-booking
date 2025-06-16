"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCrosshairs, FaBars, FaTimes } from "react-icons/fa";
import { debounce } from "lodash";
import { usePathname } from "next/navigation";

export default function Header({ onLogout }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('https://movie-ticket-booking-583u.onrender.com/user/check-session', {
          credentials: 'include'
        });
        const data = await response.json();

        if (data.isLoggedIn) {
          localStorage.setItem('user', JSON.stringify(data.user));
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem('user');
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Session check failed:', error);
      }
    };

    // Check on initial load
    checkSession();

    // Also check after Google login redirect
    const params = new URLSearchParams(window.location.search);
    if (params.has('from') && params.get('from') === 'google') {
      checkSession();
      // Clean the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Listen for storage changes (from other tabs)
    window.addEventListener('storage', checkSession);
    return () => window.removeEventListener('storage', checkSession);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("https://movie-ticket-booking-583u.onrender.com/user/logout", {
        method: "POST",
        credentials: "include",
      });

      localStorage.removeItem("user");
      setIsLoggedIn(false);
      if (onLogout) onLogout();
      router.push("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const fetchMovies = debounce(async (query) => {
    if (query.length > 2) {
      setLoading(true);
      try {
        const response = await fetch(`https://movie-ticket-booking-583u.onrender.com/movies/search?name=${query}`);
        const data = await response.json();
        setSearchResults(data.length ? data.slice(0, 5) : []);
      } catch (error) {
        console.error("Error fetching search results", error);
      } finally {
        setLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  }, 300);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchMovies(query);
  };

  const handleMovieClick = (movieId) => {
    router.push(`/movies/${movieId}`);
    setSearchQuery("");
    setSearchResults([]);
    setIsMobileMenuOpen(false); // Close mobile menu on navigation
  };

  return (
    <header className="bg-gray-900 text-white py-5 shadow-lg relative">
      <div className="container mx-auto flex justify-between items-center px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center space-x-2 md:space-x-3">
          <img src="/logo.webp" alt="Logo" className="w-[40px] md:w-[50px] h-auto" />
          <span className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-red-500 to-pink-500 text-transparent bg-clip-text drop-shadow-lg tracking-wide">
            MovieFlix
          </span>
        </div>

        {/* Hamburger Menu Icon (Mobile) */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white focus:outline-none">
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Search Bar (Desktop and Mobile) */}
        <div className="relative flex-grow mx-4 hidden md:block">
          <input
            type="text"
            placeholder="🔍 Search for Movies..."
            className="w-full px-5 py-3 text-black bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 shadow-md text-md"
            value={searchQuery}
            onChange={handleSearch}
          />

          {/* Search Results Dropdown */}
          {searchQuery && (
            <div className="absolute top-full left-0 w-full bg-white text-black border border-gray-300 rounded-lg shadow-lg mt-1 z-50">
              {loading ? (
                <div className="p-3 text-center text-gray-500">Loading...</div>
              ) : searchResults.length > 0 ? (
                searchResults.map((movie) => (
                  <div
                    key={movie.id}
                    className="flex items-center p-3 hover:bg-gray-200 cursor-pointer"
                    onClick={() => handleMovieClick(movie.id)}
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      alt={movie.title}
                      className="w-12 h-18 object-cover rounded-lg mr-3"
                    />
                    <div>
                      <p className="font-semibold">{movie.title}</p>
                      <p className="text-gray-500 text-sm">{movie.year}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-gray-500">No results found</div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex space-x-6 text-lg">
          <Link href="/" className="hover:text-red-500 transition-all duration-200">
            Home
          </Link>
          <Link href="/movies" className="hover:text-red-500 transition-all duration-200">
            Movies
          </Link>
          <Link href="/my-account" className="hover:text-red-500 transition-all duration-200">
            My Account
          </Link>
          <Link href="/my-bookings" className="hover:text-red-500 transition-all duration-200">
            My Bookings
          </Link>
          <Link href="/about-us" className="hover:text-red-500 transition-all duration-200">
            About Us
          </Link>
        </nav>

        {/* User Actions (Desktop) */}
        <div className="hidden md:flex items-center space-x-4">
          <button
            onClick={() => router.push("/theatre")}
            disabled={pathname === "/theatre"}
            className={`flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-md transition-all duration-300
              bg-blue-600 border-2 border-white text-white
              ${
                pathname === "/theatre"
                  ? "cursor-not-allowed opacity-60"
                  : "hover:bg-blue-700 hover:shadow-lg transform hover:scale-105"
              }`}
          >
            <FaCrosshairs className="mr-2 text-base" />
            Find Theaters
          </button>

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 border-2 border-white px-4 py-2 rounded-full text-sm font-semibold shadow-md transition-all duration-300 hover:bg-red-700 hover:shadow-lg transform hover:scale-105"
            >
              Logout
            </button>
          ) : (
            <Link href="/login">
              <button className="bg-gradient-to-r from-red-500 to-pink-500 border-2 border-white px-4 py-2 rounded-full text-sm font-semibold shadow-md transition-all duration-300 hover:from-pink-500 hover:to-red-500 hover:shadow-lg transform hover:scale-105">
                Sign In
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-gray-900 bg-opacity-95 text-white flex flex-col items-center py-8 space-y-6 z-40"> {/* Increased py and space-y */}
          {/* Search Bar (Mobile) */}
          <div className="relative w-11/12 px-4 mb-4">
            <input
              type="text"
              placeholder="🔍 Search for Movies..."
              className="w-full px-5 py-3 text-black bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 shadow-md text-md"
              value={searchQuery}
              onChange={handleSearch}
            />
            {searchQuery && (
              <div className="absolute top-full left-0 w-full bg-white text-black border border-gray-300 rounded-lg shadow-lg mt-1 z-50"> {/* Ensured z-50 for search results */}
                {loading ? (
                  <div className="p-3 text-center text-gray-500">Loading...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((movie) => (
                    <div
                      key={movie.id}
                      className="flex items-center p-3 hover:bg-gray-200 cursor-pointer"
                      onClick={() => handleMovieClick(movie.id)}
                    >
                      <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        className="w-12 h-18 object-cover rounded-lg mr-3"
                      />
                      <div>
                        <p className="font-semibold">{movie.title}</p>
                        <p className="text-gray-500 text-sm">{movie.year}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-gray-500">No results found</div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <Link href="/" className="text-lg hover:text-red-500 transition-all duration-200" onClick={() => setIsMobileMenuOpen(false)}>
            Home
          </Link>
          <Link href="/movies" className="text-lg hover:text-red-500 transition-all duration-200" onClick={() => setIsMobileMenuOpen(false)}>
            Movies
          </Link>
          <Link href="/my-account" className="text-lg hover:text-red-500 transition-all duration-200" onClick={() => setIsMobileMenuOpen(false)}>
            My Account
          </Link>
          <Link href="/my-bookings" className="text-lg hover:text-red-500 transition-all duration-200" onClick={() => setIsMobileMenuOpen(false)}>
            My Bookings
          </Link>
          <Link href="/about-us" className="text-lg hover:text-red-500 transition-all duration-200" onClick={() => setIsMobileMenuOpen(false)}>
            About Us
          </Link>

          {/* Mobile User Actions */}
          <div className="flex flex-col space-y-4 pt-6 w-full items-center"> {/* Increased pt */}
            <button
              onClick={() => {
                router.push("/theatre");
                setIsMobileMenuOpen(false);
              }}
              disabled={pathname === "/theatre"}
              className={`flex items-center justify-center w-11/12 px-4 py-3 rounded-full text-lg font-semibold shadow-md transition-all duration-300
                bg-blue-600 border-2 border-white text-white
                ${
                  pathname === "/theatre"
                    ? "cursor-not-allowed opacity-60"
                    : "hover:bg-blue-700 hover:shadow-lg transform hover:scale-105"
                }`}
            >
              <FaCrosshairs className="mr-2 text-base" />
              Find Theaters
            </button>

            {isLoggedIn ? (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="bg-red-500 border-2 border-white w-11/12 px-4 py-3 rounded-full text-lg font-semibold shadow-md transition-all duration-300 hover:bg-red-700 hover:shadow-lg transform hover:scale-105"
              >
                Logout
              </button>
            ) : (
              <Link href="/login" className="w-11/12">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-gradient-to-r from-red-500 to-pink-500 border-2 border-white w-full px-4 py-3 rounded-full text-lg font-semibold shadow-md transition-all duration-300 hover:from-pink-500 hover:to-red-500 hover:shadow-lg transform hover:scale-105"
                >
                  Sign In
                </button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}