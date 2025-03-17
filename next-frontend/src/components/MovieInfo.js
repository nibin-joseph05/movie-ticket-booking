import { motion } from "framer-motion";
import { X } from "lucide-react";

const MovieInfo = ({ movieDetails, onClose }) => {
  if (!movieDetails) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose} // Close on background click
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white w-[90%] sm:w-[600px] p-6 rounded-xl shadow-xl relative border border-gray-300"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-semibold text-gray-900">{movieDetails.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition-all p-2 rounded-full hover:bg-gray-200"
          >
            <X size={22} />
          </button>
        </div>

        {/* Movie Details */}
        <div className="flex flex-col sm:flex-row items-start gap-6 mt-4">
          <img
            src={movieDetails.posterPath || "/fallback-image.jpg"}
            alt={movieDetails.title}
            className="rounded-lg w-40 sm:w-48 h-60 sm:h-72 object-cover shadow-md"
          />
          <div className="flex-1">
            <p className="text-yellow-500 text-lg font-medium">⭐ {movieDetails.rating || "N/A"}</p>
            {movieDetails.genre && <p className="text-gray-700 mt-2 font-medium">🎭 {movieDetails.genre}</p>}
            <p className="mt-3 text-gray-700 text-sm leading-relaxed">
              {movieDetails.synopsis || "No synopsis available."}
            </p>
          </div>
        </div>

        {/* View More Button */}
        <div className="mt-6 flex justify-end">
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(movieDetails.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:bg-blue-700 transition-all"
          >
            View More Details
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MovieInfo;
