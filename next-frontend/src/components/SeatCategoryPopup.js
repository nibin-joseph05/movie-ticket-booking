import { useState } from "react";
import { motion } from "framer-motion";
import { FaBicycle, FaMotorcycle, FaCar, FaBus, FaTruck, FaTrain, FaShip, FaPlane, FaRocket } from "react-icons/fa";

const seatIcons = [
  <FaBicycle size={24} />,
  <FaMotorcycle size={24} />,
  <FaCar size={24} />,
  <FaBus size={24} />,
  <FaTruck size={24} />,
  <FaTrain size={24} />,
  <FaShip size={24} />,
  <FaPlane size={24} />,
  <FaRocket size={24} />,
];

export default function SeatCategoryPopup({ onClose, onSelect, selectedCategory, showtime, price }) {
  const [selectedSeats, setSelectedSeats] = useState(1);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] bg-black bg-opacity-60 backdrop-blur-lg">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-gray-900 p-6 rounded-lg shadow-xl w-full max-w-md mx-auto text-center border border-gray-700"
      >
        {/* Header */}
        <h2 className="text-2xl font-bold mb-2 text-white">🎟️ Confirm Your Selection</h2>
        <p className="text-lg font-semibold text-yellow-400">
          {selectedCategory.toUpperCase()} - ₹{price} per seat
        </p>
        <p className="text-lg font-semibold text-blue-400 mt-1">📅 Showtime: {showtime}</p>

        {/* Seat Selection */}
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {[...Array(10)].map((_, i) => (
            <button
              key={i + 1}
              className={`flex flex-col items-center justify-center px-4 py-2 rounded-md border transition ${
                selectedSeats === i + 1 ? "bg-red-600 text-white border-red-400" : "bg-gray-800 text-gray-300 border-gray-600"
              }`}
              onClick={() => setSelectedSeats(i + 1)}
            >
              {seatIcons[i] || <FaRocket size={24} />}
              <span className="mt-1 text-sm font-medium">{i + 1}</span>
            </button>
          ))}
        </div>

        {/* Confirmation Message */}
        <p className="text-sm text-gray-400 mt-4">🎭 Selecting {selectedSeats} {selectedSeats === 1 ? "seat" : "seats"} for {selectedCategory} category.</p>

        {/* Confirm Selection Button */}
        <button
          className="w-full bg-red-600 text-white font-bold py-3 rounded-md shadow-md hover:bg-red-700 mt-4 transition"
          onClick={() => onSelect(selectedSeats, selectedCategory)}
        >
          ✅ Confirm Booking
        </button>

        {/* Close Button */}
        <button className="mt-3 w-full text-gray-400 text-sm hover:underline" onClick={onClose}>
          ❌ Cancel
        </button>
      </motion.div>
    </div>
  );
}
