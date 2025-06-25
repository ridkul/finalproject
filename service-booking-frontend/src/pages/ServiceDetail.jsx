import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Container, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { getService } from '../api/serviceApi';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const ServiceDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const response = await getService(id);
        setService(response.data);
      } catch (err) {
        setError('Service not found');
      } finally {
        setLoading(false);
      }
    };
    
    fetchService();
  }, [id]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Container>
      <Typography variant="h3" gutterBottom>
        {service.title}
      </Typography>
      
      <Typography variant="h5" color="primary" gutterBottom>
        ${service.price.toFixed(2)}
      </Typography>
      
      <Typography variant="subtitle1" gutterBottom>
        Category: {service.category} | Location: {service.location}
      </Typography>
      
      <Typography variant="body1" paragraph sx={{ my: 3 }}>
        {service.description}
      </Typography>
        <Button 
          component={Link}
          to={`/booking/${service.id}`}
          variant="contained" 
          color="primary" 
          size="large"
        >
        Book This Service
      </Button>

      {user && user.role === 'user' && (
        <Button 
          component={Link} 
          to={`/chat/${service.provider_id}`}
          variant="contained" 
          color="secondary"
          sx={{ mt: 2, mr: 2 }}
        >
          Message Provider
        </Button>
      )}
    </Container>
  );
};

export default ServiceDetail;