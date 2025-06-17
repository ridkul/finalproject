import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  List, ListItem, ListItemAvatar, Avatar, ListItemText, 
  Typography, Badge, CircularProgress 
} from '@mui/material';
import { getChatPartners } from '../api/chatApi';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { activeChats } = useWebSocket();

  useEffect(() => {
    if (!user) return;
    
    const fetchChatPartners = async () => {
      try {
        const response = await getChatPartners();
        setChats(response.data);
      } catch (error) {
        console.error('Failed to fetch chat partners', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChatPartners();
  }, [user]);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {chats.length === 0 ? (
        <Typography sx={{ p: 2 }}>No recent chats</Typography>
      ) : (
        chats.map(partner => (
          <ListItem 
            key={partner.id} 
            button 
            component={Link} 
            to={`/chat/${partner.id}`}
            sx={{ borderBottom: '1px solid #eee' }}
          >
            <ListItemAvatar>
              <Badge 
                color="primary" 
                variant="dot" 
                invisible={!activeChats.includes(partner.id)}
              >
                <Avatar alt={partner.name} />
              </Badge>
            </ListItemAvatar>
            <ListItemText
              primary={partner.name}
              secondary={partner.role === 'provider' ? 'Service Provider' : 'User'}
            />
          </ListItem>
        ))
      )}
    </List>
  );
};

export default ChatList;