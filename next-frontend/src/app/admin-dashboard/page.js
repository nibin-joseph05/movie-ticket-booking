"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import { FiDollarSign, FiPieChart, FiCalendar, FiTrendingUp, FiLogOut } from "react-icons/fi";
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

export default function AdminDashboard() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
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

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      localStorage.removeItem("admin");
      router.push("/admin-login");
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${darkMode ? 'dark' : 'light'}`}>
      <Sidebar />

      <main className={`flex-1 p-8 relative ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
        {/* Header Section */}
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            {/* Title and Controls */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <FiTrendingUp className={`p-2 rounded-xl ${darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'}`} size={32} />
                <span className={`bg-gradient-to-r ${darkMode ? 'from-red-400 to-orange-400' : 'from-red-600 to-orange-600'} bg-clip-text text-transparent`}>
                  Admin Dashboard
                </span>
              </h1>
            </div>

            {/* Date Pickers and Mode Controls */}
            <div className="flex flex-col-reverse sm:flex-row gap-4 items-end sm:items-center w-full sm:w-auto">
              <div className="flex gap-3 flex-wrap">
                <div className={`flex items-center gap-2 ${darkMode ? 'bg-gray-800' : 'bg-white shadow-sm'} px-4 py-2 rounded-lg`}>
                  <label className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>From:</label>
                  <input
                    type="date"
                    value={dateRange.start.toLocaleDateString('en-CA')}
                    onChange={(e) => setDateRange({ ...dateRange, start: new Date(e.target.value) })}
                    className={`bg-transparent ${darkMode ? 'text-gray-100' : 'text-gray-900'} focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-red-400' : 'focus:ring-red-600'} rounded-md`}
                  />
                </div>
                <div className={`flex items-center gap-2 ${darkMode ? 'bg-gray-800' : 'bg-white shadow-sm'} px-4 py-2 rounded-lg`}>
                  <label className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>To:</label>
                  <input
                    type="date"
                    value={dateRange.end.toLocaleDateString('en-CA')}
                    onChange={(e) => setDateRange({ ...dateRange, end: new Date(e.target.value) })}
                    className={`bg-transparent ${darkMode ? 'text-gray-100' : 'text-gray-900'} focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-red-400' : 'focus:ring-red-600'} rounded-md`}
                  />
                </div>
              </div>

              <div className="flex gap-3 sm:self-end">
                <button
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-600'} transition-colors shadow-sm`}
                >
                  {darkMode ? '🌞' : '🌙'}
                </button>
                <button
                  onClick={handleLogout}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white transition-colors shadow-sm`}
                >
                  <FiLogOut size={18} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                title: "Ticket Sales",
                value: profitData.totalTicketSales,
                icon: FiDollarSign,
                color: "red",
                gradient: "from-red-400 to-orange-400"
              },
              {
                title: "Food & Beverages",
                value: profitData.totalFoodSales,
                icon: FiPieChart,
                color: "blue",
                gradient: "from-blue-400 to-cyan-400"
              },
              {
                title: "Total Revenue",
                value: profitData.totalProfit,
                icon: FiDollarSign,
                color: "green",
                gradient: "from-green-400 to-emerald-400"
              }
            ].map((card, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl transition-all duration-300 ${darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'} shadow-lg hover:shadow-xl`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-${card.color}-500/20`}>
                    <card.icon size={28} className={`text-${card.color}-400`} />
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{card.title}</p>
                    <p className={`text-2xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                      {loading ? (
                        <span className={`inline-block h-8 w-32 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded animate-pulse`} />
                      ) : (
                        formatCurrency(card.value)
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chart Section */}
          <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FiCalendar className={`${darkMode ? 'text-red-400' : 'text-red-600'}`} size={24} />
                Revenue Trend
              </h2>
            </div>
            <div className="h-96">
              {loading ? (
                <div className={`h-full w-full rounded-lg animate-pulse ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
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
                          color: darkMode ? '#fff' : '#111827',
                          font: { size: 14 }
                        }
                      },
                      tooltip: {
                        backgroundColor: darkMode ? '#1F2937' : '#F9FAFB',
                        titleColor: darkMode ? '#E5E7EB' : '#111827',
                        bodyColor: darkMode ? '#D1D5DB' : '#374151',
                        borderColor: darkMode ? '#374151' : '#E5E7EB',
                        borderWidth: 1,
                        padding: 12,
                        usePointStyle: true,
                      }
                    },
                    scales: {
                      x: {
                        grid: { color: darkMode ? '#374151' : '#E5E7EB' },
                        ticks: {
                          color: darkMode ? '#9CA3AF' : '#6B7280',
                          font: { size: 12 }
                        }
                      },
                      y: {
                        grid: { color: darkMode ? '#374151' : '#E5E7EB' },
                        ticks: {
                          color: darkMode ? '#9CA3AF' : '#6B7280',
                          font: { size: 12 },
                          callback: value => formatCurrency(value)
                        }
                      }
                    },
                    elements: {
                      line: { borderWidth: 2, tension: 0.3 },
                      point: {
                        radius: 4,
                        hoverRadius: 6,
                        backgroundColor: darkMode ? '#1F2937' : '#F9FAFB',
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