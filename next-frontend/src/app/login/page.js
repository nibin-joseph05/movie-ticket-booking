"use client";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Logging in with:", { email, password });
    // Implement login logic (API call)
  };

  const handleGoogleLogin = () => {
    console.log("Logging in with Google");
    // Implement Google authentication logic
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#1e1e2e] via-[#121212] to-[#000000] text-white">
      {/* Header */}
      <Header />

      {/* Login Section */}
      <section className="flex flex-grow items-center justify-center px-4">
        <div className="bg-gray-900 p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
          <h2 className="text-3xl font-bold text-center text-red-500 mb-6">Sign In</h2>

          {/* Google Sign-In */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center bg-white text-gray-900 font-semibold py-3 rounded-lg shadow-md hover:bg-gray-200 transition-all duration-300"
          >
            <Image src="/google.png" alt="Google" width={20} height={18} className="mr-2" />
            Continue with Google
          </button>

          {/* Separator */}
          <div className="flex items-center my-6">
            <hr className="w-full border-gray-600" />
            <span className="px-3 text-gray-400">OR</span>
            <hr className="w-full border-gray-600" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-black bg-gray-100 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 shadow-md"
                required
              />
            </div>

            {/* Password Field */}
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

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 py-3 rounded-lg text-lg font-semibold shadow-md transition-all duration-300 hover:from-pink-500 hover:to-red-500 hover:scale-105"
            >
              Sign In
            </button>
          </form>

          {/* Forgot Password & Sign Up */}
          <div className="text-center text-gray-400 mt-6">
            <a href="/forgot-password" className="hover:text-white block">Forgot Password?</a>
            <p className="mt-3">
              Don't have an account?{" "}
              <a href="/register" className="text-red-500 hover:text-white font-semibold">Sign Up</a>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
