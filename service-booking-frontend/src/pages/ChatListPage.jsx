import { Container, Typography } from '@mui/material';
import ChatList from '../components/ChatList';
import { useAuth } from '../context/AuthContext';

const ChatListPage = () => {
  const { user } = useAuth();

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
        Your Conversations
      </Typography>
      {user ? <ChatList /> : <Typography>Please login to view your chats</Typography>}
    </Container>
  );
};

export default ChatListPage;