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
  const seats = parseInt(searchParams.get("seats"), 10); // Parse seats as a number
  const price = parseFloat(searchParams.get("price")); // Total price from URL
  const date = searchParams.get("date");

  // State for movie and theater details
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]); // Initialize as an empty array

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

  // Handle book and pay button click
  const handleBookAndPay = () => {
    // Check if the user is trying to proceed with fewer seats than initially specified
    if (selectedSeats.length < seats) {
      const confirmProceed = window.confirm(
        `You are trying to proceed with ${selectedSeats.length} seat(s), but you initially selected ${seats} seat(s). Do you want to continue?`
      );
      if (!confirmProceed) return;
    }

    const totalPrice = price * selectedSeats.length; // Calculate total price dynamically

    const queryParams = new URLSearchParams({
      movie: movieId,
      theater: theaterId,
      showtime,
      category,
      seats: selectedSeats.join(","), // Pass selected seats as a comma-separated string
      price: totalPrice.toFixed(2), // Use the dynamically calculated price
      date,
    });
    window.location.href = `/booking-summary?${queryParams.toString()}`;
  };

  // Display loading or error state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1e1e2e] via-[#121212] to-[#000000] text-white flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-b from-[#1e1e2e] via-[#121212] to-[#000000] text-white flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-red-500">Error: {error}</p>
          <motion.button
            onClick={handleBack}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
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
    <div className="min-h-screen bg-gradient-to-b from-[#1e1e2e] via-[#121212] to-[#000000] text-white p-6">
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

      {/* Book and Pay Button - Top Right */}
      {selectedSeats.length > 0 && (
        <motion.div
          className="absolute top-4 right-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={handleBookAndPay}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 relative group"
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-500 rounded-lg blur opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>

            {/* Button Content */}
            <span className="font-semibold text-lg">Book and Pay</span>
            <span className="text-xl font-bold">{(price * selectedSeats.length).toFixed(2)} Rs</span> {/* Dynamic Price */}

            {/* Shopping Cart Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 ml-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </button>
        </motion.div>
      )}

      {/* Seat Selection Grid Below */}
      <div className="flex flex-col items-center mt-20">
        <SeatSelectionGrid
          selectedSeats={selectedSeats}
          setSelectedSeats={setSelectedSeats}
          maxSeats={seats} // Pass the number of seats directly (not as an array length)
          category={category}
        />
      </div>
    </div>
  );
}