"use client";
import { useEffect, useState, useCallback } from "react"; // Import useCallback
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { FaLocationArrow } from "react-icons/fa";
import { Suspense } from "react";

function TheatreContent() {
  const searchParams = useSearchParams();
  const movieId = searchParams.get("movieId");

  const [movie, setMovie] = useState(null);
  const [loadingMovie, setLoadingMovie] = useState(true);
  const [location, setLocation] = useState("Detecting...");
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define all functions using useCallback
  const fetchMovieDetails = useCallback(async () => {
    try {
      const res = await fetch(
        `http://localhost:8080/movies/details?id=${encodeURIComponent(movieId)}`
      );
      const data = await res.json();
      setMovie(data);
      setLoadingMovie(false);
    } catch {
      setMovie(null);
      setLoadingMovie(false);
    }
  }, [movieId]); // Add movieId to the dependency array

  const reverseGeocode = useCallback(async (lat, lon) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${process.env.NEXT_PUBLIC_GOOGLE_THEATRE_API_KEY}`
      );
      const data = await res.json();

      if (data.status === "OK" && data.results.length > 0) {
        setLocation(data.results[0].formatted_address || "Unknown Location");
      } else {
        setLocation("Unknown Location");
      }
    } catch {
      setLocation("Unknown Location");
    }
  }, []); // Empty dependency array as it doesn't depend on component scope variables

  const fetchNearbyTheatres = useCallback(async (lat, lon) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/theatres/nearby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lon }),
      });
      const data = await res.json();
      setTheatres(data.length > 0 ? data : []);
    } catch {
      setTheatres([]);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array

  const detectAndFetchTheatres = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation("Fetching location...");
          await reverseGeocode(latitude, longitude); // Call memoized function
          fetchNearbyTheatres(latitude, longitude); // Call memoized function
        },
        () => {
          setLocation("Location access denied.");
          alert("Please enable location access.");
          setLoading(false);
        }
      );
    } else {
      alert("Geolocation is not supported in this browser.");
      setLoading(false);
    }
  }, [reverseGeocode, fetchNearbyTheatres]); // Add memoized functions to dependency array

  // Now use the functions in useEffect
  useEffect(() => {
    if (movieId) {
      fetchMovieDetails();
    }
    detectAndFetchTheatres();
  }, [movieId, fetchMovieDetails, detectAndFetchTheatres]); // Add functions to dependency array

  return (
    <div className="flex flex-col min-h-screen bg-[#121212] text-white">
      <Header />
      <div className="border-t border-gray-700 shadow-lg"></div>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Movie Section with Blurred Background */}
        {movie ? (
          <div
            className="relative flex flex-col md:flex-row items-center bg-[#1e1e2e] p-6 rounded-lg shadow-2xl max-w-4xl mx-auto w-full overflow-hidden border border-gray-700"
            style={{
              backgroundImage: movie.posterPath
                ? `url(https://image.tmdb.org/t/p/w500${movie.posterPath})`
                : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Blurred & Gradient Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-md"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1e1e2e] opacity-80"></div>

            {/* Movie Poster */}
            {movie.posterPath && (
              <img
                src={`https://image.tmdb.org/t/p/w300${movie.posterPath}`}
                alt={movie.title}
                className="w-64 md:w-60 h-auto rounded-lg shadow-lg relative z-10 border-2 border-gray-600 hover:scale-110 transition-transform duration-300 ease-in-out"
              />
            )}

            {/* Movie Details */}
            <div className="md:ml-6 flex-1 text-center md:text-left relative z-10">
              <h2 className="text-3xl font-extrabold text-red-500 drop-shadow-lg">{movie.title}</h2>
              <p className="text-gray-300 mt-1 text-lg">{movie.genres?.length > 0 ? movie.genres.join(", ") : "Genre not available"}</p>
              <p className="text-gray-400 mt-1 text-sm">
                ⭐ {movie.rating ? `Rating: ${movie.rating.toFixed(1)}/10` : "Rating not available"}
              </p>

              {/* "Wrong Movie?" Section */}
              <div className="mt-4 bg-gray-800 bg-opacity-90 p-5 rounded-md text-center shadow-md border border-gray-700">
                <p className="text-gray-300 text-sm font-medium">🎥 Did you select the wrong movie?</p>

                {/* Buttons - Back & Choose Another Movie */}
                <div className="mt-3 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => window.history.back()}
                    className="bg-red-600 px-4 py-2 rounded-md text-white font-medium text-sm shadow-md transition-transform hover:scale-105 hover:shadow-red-500/50"
                  >
                    ⬅️ Go Back
                  </button>

                  <button
                    onClick={() => window.location.href = "/movies"}
                    className="bg-blue-600 px-4 py-2 rounded-md text-white font-medium text-sm shadow-md transition-transform hover:scale-105 hover:shadow-blue-500/50"
                  >
                    🎬 Choose Another Movie
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
            <h2 className="text-4xl font-extrabold text-red-500 mt-4 animate-bounce">
              🎬 Oops! No Movie Selected
            </h2>
            <p className="text-lg text-gray-400 mt-2 max-w-md">
              To continue, please select a movie from our collection.
            </p>
            <Link href="/movies">
              <button className="mt-6 bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3 rounded-full
                                 text-white font-semibold text-lg shadow-lg transition-all duration-300
                                 ease-in-out hover:from-blue-700 hover:to-blue-600 hover:scale-105
                                 hover:shadow-blue-500/50 active:scale-95">
                🎥 Browse Movies
              </button>
            </Link>
          </div>
        )}

        {/* White Separator Line */}
        <div className="border-t border-gray-400 my-6"></div>

        {/* Location Detection */}
        <div className="flex flex-col items-center text-center py-6">
          <button
            onClick={detectAndFetchTheatres}
            className="flex items-center bg-blue-600 px-5 py-2 rounded-full text-lg font-semibold hover:bg-blue-700 transition shadow-md"
          >
            <FaLocationArrow className="mr-2" /> Detect Location
          </button>
          <p className="mt-3 text-gray-300 text-xl">
            🌍 Location: <span className="text-yellow-400 font-semibold">{location}</span>
          </p>
        </div>

        {/* Theatres Section */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <h3 className="text-3xl font-bold mb-8 text-red-500 text-center">🍿 Nearby Theatres</h3>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin h-10 w-10 border-4 border-blue-400 border-t-transparent rounded-full"></div>
            </div>
          ) : theatres.length === 0 ? (
            <p className="text-gray-400 text-center text-lg">No theatres found in your area.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {theatres.map((theatre) => (
                <div
                  key={theatre.id}
                  className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-[1.05] relative flex flex-col"
                >
                  {/* Theatre Info */}
                  <div className="flex-grow">
                    <h4 className="text-xl font-semibold text-yellow-400">{theatre.name}</h4>
                    <p className="text-gray-400 text-sm mt-1">{theatre.address}</p>
                    <p className="text-green-400 mt-2 text-sm">
                      {theatre.rating ? `⭐ ${theatre.rating.toFixed(1)}/5` : "Not Rated"}
                    </p>
                    <p className="text-blue-400 mt-2 text-sm">
                      📍 {theatre.distance.toFixed(2)} km away
                    </p>
                  </div>

                  {/* View Showtimes Button */}
                  <div className="mt-auto flex justify-center">
                    {movieId ? (
                      <Link href={`/showtimes?theatreId=${theatre.id}&movieId=${movieId}`}>
                        <button className="bg-red-600 px-4 py-2.5 w-40 rounded-md text-white font-medium text-sm whitespace-nowrap hover:bg-red-700 transition shadow-md">
                          🎟️ View Showtimes
                        </button>
                      </Link>
                    ) : (
                      <button
                        disabled={!movieId}
                        className="bg-gradient-to-r from-gray-700 to-gray-600 px-5 py-3 w-52 rounded-md text-gray-300
                                   font-semibold text-sm whitespace-nowrap cursor-not-allowed opacity-70 border-2
                                   border-gray-500 shadow-md flex items-center justify-center gap-2"
                      >
                        ❌ No Movie Selected ❌
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function Theatre() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <TheatreContent />
    </Suspense>
  );
}