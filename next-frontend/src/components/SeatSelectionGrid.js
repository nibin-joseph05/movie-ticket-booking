"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export default function SeatSelectionGrid({ selectedSeats, setSelectedSeats }) {
  const [bookedSeats, setBookedSeats] = useState([8, 10, 15, 20, 25, 40, 45, 50]); // Dummy booked seats

  // Seat arrangement as per BookMyShow layout
  const seatRows = {
    M: [4, 4], // Sofa
    L: [5, 5],
    K: [6, 2, 6],
    J: [20],
    H: [20],
    G: [20],
    F: [20],
    E: [20],
    D: [20],
    C: [20],
    B: [20],
    A: [20],
  };

  const toggleSeat = (seatNumber) => {
    if (bookedSeats.includes(seatNumber)) return; // Ignore booked seats

    setSelectedSeats((prevSeats) => {
      const newSeats = prevSeats.includes(seatNumber)
        ? prevSeats.filter((seat) => seat !== seatNumber) // Remove if already selected
        : [...prevSeats, seatNumber]; // Add if not selected

      console.log("Selected Seats:", newSeats);
      return newSeats;
    });
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-start bg-black text-white p-4">
      {/* SCREEN Indicator */}
      <div className="text-lg font-bold text-gray-300 tracking-wider mb-6">🎥 SCREEN 1 - All Eyes This Way Please!</div>

      {/* Render Rows */}
      {Object.entries(seatRows).map(([rowLabel, seatGroups], rowIndex) => (
        <div key={rowLabel} className="flex items-center mb-2">
          {/* Row Label (Left Side) */}
          <div className="text-yellow-400 font-bold text-lg w-6">{rowLabel}</div>

          {/* Seat Groups */}
          {seatGroups.map((groupSize, groupIndex) => (
            <div key={groupIndex} className="flex space-x-2 mx-4">
              {[...Array(groupSize)].map((_, seatIndex) => {
                const seatNumber = rowIndex * 20 + groupIndex * groupSize + seatIndex + 1;
                const isSelected = selectedSeats.includes(seatNumber);
                const isBooked = bookedSeats.includes(seatNumber);

                return (
                  <motion.button
                    key={seatNumber}
                    whileTap={{ scale: 0.85 }}
                    whileHover={{ scale: 1.1 }}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg text-md font-bold transition-all
                      ${isBooked ? "bg-red-600 text-white cursor-not-allowed" : ""}
                      ${isSelected ? "bg-green-500 text-black scale-105" : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"}
                    `}
                    onClick={() => toggleSeat(seatNumber)}
                    disabled={isBooked}
                  >
                    {isBooked ? "❌" : seatNumber}
                  </motion.button>
                );
              })}
            </div>
          ))}
        </div>
      ))}

      {/* Pricing Details */}
      <div className="text-sm text-gray-400 mt-6">
        🛋 **Sofa (Platinum) ₹270** | 🎟 **Regular ₹190**
      </div>

      {/* Confirm Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-6 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-3 px-8 rounded-md shadow-lg hover:shadow-red-500 transition-all"
      >
        Confirm Selection
      </motion.button>
    </div>
  );
}
