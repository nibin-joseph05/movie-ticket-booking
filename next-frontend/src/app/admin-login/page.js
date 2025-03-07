"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent page reload

    try {
      const response = await fetch("http://localhost:8080/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid email or password");
      }

      const data = await response.json();
      alert("Login Successful!");

      // Store admin data in localStorage
      localStorage.setItem("admin", JSON.stringify(data));

      // Redirect to the admin dashboard (change the path accordingly)
      router.push("/admin-dashboard");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#1e1e2e] via-[#121212] to-[#000000] text-white">
      <Header />

      <section className="flex flex-grow items-center justify-center px-4">
        <div className="bg-gray-900 p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
          <h2 className="text-3xl font-bold text-center text-red-500 mb-6">Admin Login</h2>

          {error && <p className="text-red-400 text-center mb-4">{error}</p>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-1">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-black bg-gray-100 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 shadow-md"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 text-black bg-gray-100 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 shadow-md"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 py-3 rounded-lg text-lg font-semibold shadow-md transition-all duration-300 hover:from-pink-500 hover:to-red-500 hover:scale-105"
            >
              Sign In
            </button>
          </form>

          <div className="text-center text-gray-400 mt-6">
            <a href="/forgot-password" className="hover:text-white block">
              Forgot Password?
            </a>

            <p className="mt-3">
              Not an admin?{" "}
              <a href="/login" className="text-blue-500 hover:text-white font-semibold">
                Login as User
              </a>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
