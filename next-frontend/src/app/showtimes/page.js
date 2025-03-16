"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function Showtimes() {
  const searchParams = useSearchParams();
  const movieId = searchParams.get("movieId");
  const theatreId = searchParams.get("theatreId");

  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (movieId && theatreId) {
      fetchShowtimes();
    }
  }, [movieId, theatreId]);

  const fetchShowtimes = async () => {
    try {
      const res = await fetch(`http://localhost:8080/showtimes?theatreId=${theatreId}&movieId=${movieId}`);
      const data = await res.json();
      setShowtimes(data);
    } catch (error) {
      console.error("Error fetching showtimes:", error);
      setShowtimes([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#121212] text-white">
      <Header />
      <div className="border-t border-gray-700 shadow-lg"></div>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold text-red-500 my-6">🎟 Available Showtimes</h2>

        {loading ? (
          <p className="text-gray-400 text-lg">Loading showtimes...</p>
        ) : showtimes.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {showtimes.map((show, index) => (
              <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold">{show.time}</h3>
                <p className="text-gray-400">Seats Available: {show.availableSeats}</p>
                <Link
                  href={`/booking?theatreId=${theatreId}&movieId=${movieId}&time=${encodeURIComponent(show.time)}`}
                >
                  <button className="mt-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition">
                    Book Now
                  </button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-lg">No showtimes available.</p>
        )}
      </main>

      <Footer />
    </div>
  );
}
