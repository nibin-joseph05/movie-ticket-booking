'use client';

import { useState } from 'react';
import axios from 'axios';
import { FiDownload } from 'react-icons/fi';

export default function TicketDownloadButton({ bookingRef }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `http://localhost:8080/booking/${bookingRef}/ticket`,
        {
          responseType: 'blob',
          withCredentials: true
        }
      );

      // Create download link
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
      className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2"
    >
      {loading ? (
        'Downloading...'
      ) : (
        <>
          <FiDownload />
          Download Ticket
        </>
      )}
    </button>
  );
}