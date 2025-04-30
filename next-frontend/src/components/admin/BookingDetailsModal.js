"use client";
import { FiX, FiClock, FiUser, FiFilm, FiMapPin, FiCreditCard } from "react-icons/fi";
import { motion } from "framer-motion";
import { format } from "date-fns";

const DetailItem = ({ label, value }) => (
  <div className="flex justify-between items-start py-2">
    <span className="text-gray-400 text-sm w-1/3">{label}:</span>
    <span className="text-right text-sm w-2/3 break-words">{value || "—"}</span>
  </div>
);

export default function BookingDetailsModal({ booking, onClose }) {
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return isNaN(date) ? "—" : date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold">Booking Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {!booking ? (
            <div className="animate-pulse space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-700 rounded"></div>
              ))}
            </div>
          ) : (
            <>
              {/* Main Details */}
              <div className="space-y-2">
                <DetailItem label="Reference" value={booking.bookingReference} />
                <DetailItem
                  label="User"
                  value={`${booking.userName || '—'} (${booking.userEmail || '—'})`}
                />
                <DetailItem
                  label="Booked At"
                  value={booking.bookedAt ? format(new Date(booking.bookedAt), "dd MMM yyyy, hh:mm a") : "—"}
                />
              </div>

              {/* Showtime Details */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-red-500">Showtime Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem label="Movie ID" value={booking.showtime?.movieId} />
                  <DetailItem label="Theatre" value={booking.showtime?.theatreId} />
                  <DetailItem label="Date" value={booking.showtime?.date} />
                  <DetailItem label="Time" value={booking.showtime?.time} />
                </div>
              </div>

              {/* Seats Section */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-red-500">Seat Selection</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {booking.seats?.length > 0 ? (
                    booking.seats.map((seat) => (
                      <div
                        key={seat.seatNumber}
                        className="bg-gray-700/50 p-2 rounded-lg text-sm border border-gray-600"
                      >
                        {seat.seatNumber} ({seat.category})
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-400">No seats selected</span>
                  )}
                </div>
              </div>

              {/* Food Orders */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-red-500">Food & Beverages</h3>
                {booking.foodOrders?.length > 0 ? (
                  booking.foodOrders.map((food) => (
                    <div
                      key={food.name}
                      className="flex justify-between items-center bg-gray-700/50 p-3 rounded-lg"
                    >
                      <span className="font-medium">{food.name}</span>
                      <span className="text-red-400">
                        {food.quantity}x ₹{(food.priceAtOrder * food.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-400">No food orders</span>
                )}
              </div>

              {/* Payment Details */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-red-500">Payment Summary</h3>
                <div className="bg-gray-700/30 p-4 rounded-xl space-y-2">
                  <DetailItem
                    label="Transaction ID"
                    value={booking.payment?.transactionId || "—"}
                  />
                  <DetailItem
                    label="Amount"
                    value={booking.payment?.amount ? `₹${booking.payment.amount.toFixed(2)}` : "—"}
                  />
                  <DetailItem
                    label="Status"
                    value={
                      <span className={`px-2 py-1 rounded-full ${
                        booking.payment?.status === 'SUCCESSFUL'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {booking.payment?.status || "—"}
                      </span>
                    }
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800/50">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
          >
            Close Details
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}