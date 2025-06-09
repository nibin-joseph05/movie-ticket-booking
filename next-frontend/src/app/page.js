"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/home/HeroSection";
import axios from "axios";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [userName, setUserName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('https://movie-ticket-booking-583u.onrender.com/user/check-session', {
          credentials: 'include'
        });
        const data = await response.json();

        if (data.isLoggedIn) {
          localStorage.setItem('user', JSON.stringify(data.user));
          setUserName(data.user.firstName);
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem('user');
          setUserName("");
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

    const fetchMovies = async () => {
      try {
        const res = await axios.get("https://movie-ticket-booking-583u.onrender.com/movies/now-playing");
        if (res.data && res.data.results) {
          setMovies(res.data.results);
        }
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    };

    fetchMovies();

    return () => {
      window.removeEventListener('storage', checkSession);
    };
  }, []);

  const handleLogout = () => {
    setUserName("");
    setIsLoggedIn(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1e1e2e] via-[#121212] to-[#000000] text-white">
      <Header onLogout={handleLogout} />

      {isLoggedIn && userName && (
        <div className="text-center py-4 text-lg font-bold bg-gradient-to-r from-red-600 to-pink-500 text-white shadow-lg rounded-b-lg">
          🎉 Welcome, <span className="text-yellow-300">{userName}!</span> Book the best movies now!
        </div>
      )}

      <HeroSection />

      <section className="max-w-[1200px] mx-auto px-4 sm:px-8 py-12">
        <h3 className="text-3xl font-bold mb-8 text-red-500 text-center border-b-4 border-red-600 pb-2">
          🎬 Recommended Movies
        </h3>

        {movies.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
            <h2 className="text-4xl font-extrabold text-red-500 mt-4 animate-bounce">
              Oops! No Movies Available
            </h2>
            <p className="text-lg text-gray-400 mt-2 max-w-md">
              Currently, we couldn&apos;t find any movies to display. <br />
              Please check back later or explore other categories.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <Link key={movie.id} href={`/movies/${movie.id}`} passHref>
                <div
                  className="relative w-full h-[380px] bg-cover bg-center rounded-lg shadow-lg overflow-hidden
                             group transition-transform transform hover:scale-105 hover:shadow-xl flex flex-col justify-end cursor-pointer"
                  style={{ backgroundImage: `url(https://image.tmdb.org/t/p/w500${movie.poster_path})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-lg p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h4 className="text-xl font-bold text-white mb-2">{movie.title}</h4>
                    <p className="text-sm text-gray-300 mb-2">{movie.overview.slice(0, 120)}...</p>
                    <span className="mt-2 text-yellow-400 font-semibold text-lg">
                      ⭐ {movie.vote_average.toFixed(1)}
                    </span>
                    <p className="mt-2 text-gray-300 text-sm font-medium">🎭 {movie.genres || "Unknown"}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}