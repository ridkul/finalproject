import { useState } from 'react';
import { Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { createPaymentOrder } from '../api/paymentApi';
import { useAuth } from '../context/AuthContext';

const PaymentButton = ({ booking, amount }) => {
  const [loading, setLoading] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [order, setOrder] = useState(null);
  const { user } = useAuth();

  const handlePayment = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await createPaymentOrder({
        booking_id: booking.id,
        amount: amount
      });
      
      setOrder(response.data);
      setPaymentDialog(true);
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  const initRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const openRazorpay = async () => {
    const isLoaded = await initRazorpay();
    if (!isLoaded) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }

    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID,
      amount: order.amount * 100,
      currency: order.currency,
      name: 'Service Booking Platform',
      description: `Payment for Booking #${booking.id}`,
      image: '/logo.png',
      order_id: order.razorpay_order_id,
      handler: async function(response) {
        try {
          // Verify payment on backend
          await verifyPayment(response.razorpay_payment_id, response.razorpay_signature);
          setPaymentDialog(false);
          alert('Payment successful! Booking confirmed.');
        } catch (error) {
          console.error('Payment verification failed:', error);
          alert('Payment verification failed. Please contact support.');
        }
      },
      prefill: {
        name: user.name,
        email: user.email,
      },
      theme: {
        color: '#3399cc'
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <>
      <Button 
        variant="contained" 
        color="primary"
        onClick={handlePayment}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Pay Now'}
      </Button>

      <Dialog open={paymentDialog} onClose={() => setPaymentDialog(false)}>
        <DialogTitle>Confirm Payment</DialogTitle>
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
            onClick={openRazorpay}
          >
            Proceed to Payment
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PaymentButton;