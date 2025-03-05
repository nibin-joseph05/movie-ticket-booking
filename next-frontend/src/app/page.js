"use client";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Fetch logged-in user details from session storage
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.firstName) {
      setUserName(user.firstName);
    }

    const fetchMovies = async () => {
      const movieTitles = [
        "Dune: Part Two",
        "Deadpool 3",
        "Oppenheimer",
        "John Wick 4",
        "Spider-Man: No Way Home",
        "The Batman",
        "Fast X",
        "Avatar: The Way of Water",
      ];

      const apiKey = "c5822fcd"; // Your OMDb API key
      const movieData = await Promise.all(
        movieTitles.map(async (title) => {
          const res = await fetch(
            `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`
          );
          const data = await res.json();
          return {
            title: data.Title,
            img: data.Poster !== "N/A" ? data.Poster : "/placeholder.jpg",
          };
        })
      );

      setMovies(movieData);
    };

    fetchMovies();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1e1e2e] via-[#121212] to-[#000000] text-white">
      {/* Header */}
      <Header />

      {/* Enhanced Welcome Message */}
        {userName && (
          <div className="text-center py-4 text-lg font-bold bg-gradient-to-r from-red-600 to-pink-500 text-white shadow-lg rounded-b-lg">
            🎉 Welcome, <span className="text-yellow-300">{userName}!</span> Book the best movies now!
          </div>
        )}


      {/* Hero Section */}
      <section className="relative w-full h-[60vh] flex items-center justify-center">
        <img
          src="hero-section.Webp"
          alt="Movie Night"
          className="absolute inset-0 w-full h-full object-cover"
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

      {/* Trending Movies Section */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-8 py-12">
        <h3 className="text-3xl font-bold mb-8 text-red-500 text-center">
          🎬 Trending Now
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {movies.map((movie, index) => (
            <div
              key={index}
              className="relative w-full h-[250px] sm:h-[300px] bg-cover bg-center rounded-lg shadow-lg transition-transform transform hover:scale-105 hover:shadow-xl"
              style={{ backgroundImage: `url(${movie.img})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4 rounded-lg">
                <h4 className="text-lg font-bold text-white">{movie.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
