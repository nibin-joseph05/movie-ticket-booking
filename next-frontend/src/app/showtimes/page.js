"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Showtimes() {
  const searchParams = useSearchParams();
  const theatreId = searchParams.get("theatreId");
  const movieId = searchParams.get("movieId");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (theatreId && movieId) fetchShowtimes();
  }, [theatreId, movieId]);

  const fetchShowtimes = async () => {
    try {
      const res = await fetch(
        `http://localhost:8080/showtimes?theatreId=${theatreId}&movieId=${movieId}`
      );
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching showtimes:", error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#121212] text-white">
      <Header />
      <div className="border-t border-gray-700 shadow-lg"></div>

      {/* Main content should take full height */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <p className="text-center text-gray-400">Loading showtimes...</p>
        ) : data ? (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-red-500 text-center mb-4">{data.movie.title}</h2>
            <p className="text-gray-300 text-center mb-8">📍 {data.theatre.name} - {data.theatre.address}</p>

            {/* Showtimes List */}
            {data.showtimes.map((day) => (
              <div key={day.date} className="mb-6">
                <h3 className="text-xl font-semibold text-yellow-400">{day.date}</h3>
                <div className="flex flex-wrap gap-3 mt-3">
                  {day.times.map((time) => (
                    <button
                      key={time}
                      onClick={() => window.location.href = `/booking?theatreId=${theatreId}&movieId=${movieId}&time=${time}`}
                      className="bg-blue-600 px-4 py-2 rounded-md text-white font-medium hover:bg-blue-700 transition shadow-md"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400">No showtimes available.</p>
        )}
      </main>

      {/* Fixed Footer at Bottom */}
      <Footer />
    </div>
  );
}
