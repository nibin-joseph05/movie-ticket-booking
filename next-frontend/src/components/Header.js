"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCrosshairs } from "react-icons/fa";
import { debounce } from "lodash";
import { usePathname } from "next/navigation";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
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
      router.push("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const fetchMovies = debounce(async (query) => {
      if (query.length > 2) {
        setLoading(true);
        try {
          const response = await fetch(`http://localhost:8080/movies/search?name=${query}`);
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
    setSearchQuery(""); // Clear search input
    setSearchResults([]); // Hide search results
  };

  return (
    <header className="bg-gray-900 text-white py-5 shadow-lg relative">
      <div className="container mx-auto flex justify-between items-center px-6">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <Image src="/logo.webp" alt="Logo" width={50} height={50} />
          <span className="text-2xl font-extrabold bg-gradient-to-r from-red-500 to-pink-500 text-transparent bg-clip-text drop-shadow-lg tracking-wide">
            MovieFlix
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Search for Movies..."
            className="w-118 px-5 py-3 text-black bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 shadow-md text-md"
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
                      className="w-16 h-24 object-cover rounded-lg mr-3"
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
        <nav className="hidden md:flex space-x-6 text-lg">
          <a href="/" className="hover:text-red-500 transition-all duration-200">
            Home
          </a>
          <a href="/movies" className="hover:text-red-500 transition-all duration-200">
            Movies
          </a>
          <a href="#" className="hover:text-red-500 transition-all duration-200">
           My Account
          </a>
          <a href="/my-orders" className="hover:text-red-500 transition-all duration-200">
            My Bookings
          </a>
          <a href="#" className="hover:text-red-500 transition-all duration-200">Plays</a>
          <a href="#" className="hover:text-red-500 transition-all duration-200">Sports</a>
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push("/theatre")}
            disabled={pathname === "/theatre"}
            className={`flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-md transition-all duration-300
              bg-blue-600 border-2 border-white text-white
              ${
                pathname === "/theatre"
                  ? "cursor-not-allowed opacity-60"  // Reducing opacity for disabled state
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
    </header>
  );
}
