import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';
import PaymentButton from '../components/PaymentButton';

const BookingDetailPage = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // TODO: Replace with real API call
    // Simulate loading booking data
    setTimeout(() => {
      // Mock booking object
      setBooking({
        id,
        status: 'pending', // or 'confirmed'
        service: { price: 1000 }
      });
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!booking) return <Alert severity="error">Booking not found</Alert>;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Booking #{booking.id}</Typography>
      {booking.status === 'pending' && (
        <Box sx={{ mt: 3, p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>Payment Required</Typography>
          <Typography>Amount: ₹{booking.service.price}</Typography>
          <PaymentButton booking={booking} amount={booking.service.price} />
        </Box>
      )}
      {booking.status === 'confirmed' && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Payment successful! Booking confirmed.
        </Alert>
      )}
    </Box>
  );
};

export default BookingDetailPage;