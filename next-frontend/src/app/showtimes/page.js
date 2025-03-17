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
      setShowtimes(data);
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

        <h2 className="text-3xl font-semibold text-center text-white my-6">🎟 Available Showtimes</h2>

        {loading ? (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-gray-400 text-lg">
            Loading showtimes...
          </motion.p>
        ) : showtimes.length > 0 ? (
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {showtimes.map((show, index) => (
              <motion.div
                whileHover={{ scale: 1.05 }}
                key={index}
                className="bg-gray-800 p-4 rounded-lg shadow-md text-center transition-transform"
              >
                <h3 className="text-lg font-semibold">{show.time}</h3>
                <p className="text-gray-400">Seats Available: {show.availableSeats}</p>
                <p className="text-gray-400">Price: ₹{show.price}</p>
                <Link href={`/booking?theatreId=${theatreId}&movieId=${movieId}&time=${encodeURIComponent(show.time)}`}>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="mt-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
                  >
                    Book Now
                  </motion.button>
                </Link>
              </motion.div>
            ))}
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
