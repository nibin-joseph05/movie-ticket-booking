"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import axios from "axios";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.firstName) {
      setUserName(user.firstName);
    }

    const fetchMovies = async () => {
      try {
        const res = await axios.get("http://localhost:8080/movies/now-playing");
        if (res.data && res.data.results) {
          setMovies(res.data.results);
        }
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    };

    fetchMovies();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1e1e2e] via-[#121212] to-[#000000] text-white">
      <Header />

      {userName && (
        <div className="text-center py-4 text-lg font-bold bg-gradient-to-r from-red-600 to-pink-500 text-white shadow-lg rounded-b-lg">
          🎉 Welcome, <span className="text-yellow-300">{userName}!</span> Book the best movies now!
        </div>
      )}

      <section className="relative w-full h-[50vh] flex items-center justify-center">
        <img
          src="hero-section.Webp"
          alt="Movie Night"
          className="absolute inset-0 w-full h-full object-cover brightness-100"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 px-4 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg">
            Your <span className="text-red-500">Gateway</span> to the Silver Screen
          </h1>
          <p className="text-lg sm:text-xl mt-3 text-gray-300">
            Discover & book your favorite movies seamlessly.
          </p>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 sm:px-8 py-12">
        <h3 className="text-3xl font-bold mb-8 text-red-500 text-center border-b-4 border-red-600 pb-2">
          🎬 Recommended Movies
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <Link key={movie.id} href={`/movie/${movie.id}`} passHref>
              <div
                className="relative w-full h-[380px] bg-cover bg-center rounded-lg shadow-lg overflow-hidden group transition-transform transform hover:scale-105 hover:shadow-xl flex flex-col justify-end cursor-pointer"
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
      </section>

      <Footer />
    </div>
  );
}
