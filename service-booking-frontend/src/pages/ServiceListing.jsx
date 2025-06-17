import { useState, useEffect } from 'react';
import { Container, Typography, TextField, Grid, Box } from '@mui/material';
import ServiceList from '../components/ServiceList';
import { getServices } from '../api/serviceApi';

const ServiceListing = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await getServices(category, location);
        setServices(response.data);
      } catch (err) {
        console.error('Error fetching services', err);
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
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Filter by Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
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