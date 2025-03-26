import { useRouter } from 'next/router';

export default function BookingSuccess() {
  const router = useRouter();
  const { bookingId } = router.query;

  return (
    <div className="success-container">
      <h1>Booking Confirmed!</h1>
      <p>Your booking ID: {bookingId}</p>
      <p>We've sent the details to your email.</p>
      <button onClick={() => router.push('/')}>Back to Home</button>
    </div>
  );
}