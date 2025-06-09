"use client";
import { useState, useEffect, Suspense } from "react"; // Ensure Suspense is imported
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// This component contains the actual logic and uses useSearchParams
function RegisterContent() { // Renamed from original 'Register'
  const router = useRouter();
  const searchParams = useSearchParams(); // This hook requires client-side context
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
  const [isLoading, setIsLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({
    show: false,
    title: '',
    message: '',
    action: null
  });
  const [emailStatus, setEmailStatus] = useState({
    isValidFormat: false,
    isDomainValid: false,
    isChecking: false
  });

  useEffect(() => {
    const prefilledEmail = sessionStorage.getItem('prefilledEmail');
    const fromProvider = sessionStorage.getItem('fromProvider');

    if (prefilledEmail) {
      setFormData(prev => ({
        ...prev,
        email: prefilledEmail
      }));

      sessionStorage.removeItem('prefilledEmail');

//      if (fromProvider === 'google') {
//        const generatedPassword = generateStrongPassword();
//        setFormData(prev => ({
//          ...prev,
//          password: generatedPassword,
//          confirmPassword: generatedPassword
//        }));
//        sessionStorage.removeItem('fromProvider');
//      }
    }
  }, []); // Empty dependency array, runs once on mount.

  // Email validation with debouncing
  useEffect(() => {
    const validateEmail = async () => {
      const email = formData.email.trim();

      // Basic format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValidFormat = emailRegex.test(email);
      setEmailStatus(prev => ({ ...prev, isValidFormat }));

      if (!isValidFormat || !email) {
        setEmailStatus(prev => ({ ...prev, isDomainValid: false }));
        return;
      }

      // Domain validation with debouncing
      setEmailStatus(prev => ({ ...prev, isChecking: true }));

      try {
        const domain = email.split('@')[1];
        const response = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`);
        const data = await response.json();
        const isDomainValid = data.Answer && data.Answer.length > 0;
        setEmailStatus(prev => ({ ...prev, isDomainValid }));
      } catch (error) {
        console.error("Domain validation error:", error);
        setEmailStatus(prev => ({ ...prev, isDomainValid: false }));
      } finally {
        setEmailStatus(prev => ({ ...prev, isChecking: false }));
      }
    };

    const timer = setTimeout(validateEmail, 500);
    return () => clearTimeout(timer);
  }, [formData.email]); // Dependency on formData.email

  const generateStrongPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const showError = (title, message, action = null) => {
    setErrorModal({
      show: true,
      title,
      message,
      action
    });
  };

  const validateForm = () => {
    let newErrors = {};

    if (!/^[A-Za-z]+$/.test(formData.firstName)) {
      newErrors.firstName = "Only letters allowed.";
    }

    if (!/^[A-Za-z]+$/.test(formData.lastName)) {
      newErrors.lastName = "Only letters allowed.";
    }

    if (!emailStatus.isValidFormat) {
      newErrors.email = "Enter a valid email address.";
    } else if (!emailStatus.isDomainValid) {
      newErrors.email = "The email domain doesn't exist.";
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

    setIsLoading(true);

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
        window.location.href = returnUrl
          ? `/login?returnUrl=${returnUrl}`
          : "/login";
      } else {
        showError('Registration Failed', responseText);
      }
    } catch (error) {
      showError('Error', "Failed to register user. Please try again.");
    } finally {
      setIsLoading(false);
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

          {/* Conditional rendering based on returnUrl */}
          {returnUrl && returnUrl.includes("booking-summary") && (
            <div className="mb-6 p-3 bg-purple-900/30 border border-purple-500 rounded-lg">
              <p className="text-center">
                Complete registration to proceed with your booking
              </p>
            </div>
          )}

          {/* Error Modal */}
          {errorModal.show && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
                <h3 className="text-xl font-bold text-red-500 mb-4">{errorModal.title}</h3>
                <p className="mb-4">{errorModal.message}</p>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setErrorModal({ show: false });
                      if (errorModal.action) errorModal.action();
                    }}
                    className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
                  >
                    OK
                  </button>
                </div>
              </div>
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
                <div className="mt-1">
                  {emailStatus.isChecking && (
                    <p className="text-yellow-400 text-sm">Checking email domain...</p>
                  )}
                  {!emailStatus.isChecking && errors.email && (
                    <p className="text-red-400 text-sm">{errors.email}</p>
                  )}
                  {!emailStatus.isChecking && emailStatus.isValidFormat && emailStatus.isDomainValid && (
                    <p className="text-green-400 text-sm">Email appears valid</p>
                  )}
                </div>
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
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "Register"}
            </button>
          </form>
        </div>
      </section>

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      )}

      <Footer />
    </div>
  );
}

// Export the default function which wraps the content in Suspense
export default function Register() { // Original export name
    return (
        <Suspense fallback={
          // You can put a loading spinner or any placeholder here
          <div className="min-h-screen bg-gradient-to-b from-[#1e1e2e] via-[#121212] to-[#000000] text-white flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            <p className="mt-4 text-lg">Loading registration page...</p>
          </div>
        }>
            <RegisterContent /> {/* Render the renamed component */}
        </Suspense>
    );
}