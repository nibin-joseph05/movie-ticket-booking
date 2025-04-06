"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TheatreInfoPopup from "@/components/theatre-map";
import MovieInfo from "@/components/MovieInfo";
import SeatCategoryPopup from "@/components/SeatCategoryPopup";

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
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isSeatPopupOpen, setIsSeatPopupOpen] = useState(false);
  const [activeShowtime, setActiveShowtime] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [seatPrices, setSeatPrices] = useState([]);

  // Helper function to check showtime status
  const getShowtimeStatus = (showtime, date) => {
    const now = new Date();
    const [time, period] = showtime.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    // Convert to 24-hour format
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    // Create show datetime object
    const showDate = new Date(date);
    showDate.setHours(hours, minutes, 0, 0);

    // Assuming movie duration is 3 hours (180 minutes)
    const showEndTime = new Date(showDate.getTime() + 180 * 60000);

    if (now < showDate) {
      return 'upcoming'; // Show hasn't started yet
    } else if (now >= showDate && now <= showEndTime) {
      return 'running'; // Show is currently running
    } else {
      return 'ended'; // Show has ended
    }
  };

  // Filter out only ended showtimes
  const validShowtimes = showtimes.filter(show =>
    getShowtimeStatus(show.time, selectedDate) !== 'ended'
  );

  useEffect(() => {
    if (theatreId) {
      fetchTheatreDetails();
    }
    if (movieId && theatreId) {
      fetchShowtimes();
    }
    if (movieId) {
      fetchMovieDetails();
    }
  }, [movieId, theatreId, selectedDate]);

  useEffect(() => {
    const fetchSeatPrices = async () => {
      try {
        const response = await fetch("http://localhost:8080/showtimes/seat-prices");
        if (!response.ok) throw new Error("Failed to fetch seat prices");
        const data = await response.json();
        setSeatPrices(data);
      } catch (error) {
        console.error("Error fetching seat prices:", error);
      }
    };

    fetchSeatPrices();
  }, []);

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

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("API Response:", data);

      if (Array.isArray(data)) {
        const formattedShowtimes = data.map(show => ({
          time: show.time || "N/A",
          seatCategories: show.seatCategories || [],
          totalSeats: show.totalSeats || 0,
          availableSeats: show.availableSeats || 0
        }));
        setShowtimes(formattedShowtimes);
      } else {
        console.error("Unexpected data format:", data);
        setShowtimes([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
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

  const handleSeatSelection = async (seats, category) => {
    try {
      const response = await fetch("http://localhost:8080/showtimes/book-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theatreId,
          movieId,
          time: activeShowtime,
          category,
          seats,
        }),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Booking failed");

      const bookingResponse = await response.json();
      window.location.href = `/booking-confirmation?bookingId=${bookingResponse.id}`;
    } catch (error) {
      console.error("Error processing booking:", error);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
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

        {isMoviePopupOpen && movieDetails && (
          <MovieInfo movieDetails={movieDetails} onClose={() => setIsMoviePopupOpen(false)} />
        )}

        <div className="flex flex-col items-center">
          <div className="flex justify-center space-x-2 my-4">
            {getNextSevenDays().map(({ date, day, number, month, isEnabled }) => (
              <motion.button
                whileHover={{ scale: isEnabled ? 1.1 : 1 }}
                whileTap={{ scale: 0.9 }}
                key={date}
                className={`flex flex-col items-center px-4 py-2 rounded-md font-semibold w-20 transition-shadow shadow-lg ${
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

          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="mt-4 bg-gray-900 px-6 py-3 rounded-lg text-white font-semibold text-lg shadow-md border border-gray-700"
            >
              Selected Date: <span className="text-red-400">{selectedDate}</span>
            </motion.div>
          )}
        </div>

        <h2 className="text-4xl font-bold text-center text-white my-8 drop-shadow-lg">
          🎟 Available Showtimes
        </h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mb-4"></div>
            <p className="text-gray-400">Loading showtimes...</p>
          </div>
        ) : fetchError ? (
          <div className="text-center py-10">
            <p className="text-red-500 mb-4">Error loading showtimes: {fetchError}</p>
            <button
              onClick={fetchShowtimes}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : validShowtimes.length > 0 ? (
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-8">
            {validShowtimes.map((show, index) => {
              const status = getShowtimeStatus(show.time, selectedDate);
              const isRunning = status === 'running';
              const isUpcoming = status === 'upcoming';

              return (
                <motion.div
                  key={index}
                  className={`relative backdrop-blur-lg p-6 rounded-2xl shadow-xl border ${
                    isRunning
                      ? 'border-yellow-500 bg-yellow-900/20'
                      : 'border-gray-800 hover:border-red-500 bg-gray-900/70'
                  }`}
                >
                  <div className="flex justify-between items-center w-full mb-2">
                    <span className="text-2xl font-bold tracking-wide">
                      {show.time}
                    </span>
                    {isRunning && (
                      <span className="text-xs bg-yellow-900/50 text-yellow-200 px-2 py-1 rounded">
                        SHOW RUNNING
                      </span>
                    )}
                  </div>

                  {isRunning ? (
                    <div className="text-center py-4">
                      <p className="text-yellow-400 mb-2">This show is currently running</p>
                      <p className="text-gray-400 text-sm">Booking not available during the show</p>
                    </div>
                  ) : (
                    <>
                      <div className="mt-3 flex justify-center space-x-3">
                        {show.seatCategories?.map((cat) => (
                          <button
                            key={cat.type}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                              selectedCategory?.type === cat.type
                                ? "bg-gradient-to-r from-red-500 to-red-700"
                                : "bg-gray-700 hover:bg-red-500"
                            }`}
                            onClick={() => handleCategorySelect(cat)}
                          >
                            {cat.type.toUpperCase()}
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-col items-center gap-3 mt-4">
                        {selectedCategory && selectedCategory.type ? (
                          <>
                            <p className="text-lg font-semibold text-white bg-gray-800 px-3 py-1 rounded-lg">
                              {selectedCategory.type} Category
                            </p>
                            <p className="text-gray-300">
                              Seats Available: <span className="font-semibold text-white">{selectedCategory.seatsAvailable}</span>
                            </p>
                            <p className="text-gray-300">
                              Price: <span className="text-xl font-semibold text-green-400">₹{selectedCategory.price}</span>
                            </p>
                          </>
                        ) : (
                          <p className="text-gray-400 italic">Select a category</p>
                        )}
                      </div>

                      {isUpcoming && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`mt-6 w-full px-6 py-3 rounded-xl font-bold text-lg ${
                            !selectedCategory?.type
                              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                              : "bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900"
                          }`}
                          onClick={() => {
                            setActiveShowtime(show);
                            setIsSeatPopupOpen(true);
                          }}
                          disabled={!selectedCategory?.type}
                        >
                          Book Now
                        </motion.button>
                      )}
                    </>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-10"
          >
            <p className="text-gray-400 text-lg">
              {showtimes.length > 0
                ? "No available showtimes remaining for selected date"
                : "No showtimes available for selected date"}
            </p>
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Show Today's Showtimes
            </button>
          </motion.div>
        )}

        {isSeatPopupOpen && activeShowtime && movieId && theatreId && (
          <SeatCategoryPopup
            onClose={() => setIsSeatPopupOpen(false)}
            selectedCategory={selectedCategory?.type}
            showtime={activeShowtime.time}
            price={selectedCategory?.price ?? 0}
            movie={movieId}
            theater={theatreId}
            date={selectedDate}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}