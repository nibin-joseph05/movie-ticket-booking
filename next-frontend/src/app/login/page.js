"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false); // OTP sending state
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSendingOtp(true);

    try {
      const response = await fetch("http://localhost:8080/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setIsOtpSent(true);
      } else {
        alert(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };


  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Allow only digits
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input if available
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpVerification = async () => {
    const otpCode = otp.join(""); // Convert array to string

    try {
      const response = await fetch("http://localhost:8080/user/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Login successful!");
        router.push("/"); // Redirect to home
      } else {
        alert(data.message || "Invalid OTP");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#1e1e2e] via-[#121212] to-[#000000] text-white">
      {/* Header */}
      <Header />

      {/* Login Section */}
      <section className="flex flex-grow items-center justify-center px-4">
        <div className="bg-gray-900 p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
          <h2 className="text-3xl font-bold text-center text-red-500 mb-6">
            {isOtpSent ? "Verify OTP" : "Sign In"}
          </h2>

          {/* Google Sign-In */}
          {!isOtpSent && (
            <button
              onClick={() => console.log("Logging in with Google")}
              className="w-full flex items-center justify-center bg-white text-gray-900 font-semibold py-3 rounded-lg shadow-md hover:bg-gray-200 transition-all duration-300"
            >
              <Image src="/google.png" alt="Google" width={20} height={18} className="mr-2" />
              Continue with Google
            </button>
          )}

          {/* Separator */}
          {!isOtpSent && (
            <div className="flex items-center my-6">
              <hr className="w-full border-gray-600" />
              <span className="px-3 text-gray-400">OR</span>
              <hr className="w-full border-gray-600" />
            </div>
          )}

          {/* Login Form */}
          {!isOtpSent ? (
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
                {isSendingOtp ? "Sending OTP..." : "Sign In"}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <p className="text-gray-400 mb-4">Enter the OTP sent to your email</p>

              {/* OTP Input Fields */}
              <div className="flex justify-center gap-2 mb-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    maxLength="1"
                    className="w-12 h-12 text-center text-black bg-gray-100 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-xl font-bold"
                  />
                ))}
              </div>

              {/* Verify & Cancel Buttons */}
              <div className="flex justify-between gap-3">
                <button
                  onClick={handleOtpVerification}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 py-2 rounded-lg text-lg font-semibold shadow-md transition-all duration-300 hover:from-pink-500 hover:to-red-500 hover:scale-105"
                >
                  Verify OTP
                </button>
                <button
                  onClick={() => {
                    setIsOtpSent(false);
                    setOtp(["", "", "", "", "", ""]); // Reset OTP
                  }}
                  className="w-full bg-gray-700 py-2 rounded-lg text-lg font-semibold shadow-md transition-all duration-300 hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Forgot Password & Sign Up */}
          {!isOtpSent && (
            <div className="text-center text-gray-400 mt-6">
              <a href="/forgot-password" className="hover:text-white block">
                Forgot Password?
              </a>
              <p className="mt-3">
                Don't have an account?{" "}
                <a href="/register" className="text-red-500 hover:text-white font-semibold">
                  Sign Up
                </a>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
