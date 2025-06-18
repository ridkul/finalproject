import { useState, useEffect } from 'react';
import { Container, Typography, TextField, Grid, Box } from '@mui/material';
import ServiceList from '../components/ServiceList';
import { getServices } from '../api/serviceApi';

const ServiceListing = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getServices(category, location);
        setServices(response.data);
      } catch (err) {
        console.error('Error fetching services', err);
        setError(err.response?.data?.detail || 'Failed to load services. Please try again.');
        setServices([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchServices();
  }, [category, location]);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Available Services
      </Typography>
        <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Filter by Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Filter by Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={loading}
            />
          </Grid>
        </Grid>
      </Box>
      
      {loading ? (
        <Typography>Loading services...</Typography>
      ) : (
        <ServiceList services={services} />
      )}
    </Container>
  );
};

export default ServiceListing;