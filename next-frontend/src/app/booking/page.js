"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import SeatSelectionGrid from "@/components/SeatSelectionGrid";
import { motion } from "framer-motion";

export default function BookingPage() {
  const searchParams = useSearchParams();

  // Extract URL parameters
  const movieId = searchParams.get("movie");
  const theaterId = searchParams.get("theater");
  const showtime = searchParams.get("showtime");
  const category = searchParams.get("category");
  const seats = searchParams.get("seats");
  const price = searchParams.get("price");
  const date = searchParams.get("date");

  // State for movie and theater details
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch movie and theater details
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/booking/details?movieId=${movieId}&theaterId=${theaterId}`);
        if (!response.ok) throw new Error("Failed to fetch booking details.");
        const data = await response.json();
        setBookingDetails(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [movieId, theaterId]);

  // Handle back button click
  const handleBack = () => {
    window.history.back();
  };

  // Display loading or error state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400">Loading booking details...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-red-500">Error: {error}</p>
          <motion.button
            onClick={handleBack}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-xl">←</span> {/* Back arrow icon */}
            <span className="font-semibold">Go Back</span>
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="absolute top-4 left-4 text-white hover:text-gray-400 transition"
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="text-4xl font-bold"
        >
          &#8592; {/* Large back arrow symbol */}
        </motion.div>
      </button>

      {/* Top Left Movie Details */}
      <motion.div
        className="absolute top-4 left-20 text-left"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h1 className="text-xl font-bold text-white">{bookingDetails?.movie?.name || "Unknown Movie"}</h1>
        <p className="text-gray-400">
          {bookingDetails?.theater?.name || "Unknown Theatre"}: {bookingDetails?.theater?.address || "Unknown Location"} | {date}, {showtime}
        </p>
      </motion.div>

      {/* Seat Selection Grid Below */}
      <div className="flex flex-col items-center mt-20">
        <SeatSelectionGrid selectedSeats={[]} setSelectedSeats={() => {}} />
      </div>
    </div>
  );
}