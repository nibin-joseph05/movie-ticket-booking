'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FiClock, FiCalendar, FiMapPin, FiFilm, FiDollarSign, FiUser, FiCreditCard, FiShoppingBag, FiAlertTriangle, FiInfo } from 'react-icons/fi';
import TheatreInfoPopup from "@/components/theatre-map";

export default function BookingDetails({ params }) {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const router = useRouter();
  const [timeLoading, setTimeLoading] = useState(true);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const { id } = await params;

        const response = await axios.get(
          `http://localhost:8080/booking/${id}`,
          { withCredentials: true }
        );

        if (response.data.status === 'success') {
          const apiData = response.data.data;
          const now = new Date();
          const showDateTime = new Date(`${apiData.booking.date}T${apiData.booking.time}`);
          const isExpired = showDateTime < now;
          const timeUntilShow = showDateTime - now;

          let timeStatus = {
            hours: 0,
            minutes: 0,
            totalMinutes: 0
          };

          if (!isExpired) {
            const totalMinutes = Math.floor(timeUntilShow / (1000 * 60));
            timeStatus = {
              hours: Math.floor(totalMinutes / 60),
              minutes: totalMinutes % 60,
              totalMinutes: totalMinutes
            };
          }

          // Calculate ticket and food totals
          const ticketTotal = apiData.booking.totalAmount - (apiData.foodItems?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0);
          const ticketPrice = ticketTotal / (apiData.booking.seats?.length || 1);

          const bookingData = {
            ...apiData.booking,
            movieTitle: apiData.movie.title,
            posterPath: apiData.movie.posterPath,
            genres: apiData.movie.genres?.join(', ') || 'No genre specified',
            rating: apiData.movie.rating,
            movieDescription: apiData.movie.synopsis,
            theaterName: apiData.theater.name,
            theaterAddress: apiData.theater.address,
            theater: apiData.theater, // Full theater object for map component
            seats: apiData.booking.seats?.map(seat => ({
              row: seat.charAt(0),
              number: seat.substring(1)
            })) || [],
            foodItems: apiData.foodItems || [],
            isExpired,
            showDateTime,
            formattedDate: new Date(apiData.booking.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            formattedTime: apiData.booking.time.includes('M')
              ? apiData.booking.time
              : new Date(`1970-01-01T${apiData.booking.time}`).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                }),
            subtotal: apiData.booking.totalAmount,
            taxes: 0, // Assuming taxes are included in the total
            totalAmount: apiData.booking.totalAmount,
            ticketPrice
          };

          setBooking(bookingData);
          setTimeLeft(timeStatus);
        } else {
          setError(response.data.message || 'Booking not found');
        }
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError(err.response?.data?.message || 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [params]);

  // Update time left counter
  useEffect(() => {
    if (!booking) {
      setTimeLoading(false);
      return;
    }

    const updateTimeLeft = () => {
      const now = new Date();
      const diff = booking.showDateTime - now;

      if (diff <= 0) {
        setBooking(prev => ({ ...prev, isExpired: true }));
        setTimeLeft(null);
      } else {
        const totalMinutes = Math.floor(diff / (1000 * 60));
        setTimeLeft({
          hours: Math.floor(totalMinutes / 60),
          minutes: totalMinutes % 60,
          totalMinutes: totalMinutes
        });
      }
      setTimeLoading(false);
    };

    // Initial calculation
    updateTimeLeft();

    // Only set up timer if booking is not expired
    if (!booking.isExpired) {
      const timer = setInterval(updateTimeLeft, 60000); // Update every minute
      return () => clearInterval(timer);
    }
  }, [booking]);



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1e1e2e] via-[#121212] to-[#000000] text-white flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500 mb-4"></div>
            <p className="text-gray-400">Loading booking details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1e1e2e] via-[#121212] to-[#000000] text-white flex flex-col">
        <Header />
        <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
          <div className="bg-[#1e1e2e]/80 backdrop-blur-sm p-8 rounded-xl border border-red-900/50 max-w-md w-full">
            <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-500 mb-2">Error Loading Booking</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <button
              onClick={() => router.push('/my-bookings')}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-red-500/30 active:scale-95 inline-block"
            >
              Back to My Bookings
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!booking) return null;

  const hasFoodItems = booking.foodItems?.length > 0;
  const isUrgent = timeLeft?.hours === 0 && timeLeft?.minutes < 30;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1e1e2e] via-[#121212] to-[#000000] text-white flex flex-col">
      <Header />

      <main className="flex-grow max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Time-sensitive alert */}
        {!booking.isExpired && (
          timeLoading ? (
            <div className="mb-6 p-4 rounded-lg border border-gray-700 bg-gray-800/50">
              <div className="flex items-start">
                <FiClock className="flex-shrink-0 mt-1 mr-3 text-gray-400" />
                <p className="text-gray-300">Calculating show time...</p>
              </div>
            </div>
          ) : timeLeft ? (
            <div className={`mb-6 p-4 rounded-lg border ${
              timeLeft.totalMinutes <= 30
                ? 'bg-red-900/20 border-red-900/50 animate-pulse'
                : 'bg-blue-900/20 border-blue-900/50'
            }`}>
              <div className="flex items-start">
                <FiAlertTriangle className={`flex-shrink-0 mt-1 mr-3 ${
                  timeLeft.totalMinutes <= 30 ? 'text-red-400' : 'text-blue-400'
                }`} />
                <div>
                  <h3 className="font-medium">
                    {timeLeft.totalMinutes <= 0
                      ? "Show is starting now!"
                      : timeLeft.totalMinutes <= 30
                        ? `Hurry! Show starts in ${timeLeft.minutes} minutes`
                        : `Show starts in ${timeLeft.hours}h ${timeLeft.minutes}m`}
                  </h3>
                  <p className="text-sm mt-1 text-gray-300">
                    {timeLeft.totalMinutes > 30 && "Please arrive at least 30 minutes before showtime for ticket verification."}
                    {timeLeft.totalMinutes <= 30 && timeLeft.totalMinutes > 0 && "Proceed directly to your seat."}
                    {timeLeft.totalMinutes <= 0 && "The show has started - late arrivals may not be admitted."}
                  </p>
                </div>
              </div>
            </div>
          ) : null
        )}

        <div className="bg-[#1e1e2e]/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-800">
          {/* Booking status header */}
          <div className={`px-6 py-4 border-b ${
            booking.isExpired
              ? 'bg-gray-900/50 border-gray-700'
              : 'bg-gradient-to-r from-red-900/50 to-pink-900/50 border-red-900/20'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center">
                  {booking.isExpired ? (
                    <>
                      <FiFilm className="mr-2 text-gray-400" />
                      <span className="text-gray-300">Past Booking</span>
                    </>
                  ) : (
                    <>
                      <FiCreditCard className="mr-2 text-red-400" />
                      <span className="text-white">Active Booking</span>
                    </>
                  )}
                </h1>
                <p className={`text-sm mt-1 ${
                  booking.isExpired ? 'text-gray-500' : 'text-gray-300'
                }`}>
                  Reference: {booking.reference}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium mt-2 md:mt-0 ${
                booking.isExpired
                  ? 'bg-gray-800 text-gray-400'
                  : 'bg-green-900/50 text-green-300'
              }`}>
                {booking.paymentStatus}
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Movie details */}
            <div className="lg:col-span-2">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <img
                    src={booking.posterPath || '/placeholder-poster.jpg'}
                    alt={booking.movieTitle}
                    className={`w-40 h-56 object-cover rounded-lg shadow-md border-2 ${
                      booking.isExpired
                        ? 'border-gray-700 grayscale-[30%]'
                        : 'border-gray-700 hover:border-red-500'
                    } transition-colors duration-300`}
                  />
                </div>

                <div className="flex-grow">
                  <h2 className={`text-2xl font-bold mb-2 ${
                    booking.isExpired ? 'text-gray-400' : 'text-white'
                  }`}>
                    {booking.movieTitle}
                  </h2>

                  <div className="flex items-center mb-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold mr-3 flex items-center ${
                      booking.isExpired ? 'bg-gray-800 text-gray-400' : 'bg-yellow-500/90 text-black'
                    }`}>
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {booking.rating || 'N/A'}
                    </span>
                    <span className={`text-sm ${
                      booking.isExpired ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {booking.genres}
                    </span>
                  </div>

                  <p className={`mb-6 ${
                    booking.isExpired ? 'text-gray-500' : 'text-gray-300'
                  }`}>
                    {booking.movieDescription || 'No description available.'}
                  </p>

                  {/* Showtime details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg ${
                      booking.isExpired ? 'bg-gray-900/50' : 'bg-gray-800/50'
                    }`}>
                      <div className="flex items-center mb-2">
                        <FiCalendar className={`mr-2 ${
                          booking.isExpired ? 'text-gray-500' : 'text-red-400'
                        }`} />
                        <h3 className={`font-medium ${
                          booking.isExpired ? 'text-gray-400' : 'text-white'
                        }`}>
                          Date
                        </h3>
                      </div>
                      <p className={booking.isExpired ? 'text-gray-500' : 'text-gray-300'}>
                        {booking.formattedDate}
                      </p>
                    </div>

                    <div className={`p-4 rounded-lg ${
                      booking.isExpired ? 'bg-gray-900/50' : 'bg-gray-800/50'
                    }`}>
                      <div className="flex items-center mb-2">
                        <FiClock className={`mr-2 ${
                          booking.isExpired ? 'text-gray-500' : 'text-red-400'
                        }`} />
                        <h3 className={`font-medium ${
                          booking.isExpired ? 'text-gray-400' : 'text-white'
                        }`}>
                          Time
                        </h3>
                      </div>
                      <p className={booking.isExpired ? 'text-gray-500' : 'text-gray-300'}>
                        {booking.formattedTime}
                      </p>
                    </div>

                    <div className={`p-4 rounded-lg ${
                      booking.isExpired ? 'bg-gray-900/50' : 'bg-gray-800/50'
                    }`}>
                      <div className="flex items-center mb-2">
                        <FiMapPin className={`mr-2 ${
                          booking.isExpired ? 'text-gray-500' : 'text-red-400'
                        }`} />
                        <h3 className={`font-medium ${
                          booking.isExpired ? 'text-gray-400' : 'text-white'
                        }`}>
                          Theater
                        </h3>
                      </div>
                      <p className={booking.isExpired ? 'text-gray-500' : 'text-gray-300'}>
                        {booking.theaterName || 'Unknown theater'}
                      </p>
                      <p className={`text-xs mt-1 ${
                        booking.isExpired ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {booking.theaterAddress || ''}
                      </p>
                      {booking.theater && (
                        <div className="mt-2">
                          <TheatreInfoPopup theater={booking.theater} />
                        </div>
                      )}
                    </div>

                    <div className={`p-4 rounded-lg ${
                      booking.isExpired ? 'bg-gray-900/50' : 'bg-gray-800/50'
                    }`}>
                      <div className="flex items-center mb-2">
                        <FiUser className={`mr-2 ${
                          booking.isExpired ? 'text-gray-500' : 'text-red-400'
                        }`} />
                        <h3 className={`font-medium ${
                          booking.isExpired ? 'text-gray-400' : 'text-white'
                        }`}>
                          Seats
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {booking.seats.length > 0 ? (
                          booking.seats.map((seat, index) => (
                            <span
                              key={index}
                              className={`px-2 py-1 rounded text-xs ${
                                booking.isExpired
                                  ? 'bg-gray-800 text-gray-400 border border-gray-700'
                                  : 'bg-red-900/30 text-red-200 border border-red-800/50'
                              }`}
                            >
                              {seat.row}
                              {seat.number}
                            </span>
                          ))
                        ) : (
                          <p className={booking.isExpired ? 'text-gray-500' : 'text-gray-300'}>
                            No seats selected
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Food items section */}
                  {hasFoodItems && (
                    <div className={`mt-6 p-4 rounded-lg ${
                      booking.isExpired ? 'bg-gray-900/50' : 'bg-gray-800/50'
                    }`}>
                      <div className="flex items-center mb-4">
                        <FiShoppingBag className={`mr-2 ${
                          booking.isExpired ? 'text-gray-500' : 'text-red-400'
                        }`} />
                        <h3 className={`font-medium ${
                          booking.isExpired ? 'text-gray-400' : 'text-white'
                        }`}>
                          Food & Drinks
                        </h3>
                      </div>

                      <div className="mb-3 p-3 bg-gray-900/30 rounded-lg border border-gray-700">
                        <div className="flex items-start">
                          <FiInfo className="flex-shrink-0 mt-1 mr-2 text-blue-400" />
                          <p className="text-sm text-gray-300">
                            Present your ticket at the concession stand to collect your food items before the show starts.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {booking.foodItems.map((item, index) => (
                          <div key={index} className="flex items-start gap-4">
                            <img
                              src={item.imageUrl || '/placeholder-food.jpg'}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg border border-gray-700"
                            />
                            <div className="flex-grow">
                              <h4 className={`font-medium ${
                                booking.isExpired ? 'text-gray-400' : 'text-white'
                              }`}>
                                {item.name}
                              </h4>
                              <p className={`text-sm ${
                                booking.isExpired ? 'text-gray-500' : 'text-gray-400'
                              }`}>
                                {item.quantity} × ₹{item.price}
                              </p>
                            </div>
                            <span className={`font-medium ${
                              booking.isExpired ? 'text-gray-300' : 'text-white'
                            }`}>
                              ₹{item.quantity * item.price}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className={`sticky top-4 rounded-lg overflow-hidden border ${
                booking.isExpired ? 'border-gray-700' : 'border-red-900/50'
              }`}>
                <div className={`p-4 ${
                  booking.isExpired ? 'bg-gray-900/50' : 'bg-red-900/20'
                }`}>
                  <h3 className={`text-lg font-bold flex items-center ${
                    booking.isExpired ? 'text-gray-300' : 'text-white'
                  }`}>
                    <FiDollarSign className="mr-2" />
                    Order Summary
                  </h3>
                </div>

                <div className={`p-4 ${
                  booking.isExpired ? 'bg-gray-900/30' : 'bg-gray-900/50'
                }`}>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className={booking.isExpired ? 'text-gray-400' : 'text-gray-300'}>Tickets</span>
                      <span className={booking.isExpired ? 'text-gray-300' : 'text-white'}>
                        {booking.seats.length} × ₹{booking.ticketPrice.toFixed(2)}
                      </span>
                    </div>

                    {hasFoodItems && (
                      <>
                        <div className="border-t border-gray-800 my-2"></div>
                        <div>
                          <h4 className={`text-sm font-medium mb-2 ${
                            booking.isExpired ? 'text-gray-400' : 'text-gray-300'
                          }`}>
                            Food & Drinks
                          </h4>
                          {booking.foodItems.map((item, index) => (
                            <div key={index} className="flex justify-between mb-1">
                              <span className={booking.isExpired ? 'text-gray-500' : 'text-gray-400'}>
                                {item.quantity} × {item.name}
                              </span>
                              <span className={booking.isExpired ? 'text-gray-300' : 'text-white'}>
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    <div className="border-t border-gray-800 my-2"></div>
                    <div className="flex justify-between">
                      <span className={booking.isExpired ? 'text-gray-400' : 'text-gray-300'}>Subtotal</span>
                      <span className={booking.isExpired ? 'text-gray-300' : 'text-white'}>
                        ₹{booking.subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={booking.isExpired ? 'text-gray-400' : 'text-gray-300'}>Taxes & Fees</span>
                      <span className={booking.isExpired ? 'text-gray-300' : 'text-white'}>
                        ₹{booking.taxes.toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t border-gray-800 my-2"></div>
                    <div className="flex justify-between">
                      <span className={`font-bold ${
                        booking.isExpired ? 'text-gray-300' : 'text-white'
                      }`}>Total</span>
                      <span className={`text-xl font-bold ${
                        booking.isExpired ? 'text-gray-300' : 'text-yellow-400'
                      }`}>
                        ₹{booking.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    {!booking.isExpired && (
                      <>
                        <button
                          className="w-full py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-red-500/30 active:scale-[0.98] flex items-center justify-center"
                          onClick={() => {
                            alert('Download ticket functionality will be implemented here');
                          }}
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download Ticket
                        </button>
                        <button
                          className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-gray-800/30 active:scale-[0.98] flex items-center justify-center"
                          onClick={() => {
                            alert('Cancel booking functionality will be implemented here');
                          }}
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Cancel Booking
                        </button>
                      </>
                    )}

                    {booking.isExpired && (
                      <button
                        className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-gray-800/30 active:scale-[0.98] flex items-center justify-center"
                        onClick={() => {
                          alert('Rate movie functionality will be implemented here');
                        }}
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        Rate This Movie
                      </button>
                    )}
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