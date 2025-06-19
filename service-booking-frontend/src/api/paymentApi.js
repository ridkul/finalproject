import api from './api';

export const createPaymentOrder = (data) => {
  return api.post('/payments/create-order', data);
};

export const verifyPayment = (paymentId, signature) => {
  return api.post('/payments/verify', { payment_id: paymentId, signature });
};