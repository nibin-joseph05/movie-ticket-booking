'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function MyOrders() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserAndBookings = async () => {
      try {
        const sessionResponse = await axios.get('http://localhost:8080/user/check-session', {
          withCredentials: true
        });

        if (!sessionResponse.data.isLoggedIn) {
          setLoading(false);
          setError('Please login to view your bookings');
          return;
        }

        const userData = sessionResponse.data.user;
        setUser(userData);

        const bookingsResponse = await axios.get(
          `http://localhost:8080/booking/user/${userData.id}`,
          { withCredentials: true }
        );

        if (bookingsResponse.data.status === 'success') {
          const processedBookings = bookingsResponse.data.data.map(booking => {
            if (!booking.date || !booking.showtime) {
              console.warn('Invalid booking data:', booking);
              return null;
            }

            const now = new Date();
            const showDateTime = new Date(booking.showDateTime);
            const timeDiff = showDateTime - now;
            const isExpired = timeDiff <= 0;
            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

            return {
              ...booking,
              timeStatus: isExpired ? 'Expired' :
                        `${hours > 0 ? `${hours}h ` : ''}${minutes}m remaining`,
              isExpired,
              showDateTime // Store the actual date object for easier calculations
            };
          }).filter(booking => booking !== null);

          setBookings(processedBookings);
        } else {
          setError(bookingsResponse.data.message || 'Failed to fetch bookings');
        }
      } catch (err) {
        console.error('Error:', err);
        setError(err.response?.data?.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndBookings();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatTime = (timeString) => {
    // Format time string to include AM/PM if not already present
    if (!timeString.match(/[AP]M$/i)) {
      const [hours, minutes] = timeString.split(':');
      const hourNum = parseInt(hours, 10);
      const period = hourNum >= 12 ? 'PM' : 'AM';
      const displayHour = hourNum % 12 || 12;
      return `${displayHour}:${minutes} ${period}`;
    }
    return timeString;
  };

  const calculateTimeStatus = (booking) => {
    const now = new Date();
    const timeDiff = booking.showDateTime - now;

    if (timeDiff <= 0) {
      return {
        valid: false,
        message: 'Showtime has passed',
        status: 'expired'
      };
    }

    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours < 1) {
      return {
        valid: true,
        message: `${minutes}m remaining - Hurry!`,
        status: 'urgent'
      };
    } else if (hours < 24) {
      return {
        valid: true,
        message: `${hours}h ${minutes}m remaining - Today`,
        status: 'upcoming'
      };
    } else {
      const days = Math.floor(hours / 24);
      return {
        valid: true,
        message: `${days}d ${hours % 24}h remaining`,
        status: 'future'
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1e1e2e] via-[#121212] to-[#000000] text-white flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500 mb-4"></div>
            <p className="text-gray-400">Loading your bookings...</p>
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
            <h2 className="text-2xl font-bold text-red-500 mb-2">Error Loading Bookings</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            {!user && (
              <Link
                href="/login"
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-red-500/30 active:scale-95 inline-block"
              >
                Login to View Bookings
              </Link>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1e1e2e] via-[#121212] to-[#000000] text-white flex flex-col">
      <Header />

      <main className="flex-grow max-w-6xl mx-auto px-4 py-12 w-full">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
            My Bookings
          </h1>
          <p className="text-gray-400">
            {bookings.length > 0
              ? `You have ${bookings.length} ${bookings.length === 1 ? 'booking' : 'bookings'}`
              : "You haven't made any bookings yet"}
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
            <div className="bg-[#1e1e2e]/80 backdrop-blur-sm p-8 rounded-xl border border-gray-800 max-w-md w-full transform hover:scale-[1.01] transition-transform duration-300">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-300 mb-2">No Bookings Found</h2>
              <p className="text-gray-400 mb-6">
                It looks like you haven't booked any movies yet. Start exploring our collection!
              </p>
              <Link
                href="/"
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-red-500/30 active:scale-95 inline-block"
              >
                Browse Movies
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const timeStatus = calculateTimeStatus(booking);
              const isExpired = !timeStatus.valid;
              const formattedShowtime = formatTime(booking.showtime);

              return (
                <div
                  key={booking.id}
                  className={`bg-[#1e1e2e]/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border transition-all duration-300 transform hover:scale-[1.005] ${
                    isExpired
                      ? 'border-gray-700 hover:border-gray-600 bg-gray-900/30'
                      : 'border-gray-800 hover:border-red-500/50'
                  }`}
                >
                  {isExpired && (
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 py-1 px-4 text-center">
                      <span className="text-xs font-medium text-gray-400 flex items-center justify-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        This show has already occurred
                      </span>
                    </div>
                  )}

                  <div className={`p-6 flex flex-col md:flex-row gap-6 ${isExpired ? 'opacity-80' : ''}`}>
                    <div className="flex-shrink-0 relative">
                      <div className="relative">
                        <img
                          src={booking.posterPath || '/placeholder-poster.jpg'}
                          alt={booking.movieTitle}
                          className={`w-32 h-48 object-cover rounded-lg shadow-md border-2 transition-colors duration-300 ${
                            isExpired
                              ? 'border-gray-700 grayscale-[30%]'
                              : 'border-gray-700 hover:border-red-500'
                          }`}
                        />
                        {isExpired && (
                          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm rotate-[-15deg] transform bg-black/70 px-2 py-1 rounded">
                              SHOW ENDED
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-grow">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                        <div>
                          <h2 className={`text-xl font-bold transition-colors duration-200 ${
                            isExpired ? 'text-gray-400' : 'text-white hover:text-red-400'
                          }`}>
                            {booking.movieTitle}
                          </h2>
                          <div className="flex items-center mt-1 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold mr-2 flex items-center ${
                              isExpired ? 'bg-gray-800 text-gray-400' : 'bg-yellow-500/90 text-black'
                            }`}>
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              {booking.rating || 'N/A'}
                            </span>
                            <span className={`text-sm ${
                              isExpired ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                              {formatDate(booking.date)} • {formattedShowtime}
                            </span>
                          </div>

                          {/* Time status indicator */}
                          <div className={`text-xs px-2 py-1 rounded-full inline-flex items-center mt-1 ${
                            isExpired
                              ? 'bg-gray-800 text-gray-400'
                              : timeStatus.status === 'urgent'
                                ? 'bg-red-900/50 text-red-300 animate-pulse'
                                : timeStatus.status === 'upcoming'
                                  ? 'bg-blue-900/50 text-blue-300'
                                  : 'bg-green-900/50 text-green-300'
                          }`}>
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {timeStatus.message}
                          </div>
                        </div>

                        <div className="flex flex-col items-end">
                          <span className={`text-lg font-bold ${
                            isExpired ? 'text-gray-500' : 'text-yellow-400'
                          }`}>
                            ₹{booking.totalAmount}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full mt-1 ${
                              booking.status === 'CONFIRMED'
                                ? isExpired
                                  ? 'bg-gray-800 text-gray-400'
                                  : 'bg-green-900/50 text-green-300'
                                : booking.status === 'CANCELLED'
                                ? 'bg-red-900/50 text-red-300'
                                : 'bg-gray-800 text-gray-300'
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>
                      </div>

                      {/* Important notice - only for upcoming shows */}
                      {!isExpired && (
                        <div className="mt-3 bg-gray-800/50 border-l-4 border-yellow-500 p-3 rounded-r-lg">
                          <div className="flex items-start">
                            <svg className="w-4 h-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p className="text-xs text-gray-300">
                              Please arrive at least 30 minutes before showtime for ticket verification.
                              Late arrivals may not be admitted.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Expired notice */}
                      {isExpired && (
                        <div className="mt-3 bg-gray-800/50 border-l-4 border-gray-500 p-3 rounded-r-lg">
                          <div className="flex items-start">
                            <svg className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-xs text-gray-400">
                              This show has already occurred. We hope you enjoyed your experience!
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link
                          href={`/booking/${booking.reference}`}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-lg flex items-center ${
                            isExpired
                              ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:shadow-gray-800/10 cursor-not-allowed'
                              : 'bg-gray-800 hover:bg-gray-700 text-white hover:shadow-gray-800/30'
                          }`}
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Details
                        </Link>

                        {!isExpired && (
                          <>
                            <button
                              className="px-4 py-2 bg-red-900/50 hover:bg-red-800/50 text-red-300 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-red-900/20 flex items-center"
                              onClick={() => {
                                alert('Cancellation functionality will be implemented here');
                              }}
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Cancel Booking
                            </button>
                            <button
                              className="px-4 py-2 bg-blue-900/50 hover:bg-blue-800/50 text-blue-300 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/20 flex items-center"
                              onClick={() => {
                                alert('Download ticket functionality will be implemented here');
                              }}
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Download Ticket
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}