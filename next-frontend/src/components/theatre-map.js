import { useState, useEffect } from "react";
import { MapPin, X } from "lucide-react";

const TheatreMap = ({ theater }) => {
  const [open, setOpen] = useState(false);
  const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_THEATRE_API_KEY;
  const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(theater.name)},${theater.latitude},${theater.longitude}`;

  // Disable scrolling when modal is open
  useEffect(() => {
    if (open) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [open]);

  return (
    <>
      {/* Info Button */}
      <button
        className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
        onClick={() => setOpen(true)}
      >
        <MapPin size={16} /> Info
      </button>

      {/* Modal Popup */}
      {open && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setOpen(false)} // Click outside to close
        >
          <div
            className="bg-white w-[90%] sm:w-[600px] p-6 rounded-xl shadow-xl relative border border-gray-300 transition-all transform scale-100 opacity-100"
            onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-xl font-semibold text-gray-900">{theater.name}</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-800 transition-all p-2 rounded-full hover:bg-gray-200"
              >
                <X size={22} />
              </button>
            </div>

            {/* Embedded Google Map */}
            <div className="w-full h-64 mt-4 rounded-lg overflow-hidden shadow-md">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://www.google.com/maps/embed/v1/place?key=${googleMapsKey}&q=${encodeURIComponent(theater.name)},${theater.latitude},${theater.longitude}`}
                allowFullScreen
              ></iframe>
            </div>

            {/* Address */}
            <p className="mt-4 text-gray-700">{theater.address}</p>

            {/* Available Facilities */}
            {theater.facilities && theater.facilities.length > 0 && (
              <div className="mt-4">
                <h3 className="text-gray-900 font-semibold">Facilities:</h3>
                <ul className="list-disc pl-5 text-gray-700">
                  {theater.facilities.map((facility, index) => (
                    <li key={index}>{facility}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* View in Google Maps Link */}
            <div className="mt-6 flex justify-end">
              <a
                href={googleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:bg-blue-700 transition-all"
              >
                View in Google Maps
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TheatreMap;
