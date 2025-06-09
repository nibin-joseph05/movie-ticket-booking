"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [showRegistrationPrompt, setShowRegistrationPrompt] = useState(false);
  const [errorModal, setErrorModal] = useState({
    show: false,
    title: '',
    message: '',
    action: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");
  const isOtpComplete = otp.every((digit) => digit !== "");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const message = params.get('message');
    const email = params.get('email');
    const from = params.get('from');
    const state = params.get('state');


    if (error === 'no_account' && email) {
            const displayMessage = message || "No account found with this Google email. Please register.";

            sessionStorage.setItem('prefilledEmail', email);

            // Store state for registration redirect
            if (state) {
                sessionStorage.setItem('oauthState', state);
            }

            if (from === 'google') {
                sessionStorage.setItem('fromProvider', 'google');
            }

            setShowRegistrationPrompt(true);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

  const showError = (title, message, action = null) => {
    setErrorModal({
      show: true,
      title,
      message,
      action
    });
  };

  const checkSession = async () => {
    try {
      const response = await fetch('http://localhost:8080/user/check-session', {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.isLoggedIn) {
        localStorage.setItem('user', JSON.stringify(data.user));

        const pendingBooking = sessionStorage.getItem('pendingBooking');
        const returnUrl = sessionStorage.getItem('returnUrl');

        if (pendingBooking) {
          handlePendingBookingRedirect(data.user);
        } else if (returnUrl) {
          sessionStorage.removeItem('returnUrl');
          window.location.href = returnUrl;
        } else if (searchParams.get('returnUrl')) {
          window.location.href = searchParams.get('returnUrl');
        } else {
          router.push('/');
        }
      }
    } catch (error) {
      console.error('Session check failed:', error);
    }
  };

  const handlePendingBookingRedirect = (user) => {
    const bookingData = JSON.parse(sessionStorage.getItem('pendingBooking'));
    sessionStorage.removeItem('pendingBooking');

    const queryParams = new URLSearchParams({
      movie: bookingData.movieId,
      theater: bookingData.theaterId,
      showtime: bookingData.showtime,
      category: bookingData.category,
      seats: bookingData.seats.join(','),
      price: bookingData.price.toFixed(2),
      date: bookingData.date,
      food: JSON.stringify(bookingData.food)
    });

    window.location.href = `/booking-summary?${queryParams.toString()}`;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSendingOtp(true);

    try {
      const response = await fetch("http://localhost:8080/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include"
      });

      const data = await response.json();
      if (response.ok) {
        setIsOtpSent(true);
      } else if (response.status === 404) {
        setShowRegistrationPrompt(true);
      } else {
        showError('Login Failed', data.error || "Login failed");
      }
    } catch (error) {
      showError('Error', "An error occurred. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleRegisterRedirect = () => {
      const pendingBooking = sessionStorage.getItem("pendingBooking");
      const oauthState = sessionStorage.getItem("oauthState");

      // Build return URL from OAuth state or original returnUrl
      let returnPath = returnUrl || "/";
      try {
          if (oauthState) {
              const stateObj = JSON.parse(decodeURIComponent(oauthState));
              returnPath = stateObj.returnUrl || "/";
          }
      } catch (e) {
          console.error("Error parsing OAuth state:", e);
      }

      const queryParams = new URLSearchParams({
          returnUrl: returnPath,
          email: sessionStorage.getItem('prefilledEmail'),
          ...(pendingBooking && {
              booking: sessionStorage.getItem("pendingBooking")
          })
      });

      sessionStorage.removeItem('prefilledEmail');
      sessionStorage.removeItem('oauthState');
      sessionStorage.removeItem('fromProvider');

      window.location.href = `/register?${queryParams.toString()}`;
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const verifyOtp = async () => {
    try {
      const otpCode = otp.join("");
      const response = await axios.post(
        "http://localhost:8080/user/verify-otp",
        { email, otp: otpCode },
        { withCredentials: true }
      );

      if (response.status === 200) {
        localStorage.setItem('user', JSON.stringify(response.data));

        const sessionResponse = await fetch('http://localhost:8080/user/check-session', {
          credentials: 'include'
        });
        const sessionData = await sessionResponse.json();

        if (sessionData.isLoggedIn) {
          const pendingBooking = sessionStorage.getItem('pendingBooking');
          const returnUrl = sessionStorage.getItem('returnUrl');

          if (pendingBooking) {
            handlePendingBookingRedirect(sessionData.user);
          } else if (returnUrl) {
            sessionStorage.removeItem('returnUrl');
            window.location.href = returnUrl;
          } else if (searchParams.get('returnUrl')) {
            window.location.href = searchParams.get('returnUrl');
          } else {
            router.push('/');
          }
        } else {
          showError('Session Error', 'Login failed. Please try again.');
        }
      }
    } catch (error) {
      showError(
        'Verification Failed',
        error.response?.data?.error || "OTP Verification Failed"
      );
    }
  };

  const handleOtpVerification = async () => {
    if (!isOtpComplete) {
      showError('Incomplete OTP', 'Please enter the complete OTP before verifying.');
      return;
    }
    await verifyOtp();
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    setIsLoading(true);

    const pendingBooking = sessionStorage.getItem('pendingBooking');
    const returnUrl = searchParams.get('returnUrl');

    // Store both pending booking and returnUrl in sessionStorage
    if (pendingBooking) {
      sessionStorage.setItem('pendingBooking', pendingBooking);
    }
    if (returnUrl) {
      sessionStorage.setItem('returnUrl', returnUrl);
    } else if (pendingBooking) {
      sessionStorage.setItem('returnUrl', '/booking-summary');
    }

    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#1e1e2e] via-[#121212] to-[#000000] text-white">
      <Header />

      <section className="flex flex-grow items-center justify-center px-4">
        <div className="bg-gray-900 p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
          <h2 className="text-3xl font-bold text-center text-red-500 mb-6">
            {isOtpSent ? "Verify OTP" : "Sign In"}
          </h2>

          {showRegistrationPrompt && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
                <h3 className="text-xl font-bold text-red-500 mb-4">Account Not Found</h3>
                <p className="mb-4">
                  {sessionStorage.getItem('prefilledEmail')
                    ? `No account found for ${sessionStorage.getItem('prefilledEmail')}. Please register.`
                    : "No account found with this email. Please register."}
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowRegistrationPrompt(false)}
                    className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowRegistrationPrompt(false);
                      handleRegisterRedirect();
                    }}
                    className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
                  >
                    Register Now
                  </button>
                </div>
              </div>
            </div>
          )}

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

          {!isOtpSent && (
            <button
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className={`w-full flex items-center justify-center bg-white text-gray-900 font-semibold py-3 rounded-lg shadow-md hover:bg-gray-200 transition-all duration-300 ${
                isGoogleLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isGoogleLoading ? (
                "Processing..."
              ) : (
                <>
                  <Image
                      src="/google.png"
                      alt="Google"
                      width={20} // Explicitly set width
                      height={20} // Explicitly set height (assuming square icon)
                      className="mr-2 w-[20px] h-auto" // Keep Tailwind classes for visual size
                    />
                    Continue with Google
                  </>
              )}
            </button>
          )}

          {!isOtpSent && (
            <div className="flex items-center my-6">
              <hr className="w-full border-gray-600" />
              <span className="px-3 text-gray-400">OR</span>
              <hr className="w-full border-gray-600" />
            </div>
          )}

          {!isOtpSent ? (
            <form onSubmit={handleLogin} className="space-y-4">
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
                {isSendingOtp ? "Sending OTP..." : "Sign In"}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <p className="text-gray-400 mb-4">Enter the OTP sent to your email</p>

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

              <div className="flex justify-between gap-3">
                <button
                  disabled={!isOtpComplete}
                  onClick={handleOtpVerification}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 py-2 rounded-lg text-lg font-semibold shadow-md transition-all duration-300 hover:from-pink-500 hover:to-red-500 hover:scale-105"
                >
                  Verify OTP
                </button>
                <button
                  onClick={() => {
                    setIsOtpSent(false);
                    setOtp(["", "", "", "", "", ""]);
                  }}
                  className="w-full bg-gray-700 py-2 rounded-lg text-lg font-semibold shadow-md transition-all duration-300 hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {!isOtpSent && (
            <div className="text-center text-gray-400 mt-6">
              <a href="/forgot-password" className="hover:text-white block">
                Forgot Password?
              </a>

              <p className="mt-3">
                Don&apos;t have an account?{" "}
                <button
                  onClick={handleRegisterRedirect}
                  className="text-red-500 hover:text-white font-semibold"
                >
                  Sign Up
                </button>
              </p>
              <p className="mt-3 text-center text-gray-400">
                Are you an admin?{" "}
                <a href="/admin-login" className="text-blue-500 hover:text-white font-semibold">
                  Login as Admin
                </a>
              </p>
            </div>
          )}
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