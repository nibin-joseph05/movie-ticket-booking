"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FaLocationArrow } from "react-icons/fa";

export default function Theatre() {
  const searchParams = useSearchParams();
  const movieId = searchParams.get("movieId"); // Get movie ID from URL

  const [movie, setMovie] = useState(null);
  const [location, setLocation] = useState("Detecting...");
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (movieId) fetchMovieDetails();
    detectAndFetchTheatres();
  }, [movieId]);

  const fetchMovieDetails = async () => {
    try {
      const res = await fetch(`http://localhost:8080/movies/details?id=${encodeURIComponent(movieId)}`);
      const data = await res.json();
      setMovie(data);
    } catch {
      setMovie(null);
    }
  };

  const detectAndFetchTheatres = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation("Fetching location...");
          await reverseGeocode(latitude, longitude);
          fetchNearbyTheatres(latitude, longitude);
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
  };

  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${process.env.NEXT_PUBLIC_GOOGLE_THEATRE_API_KEY}`
      );
      const data = await res.json();

      if (data.status === "OK" && data.results.length > 0) {
        let locationName = data.results[0].formatted_address || "Unknown Location";
        setLocation(locationName);
      } else {
        setLocation("Unknown Location");
      }
    } catch {
      setLocation("Unknown Location");
    }
  };

  const fetchNearbyTheatres = async (lat, lon) => {
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
  };


  return (
    <div className="flex flex-col min-h-screen bg-[#121212] text-white">
      <Header />

      <main className="flex-grow">
        {/* Movie Info Section */}
        {movie && (
          <div className="text-center py-6 bg-[#1e1e2e]">
            <h2 className="text-3xl font-bold text-red-500">{movie.title}</h2>
            <p className="text-gray-400 mt-1">{movie.genre?.join(", ") || "Genre not available"}</p>
          </div>
        )}

        {/* Location and Detect Button */}
        <div className="text-center py-6">
          <button
            onClick={detectAndFetchTheatres}
            className="flex items-center bg-blue-600 px-5 py-2 rounded-full text-lg font-semibold hover:bg-blue-700"
          >
            <FaLocationArrow className="mr-2" /> Detect Location
          </button>
          <p className="mt-3 text-gray-300 text-xl">
            🌍 Location: <span className="text-yellow-400 font-semibold">{location}</span>
          </p>
        </div>

        {/* Theatres Section */}
        <section className="max-w-6xl mx-auto px-4 py-10">
          <h3 className="text-3xl font-bold mb-6 text-red-500">🍿 Nearby Theatres</h3>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-400 border-t-transparent rounded-full"></div>
            </div>
          ) : theatres.length === 0 ? (
            <p className="text-gray-400 text-center text-lg">No theatres found in your area.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {theatres.map((theatre) => (
                <div key={theatre.id} className="p-5 bg-gray-900 rounded-lg">
                  <h4 className="text-xl font-semibold text-yellow-400">{theatre.name}</h4>
                  <p className="text-gray-400">{theatre.address}</p>
                  <p className="text-green-400 mt-2">
                    {theatre.rating ? `⭐ ${theatre.rating.toFixed(1)}/5` : "Not Rated"}
                  </p>
                  <button className="mt-3 bg-red-600 px-4 py-2 rounded-lg text-white font-semibold hover:bg-red-700">
                    View Showtimes
                  </button>
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
