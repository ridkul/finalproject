import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Typography, CircularProgress, Alert } from '@mui/material';
import { verifyPayment } from '../api/paymentApi';

const PaymentCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const bookingId = params.get('booking_id');
    const orderId = params.get('order_id');
    
    if (!bookingId || !orderId) {
      setStatus('error');
      setError('Invalid payment callback');
      return;
    }
    
    const verify = async () => {
      try {
        const response = await verifyPayment(orderId);
        
        // Notify parent window
        window.opener.postMessage({
          type: 'PAYMENT_COMPLETE',
          status: 'success',
          bookingId
        }, window.location.origin);
        
        setStatus('success');
        
        // Close after delay
        setTimeout(() => window.close(), 3000);
      } catch (err) {
        setStatus('error');
        setError('Payment verification failed');
        console.error(err);
      }
    };
    
    verify();
  }, [location]);

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        {status === 'processing' && (
          <>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h5">Verifying your payment...</Typography>
          </>
        )}
        
        {status === 'success' && (
          <Alert severity="success" icon={false} sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 1 }}>Payment Successful!</Typography>
            <Typography>Your booking is now confirmed.</Typography>
            <Typography>This window will close automatically.</Typography>
          </Alert>
        )}
        
        {status === 'error' && (
          <Alert severity="error" icon={false} sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 1 }}>Payment Failed</Typography>
            <Typography>{error}</Typography>
            <Button 
              variant="contained" 
              sx={{ mt: 2 }}
              onClick={() => window.close()}
            >
              Close Window
            </Button>
          </Alert>
        )}
      </Box>
    </Container>
  );
};

export default PaymentCallback;