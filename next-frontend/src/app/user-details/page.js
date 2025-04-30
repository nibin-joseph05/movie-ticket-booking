"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import { FiSearch, FiUsers } from "react-icons/fi";

export default function UserDetails() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [darkMode, setDarkMode] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!localStorage.getItem("admin")) {
      router.push("/admin-login");
    }
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/admin/users?search=${searchTerm}&limit=${itemsPerPage}&offset=${(currentPage - 1) * itemsPerPage}`
        );
        const data = await response.json();
        setUsers(data.users);
        setTotalUsers(data.total);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [searchTerm, currentPage]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalUsers / itemsPerPage);

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className={`flex-1 p-8 relative transition-colors duration-300 ${
        darkMode ? "bg-[#121212] text-white" : "bg-gray-100 text-black"
      }`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-red-500">User Management</h1>
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={handleSearch}
                className={`pl-10 pr-4 py-2 rounded-lg ${
                  darkMode
                    ? "bg-gray-800 text-white focus:ring-red-500"
                    : "bg-white text-black focus:ring-blue-500"
                } focus:outline-none focus:ring-2`}
              />
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          {/* User Table */}
          <div className={`rounded-lg shadow-lg ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}>
            <table className="w-full">
              <thead className={`border-b ${
                darkMode ? "border-gray-700" : "border-gray-200"
              }`}>
                <tr>
                  <th className="px-6 py-4 text-left">Name</th>
                  <th className="px-6 py-4 text-left">Email</th>
                  <th className="px-6 py-4 text-left">Phone</th>
                  <th className="px-6 py-4 text-left">Registered</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.userId} className={`hover:${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {user.userPhotoPath && (
                          <img
                            src={`http://localhost:8080/user/photo?path=${encodeURIComponent(user.userPhotoPath)}`}
                            alt="User"
                            className="w-10 h-10 rounded-full mr-3"
                          />
                        )}
                        {user.firstName} {user.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">{user.phoneNumber}</td>
                    <td className="px-6 py-4">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <span className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers} users
            </span>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded-lg ${
                    currentPage === i + 1
                      ? "bg-red-500 text-white"
                      : darkMode
                      ? "bg-gray-700 text-white"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}