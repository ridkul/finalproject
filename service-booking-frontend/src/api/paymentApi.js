export const createPaymentOrder = (data) => {
  return api.post('/payments/create-order', data);
};

export const verifyPayment = (orderId) => {
  return api.get(`/payments/verify?order_id=${orderId}`);
};