"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import { FiDollarSign, FiPieChart, FiCalendar, FiTrendingUp } from "react-icons/fi";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const API_URL = "http://localhost:8080/admin";

export default function ProfitPage() {
  const router = useRouter();
  const [profitData, setProfitData] = useState({
    totalTicketSales: 0,
    totalFoodSales: 0,
    totalProfit: 0,
    monthlyTrend: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    end: new Date()
  });

  useEffect(() => {
    if (!localStorage.getItem("admin")) {
      router.push("/admin-login");
      return;
    }

    const fetchProfitData = async () => {
      try {
        setLoading(true);
        const startDate = dateRange.start.toISOString().split('T')[0];
        const endDate = dateRange.end.toISOString().split('T')[0];

        const res = await fetch(
          `${API_URL}/profit?start=${startDate}&end=${endDate}`
        );

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        setProfitData(data);
      } catch (e) {
        console.error("Error fetching profit data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchProfitData();
  }, [dateRange, router]);

  const chartData = {
    labels: profitData.monthlyTrend?.map(m => m.month) || [],
    datasets: [
      {
        label: 'Ticket Sales',
        data: profitData.monthlyTrend?.map(m => m.ticketSales) || [],
        borderColor: '#ef4444',
        tension: 0.1,
      },
      {
        label: 'Food Sales',
        data: profitData.monthlyTrend?.map(m => m.foodSales) || [],
        borderColor: '#3b82f6',
        tension: 0.1,
      }
    ]
  };

  const formatCurrency = (amount) =>
    amount.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    });

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8 bg-[#121212] text-white">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <h1 className="text-4xl font-bold text-red-500 flex items-center gap-3">
              <FiTrendingUp size={32} className="p-2 bg-red-500/20 rounded-xl" />
              Revenue Dashboard
            </h1>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 bg-gray-800 px-4 py-3 rounded-xl">
                <label className="text-sm text-gray-400">From:</label>
                <input
                  type="date"
                  value={dateRange.start.toLocaleDateString('en-CA')}
                  onChange={(e) => setDateRange({ ...dateRange, start: new Date(e.target.value) })}
                  className="bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-red-500 rounded-lg"
                />
              </div>
              <div className="flex items-center gap-2 bg-gray-800 px-4 py-3 rounded-xl">
                <label className="text-sm text-gray-400">To:</label>
                <input
                  type="date"
                  value={dateRange.end.toLocaleDateString('en-CA')}
                  onChange={(e) => setDateRange({ ...dateRange, end: new Date(e.target.value) })}
                  className="bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-red-500 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Ticket Sales Card */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-xl hover:transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/20 rounded-xl">
                  <FiDollarSign size={28} className="text-red-400" />
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Ticket Sales</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                    {loading ? (
                      <span className="inline-block h-8 w-32 bg-gray-700 rounded animate-pulse" />
                    ) : (
                      formatCurrency(profitData.totalTicketSales)
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Food Sales Card */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-xl hover:transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <FiPieChart size={28} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Food & Beverages</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    {loading ? (
                      <span className="inline-block h-8 w-32 bg-gray-700 rounded animate-pulse" />
                    ) : (
                      formatCurrency(profitData.totalFoodSales)
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Revenue Card */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-xl hover:transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <FiDollarSign size={28} className="text-green-400" />
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    {loading ? (
                      <span className="inline-block h-8 w-32 bg-gray-700 rounded animate-pulse" />
                    ) : (
                      formatCurrency(profitData.totalProfit)
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <FiCalendar size={24} className="text-red-400" />
              Revenue Trend
            </h2>
            <div className="h-[500px]">
              {loading ? (
                <div className="h-full w-full bg-gray-700 rounded-xl animate-pulse" />
              ) : (
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: {
                          color: '#fff',
                          font: { size: 14 },
                          padding: 20
                        }
                      },
                      tooltip: {
                        backgroundColor: '#1F2937',
                        titleColor: '#fff',
                        bodyColor: '#E5E7EB',
                        borderColor: '#374151',
                        borderWidth: 1,
                        padding: 12,
                        usePointStyle: true,
                      }
                    },
                    scales: {
                      x: {
                        grid: { color: '#374151' },
                        ticks: {
                          color: '#9CA3AF',
                          font: { size: 12 }
                        },
                        border: { color: '#374151' }
                      },
                      y: {
                        grid: { color: '#374151' },
                        ticks: {
                          color: '#9CA3AF',
                          font: { size: 12 },
                          callback: value => formatCurrency(value)
                        },
                        border: { color: '#374151' }
                      }
                    },
                    elements: {
                      line: {
                        borderWidth: 3,
                        tension: 0.3
                      },
                      point: {
                        radius: 5,
                        hoverRadius: 8,
                        backgroundColor: '#1F2937',
                        borderWidth: 2
                      }
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}