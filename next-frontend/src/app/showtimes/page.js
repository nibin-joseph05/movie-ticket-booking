"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import TheatreInfoPopup from "@/components/theatre-map";
import MovieInfo from "@/components/MovieInfo";

export default function Showtimes() {
  const searchParams = useSearchParams();
  const movieId = searchParams.get("movieId");
  const theatreId = searchParams.get("theatreId");

  const [movieDetails, setMovieDetails] = useState(null);
  const [theatreDetails, setTheatreDetails] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [isMoviePopupOpen, setIsMoviePopupOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("gold");

  useEffect(() => {
    if (theatreId) fetchTheatreDetails();
    if (movieId && theatreId) fetchShowtimes();
    if (movieId) fetchMovieDetails();
  }, [movieId, theatreId, selectedDate]);

  const fetchMovieDetails = async () => {
    try {
      const res = await fetch(`http://localhost:8080/movies/details?id=${movieId}`);
      const data = await res.json();
      setMovieDetails(data);
    } catch (error) {
      console.error("Error fetching movie details:", error);
    }
  };

  const fetchTheatreDetails = async () => {
    try {
      const res = await fetch(`http://localhost:8080/theatres/details?theatreId=${theatreId}`);
      const data = await res.json();
      setTheatreDetails(data);
    } catch (error) {
      console.error("Error fetching theatre details:", error);
    }
  };

  const fetchShowtimes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/showtimes?theatreId=${theatreId}&movieId=${movieId}&date=${selectedDate}`);
      const data = await res.json();
      setShowtimes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching showtimes:", error);
      setShowtimes([]);
    } finally {
      setLoading(false);
    }
  };



  const getNextSevenDays = () => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      return {
        date: date.toISOString().split("T")[0],
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        number: date.getDate(),
        month: date.toLocaleDateString("en-US", { month: "short" }),
        isEnabled: i < 3,
      };
    });
  };

  const handleBack = () => {
    const confirmNavigation = window.confirm("Are you sure you want to go back?");
    if (confirmNavigation) {
      window.history.back();
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-[#121212] text-white">
      <Header />
      <div className="border-t border-gray-700 shadow-lg"></div>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {(theatreDetails || movieDetails) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <h2 className="text-4xl font-bold text-red-500 drop-shadow-md">{theatreDetails?.name}</h2>
            <p className="text-gray-400 mt-2">{theatreDetails?.address}</p>
            <p className="text-yellow-400 text-lg">⭐ {theatreDetails?.rating || "N/A"}</p>

            <div className="mt-4 flex flex-col sm:flex-row justify-center items-center space-x-4">
              {theatreDetails && <TheatreInfoPopup theater={theatreDetails} />}
              {movieDetails && (
                <button
                  onClick={() => setIsMoviePopupOpen(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  🎬 Movie Info
                </button>
              )}
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 bg-gray-700 text-white px-5 py-1.5 rounded-lg shadow-md
                           border border-white hover:bg-gray-800 transition-transform transform hover:scale-105
                           focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <span className="text-lg">🔙</span>
                <span className="font-medium">Back</span>
              </button>

            </div>
          </motion.div>
        )}

        {/* Movie Info Popup */}
        {isMoviePopupOpen && movieDetails && (
          <MovieInfo movieDetails={movieDetails} onClose={() => setIsMoviePopupOpen(false)} />
        )}


        <div className="flex justify-center space-x-2 my-4">
          {getNextSevenDays().map(({ date, day, number, month, isEnabled }) => (
            <motion.button
              whileHover={{ scale: isEnabled ? 1.1 : 1 }}
              whileTap={{ scale: 0.9 }}
              key={date}
              className={`flex flex-col items-center px-4 py-2 rounded-md font-semibold w-20 transition-shadow shadow-lg $ {
                selectedDate === date ? "bg-red-600 text-white" : "bg-gray-700 text-gray-300"
              } ${!isEnabled ? "opacity-50 cursor-not-allowed" : "hover:bg-red-500"}`}
              onClick={() => isEnabled && setSelectedDate(date)}
              disabled={!isEnabled}
            >
              <span className="text-sm">{day}</span>
              <span className="text-xl font-bold">{number}</span>
              <span className="text-sm">{month}</span>
            </motion.button>
          ))}
        </div>

        <h2 className="text-4xl font-bold text-center text-white my-8 drop-shadow-lg">
          🎟 Available Showtimes
        </h2>

        {loading ? (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-gray-400 text-lg">
            Loading showtimes...
          </motion.p>
        ) : showtimes.length > 0 ? (
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-8">
            {showtimes.map((show, index) => {
              const totalSeats = show.totalSeats || 100;
              const bookedSeats = totalSeats - (show.availableSeats || 0);
              const seatFillPercentage = (bookedSeats / totalSeats) * 100;

              let seatColor = "text-green-400"; // Default (Plenty seats)
              if (seatFillPercentage > 80) seatColor = "text-red-500"; // Almost full
              else if (seatFillPercentage > 40) seatColor = "text-yellow-400"; // Filling fast

              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, boxShadow: "0px 4px 15px rgba(255, 0, 0, 0.4)" }}
                  whileTap={{ scale: 0.97 }}
                  className="relative backdrop-blur-md bg-gray-900/60 p-6 rounded-xl shadow-lg border border-gray-800 hover:border-red-500
                             transition-all text-center flex flex-col justify-between items-center"
                >
                  {/* Showtime Header */}
                  <div className="flex justify-between items-center w-full mb-4">
                    <span className="text-xl font-bold text-white">{show.time}</span>
                  </div>

                  {/* Category Selection */}
                  <div className="mt-3 flex justify-center space-x-3">
                    {["gold", "platinum"].map((cat) => (
                      <button
                        key={cat}
                        className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                          selectedCategory === cat ? "bg-red-600 text-white" : "bg-gray-700 text-gray-300"
                        }`}
                        onClick={() => setSelectedCategory(cat)}
                      >
                        {cat.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  {/* Seat Availability & Price */}
                  <div className="flex flex-col items-center gap-2 mt-2">
                    <p className={`text-sm flex items-center gap-2 ${seatColor}`}>
                      🎟 <span className="font-medium">{show.availableSeats || "N/A"} Seats Available</span>
                    </p>
                    <p className="text-gray-300 text-sm flex items-center gap-2">
                      💰 <span className="text-green-400 font-semibold">₹{selectedCategory === "gold" ? show.goldPrice : show.platinumPrice}</span>
                    </p>
                  </div>

                  {/* Book Now Button */}
                  <Link href={{
                    pathname: "/booking",
                    query: {
                      theatreId,
                      movieId,
                      time: show.time,
                      category: selectedCategory,
                      price: selectedCategory === "gold" ? show.goldPrice : show.platinumPrice
                    }
                  }}>
                    <motion.button
                      whileHover={{ scale: 1.1, backgroundColor: "#ff1744", boxShadow: "0px 3px 10px rgba(255, 23, 68, 0.6)" }}
                      whileTap={{ scale: 0.95 }}
                      className="mt-4 w-full bg-red-600 text-white px-5 py-2 rounded-lg font-semibold text-md shadow-md
                                 hover:bg-red-700 transition-all focus:ring-2 focus:ring-red-500"
                    >
                      Book Now
                    </motion.button>
                  </Link>
                </motion.div>
              );
            })}

          </motion.div>
        ) : (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-gray-400 text-lg">
            No showtimes available.
          </motion.p>
        )}


      </main>

      <Footer />
    </div>
  );
}
