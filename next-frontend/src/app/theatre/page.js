"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FaLocationArrow } from "react-icons/fa";

export default function Theatre() {
  const [location, setLocation] = useState("Detecting...");
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    detectAndFetchTheatres(); // Auto-detect location on load
  }, []);

  // Detect user location and fetch nearby theaters
  const detectAndFetchTheatres = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log("User Location:", latitude, longitude);

          setLocation("Fetching location...");
          await reverseGeocode(latitude, longitude);
          fetchNearbyTheatres(latitude, longitude);
        },
        (error) => {
          console.error("Geolocation error:", error);
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

  // Reverse geocode: Convert lat/lon to a city name
  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${process.env.NEXT_PUBLIC_GOOGLE_THEATRE_API_KEY}`
      );
      const data = await res.json();

      if (data.status === "OK" && data.results.length > 0) {
        const city = data.results[0].address_components.find((component) =>
          component.types.includes("locality")
        )?.long_name || "Unknown Location";
        setLocation(city);
      } else {
        setLocation("Unknown Location");
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      setLocation("Unknown Location");
    }
  };

  // Fetch nearby theaters using the backend
  const fetchNearbyTheatres = async (lat, lon) => {
    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:8080/theatres/nearby?lat=${lat}&lon=${lon}`
      );
      const data = await res.json();

      if (data.length > 0) {
        setTheatres(data);
      } else {
        setTheatres([]);
      }
    } catch (error) {
      console.error("Error fetching nearby theatres:", error);
      setTheatres([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#121212] text-white">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="text-center py-10 bg-gradient-to-b from-[#1e1e2e] to-[#000000]">
          <h2 className="text-4xl font-bold text-red-500 drop-shadow-lg">
            🎬 Discover Theatres Near You
          </h2>

          <button
            onClick={detectAndFetchTheatres}
            className="mt-6 flex items-center justify-center bg-blue-600 px-6 py-3 rounded-full text-lg font-semibold shadow-lg transition-all duration-300 hover:bg-blue-700 transform hover:scale-105"
          >
            <FaLocationArrow className="mr-2" /> Detect Location
          </button>

          <p className="mt-4 text-gray-300 text-xl">
            🌍 Location:{" "}
            <span className="text-yellow-400 font-semibold">{location}</span>
          </p>
        </div>

        {/* Theatres Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
          <h3 className="text-3xl font-bold mb-8 text-red-500">
            🍿 Nearby Theatres
          </h3>

          {loading ? (
            <p className="text-gray-400 text-center text-lg">
              Detecting location and fetching theatres...
            </p>
          ) : theatres.length === 0 ? (
            <p className="text-gray-400 text-center text-lg">
              No theatres found in your area.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {theatres.map((theatre) => (
                <div
                  key={theatre.id}
                  className="p-6 bg-gray-900 rounded-lg shadow-xl border border-gray-800 transition-transform transform hover:scale-105"
                >
                  <h4 className="text-xl font-semibold text-yellow-400">
                    {theatre.name}
                  </h4>
                  <p className="text-gray-400">{theatre.address}</p>
                  <p className="text-green-400 text-lg mt-2">
                    {theatre.rating ? `⭐ ${theatre.rating.toFixed(1)}/5` : "Not Rated"}
                  </p>

                  {/* Extra Details */}
                  <div className="mt-3 text-gray-300 text-sm space-y-2">
                    <p>📞 {theatre.phoneNumber || "Not Available"}</p>
                    {theatre.openingHours ? (
                      <div className="mt-3 bg-gray-800 p-3 rounded-lg shadow-md border border-gray-700">
                        <h5 className="text-yellow-400 font-semibold">🕒 Opening Hours</h5>
                        <ul className="mt-2 text-sm text-gray-300 space-y-1">
                          {theatre.openingHours.split(", ").map((day, index) => {
                            // Highlight today's hours
                            const today = new Date().toLocaleString("en-US", { weekday: "long" });
                            const isToday = day.startsWith(today);

                            return (
                              <li key={index} className={isToday ? "text-green-400 font-semibold" : ""}>
                                {day}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ) : (
                      <p>🕒 Not Available</p>
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
