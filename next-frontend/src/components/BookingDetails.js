"use client";
import { motion, AnimatePresence } from "framer-motion";

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
      {/* Movie Details */}
      <motion.div
        className="bg-gray-700/50 rounded-xl p-6 border border-gray-600"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-indigo-600/20 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold">Movie Details</h2>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-baseline">
            <div className="w-32 text-gray-400">Movie:</div>
            <div className="flex-1 font-medium text-white">
              {bookingDetails?.movie?.name || "Unknown Movie"}
            </div>
          </div>
          <div className="flex flex-wrap items-baseline">
            <div className="w-32 text-gray-400">Category:</div>
            <div className="flex-1 font-medium capitalize text-indigo-300">
              {category || "Standard"}
            </div>
          </div>
          <div className="flex flex-wrap items-baseline">
            <div className="w-32 text-gray-400">Date & Time:</div>
            <div className="flex-1 font-medium">
              {date}, <span className="text-purple-300">{showtime}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Theater Details */}
      <motion.div
        className="bg-gray-700/50 rounded-xl p-6 border border-gray-600"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-indigo-600/20 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold">Theater Details</h2>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-baseline">
            <div className="w-32 text-gray-400">Theater:</div>
            <div className="flex-1 font-medium text-white">
              {bookingDetails?.theater?.name || "Unknown Theater"}
            </div>
          </div>
          <div className="flex flex-wrap items-baseline">
            <div className="w-32 text-gray-400">Location:</div>
            <div className="flex-1 font-medium">
              {bookingDetails?.theater?.address || "Unknown Location"}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Seat Selection */}
      <motion.div
        className="bg-gray-700/50 rounded-xl p-6 border border-gray-600"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-indigo-600/20 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold">Your Seats</h2>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
          <AnimatePresence>
            {seats.map((seat, index) => (
              <motion.div
                key={seat}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-indigo-600/20 border border-indigo-500/50 rounded-lg p-3 text-center font-medium shadow-md text-indigo-100"
              >
                {seat}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="border-t border-gray-600/50 pt-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Seats ({seats.length}):</span>
            <span className="font-medium">{(price / seats.length).toFixed(2)} × {seats.length}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold">
            <span>Ticket Price:</span>
            <span className="text-indigo-400">{price.toFixed(2)} Rs</span>
          </div>
        </div>
      </motion.div>

      {/* Order Summary */}
      <motion.div
        className="bg-gray-700/50 rounded-xl p-6 border border-gray-600"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-indigo-600/20 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold">Order Summary</h2>
        </div>

        <AnimatePresence>
          {selectedFood.length > 0 ? (
            <>
              <div className="space-y-3 max-h-[200px] overflow-y-auto mb-6 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800/50">
                {selectedFood.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="bg-gray-600/30 rounded-lg p-3 flex justify-between items-center border border-gray-600/50"
                  >
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-400">
                        {item.price} Rs × {item.quantity}
                      </p>
                    </div>
                    <div className="font-semibold text-indigo-300">
                      {(item.price * item.quantity).toFixed(2)} Rs
                    </div>
                  </motion.div>
                ))}
              </div>



              <div className="border-t border-gray-600/50 pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Tickets:</span>
                  <span className="font-medium">{price.toFixed(2)} Rs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Food ({selectedFood.reduce((sum, item) => sum + item.quantity, 0)} items):</span>
                  <span className="font-medium">
                    {selectedFood.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)} Rs
                  </span>
                </div>
                <div className="flex justify-between text-xl font-bold mt-4 pt-3 border-t border-gray-600/50">
                  <span>Total Amount:</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                    {calculateTotalPrice().toFixed(2)} Rs
                  </span>
                </div>
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-6"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-gray-400">Your concession items will appear here</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}