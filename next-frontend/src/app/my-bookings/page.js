'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FiClock, FiCalendar, FiX, FiCheck, FiDownload, FiEye, FiAlertTriangle } from 'react-icons/fi';

export default function MyOrders() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const parseTimeString = (timeString, dateString) => {
    const [time, period] = timeString.split(' ');
    const [hours, minutes] = time.split(':').map(Number);

    // Convert to 24-hour format
    let hours24 = hours;
    if (period === 'PM' && hours < 12) {
      hours24 += 12;
    } else if (period === 'AM' && hours === 12) {
      hours24 = 0;
    }

    // Parse the date parts
    const dateParts = dateString.split('-');
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1;
    const day = parseInt(dateParts[2]);

    // Create date in local timezone
    return new Date(year, month, day, hours24, minutes);
  };

  const calculateTimeLeft = (showDateTime) => {
    const now = new Date();
    const diff = showDateTime - now;

    if (diff <= 0) {
      return null; // Show has already started
    }

    const totalMinutes = Math.floor(diff / (1000 * 60));

    // Get dates in theater timezone (Asia/Kolkata)
    const options = { timeZone: 'Asia/Kolkata' };
    const nowInTheaterTZ = new Date(now.toLocaleString('en-US', options));
    const showDateInTheaterTZ = new Date(showDateTime.toLocaleString('en-US', options));

    // Extract just the date parts (ignoring time)
    const nowDateStr = nowInTheaterTZ.toISOString().split('T')[0];
    const showDateStr = showDateInTheaterTZ.toISOString().split('T')[0];

    let dayLabel;
    if (nowDateStr === showDateStr) {
      dayLabel = 'Today';
    } else {
      // Check if it's tomorrow in theater timezone
      const tomorrow = new Date(nowInTheaterTZ);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      if (showDateStr === tomorrowStr) {
        dayLabel = 'Tomorrow';
      } else {
        // Show is more than 1 day away
        dayLabel = showDateTime.toLocaleDateString('en-US', {
          weekday: 'long',
          timeZone: 'Asia/Kolkata'
        });
      }
    }

    return {
      hours: Math.floor(totalMinutes / 60),
      minutes: totalMinutes % 60,
      totalMinutes: totalMinutes,
      dayLabel
    };
  };

  useEffect(() => {
    const fetchUserAndBookings = async () => {
      try {
        const sessionResponse = await axios.get('https://movie-ticket-booking-583u.onrender.com/user/check-session', {
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
          `https://movie-ticket-booking-583u.onrender.com/booking/user/${userData.id}`,
          { withCredentials: true }
        );

        if (bookingsResponse.data.status === 'success') {
          const processedBookings = bookingsResponse.data.data.map(booking => {
            if (!booking.date || !booking.showtime) {
              console.warn('Invalid booking data:', booking);
              return null;
            }

            const showDateTime = parseTimeString(booking.showtime, booking.date);
            const now = new Date();
            const isExpired = showDateTime < now;
            const timeStatus = calculateTimeLeft(showDateTime);
            const isCancelled = booking.status === 'CANCELLED';

            return {
              ...booking,
              isExpired,
              isCancelled,
              showDateTime,
              timeStatus
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

  // Update time left counters periodically
  useEffect(() => {
    if (bookings.length === 0) return;

    const timer = setInterval(() => {
      setBookings(prevBookings =>
        prevBookings.map(booking => {
          if (booking.isExpired || booking.isCancelled) return booking;

          const now = new Date();
          const isExpired = booking.showDateTime < now;
          const timeStatus = calculateTimeLeft(booking.showDateTime);

          return {
            ...booking,
            isExpired,
            timeStatus
          };
        })
      );
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [bookings]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatTime = (timeString) => {
    if (!timeString.match(/[AP]M$/i)) {
      const [hours, minutes] = timeString.split(':');
      const hourNum = parseInt(hours, 10);
      const period = hourNum >= 12 ? 'PM' : 'AM';
      const displayHour = hourNum % 12 || 12;
      return `${displayHour}:${minutes} ${period}`;
    }
    return timeString;
  };

  const handleCancelBooking = async (bookingRef) => {
    try {
      const response = await axios.post(
        `https://movie-ticket-booking-583u.onrender.com/booking/${bookingRef}/cancel`,
        {},
        { withCredentials: true }
      );

      if (response.data.status === 'success') {
        setBookings(prevBookings =>
          prevBookings.map(booking =>
            booking.reference === bookingRef
              ? { ...booking, status: 'CANCELLED', isCancelled: true }
              : booking
          )
        );
      } else {
        alert(response.data.message || 'Failed to cancel booking');
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert(err.response?.data?.message || 'Failed to cancel booking');
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
              <FiAlertTriangle className="w-8 h-8 text-red-500" />
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
                It looks like you haven&apos;t booked any movies yet. Start exploring our collection!
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
              const formattedShowtime = formatTime(booking.showtime);
              const isExpired = booking.isExpired;
              const isCancelled = booking.isCancelled;
              const timeStatus = booking.timeStatus;

              return (
                <div
                  key={booking.id}
                  className={`bg-[#1e1e2e]/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border transition-all duration-300 transform hover:scale-[1.005] ${
                    isCancelled
                      ? 'border-red-900/50 bg-red-900/10'
                      : isExpired
                        ? 'border-gray-700 hover:border-gray-600 bg-gray-900/30'
                        : 'border-gray-800 hover:border-red-500/50'
                  }`}
                >
                  {/* Status header */}
                  {isCancelled ? (
                    <div className="bg-gradient-to-r from-red-900/50 to-red-800/50 py-2 px-4 text-center">
                      <span className="text-xs font-medium text-red-300 flex items-center justify-center">
                        <FiX className="w-4 h-4 mr-1" />
                        This booking has been cancelled
                      </span>
                    </div>
                  ) : isExpired ? (
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 py-2 px-4 text-center">
                      <span className="text-xs font-medium text-gray-400 flex items-center justify-center">
                        <FiClock className="w-4 h-4 mr-1" />
                        This show has already occurred
                      </span>
                    </div>
                  ) : null}

                  <div className={`p-6 flex flex-col md:flex-row gap-6 ${isCancelled ? 'opacity-90' : ''}`}>
                    <div className="flex-shrink-0 relative">
                      <div className="relative">
                        <img
                          src={booking.posterPath || '/placeholder-poster.jpg'}
                          alt={booking.movieTitle}
                          className={`w-32 h-48 object-cover rounded-lg shadow-md border-2 transition-colors duration-300 ${
                            isCancelled
                              ? 'border-red-900/50 grayscale-[50%]'
                              : isExpired
                                ? 'border-gray-700 grayscale-[30%]'
                                : 'border-gray-700 hover:border-red-500'
                          }`}
                        />
                        {isCancelled && (
                          <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm rotate-[-15deg] transform bg-red-900/70 px-2 py-1 rounded">
                              CANCELLED
                            </span>
                          </div>
                        )}
                        {isExpired && !isCancelled && (
                          <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
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
                            isCancelled
                              ? 'text-red-300 line-through'
                              : isExpired
                                ? 'text-gray-400'
                                : 'text-white hover:text-red-400'
                          }`}>
                            {booking.movieTitle}
                          </h2>
                          <div className="flex items-center mt-1 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold mr-2 flex items-center ${
                              isCancelled
                                ? 'bg-red-900/50 text-red-200'
                                : isExpired
                                  ? 'bg-gray-800 text-gray-400'
                                  : 'bg-yellow-500/90 text-black'
                            }`}>
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              {booking.rating || 'N/A'}
                            </span>
                            <span className={`text-sm ${
                              isCancelled
                                ? 'text-red-400/80'
                                : isExpired
                                  ? 'text-gray-500'
                                  : 'text-gray-400'
                            }`}>
                              {formatDate(booking.date)} • {formattedShowtime}
                            </span>
                          </div>

                          {/* Time status indicator */}
                          {timeStatus && !isCancelled && (
                            <div className={`text-xs px-2 py-1 rounded-full inline-flex items-center mt-1 ${
                              isExpired
                                ? 'bg-gray-800 text-gray-400'
                                : timeStatus.totalMinutes <= 30
                                  ? 'bg-red-900/50 text-red-300 animate-pulse'
                                  : 'bg-blue-900/50 text-blue-300'
                            }`}>
                              <FiClock className="w-3 h-3 mr-1" />
                              {timeStatus.totalMinutes <= 30
                                ? `Hurry! ${timeStatus.minutes}m remaining`
                                : `${timeStatus.hours}h ${timeStatus.minutes}m remaining - ${timeStatus.dayLabel}`}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end">
                          <span className={`text-lg font-bold ${
                            isCancelled
                              ? 'text-red-300 line-through'
                              : isExpired
                                ? 'text-gray-500'
                                : 'text-yellow-400'
                          }`}>
                            ₹{booking.totalAmount}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full mt-1 ${
                              isCancelled
                                ? 'bg-red-900/50 text-red-300'
                                : booking.status === 'CONFIRMED'
                                ? 'bg-green-900/50 text-green-300'
                                : 'bg-gray-800 text-gray-300'
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>
                      </div>

                      {/* Status notice */}
                      {isCancelled ? (
                        <div className="mt-3 bg-red-900/20 border-l-4 border-red-500 p-3 rounded-r-lg">
                          <div className="flex items-start">
                            <FiX className="w-4 h-4 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                            <p className="text-xs text-red-300">
                              This booking was cancelled. Refund will be processed within 5-7 business days.
                            </p>
                          </div>
                        </div>
                      ) : !isExpired && timeStatus ? (
                        <div className="mt-3 bg-gray-800/50 border-l-4 border-yellow-500 p-3 rounded-r-lg">
                          <div className="flex items-start">
                            <FiAlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                            <p className="text-xs text-gray-300">
                              {timeStatus.totalMinutes <= 30
                                ? "Proceed directly to your seat."
                                : "Please arrive at least 30 minutes before showtime for ticket verification."}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 bg-gray-800/50 border-l-4 border-gray-500 p-3 rounded-r-lg">
                          <div className="flex items-start">
                            <FiClock className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                            <p className="text-xs text-gray-400">
                              This show has already occurred. We hope you enjoyed your experience!
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link
                          href={`/my-bookings/${booking.reference}`}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-lg flex items-center ${
                            isCancelled
                              ? 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 cursor-not-allowed'
                              : 'bg-gray-800 hover:bg-gray-700 text-white hover:shadow-gray-800/30'
                          }`}
                        >
                          <FiEye className="w-4 h-4 mr-2" />
                          View Details
                        </Link>

                        {!isCancelled && !isExpired && (
                          <>
                            <button
                              className="px-4 py-2 bg-red-900/50 hover:bg-red-800/50 text-red-300 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-red-900/20 flex items-center"
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to cancel booking ${booking.reference}? A refund of ₹${booking.totalAmount} will be processed.`)) {
                                  handleCancelBooking(booking.reference);
                                }
                              }}
                            >
                              <FiX className="w-4 h-4 mr-2" />
                              Cancel Booking
                            </button>
                            <button
                              className="px-4 py-2 bg-blue-900/50 hover:bg-blue-800/50 text-blue-300 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/20 flex items-center"
                              onClick={async () => {
                                try {
                                  const response = await fetch(
                                    `https://movie-ticket-booking-583u.onrender.com/booking/${booking.reference}/ticket`,
                                    {
                                      credentials: 'include',
                                      headers: {
                                        'Content-Type': 'application/pdf',
                                      },
                                    }
                                  );

                                  if (!response.ok) throw new Error('Failed to download ticket');

                                  const blob = await response.blob();
                                  const url = window.URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `ticket_${booking.reference}.pdf`;
                                  document.body.appendChild(a);
                                  a.click();
                                  a.remove();
                                  window.URL.revokeObjectURL(url);
                                } catch (error) {
                                  console.error('Download failed:', error);
                                  alert('Failed to download ticket. Please try again.');
                                }
                              }}
                            >
                              <FiDownload className="w-4 h-4 mr-2" />
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