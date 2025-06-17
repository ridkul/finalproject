import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState({});
  const [activeChats, setActiveChats] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  const connectWebSocket = useCallback((token) => {
    if (socket) socket.close();
    
    const newSocket = new WebSocket(`ws://localhost:8000/api/chat/ws/${token}`);
    
    newSocket.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };
    
    newSocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => {
        const chatId = message.sender_id;
        return {
          ...prev,
          [chatId]: [...(prev[chatId] || []), message]
        };
      });
    };
    
    newSocket.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };
    
    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    setSocket(newSocket);
    return () => newSocket.close();
  }, [socket]);

  const sendMessage = useCallback((receiverId, content) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ receiver_id: receiverId, content }));
    }
  }, [socket]);

  const addActiveChat = useCallback((userId) => {
    setActiveChats(prev => [...new Set([...prev, userId])]);
  }, []);

  return (
    <WebSocketContext.Provider value={{
      socket,
      isConnected,
      connectWebSocket,
      sendMessage,
      messages,
      activeChats,
      addActiveChat
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);