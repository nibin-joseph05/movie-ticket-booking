"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import BookingDetails from "@/components/BookingDetails";
import FoodSelection from "@/components/FoodSelection";

export default function BookingSummaryPage() {
  const searchParams = useSearchParams();

  // Extract URL parameters
  const movieId = searchParams.get("movie");
  const theaterId = searchParams.get("theater");
  const showtime = searchParams.get("showtime");
  const category = searchParams.get("category");
  const seats = searchParams.get("seats").split(",");
  const price = parseFloat(searchParams.get("price"));
  const date = searchParams.get("date");

  // State for booking details
  const [bookingDetails, setBookingDetails] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [selectedFood, setSelectedFood] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch movie and theater details
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [detailsResponse, foodResponse] = await Promise.all([
          fetch(`http://localhost:8080/booking/details?movieId=${movieId}&theaterId=${theaterId}`),
          fetch(`http://localhost:8080/booking/food`)
        ]);

        if (!detailsResponse.ok) throw new Error("Failed to fetch booking details.");
        if (!foodResponse.ok) throw new Error("Failed to fetch food options.");

        const detailsData = await detailsResponse.json();
        const foodData = await foodResponse.json();

        setBookingDetails(detailsData);
        setFoodItems(foodData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [movieId, theaterId]);

  // Handle back button click - redirect to showtimes page
  const handleBack = () => {
    const queryParams = new URLSearchParams({
      movie: movieId,
      date: date
    });
    window.location.href = `/showtimes?${queryParams.toString()}`;
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    const foodTotal = selectedFood.reduce((sum, item) => sum + item.price, 0);
    return price + foodTotal;
  };

  // Handle proceed to payment button click
  const handleProceedToPayment = () => {
    const queryParams = new URLSearchParams({
      movie: movieId,
      theater: theaterId,
      showtime,
      category,
      seats: seats.join(","),
      price: calculateTotalPrice().toFixed(2),
      date,
      food: JSON.stringify(selectedFood.map(item => ({
        name: item.name,
        price: item.price,
        quantity: 1
      })))
    });
    window.location.href = `/payment?${queryParams.toString()}`;
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
          <p className="mt-4 text-gray-400">Loading booking summary...</p>
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
            <span className="text-xl">←</span>
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
          &#8592;
        </motion.div>
      </button>

      {/* Movie and Theater Info - Top Left */}
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

      {/* Proceed to Payment Button - Top Right */}
      {seats.length > 0 && (
        <motion.div
          className="absolute top-4 right-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={handleProceedToPayment}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 relative group"
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-500 rounded-lg blur opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>

            {/* Button Content */}
            <span className="font-semibold text-lg">Proceed to Payment</span>
            <span className="text-xl font-bold">{calculateTotalPrice().toFixed(2)} Rs</span>

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

      {/* Main Content */}
      <div className="max-w-6xl mx-auto pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#1e1e2e]/50 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-[#3a3a4e]"
        >
          <h1 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-red-500">
            Booking Summary
          </h1>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Food Selection - Left Side (60% width) */}
            <div className="lg:w-[60%]">
              <FoodSelection
                foodItems={foodItems}
                selectedFood={selectedFood}
                setSelectedFood={setSelectedFood}
                setFoodItems={setFoodItems}
              />
            </div>

            {/* Booking Details - Right Side (40% width) */}
            <div className="lg:w-[40%]">
              <BookingDetails
                bookingDetails={bookingDetails}
                category={category}
                date={date}
                showtime={showtime}
                seats={seats}
                price={price}
                selectedFood={selectedFood}
                calculateTotalPrice={calculateTotalPrice}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}