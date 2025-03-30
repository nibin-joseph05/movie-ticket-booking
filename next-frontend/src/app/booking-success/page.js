'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function BookingSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('bookingId');
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/booking/${bookingId}`);
        if (response.data.status === 'success') {
          setBookingData(response.data.data);
        } else {
          setError(response.data.message || 'Failed to load booking details');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load booking details');
        console.error('Error fetching booking:', err);
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBookingData();
    }
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1e1e2e] via-[#121212] to-[#000000] text-white flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1e1e2e] via-[#121212] to-[#000000] text-white flex flex-col">
        <Header />
        <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
          <h2 className="text-3xl font-bold text-red-500 mb-4">Error Loading Booking</h2>
          <p className="text-lg text-gray-400 mb-6">{error || 'Booking not found'}</p>
          <button
            onClick={() => router.push('/my-bookings')}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-red-500/30 active:scale-95"
          >
            View My Bookings
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const { booking, movie, theater, foodItems } = bookingData;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1e1e2e] via-[#121212] to-[#000000] text-white flex flex-col">
      <Header />

      <main className="flex-grow max-w-4xl mx-auto px-4 py-12 w-full">
        <div className="bg-[#1e1e2e] rounded-xl shadow-2xl overflow-hidden border border-gray-800 transform hover:scale-[1.005] transition-transform duration-300">
          {/* Header Section with Enhanced Glow Effect */}
          <div className="bg-gradient-to-r from-red-600 to-pink-600 p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-30 animate-pulse"></div>
            <div className="relative z-10">
              <div className="flex justify-center mb-4 animate-bounce">
                <svg
                  className="h-16 w-16 text-white drop-shadow-lg"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">Booking Confirmed!</h1>
              <p className="text-yellow-200 mt-2 font-medium">
                Booking ID: <span className="font-mono bg-black/30 px-2 py-1 rounded">{booking.reference}</span>
              </p>
              <p className="mt-3 text-white/90">
                Your ticket has been successfully booked. You can download it anytime from{' '}
                <span
                  onClick={() => router.push('/my-bookings')}
                  className="underline cursor-pointer hover:text-yellow-300 transition-colors font-medium"
                >
                  My Orders
                </span>
              </p>
            </div>
          </div>

          {/* Movie Poster and Basic Info */}
          <div className="p-6 border-b border-gray-800 flex flex-col md:flex-row gap-6">
            {movie.posterPath && (
              <img
                src={movie.posterPath}
                alt={movie.title}
                className="w-32 h-48 object-cover rounded-lg shadow-lg border-2 border-gray-700 hover:border-red-500 transition-all duration-300"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold text-white">{movie.title}</h2>
              <div className="flex items-center mt-2">
                <span className="bg-yellow-500 text-black px-2 py-1 rounded text-sm font-bold mr-3 transform hover:scale-105 transition-transform">
                  ⭐ {movie.rating}
                </span>
                <span className="text-gray-300">
                  {movie.genres.join(', ')}
                </span>
              </div>
              <div className="mt-4">
                <p className="font-semibold text-white">{theater.name}</p>
                <p className="text-gray-400 text-sm">{theater.address}</p>
              </div>
              <div className="mt-2 flex gap-4">
                <p className="text-gray-300">
                  <span className="text-gray-400">Date:</span> {booking.date}
                </p>
                <p className="text-gray-300">
                  <span className="text-gray-400">Time:</span> {booking.time}
                </p>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Seats */}
              <div className="bg-[#121212] p-4 rounded-lg border border-gray-700 hover:border-red-500 transition-colors duration-300">
                <h3 className="text-lg font-bold text-red-500 mb-3">Your Seats</h3>
                <div className="flex flex-wrap gap-2">
                  {booking.seats.map((seat) => (
                    <span
                      key={seat}
                      className="px-3 py-1 bg-gray-800 rounded-full text-sm font-medium hover:bg-red-600 hover:text-white transition-colors"
                    >
                      {seat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-[#121212] p-4 rounded-lg border border-gray-700 hover:border-red-500 transition-colors duration-300">
                <h3 className="text-lg font-bold text-red-500 mb-3">Payment Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Tickets</span>
                    <span>₹{booking.totalAmount - (foodItems?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0)}</span>
                  </div>
                  {foodItems?.length > 0 && (
                    <>
                      <div className="pt-2 border-t border-gray-700">
                        <h4 className="font-medium mb-1 text-gray-300">Food & Drinks</h4>
                        {foodItems.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm hover:bg-gray-800/50 px-1 py-1 rounded transition-colors">
                            <span className="text-gray-300">{item.name} × {item.quantity}</span>
                            <span>₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  <div className="pt-2 border-t border-gray-700 font-bold">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Total Paid</span>
                      <span className="text-yellow-400">₹{booking.totalAmount}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    Paid via {booking.paymentMethod} • {booking.paymentStatus}
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}