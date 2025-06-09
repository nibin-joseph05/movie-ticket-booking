'use client';
import { useState } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

export default function VerifyOTP({ email, onVerify, onResendOTP, error, isLoading }) {
  const [otp, setOtp] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Client-side OTP validation
    if (!/^\d{6}$/.test(otp)) {
      onVerify('Invalid OTP format');
      return;
    }

    onVerify(otp);
  };

  return (
    <div className="bg-[#1e1e2e]/80 backdrop-blur-sm p-8 rounded-xl border border-red-900/50 max-w-md w-full">
      <h2 className="text-2xl font-bold text-red-500 mb-4">Verify OTP</h2>
      <p className="text-gray-300 mb-6">
        We&apos;ve sent a 6-digit code to <span className="text-red-400">{email}</span>
      </p>

      {error && (
        <div className="bg-red-900/50 border-l-4 border-red-500 text-red-300 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Enter OTP
          </label>
          <input
              type="text"
              value={otp}
              onChange={(e) => {
                // Only allow numbers and limit to 6 digits
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtp(value);
              }}
              required
              pattern="\d{6}"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 text-white"
              placeholder="123456"
            />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-red-500/30 active:scale-95 disabled:opacity-50"
        >
          {isLoading ? 'Verifying...' : 'Verify Code'}
        </button>
      </form>

      <div className="mt-6 text-center text-gray-400">
        Didn&apos;t receive code?{' '}
        <button
          onClick={onResendOTP}
          className="text-red-400 hover:text-red-300 underline"
        >
          Resend OTP
        </button>
      </div>
    </div>
  );
}