"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import axios from "axios";

export default function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");

  // Fetch Genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await axios.get("http://localhost:8080/movies/genres");
        if (res.data) {
          setGenres(res.data);
        }
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };
    fetchGenres();
  }, []);

  // Fetch Movies
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        let url = `http://localhost:8080/movies/now-playing?page=1`;
        if (selectedGenre) url += `&genre=${encodeURIComponent(selectedGenre)}`;
        if (selectedLanguage) url += `&language=${selectedLanguage}`;

        const res = await axios.get(url);
        if (res.data && res.data.results) {
          setMovies(res.data.results);
        } else {
          setMovies([]);
        }
      } catch (error) {
        console.error("Error fetching movies:", error);
        setMovies([]);
      }
    };
    fetchMovies();
  }, [selectedGenre, selectedLanguage]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#1e1e2e] via-[#121212] to-[#000000] text-white">
      <Header />
      <div className="w-full h-[2px] bg-white opacity-20" />

      <main className="flex-grow">
        {/* Filter Section */}
        <section className="max-w-4xl mx-auto bg-[#222] p-6 rounded-lg shadow-md mt-8 flex flex-wrap items-center justify-center gap-4">
          <div className="flex flex-col">
            <label className="text-gray-300 font-medium mb-1">Genre:</label>
            <select
              className="bg-gray-800 text-white p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
            >
              <option value="">All</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-gray-300 font-medium mb-1">Language:</label>
            <select
              className="bg-gray-800 text-white p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              <option value="">All</option>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="ta">Tamil</option>
              <option value="ml">Malayalam</option>
              <option value="te">Telugu</option>
            </select>
          </div>
        </section>

        {/* Movies Section */}
        <section className="max-w-[1200px] mx-auto px-4 sm:px-8 py-12">
          <h3 className="text-3xl font-bold mb-8 text-red-500 text-center border-b-4 border-red-600 pb-2">
            🎬 Recommended Movies
          </h3>

          {movies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {movies.map((movie) => (
                <Link key={movie.id} href={`/movie/${movie.id}`} passHref>
                  <div
                    className="relative w-full h-[380px] bg-cover bg-center rounded-lg shadow-lg overflow-hidden group transition-transform transform hover:scale-105 hover:shadow-xl flex flex-col justify-end cursor-pointer"
                    style={{ backgroundImage: `url(https://image.tmdb.org/t/p/w500${movie.poster_path})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-lg p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <h4 className="text-xl font-bold text-white mb-2">{movie.title}</h4>
                      <p className="text-sm text-gray-300 mb-2">
                        {movie.overview.slice(0, 120)}...
                      </p>
                      <span className="mt-2 text-yellow-400 font-semibold text-lg">
                         ⭐ {movie.vote_average.toFixed(1)}
                       </span>
                      <p className="mt-2 text-gray-300 text-sm font-medium">
                        🎭 {movie.genres || "Unknown"}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-xl text-gray-400 mt-8">🚫 No movies available for the selected filters. Please try different criteria.</p>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
