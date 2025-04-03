import React, { useState } from "react";
import { motion } from "framer-motion";

const SeatSelectionGrid = ({ selectedSeats, setSelectedSeats, maxSeats, category, bookedSeats = [] }) => {
  const rows = ["A", "B", "C", "D", "E", "F", "G"];
  const seatsPerRow = 10;

  const toggleSeatSelection = (seatNumber) => {
    if (bookedSeats.includes(seatNumber)) {
      return; // Do nothing if seat is booked
    }

    const row = seatNumber.charAt(0);

    // Check if the selected seat is in the same category
    if (
      (category === "Silver" && !["A", "B", "C", "D"].includes(row)) ||
      (category === "Gold" && !["E", "F"].includes(row)) ||
      (category === "Platinum" && !["G"].includes(row))
    ) {
      const confirmChange = window.confirm(
        `You selected a seat from a different category (${row}). Do you want to continue?`
      );
      if (!confirmChange) return;
      window.history.back();
      return;
    }

    // Check if the user is trying to select more seats than allowed
    if (maxSeats > 0 && selectedSeats.length >= maxSeats && !selectedSeats.includes(seatNumber)) {
      const confirmExceed = window.confirm(
        `You are trying to select more seats than initially specified (${maxSeats}). Do you want to continue?`
      );
      if (!confirmExceed) return;
    }

    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((seat) => seat !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const getSeatColor = (seatNumber) => {
    if (bookedSeats.includes(seatNumber)) {
      return "bg-red-500 cursor-not-allowed shadow-md shadow-red-300"; // Booked seats (Red)
    }
    if (selectedSeats.includes(seatNumber)) {
      return "bg-green-500 shadow-lg shadow-green-400 scale-110"; // Selected (Green)
    }

    const row = seatNumber.charAt(0);
    if (["A", "B", "C", "D"].includes(row)) return "bg-gray-500 hover:bg-gray-400 shadow-md shadow-gray-300"; // Silver
    if (["E", "F"].includes(row)) return "bg-yellow-500 hover:bg-yellow-400 shadow-md shadow-yellow-300"; // Gold
    if (["G"].includes(row)) return "bg-blue-500 hover:bg-blue-400 shadow-md shadow-blue-300"; // Platinum

    return "bg-gray-700 hover:bg-gray-500";
  };

  const getSeatCursor = (seatNumber) => {
    return bookedSeats.includes(seatNumber) ? "cursor-not-allowed" : "cursor-pointer";
  };

  return (
    <div className="w-full flex flex-col items-center text-white p-10 min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Theater Screen Section */}
      <div className="w-full flex flex-col items-center mb-12">
        <motion.div
          className="w-3/4 h-16 bg-gradient-to-r from-gray-800 to-gray-600 bg-opacity-90 backdrop-blur-lg rounded-t-2xl flex items-center justify-center text-white text-xl font-bold shadow-2xl border-b-4 border-yellow-400"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          🎬 All eyes this way please!
        </motion.div>
      </div>

      {/* Column Numbers */}
      <div className="grid grid-cols-11 gap-6 mb-6">
        <div className="w-12 h-12"></div> {/* Empty space for row labels */}
        {[...Array(seatsPerRow)].map((_, index) => (
          <div key={index} className="w-12 h-12 flex items-center justify-center font-bold text-gray-400 text-lg">
            {index + 1}
          </div>
        ))}
      </div>

      {/* Seat Grid with Row Labels */}
      {rows.map((row, rowIndex) => (
        <div key={row} className={`flex items-center gap-8 mb-3 ${rowIndex === 4 || rowIndex === 6 ? 'mt-10' : ''}`}>
          {/* Row Label */}
          <div className="w-12 h-12 flex items-center justify-center font-bold text-gray-300 text-lg">{row}</div>

          {/* Seats */}
          <div className="grid grid-cols-10 gap-6">
            {[...Array(seatsPerRow)].map((_, index) => {
              const seatNumber = `${row}${index + 1}`;
              const isBooked = bookedSeats.includes(seatNumber);

              return (
                <motion.div
                  key={seatNumber}
                  className={`w-12 h-12 flex items-center justify-center rounded-lg text-white font-bold transition-all transform ${getSeatColor(seatNumber)} ${getSeatCursor(seatNumber)}`}
                  whileHover={!isBooked ? { scale: 1.1 } : {}}
                  whileTap={!isBooked ? { scale: 0.9 } : {}}
                  onClick={() => !isBooked && toggleSeatSelection(seatNumber)}
                >
                  {seatNumber}
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Seat Status Legend */}
      <div className="mt-12 text-center">
        <div className="text-xl font-bold mb-4">Seat Status</div>
        <div className="flex gap-10">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-red-500 rounded shadow-md"></div>
            <span className="text-lg">Booked</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-green-500 rounded shadow-md"></div>
            <span className="text-lg">Selected</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gray-500 rounded shadow-md animate-pulse"></div>
            <span className="text-lg">Silver (A–D)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-yellow-500 rounded shadow-md animate-pulse"></div>
            <span className="text-lg">Gold (E–F)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-blue-500 rounded shadow-md animate-pulse"></div>
            <span className="text-lg">Platinum (G)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionGrid;