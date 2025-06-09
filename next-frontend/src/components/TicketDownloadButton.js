'use client';

import { useState } from 'react';
import axios from 'axios';
import { FiDownload } from 'react-icons/fi';

export default function TicketDownloadButton({ bookingRef, className }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://movie-ticket-booking-583u.onrender.com/booking/${bookingRef}/ticket`,
        {
          responseType: 'blob',
          withCredentials: true
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticket_${bookingRef}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (error) {
      console.error('Error downloading ticket:', error);
      alert('Failed to download ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={`w-full py-3 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/40 active:scale-[0.97] flex items-center justify-center gap-2 transform hover:-translate-y-1 ${className}`}
    >
      {loading ? (
        'Downloading...'
      ) : (
        <>
          <FiDownload className="w-5 h-5" />
          Download Ticket
        </>
      )}
    </button>
  );
}