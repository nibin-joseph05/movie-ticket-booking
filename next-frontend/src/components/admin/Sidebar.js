"use client";
import { useRouter } from "next/navigation";
import { FiHome, FiPlusCircle, FiUsers } from "react-icons/fi";

export default function Sidebar() {
  const router = useRouter();

  return (
    <aside className="w-64 bg-[#1e1e2e] p-6 flex flex-col shadow-lg">
      {/* Logo */}
      <div className="flex items-center justify-center mb-8">
        <img src="/logo.webp" alt="Logo" width={120} height={80} className="rounded-lg shadow-md" />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col space-y-4 text-white">
        <button
          onClick={() => router.push("/admin-dashboard")}
          className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg bg-gray-800 hover:bg-red-500 transition-transform transform hover:scale-105"
        >
          <FiHome size={20} />
          Dashboard
        </button>

        <button
          onClick={() => router.push("/user-details")}
          className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg bg-gray-800 hover:bg-red-500 transition-transform transform hover:scale-105"
        >
          <FiUsers size={20} />
          Users
        </button>

        {/* Booking Details Button */}
        <button
          onClick={() => router.push("/booking-details")}
          className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg bg-gray-800 hover:bg-red-500 transition-transform transform hover:scale-105"
        >
          <FiPlusCircle size={20} />
          Booking Details
        </button>
      </nav>
    </aside>
  );
}
