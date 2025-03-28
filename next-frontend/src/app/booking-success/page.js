'use client'; // Mark this as a Client Component

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

export default function BookingSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('orderId');

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <svg
          className="mx-auto h-12 w-12 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <h1 className="text-2xl font-bold text-gray-800 mt-4">Booking Confirmed!</h1>
        <p className="text-gray-600 mt-2">Your booking ID: {bookingId}</p>
        <p className="text-gray-600 mt-2">
          We've sent the details to your email.
        </p>
        <button
          onClick={() => router.push('/')}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}