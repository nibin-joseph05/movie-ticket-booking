import { useState } from "react";
import { motion } from "framer-motion";

export default function SeatCategoryPopup({ onClose, onSelect }) {
  const categories = [
    { name: "GOLD", price: 200, image: "/images/gold.png" },
    { name: "PLATINUM", price: 300, image: "/images/platinum.png" },
  ];

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState(1);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <motion.div className="bg-gray-900 p-6 rounded-lg shadow-lg max-w-md text-white">
        <h2 className="text-2xl font-bold mb-4 text-center">Select Your Seats</h2>

        {/* Seat Count Selection */}
        <div className="flex justify-center space-x-2 mb-4">
          {[...Array(10)].map((_, i) => (
            <motion.button
              key={i + 1}
              whileTap={{ scale: 0.9 }}
              className={`px-4 py-2 rounded-md border border-gray-600 ${
                selectedSeats === i + 1 ? "bg-red-600 text-white" : "bg-gray-700 text-gray-300"
              }`}
              onClick={() => setSelectedSeats(i + 1)}
            >
              {i + 1}
            </motion.button>
          ))}
        </div>

        {/* Gold & Platinum Selection */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {categories.map((category) => (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              key={category.name}
              className={`p-4 rounded-lg text-center border ${
                selectedCategory === category.name ? "border-red-500 bg-gray-800" : "border-gray-600 bg-gray-900"
              } cursor-pointer`}
              onClick={() => setSelectedCategory(category.name)}
            >
              <img src={category.image} alt={category.name} className="w-16 h-16 mx-auto mb-2" />
              <h3 className="text-xl font-semibold">{category.name}</h3>
              <p className="text-lg text-green-400">₹{category.price}</p>
            </motion.div>
          ))}
        </div>

        {/* Select Seats Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-full bg-red-600 text-white font-semibold py-2 rounded-md shadow-lg hover:bg-red-700 transition"
          onClick={() => {
            if (selectedCategory) {
              onSelect(selectedSeats, selectedCategory);
            } else {
              alert("Please select a seat category!");
            }
          }}
        >
          Select Seats
        </motion.button>

        {/* Close Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="mt-2 w-full text-gray-400 text-sm"
          onClick={onClose}
        >
          Cancel
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
