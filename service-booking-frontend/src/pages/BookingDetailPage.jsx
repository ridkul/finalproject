// Add to BookingDetailPage.jsx
import PaymentButton from '../components/PaymentButton';

// Inside the component return statement
{booking.status === 'pending' && (
  <Box sx={{ mt: 3, p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
    <Typography variant="h6" gutterBottom>
      Payment Required
    </Typography>
    <Typography>Amount: ₹{booking.service.price}</Typography>
    <PaymentButton booking={booking} amount={booking.service.price} />
  </Box>
)}

{booking.status === 'confirmed' && (
  <Alert severity="success" sx={{ mt: 2 }}>
    Payment successful! Booking confirmed.
  </Alert>
)}