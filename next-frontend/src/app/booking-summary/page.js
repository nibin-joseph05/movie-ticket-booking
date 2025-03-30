"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import BookingDetails from "@/components/BookingDetails";
import FoodSelection from "@/components/FoodSelection";

export default function BookingSummaryPage() {
  const searchParams = useSearchParams();

  // Extract URL parameters
  const movieId = searchParams.get("movie");
  const theaterId = searchParams.get("theater");
  const showtime = searchParams.get("showtime");
  const category = searchParams.get("category");
  const seats = searchParams.get("seats")?.split(",") || [];
  const price = parseFloat(searchParams.get("price")) || 0;
  const date = searchParams.get("date");
  const router = useRouter();

  // State for booking details
  const [bookingDetails, setBookingDetails] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [selectedFood, setSelectedFood] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);

  // Fetch movie and theater details
  useEffect(() => {

    if (initialLoad) {
        const foodParam = searchParams.get("food");
        if (foodParam) {
          try {
            const decodedFood = JSON.parse(decodeURIComponent(foodParam));
            setSelectedFood(decodedFood);
          } catch (error) {
            console.error("Error parsing food items:", error);
          }
        }
        setInitialLoad(false);
      }

    const foodParam = searchParams.get("food");
      if (foodParam && (initialLoad || !isLoggedIn)) {
        try {
          const decodedFood = JSON.parse(decodeURIComponent(foodParam));
          setSelectedFood(decodedFood);
        } catch (error) {
          console.error("Error parsing food items:", error);
        }
        if (initialLoad) setInitialLoad(false);
      }

      const fetchData = async () => {
        try {
          const [detailsResponse, foodResponse] = await Promise.all([
            fetch(`http://localhost:8080/booking/details?movieId=${movieId}&theaterId=${theaterId}`),
            fetch(`http://localhost:8080/api/food/items`)
          ]);

          if (!detailsResponse.ok) throw new Error("Failed to fetch booking details.");
          if (!foodResponse.ok) throw new Error("Failed to fetch food options.");

          const detailsData = await detailsResponse.json();
          const foodData = await foodResponse.json();

          setBookingDetails(detailsData);
          setFoodItems(foodData);
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };

    fetchData();
  }, [movieId, theaterId, initialLoad, isLoggedIn]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
      const checkLoginStatus = async () => {
        try {
          const response = await fetch('http://localhost:8080/user/check-session', {
            credentials: 'include'
          });

          if (!response.ok) throw new Error("Session check failed");

          const data = await response.json();
          setIsLoggedIn(data.isLoggedIn);

          if (data.isLoggedIn) {
            setUser(data.user);
            // Store user email in localStorage for easy access
            localStorage.setItem('userEmail', data.user.email);
          } else {
            // Clear any existing user data if not logged in
            localStorage.removeItem('userEmail');
          }
        } catch (error) {
          console.error('Error checking login status:', error);
          setIsLoggedIn(false);
          setUser(null);
        }
      };
      checkLoginStatus();
  }, []);


  // Handle back button click
  const handleBack = () => {
    // Preserve all selections when going back
    const params = new URLSearchParams({
      movie: movieId,
      theater: theaterId,
      date,
      showtime,
      category,
      seats: seats.join(','),
      price: price.toFixed(2),
      food: JSON.stringify(selectedFood)
    });

    router.push(`/showtimes?${params.toString()}`);
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    const basePrice = parseFloat(searchParams.get("price")) || 0;

    const foodTotal = selectedFood.reduce((sum, item) => {
      // Ensure both price and quantity are properly parsed as numbers
      const itemPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
      const itemQuantity = typeof item.quantity === 'string' ? parseInt(item.quantity) : item.quantity;

      return sum + (itemPrice * itemQuantity);
    }, 0);

    // Return with exactly 2 decimal places
    return parseFloat((basePrice + foodTotal).toFixed(2));
  };

  // Handle proceed to payment
  const handleProceedToPayment = async () => {
    try {
      // 1. Check login status
      const sessionCheck = await fetch('http://localhost:8080/user/check-session', {
        credentials: 'include'
      });
      const sessionData = await sessionCheck.json();

      if (!sessionData.isLoggedIn) {
        const shouldLogin = window.confirm(
          "You need to login to complete your booking. Do you want to proceed to login page?"
        );

        if (shouldLogin) {
          sessionStorage.setItem('pendingBooking', JSON.stringify({
            movieId,
            theaterId,
            showtime,
            category,
            seats,
            price: price,
            date,
            food: selectedFood
          }));

          window.location.href = `/login?returnUrl=${encodeURIComponent('/booking-summary?' + new URLSearchParams({
            movie: movieId,
            theater: theaterId,
            showtime,
            category,
            seats: seats.join(','),
            price: price.toFixed(2),
            date,
            food: JSON.stringify(selectedFood)
          }).toString())}`;
        }
        return;
      }

          setLoading(true);

          // Check if Razorpay is already loaded
          if (!window.Razorpay) {
            // If not loaded, wait a bit and check again
            await new Promise(resolve => setTimeout(resolve, 500));
            if (!window.Razorpay) {
              throw new Error('Payment gateway is taking longer than usual to load');
            }
          }

      // 2. Show payment confirmation
      const shouldProceed = window.confirm(
        `Total Amount: ${calculateTotalPrice().toFixed(2)} Rs\nDo you want to proceed with payment?`
      );
      if (!shouldProceed) return;

      // 3. Create Razorpay order
      const orderResponse = await fetch('http://localhost:8080/api/payments/create-order', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: calculateTotalPrice() ,
          receipt: `booking_${Date.now()}`,
          notes: {
            userId: sessionData.user.email,
            movieId,
            theaterId,
            showtime,
            category,
            seats: seats.join(','),
            date,
            foodItems: JSON.stringify(selectedFood)
          }
        })
      });

      if (!orderResponse.ok) throw new Error("Failed to create payment order");
      const orderData = await orderResponse.json();

      // 4. Load Razorpay script dynamically
      const loadScript = (src) => {
        return new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = src;
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const isRazorpayLoaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!isRazorpayLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // 5. Initialize Razorpay payment
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "MovieFlix",
        description: "Movie Ticket Booking",
        order_id: orderData.id,
        handler: async function(response) {
          try {
            console.log("Payment successful, verifying...", {
              seats: seats // Debug log
            });

            const verificationResponse = await fetch('http://localhost:8080/api/payments/verify-payment', {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                seats: seats.join(','),
                foodItems: selectedFood.length > 0 ? JSON.stringify(selectedFood) : null,
                // Add these additional parameters
                showtime: showtime,
                date: date,
                category: category,
                movieId: movieId,
                theaterId: theaterId,
                amount: calculateTotalPrice(),
                userEmail: user.email
              })
            });

            const verificationData = await verificationResponse.json();
            if (verificationData.status === 'success') {
              window.location.href = `/booking-success?bookingId=${verificationData.bookingId}`;
            } else {
              setError('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error("Verification error:", error);
            setError('Error verifying payment: ' + error.message);
          }
        },
        prefill: {
          name: sessionData.user.name || '',
          email: sessionData.user.email || '',
          contact: sessionData.user.phone || ''
        },
        theme: {
          color: "#F37254"
        },
        modal: {
          ondismiss: function() {
            setError('Payment was cancelled. Please try again.');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      setError(error.message);
      console.error("Payment error:", error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0d0d12] to-[#000000] text-white flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-transparent border-t-red-500 border-r-red-500 rounded-full"
          />
          <motion.p
            className="mt-6 text-gray-300 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Preparing your cinematic experience...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0d0d12] to-[#000000] text-white flex items-center justify-center">
        <motion.div
          className="text-center max-w-md p-8 rounded-xl bg-[#1a1a24]/80 backdrop-blur-sm border border-[#2a2a3a] shadow-2xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-red-400 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <motion.button
            onClick={handleBack}
            className="px-8 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Return to Showtimes</span>
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0d0d12] to-[#000000] text-white p-4 md:p-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-red-500/10"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, (Math.random() - 0.5) * 100],
              y: [0, (Math.random() - 0.5) * 100],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      {/* Header Section */}
      <div className="absolute top-6 left-6 right-6 z-10 flex items-center justify-between">
        {/* Back Button */}
        <motion.button
          onClick={handleBack}
          className="group"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
            <div className="w-10 h-10 rounded-full bg-[#1a1a24]/80 backdrop-blur-sm border border-[#2a2a3a] flex items-center justify-center group-hover:bg-red-600/20 group-hover:border-red-500 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-medium hidden md:inline">Back to Showtimes</span>
          </div>
        </motion.button>

        {/* Movie and Theater Info */}
        <motion.div
          className="text-center mx-4 flex-1 max-w-xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <motion.h1
            className="text-xl md:text-2xl font-bold text-white truncate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {bookingDetails?.movie?.name || "Unknown Movie"}
          </motion.h1>
          <motion.p
            className="text-sm text-gray-400 truncate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {bookingDetails?.theater?.name || "Unknown Theatre"} • {date}, {showtime}
          </motion.p>
        </motion.div>

        {/* Proceed to Payment Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <motion.button
            onClick={handleProceedToPayment}
            className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-3 relative group overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Animated background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-red-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity"
              initial={{ x: -100 }}
              animate={{ x: 1000 }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            {/* Button content */}
            <div className="relative z-10 flex items-center space-x-2">
              <span className="font-semibold text-lg">Proceed to Payment</span>
              <span className="text-xl font-bold bg-white/10 px-2 py-1 rounded">
                {calculateTotalPrice().toFixed(2)} Rs
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </motion.button>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto pt-24 md:pt-28 relative z-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-[#1a1a24]/80 backdrop-blur-lg rounded-xl p-6 shadow-2xl border border-[#2a2a3a]"
        >
          <motion.h1
            className="text-3xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-red-500"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            Complete Your Booking
          </motion.h1>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Food Selection - Left Side */}
            <div className="lg:w-[58%]">
              <FoodSelection
                selectedFood={selectedFood}
                setSelectedFood={setSelectedFood}
                foodItems={foodItems}
                setFoodItems={setFoodItems}
              />
            </div>

            {/* Booking Details - Right Side */}
            <div className="lg:w-[42%]">
              <BookingDetails
                bookingDetails={bookingDetails}
                category={category}
                date={date}
                showtime={showtime}
                seats={seats}
                price={price}
                selectedFood={selectedFood}
                calculateTotalPrice={calculateTotalPrice}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}