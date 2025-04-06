"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Register() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    userPhotoPath: null,
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
    setFormData({ ...formData, userPhotoPath: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formDataToSend = new FormData();
    formDataToSend.append("firstName", formData.firstName);
    formDataToSend.append("lastName", formData.lastName);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("phoneNumber", formData.phoneNumber);
    formDataToSend.append("password", formData.password);
    if (formData.userPhotoPath) {
      formDataToSend.append("userPhotoPath", formData.userPhotoPath);
    }

    try {
      const response = await fetch("http://localhost:8080/user/register", {
        method: "POST",
        body: formDataToSend,
      });

      const responseText = await response.text();

      if (response.ok) {
        alert(responseText);
        window.location.href = returnUrl
          ? `/login?returnUrl=${returnUrl}`
          : "/login";
      } else {
        alert(`Error: ${responseText}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to register user.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#1e1e2e] via-[#121212] to-[#000000] text-white">
      <Header />

      <section className="flex flex-grow items-center justify-center px-4">
        <div className="bg-gray-900 p-10 rounded-lg shadow-xl w-full max-w-2xl border border-gray-700">
          <h2 className="text-3xl font-bold text-center text-red-500 mb-6">
            Create Your Account
          </h2>

          {returnUrl && returnUrl.includes("booking-summary") && (
            <div className="mb-6 p-3 bg-purple-900/30 border border-purple-500 rounded-lg">
              <p className="text-center">
                Complete registration to proceed with your booking
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                {errors.firstName && (
                  <p className="text-red-400 text-sm">{errors.firstName}</p>
                )}
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
                {errors.lastName && (
                  <p className="text-red-400 text-sm">{errors.lastName}</p>
                )}
              </div>
            </div>

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
                {errors.email && (
                  <p className="text-red-400 text-sm">{errors.email}</p>
                )}
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
                {errors.phoneNumber && (
                  <p className="text-red-400 text-sm">{errors.phoneNumber}</p>
                )}
              </div>
            </div>

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

            <div>
              <label className="block text-gray-300 mb-1">Upload Photo</label>
              <input
                type="file"
                name="photo"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full bg-gray-100 border border-gray-500 rounded-lg p-2 text-black shadow-md"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-red-500 py-3 rounded-lg text-lg font-semibold hover:bg-red-600 transition"
            >
              Register
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}