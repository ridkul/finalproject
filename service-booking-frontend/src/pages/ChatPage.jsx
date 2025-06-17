import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWebSocket } from '../context/WebSocketContext';
import { useAuth } from '../context/AuthContext';
import { getMessageHistory } from '../api/chatApi';
import { Box, TextField, Button, Avatar, Typography, List, ListItem, ListItemText, ListItemAvatar, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const ChatPage = () => {
  const { otherUserId } = useParams();
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { sendMessage, messages, addActiveChat } = useWebSocket();
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!otherUserId || !user) return;
    
    const fetchChatHistory = async () => {
      try {
        const response = await getMessageHistory(otherUserId);
        setChatHistory(response.data);
        addActiveChat(parseInt(otherUserId));
      } catch (error) {
        console.error('Failed to load chat history', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChatHistory();
  }, [otherUserId, user, addActiveChat]);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, messages]);

  useEffect(() => {
    if (otherUserId && messages[otherUserId]) {
      setChatHistory(prev => [...prev, ...messages[otherUserId]]);
      // Clear messages for this chat after adding to history
      setMessages(prev => ({ ...prev, [otherUserId]: [] }));
    }
  }, [messages, otherUserId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    sendMessage(parseInt(otherUserId), message);
    setMessage('');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <Box sx={{ display: 'flex', height: '85vh' }}>
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, bgcolor: '#f9f9f9' }}>
          {loading ? (
            <Typography>Loading messages...</Typography>
          ) : (
            <List>
              {chatHistory.map((msg, index) => (
                <ListItem 
                  key={index} 
                  sx={{ 
                    justifyContent: msg.sender_id === user.id ? 'flex-end' : 'flex-start',
                    alignItems: 'flex-end'
                  }}
                >
                  {msg.sender_id !== user.id && (
                    <ListItemAvatar>
                      <Avatar alt={msg.sender_name} />
                    </ListItemAvatar>
                  )}
                  <ListItemText
                    primary={msg.content}
                    secondary={new Date(msg.timestamp).toLocaleTimeString()}
                    sx={{
                      bgcolor: msg.sender_id === user.id ? '#e3f2fd' : '#f5f5f5',
                      borderRadius: 2,
                      p: 1.5,
                      maxWidth: '70%',
                      textAlign: msg.sender_id === user.id ? 'right' : 'left'
                    }}
                  />
                </ListItem>
              ))}
              <div ref={messagesEndRef} />
            </List>
          )}
        </Box>
        
        <Box 
          component="form" 
          onSubmit={handleSubmit} 
          sx={{ 
            display: 'flex', 
            p: 2, 
            borderTop: '1px solid #eee',
            bgcolor: 'background.paper'
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{ mr: 1 }}
          />
          <IconButton 
            type="submit" 
            color="primary" 
            disabled={!message.trim()}
            sx={{ alignSelf: 'center' }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatPage;