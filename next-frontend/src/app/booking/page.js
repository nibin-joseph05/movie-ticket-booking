"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import SeatSelectionGrid from "@/components/SeatSelectionGrid";

export default function BookingPage() {
  const searchParams = useSearchParams();

  const movieName = searchParams.get("movie") || "Unknown Movie";
  const theatreName = searchParams.get("theater") || "Unknown Theatre";
  const location = searchParams.get("location") || "Unknown Location";
  const showDate = searchParams.get("date") || "Unknown Date";
  const showtime = searchParams.get("showtime") || "10:00 AM";

  const [selectedSeats, setSelectedSeats] = useState([]);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Top Left Movie Details */}
      <div className="absolute top-4 left-4 text-left">
        <h1 className="text-xl font-bold text-white">{movieName}</h1>
        <p className="text-gray-400">
          {theatreName}: {location} | {showDate}, {showtime}
        </p>
      </div>

      {/* Seat Selection Grid Below */}
      <div className="flex flex-col items-center mt-20">
        <SeatSelectionGrid selectedSeats={selectedSeats} setSelectedSeats={setSelectedSeats} />
      </div>
    </div>
  );
}
