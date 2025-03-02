"use client";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    photo: null,
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};

    if (!/^[A-Za-z]+$/.test(formData.firstName)) {
      newErrors.firstName = "Only letters allowed.";
    }

    if (!/^[A-Za-z]+$/.test(formData.lastName)) {
      newErrors.lastName = "Only letters allowed.";
    }

    if (!/^[\w.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.email)) {
      newErrors.email = "Enter a valid email.";
    }

    if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Must be 10 digits.";
    }

    if (formData.password.length < 8) {
      newErrors.password = "Min. 8 characters.";
    }

    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords don't match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, photo: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Registering user with:", formData);
      // Implement API call here
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#1e1e2e] via-[#121212] to-[#000000] text-white">
      {/* Header */}
      <Header />

      {/* Registration Form */}
      <section className="flex flex-grow items-center justify-center px-4">
        <div className="bg-gray-900 p-10 rounded-lg shadow-xl w-full max-w-2xl border border-gray-700">
          <h2 className="text-3xl font-bold text-center text-red-500 mb-6">Create Your Account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-black bg-gray-100 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 shadow-md"
                  required
                />
                {errors.firstName && <p className="text-red-400 text-sm">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-black bg-gray-100 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 shadow-md"
                  required
                />
                {errors.lastName && <p className="text-red-400 text-sm">{errors.lastName}</p>}
              </div>
            </div>

            {/* Email & Phone Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-black bg-gray-100 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 shadow-md"
                  required
                />
                {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-black bg-gray-100 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 shadow-md"
                  required
                />
                {errors.phoneNumber && <p className="text-red-400 text-sm">{errors.phoneNumber}</p>}
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-black bg-gray-100 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 shadow-md"
                  required
                />
                {errors.password && <p className="text-red-400 text-sm">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-black bg-gray-100 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 shadow-md"
                  required
                />
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-gray-300 mb-1">Upload Photo</label>
              <input
                type="file"
                name="photo"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full bg-gray-100 border border-gray-500 rounded-lg p-2 text-black shadow-md"
              />
              <p className="text-gray-400 text-sm mt-1">Photo is optional.</p>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 py-3 rounded-lg text-lg font-semibold shadow-md transition-all duration-300 hover:from-pink-500 hover:to-red-500 hover:scale-105"
            >
              Register
            </button>
          </form>

          {/* Already have an account? */}
          <p className="text-center text-gray-400 mt-6">
            Already have an account?{" "}
            <a href="/login" className="text-red-500 hover:text-white font-semibold">Sign In</a>
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
