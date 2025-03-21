"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  FaBicycle, FaMotorcycle, FaCar, FaShuttleVan,
  FaBus, FaTrain, FaPlane, FaRocket, FaTram, FaShip
} from "react-icons/fa";
import { MdElectricRickshaw } from "react-icons/md";

const seatIcons = [
  <FaBicycle size={30} />,
  <FaMotorcycle size={30} />,
  <MdElectricRickshaw size={30} />,
  <FaCar size={30} />,
  <FaShuttleVan size={30} />,
  <FaBus size={30} />,
  <FaTrain size={30} />,
  <FaTram size={30} />,
  <FaShip size={30} />,
  <FaRocket size={30} />
];

export default function SeatCategoryPopup({ onClose, selectedCategory, showtime, price, movie, theater }) {
  const [selectedSeats, setSelectedSeats] = useState(1);
  const router = useRouter();

  const handleConfirmBooking = () => {
    // Navigate to BookingPage with URL parameters
    router.push(
      `/booking?movie=${encodeURIComponent(movie)}&theater=${encodeURIComponent(theater)}&showtime=${encodeURIComponent(showtime)}&category=${encodeURIComponent(selectedCategory)}&seats=${selectedSeats}&price=${price * selectedSeats}`
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] bg-black bg-opacity-60 backdrop-blur-lg">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-gray-900 p-6 rounded-xl shadow-2xl w-full max-w-md mx-auto text-center border border-gray-700"
      >
        {/* Header */}
        <motion.h2
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold mb-2 text-white"
        >
          🎟️ Confirm Your Selection
        </motion.h2>

        <motion.p className="text-lg font-semibold text-blue-400 mt-1">
          📅 Showtime: {showtime}
        </motion.p>

        {/* Seat Selection */}
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {seatIcons.map((icon, i) => (
            <motion.button
              key={i}
              className={`flex flex-col items-center justify-center px-4 py-2 rounded-md border transition-all duration-300 ${
                selectedSeats === i + 1
                  ? "bg-red-600 text-white border-red-400 scale-110 shadow-lg"
                  : "bg-gray-800 text-gray-300 border-gray-600"
              } hover:scale-110 hover:shadow-lg`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedSeats(i + 1)}
            >
              {icon}
              <span className="mt-1 text-sm font-medium">{i + 1}</span>
            </motion.button>
          ))}
        </div>

        {/* Confirmation Message */}
        <motion.p className="text-sm text-gray-400 mt-4">
          🎭 Selecting {selectedSeats} {selectedSeats === 1 ? "seat" : "seats"} for {selectedCategory} category.
        </motion.p>

        {/* Confirm Selection Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-3 rounded-md shadow-lg hover:shadow-red-500 mt-4 transition-all"
          onClick={handleConfirmBooking}
        >
          Confirm Booking
        </motion.button>

        {/* Close Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-3 w-full text-gray-400 text-sm hover:underline"
          onClick={onClose}
        >
          Cancel
        </motion.button>
      </motion.div>
    </div>
  );
}
