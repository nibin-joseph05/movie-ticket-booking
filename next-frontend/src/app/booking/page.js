"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SeatSelectionGrid from "@/components/SeatSelectionGrid";

export default function BookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const movieId = searchParams.get("movieId");
  const theatreId = searchParams.get("theatreId");
  const showtime = searchParams.get("showtime") || "10:00 AM";
  const category = searchParams.get("category") || "Standard";
  const seats = searchParams.get("seats") || 1;
  const price = searchParams.get("price") || 150;

  console.log("Movie ID in booking page:", movieId);
  console.log("Theatre ID in booking page:", theatreId);

  const [selectedSeats, setSelectedSeats] = useState([]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white p-6">
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-700 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-yellow-400 text-center">🎬 {movieId || "Movie Name"}</h1>
        <p className="text-center text-gray-400">{theatreId || "Theater Name"} - {showtime}</p>
        <p className="text-center text-green-400">Category: {category}</p>
        <p className="text-center text-red-400">Seats: {seats}</p>
        <p className="text-center text-yellow-400">Total Price: ₹{price}</p>

        {/* Seat Selection Grid */}
        <SeatSelectionGrid selectedSeats={selectedSeats} setSelectedSeats={setSelectedSeats} />
      </div>
    </div>
  );
}
