'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { FiAlertTriangle } from 'react-icons/fi';
import VerifyOTP from '@/components/forgot-password/VerifyOTP';
import ChangePassword from '@/components/forgot-password/ChangePassword';

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Replace with your API endpoint
      await axios.post('https://movie-ticket-booking-583u.onrender.com/user/forgot-password', { email });
      setStep('otp');
      setSuccess('OTP sent to your email!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (otp) => {
    setIsLoading(true);
    setError('');

    try {
      // Replace with your API endpoint
      await axios.post('https://movie-ticket-booking-583u.onrender.com/user/verify-reset-otp', { email, otp });
      setStep('password');
      setSuccess('OTP verified successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setError('');

    try {
      await axios.post('https://movie-ticket-booking-583u.onrender.com/user/resend-otp', {
        email,
        purpose: "PASSWORD_RESET"
      });
      setSuccess('New OTP sent!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (newPassword, confirmPassword) => {
    setIsLoading(true);
    setError('');

    try {
      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      await axios.post('https://movie-ticket-booking-583u.onrender.com/user/reset-password', {
        email,
        newPassword,
        confirmPassword
      });

      setSuccess('Password reset successfully!');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Password reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1e1e2e] via-[#121212] to-[#000000] text-white flex flex-col">
      <Header />
      <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
        {step === 'email' && (
          <div className="bg-[#1e1e2e]/80 backdrop-blur-sm p-8 rounded-xl border border-red-900/50 max-w-md w-full">
            <h2 className="text-2xl font-bold text-red-500 mb-6">Forgot Password</h2>

            {error && (
              <div className="bg-red-900/50 border-l-4 border-red-500 text-red-300 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 text-white"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-red-500/30 active:scale-95 disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>

            <div className="mt-6 text-gray-400">
              Remember your password?{' '}
              <Link href="/login" className="text-red-400 hover:text-red-300 underline">
                Login here
              </Link>
            </div>
          </div>
        )}

        {step === 'otp' && (
          <VerifyOTP
            email={email}
            onVerify={handleVerifyOTP}
            onResendOTP={handleResendOTP}
            error={error}
            isLoading={isLoading}
          />
        )}

        {step === 'password' && (
          <ChangePassword
            onSubmit={handlePasswordReset}
            error={error}
            success={success}
            isLoading={isLoading}
          />
        )}
      </div>
      <Footer />
    </div>
  );
}