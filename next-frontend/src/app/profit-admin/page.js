"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import { FiDollarSign, FiPackage, FiPercent } from "react-icons/fi";

const API_URL = "https://movie-ticket-booking-583u.onrender.com/admin";

export default function ProfitPage() {
  const router = useRouter();
  const [salesData, setSalesData] = useState({
    totalTicketSales: 0,
    totalFoodSales: 0,
    totalBookings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("admin")) {
      router.push("/admin-login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/sales`);

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();

        setSalesData({
          totalTicketSales: data.totalTicketSales,
          totalFoodSales: data.totalFoodSales,
          totalBookings: data.totalBookings
        });
      } catch (e) {
        console.error("Error fetching data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const formatCurrency = (amount) =>
    amount.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    });

  // Calculate commissions
  const adminCommission = salesData.totalTicketSales * 0.05;
  const theatreEarnings = salesData.totalTicketSales * 0.95;

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8 bg-[#121212] text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <FiDollarSign className="text-green-400" size={28} />
            Earnings Breakdown
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Commission Structure Card */}
            <div className="bg-gray-800 p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FiPercent className="text-blue-400" />
                Commission Structure
              </h2>
              <ul className="space-y-3 text-gray-400">
                <li>🎟️ Ticket Sales: 5% Admin Commission</li>
                <li>🍔 Food & Beverages: 0% Commission (Full amount to theatre)</li>
              </ul>
            </div>

            {/* Total Bookings Card */}
            <div className="bg-gray-800 p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FiPackage className="text-purple-400" />
                Total Bookings
              </h2>
              <p className="text-3xl font-bold">
                {loading ? (
                  <span className="inline-block h-8 w-32 bg-gray-700 rounded animate-pulse" />
                ) : (
                  salesData.totalBookings
                )}
              </p>
            </div>
          </div>

          {/* Earnings Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Ticket Sales */}
            <div className="bg-gray-800 p-6 rounded-xl">
              <h3 className="text-gray-400 mb-2">Total Ticket Sales</h3>
              <p className="text-2xl font-bold text-green-400">
                {loading ? (
                  <span className="inline-block h-8 w-32 bg-gray-700 rounded animate-pulse" />
                ) : (
                  formatCurrency(salesData.totalTicketSales)
                )}
              </p>
            </div>

            {/* Admin Earnings */}
            <div className="bg-gray-800 p-6 rounded-xl">
              <h3 className="text-gray-400 mb-2">Admin Commission (5%)</h3>
              <p className="text-2xl font-bold text-blue-400">
                {loading ? (
                  <span className="inline-block h-8 w-32 bg-gray-700 rounded animate-pulse" />
                ) : (
                  formatCurrency(adminCommission)
                )}
              </p>
            </div>

            {/* Theatre Earnings */}
            <div className="bg-gray-800 p-6 rounded-xl">
              <h3 className="text-gray-400 mb-2">Theatre Earnings (95%)</h3>
              <p className="text-2xl font-bold text-purple-400">
                {loading ? (
                  <span className="inline-block h-8 w-32 bg-gray-700 rounded animate-pulse" />
                ) : (
                  formatCurrency(theatreEarnings)
                )}
              </p>
            </div>
          </div>

          {/* Food Sales Section */}
          <div className="mt-8 bg-gray-800 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FiDollarSign className="text-yellow-400" />
              Total Food & Beverage Sales
            </h2>
            <p className="text-3xl font-bold">
              {loading ? (
                <span className="inline-block h-8 w-32 bg-gray-700 rounded animate-pulse" />
              ) : (
                formatCurrency(salesData.totalFoodSales)
              )}
            </p>
            <p className="text-gray-400 mt-2 text-sm">
              Full amount goes directly to the theatre
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}