"use client";
import { motion } from "framer-motion";

export default function BookingDetails({
  bookingDetails,
  category,
  date,
  showtime,
  seats,
  price,
  selectedFood,
  calculateTotalPrice
}) {
  return (
    <div className="space-y-6">
      {/* Movie and Theater Details */}
      <div className="bg-[#2a2a3a] rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Movie Details</h2>
        <div className="space-y-3">
          <div className="flex">
            <div className="w-28 text-gray-400">Movie:</div>
            <div className="flex-1 font-medium">
              {bookingDetails?.movie?.name || "Unknown Movie"}
            </div>
          </div>
          <div className="flex">
            <div className="w-28 text-gray-400">Category:</div>
            <div className="flex-1 font-medium capitalize">
              {category || "Standard"}
            </div>
          </div>
          <div className="flex">
            <div className="w-28 text-gray-400">Date & Time:</div>
            <div className="flex-1 font-medium">
              {date}, {showtime}
            </div>
          </div>
        </div>
      </div>

      {/* Theater Details */}
      <div className="bg-[#2a2a3a] rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Theater Details</h2>
        <div className="space-y-3">
          <div className="flex">
            <div className="w-28 text-gray-400">Theater:</div>
            <div className="flex-1 font-medium">
              {bookingDetails?.theater?.name || "Unknown Theater"}
            </div>
          </div>
          <div className="flex">
            <div className="w-28 text-gray-400">Location:</div>
            <div className="flex-1 font-medium">
              {bookingDetails?.theater?.address || "Unknown Location"}
            </div>
          </div>
        </div>
      </div>

      {/* Seat Selection */}
      <div className="bg-[#2a2a3a] rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Seat Selection</h2>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {seats.map((seat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-[#3a3a4e] rounded-md p-2 text-center font-medium shadow-md"
            >
              {seat}
            </motion.div>
          ))}
        </div>
        <div className="border-t border-[#3a3a4e] pt-3">
          <div className="flex justify-between mb-1">
            <span className="text-gray-400">Seats ({seats.length}):</span>
            <span className="font-medium">{(price / seats.length).toFixed(2)} × {seats.length}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold">
            <span>Ticket Price:</span>
            <span className="text-pink-500">{price.toFixed(2)} Rs</span>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-[#2a2a3a] rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

        {selectedFood.length > 0 ? (
          <>
            <div className="space-y-3 max-h-[200px] overflow-y-auto mb-4">
              {selectedFood.map((item) => (
                <div key={item.id} className="bg-[#3a3a4e] rounded-lg p-3 flex justify-between">
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-400">{item.price} Rs</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#3a3a4e] pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Tickets:</span>
                <span className="font-medium">{price.toFixed(2)} Rs</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Food ({selectedFood.length}):</span>
                <span className="font-medium">
                  {selectedFood.reduce((sum, item) => sum + item.price, 0).toFixed(2)} Rs
                </span>
              </div>
              <div className="flex justify-between text-lg font-semibold mt-4">
                <span>Total Amount:</span>
                <span className="text-pink-500">{calculateTotalPrice().toFixed(2)} Rs</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4 text-gray-400">
            <p>No food items selected yet</p>
          </div>
        )}
      </div>
    </div>
  );
}