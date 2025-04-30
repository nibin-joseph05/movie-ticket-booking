"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import BookingDetailsModal from "@/components/admin/BookingDetailsModal";
import { FiSearch, FiClock, FiDollarSign } from "react-icons/fi";
import { format } from "date-fns";


const API_URL = "http://localhost:8080/admin";

export default function BookingList() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [darkMode] = useState(true);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalBookings / itemsPerPage);


  useEffect(() => {
    if (!localStorage.getItem("admin")) {
      router.push("/admin-login");
      return;
    }

    const fetchBookings = async () => {
      try {
        const res = await fetch(
          `${API_URL}/bookings?search=${encodeURIComponent(searchTerm)}&page=${currentPage - 1}&size=${itemsPerPage}`
        );
        const page = await res.json();
        setBookings(page.content || []);
        setTotalBookings(page.totalElements || 0);
      } catch (e) {
        console.error("Error fetching bookings:", e);
      }
    };

    fetchBookings();
  }, [searchTerm, currentPage, router]);

  const fetchBookingDetails = async (reference) => {
    try {
      const res = await fetch(`${API_URL}/bookings/${reference}`);
      const details = await res.json();
      setSelectedBooking(details);
    } catch (e) {
      console.error("Error fetching details:", e);
    }
  };

  const formatDateTime = (dt) => format(new Date(dt), "dd MMM yyyy, hh:mm a");

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className={`flex-1 p-8 transition-colors duration-300 ${
        darkMode ? "bg-[#121212] text-white" : "bg-gray-100 text-black"
      }`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-red-500">Booking Management</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <FiSearch className="absolute left-3 top-3 text-gray-400" size={18} />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg shadow-lg bg-gray-800">
          <table className="min-w-full">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left">Ref</th>
                <th className="px-6 py-4 text-left">User</th>
                <th className="px-6 py-4 text-left">Booked At</th>
                <th className="px-6 py-4 text-left">Total (₹)</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.bookingReference} className="hover:bg-gray-700 border-b border-gray-700">
                  <td className="px-6 py-3">{b.bookingReference}</td>
                  <td className="px-6 py-3">
                    <div className="flex flex-col">
                      <span>{b.userName}</span>
                      <span className="text-sm text-gray-400">{b.userEmail}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center">
                      <FiClock className="mr-2" size={16} />
                      {formatDateTime(b.bookingTime)}
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center">
                      {b.totalAmount.toLocaleString('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        minimumFractionDigits: 2,
                      })}
                    </div>
                  </td>

                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      b.paymentStatus === "SUCCESSFUL" ? "bg-green-500" : "bg-red-500"
                    }`}>
                      {b.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => fetchBookingDetails(b.bookingReference)}
                      className="text-red-500 hover:text-red-400"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <div className="text-gray-400">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, totalBookings)} of {totalBookings}
          </div>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-lg ${
                  currentPage === i + 1 ? "bg-red-500" : "bg-gray-700"
                } text-white`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {selectedBooking && (
          <BookingDetailsModal
            booking={selectedBooking}
            onClose={() => setSelectedBooking(null)}
          />
        )}
      </main>
    </div>
  );
}

const DetailItem = ({ label, value }) => (
  <div className="flex justify-between py-1">
    <span className="text-gray-400">{label}:</span>
    <span className="max-w-[60%] text-right">{value}</span>
  </div>
);