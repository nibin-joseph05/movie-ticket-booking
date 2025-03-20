"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import SeatSelectionGrid from "@/components/SeatSelectionGrid";

export default function BookingPage() {
  const router = useRouter();
  const query = new URLSearchParams(window.location.search);
  const movie = query.get("movie") || "Movie Name";
  const theater = query.get("theater") || "Theater Name";
  const showtime = query.get("showtime") || "10:00 AM";
  const category = query.get("category") || "Standard";
  const seats = query.get("seats") || 1;
  const price = query.get("price") || 150;

  const [selectedSeats, setSelectedSeats] = useState([]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white p-6">
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-700 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-yellow-400 text-center">🎬 {movie || "Movie Name"}</h1>
        <p className="text-center text-gray-400">{theater || "Theater Name"} - {showtime || "10:00 AM"}</p>
        <p className="text-center text-green-400">Category: {category || "Standard"}</p>
        <p className="text-center text-red-400">Seats: {seats || 1}</p>
        <p className="text-center text-yellow-400">Total Price: ₹{price || 150}</p>

        {/* Seat Selection Grid */}
        <SeatSelectionGrid selectedSeats={selectedSeats} setSelectedSeats={setSelectedSeats} />
      </div>
    </div>
  );
}
