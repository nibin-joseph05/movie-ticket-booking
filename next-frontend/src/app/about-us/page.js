"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";

export default function AboutUs() {
  const [userName, setUserName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // This is a placeholder for your backend API.
        // Ensure your backend is running on http://localhost:8080 or update this URL.
        const response = await fetch("http://localhost:8080/user/check-session", {
          credentials: "include", // Important for sending cookies/session with the request
        });
        const data = await response.json();
        if (data.isLoggedIn) {
          setUserName(data.user.firstName);
          setIsLoggedIn(true);
        } else {
          setUserName("");
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Session check failed:", error);
      }
    };

    checkSession();
  }, []); // Empty dependency array means this effect runs once on mount.

  const handleLogout = () => {
    // Logic to clear user session (e.g., call a logout API) would go here.
    setUserName("");
    setIsLoggedIn(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1e1e2e] via-[#121212] to-[#000000] text-white">
      <Header onLogout={handleLogout} />

      {isLoggedIn && userName && (
        <div className="text-center py-4 text-lg font-bold bg-gradient-to-r from-red-600 to-pink-500 text-white shadow-lg rounded-b-lg">
          👋 Hello, <span className="text-yellow-300">{userName}</span> – learn more about us!
        </div>
      )}

      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-red-500 text-center mb-6 border-b-4 border-red-600 pb-3">
          🎥 About Movie-Flix
        </h1>

        <p className="text-lg sm:text-xl text-gray-300 text-center max-w-3xl mx-auto mb-10 leading-relaxed">
          Movie-Flix is your ultimate destination to explore and book the latest movies playing near you. From
          showtimes to seat selection, we&apos;ve built a seamless experience that makes movie-going easier and more exciting.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mt-10">
          <div className="bg-black/40 p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold text-red-400 mb-3">🎯 Our Mission</h2>
            <p className="text-gray-300">
              To revolutionize movie booking by integrating real-time theater data, rich movie content from TMDB,
              and a smooth UI powered by cutting-edge technologies like Spring Boot, React/Next.js, and Docker.
            </p>
          </div>

          <div className="bg-black/40 p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold text-red-400 mb-3">💡 Technologies</h2>
            <p className="text-gray-300">
              We leverage TMDB, Google Maps & Places API, Razorpay, and more — backed by PostgreSQL and Spring Boot,
              styled beautifully with Tailwind CSS and deployed via Docker for performance and scalability.
            </p>
          </div>

          <div className="bg-black/40 p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold text-red-400 mb-3">🚀 Features</h2>
            <ul className="list-disc ml-6 text-gray-300">
              <li>Smart Theater Detection</li>
              <li>Live Showtimes & Seat Booking</li>
              <li>Secure Payments</li>
              <li>Downloadable Tickets</li>
              <li>Email Notifications</li>
            </ul>
          </div>

          <div className="bg-black/40 p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold text-red-400 mb-3">🤝 Get in Touch</h2>
            <p className="text-gray-300">
              We&apos;d love to hear from you! Whether you&apos;re a movie buff or a theater owner, connect with us to collaborate,
              share feedback, or just say hello. Together, let&apos;s change the way India watches movies!
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}