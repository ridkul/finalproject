import { useState } from 'react';
import { Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { createPaymentOrder } from '../api/paymentApi';

const PaymentButton = ({ booking, amount }) => {
  const [loading, setLoading] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentLink, setPaymentLink] = useState('');
  const { user } = useAuth();

  const handlePayment = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await createPaymentOrder({
        booking_id: booking.id,
        amount: amount
      });
      
      setPaymentLink(response.data.payment_link);
      setPaymentDialog(true);
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openPaymentWindow = () => {
    const width = 600;
    const height = 700;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    
    window.open(
      paymentLink,
      'CashfreePayment',
      `width=${width},height=${height},top=${top},left=${left}`
    );
    
    // Listen for payment completion
    window.addEventListener('message', handlePaymentMessage);
  };

  const handlePaymentMessage = (event) => {
    if (event.origin !== window.location.origin) return;
    if (event.data.type === 'PAYMENT_COMPLETE') {
      setPaymentDialog(false);
      // Handle payment success
    }
  };

  return (
    <>
      <Button 
        variant="contained" 
        color="primary"
        onClick={handlePayment}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Pay with Cashfree'}
      </Button>

      <Dialog open={paymentDialog} onClose={() => setPaymentDialog(false)}>
        <DialogTitle>Complete Payment</DialogTitle>
        <DialogContent>
          <p>Booking #{booking.id}</p>
          <p>Amount: ₹{amount}</p>
          <p>Click below to complete payment</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={openPaymentWindow}
          >
            Proceed to Payment
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PaymentButton;