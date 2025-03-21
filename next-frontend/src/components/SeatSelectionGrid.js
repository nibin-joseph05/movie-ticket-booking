import React, { useState } from "react";

const SeatSelection = () => {
  const rows = ["A", "B", "C", "D", "E", "F", "G"]; // 7 rows
  const seatsPerRow = 10; // 10 seats per row (total 70 seats)
  const bookedSeats = ["A1", "B5", "C7", "D3", "E6", "F9", "G10"];

  const [selectedSeats, setSelectedSeats] = useState([]);

  const toggleSeatSelection = (seatNumber) => {
    if (bookedSeats.includes(seatNumber)) return; // Prevent selecting booked seats
    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((seat) => seat !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const getSeatColor = (seatNumber) => {
    if (bookedSeats.includes(seatNumber)) return "bg-red-600 cursor-not-allowed"; // Booked (Red)
    if (selectedSeats.includes(seatNumber)) return "bg-green-500"; // Selected (Green)

    const row = seatNumber.charAt(0);
    if (["A", "B", "C", "D"].includes(row)) return "bg-gray-500 hover:bg-gray-400"; // Silver
    if (["E", "F"].includes(row)) return "bg-yellow-500 hover:bg-yellow-400"; // Gold
    if (["G"].includes(row)) return "bg-blue-500 hover:bg-blue-400"; // Platinum

    return "bg-gray-700 hover:bg-gray-500";
  };

  return (
    <div className="w-full flex flex-col items-center text-white p-6 min-h-screen bg-black">
      {/* Theater Screen Section */}
      <div className="w-full flex flex-col items-center mb-10">
        <div className="w-3/4 h-12 bg-gray-300 rounded-t-2xl flex items-center justify-center text-black text-lg font-bold shadow-lg">
          📽️ THEATER SCREEN | "Look this way 👀"
        </div>
      </div>

      {/* Column Numbers */}
      <div className="grid grid-cols-11 gap-6 mb-4">
        <div className="w-12 h-12"></div> {/* Empty space for row labels */}
        {[...Array(seatsPerRow)].map((_, index) => (
          <div key={index} className="w-12 h-12 flex items-center justify-center font-bold text-gray-400">
            {index + 1}
          </div>
        ))}
      </div>

      {/* Seat Grid with Row Labels */}
      {rows.map((row, rowIndex) => (
        <div key={row} className={`flex items-center gap-6 mb-2 ${rowIndex === 4 || rowIndex === 6 ? 'mt-6' : ''}`}>
          {/* Row Label */}
          <div className="w-12 h-12 flex items-center justify-center font-bold text-gray-400">{row}</div>

          {/* Seats */}
          <div className="grid grid-cols-10 gap-6">
            {[...Array(seatsPerRow)].map((_, index) => {
              const seatNumber = `${row}${index + 1}`;
              return (
                <div
                  key={seatNumber}
                  className={`w-12 h-12 flex items-center justify-center rounded-lg text-white font-bold cursor-pointer transition-all ${getSeatColor(seatNumber)}`}
                  onClick={() => toggleSeatSelection(seatNumber)}
                >
                  {seatNumber}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Seat Categories */}
      <div className="mt-10 text-center">
        <div className="text-lg font-bold mb-2">Seat Categories</div>
        <div className="flex gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-500 rounded"></div>
            <span>Silver (A–D)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-500 rounded"></div>
            <span>Gold (E–F)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded"></div>
            <span>Platinum (G)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;