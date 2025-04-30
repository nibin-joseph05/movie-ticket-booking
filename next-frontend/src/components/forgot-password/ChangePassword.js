'use client';
import { useState } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

export default function ChangePassword({ onSubmit, error, success, isLoading }) {
  const [password, setPassword] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = (e) => {
      e.preventDefault();

      // Additional client-side validation
      if (password.newPassword.length < 8) {
        onSubmit(null, null, 'Password must be at least 8 characters');
        return;
      }

      onSubmit(password.newPassword, password.confirmPassword);
    };

  return (
    <div className="bg-[#1e1e2e]/80 backdrop-blur-sm p-8 rounded-xl border border-red-900/50 max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-500 mb-6">Set New Password</h2>

      {error && (
        <div className="bg-red-900/50 border-l-4 border-red-500 text-red-300 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-900/50 border-l-4 border-green-500 text-green-300 p-4 rounded-lg mb-6">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          New Password (min 8 characters)
        </label>
        <input
          type="password"
          value={password.newPassword}
          onChange={(e) => setPassword(p => ({ ...p, newPassword: e.target.value }))}
          required
          minLength="8"
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 text-white"
        />
      </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            value={password.confirmPassword}
            onChange={(e) => setPassword(p => ({ ...p, confirmPassword: e.target.value }))}
            required
            minLength="8"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 text-white"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-red-500/30 active:scale-95 disabled:opacity-50"
        >
          {isLoading ? 'Updating...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}