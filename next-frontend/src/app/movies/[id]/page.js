"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function MovieDetailPage() {
  const { id } = useParams(); // Get movie ID from URL
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/movies/details?id=${id}`);
        if (res.data) {
          setMovie(res.data);
        }
      } catch (error) {
        console.error("Error fetching movie details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchMovieDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-lg">
        Loading movie details...
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 text-lg">
        Movie not found! 🚫
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header />

      {/* Hero Section (Movie Poster with Overlay) */}
      <div
        className="relative w-full h-[400px] bg-cover bg-center flex items-center justify-center p-6 brightness-100"
        style={{
          backgroundImage: movie.backdrop_path
            ? `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
            : "url('/default-movie-banner.jpg')",
        }}
      >
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-80"></div>

        {/* Movie Info Overlay */}
        <div className="relative w-full flex flex-col items-center max-w-5xl">
          {/* Trailer and Details */}
          <div className="flex flex-col md:flex-row items-center max-w-5xl w-full p-6 gap-6">
            {/* Left: Trailer */}
            {movie.trailer && (
              <div className="w-full md:w-1/3 flex justify-center">
                <iframe
                  className="w-[320px] h-[200px] md:w-[450px] md:h-[250px] rounded-lg shadow-lg"
                  src={`https://www.youtube.com/embed/${movie.trailer}`}
                  title="Movie Trailer"
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              </div>
            )}

            {/* Right: Movie Title & Details */}
            <div className="text-center md:w-2/3 md:text-left md:pl-6">
              <h1 className="text-5xl font-bold">{movie.title}</h1>
              <p className="text-xl text-yellow-400 font-semibold mt-2">
                ⭐ {movie.vote_average?.toFixed(1)} / 10 ({movie.vote_count?.toLocaleString()} Votes)
              </p>
              <p className="text-gray-400 text-lg mt-1">In Cinemas</p>
              <div className="flex justify-center md:justify-start gap-3 mt-2 text-lg">
                <span className="bg-gray-800 px-4 py-1 rounded">{movie.format || "2D"}</span>
                <span className="bg-gray-800 px-4 py-1 rounded">{movie.language?.toUpperCase() || "N/A"}</span>
                <span className="bg-gray-800 px-4 py-1 rounded">{movie.runtime || "1h 59m"}</span>
              </div>
              <p className="mt-3 text-lg text-gray-400">{movie.genre?.join(", ") || "Drama, Family"}</p>
              <p className="mt-1 text-lg text-gray-400">UA13+ • {movie.release_date || "7 Mar, 2025"}</p>
              {movie.isNowPlaying ? (
                <button className="mt-5 bg-red-600 px-8 py-3 text-white rounded-md text-lg">
                  Book Tickets
                </button>
              ) : (
                <p className="mt-5 text-lg text-red-500 font-semibold">
                  ❌ This movie is not currently showing in theaters.
                </p>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* About the Movie */}
      <div className="max-w-4xl mx-auto p-6">
        <h3 className="text-2xl font-semibold mb-2">About the Movie</h3>
        <p className="text-gray-300 text-lg">{movie.overview || "No description available"}</p>
      </div>

      {/* Cast Section */}
      <div className="max-w-4xl mx-auto p-6">
        <h3 className="text-2xl font-semibold mb-4">Cast</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {movie.cast?.length > 0 ? (
            movie.cast.map((member) => (
              <div key={member.id} className="flex flex-col items-center">
                <img
                  src={member.profile_path ? `https://image.tmdb.org/t/p/w200${member.profile_path}` : "/placeholder.jpg"}
                  alt={member.name}
                  className="w-28 h-28 object-cover rounded-full mb-2"
                />
                <p className="text-center text-lg font-semibold">{member.name}</p>
                <p className="text-center text-md text-gray-400">{member.character}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-lg">No cast information available</p>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}