import api from './api';

export const getMessageHistory = (otherUserId) => {
  return api.get(`/chat/history/${otherUserId}`);
};

export const getChatPartners = () => {
  return api.get('/chat/partners');
};

export const sendMessage = (receiverId, content) => {
  return api.post('/chat/send', { receiver_id: receiverId, content });
};