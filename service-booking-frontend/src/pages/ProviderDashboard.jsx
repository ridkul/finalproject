import { useState, useEffect } from 'react';
import { Container, Typography, Button, CircularProgress, Alert } from '@mui/material';
import ServiceForm from '../components/ServiceForm';
import ServiceList from '../components/ServiceList';
import { getMyServices, createService, updateService, deleteService } from '../api/serviceApi';
import { useAuth } from '../context/AuthContext';

const ProviderDashboard = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingService, setEditingService] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role === 'provider') {
      loadServices();
    }
  }, [user]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await getMyServices();
      setServices(response.data);
    } catch (err) {
      setError('Failed to load services');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (service) => {
    try {
      const response = await createService(service);
      setServices([...services, response.data]);
      return true;
    } catch (err) {
      setError('Failed to create service');
      console.error(err);
      return false;
    }
  };

  const handleUpdate = async (id, service) => {
    try {
      const response = await updateService(id, service);
      setServices(services.map(s => s.id === id ? response.data : s));
      setEditingService(null);
      return true;
    } catch (err) {
      setError('Failed to update service');
      console.error(err);
      return false;
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteService(id);
      setServices(services.filter(s => s.id !== id));
    } catch (err) {
      setError('Failed to delete service');
      console.error(err);
    }
  };

  if (!user || user.role !== 'provider') {
    return (
      <Container>
        <Typography variant="h5" color="error">
          Only providers can access this page.
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        My Services
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {editingService ? (
        <ServiceForm 
          service={editingService}
          onSubmit={(data) => handleUpdate(editingService.id, data)}
          onCancel={() => setEditingService(null)}
        />
      ) : (
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => setEditingService({})}
          sx={{ mb: 3 }}
        >
          Add New Service
        </Button>
      )}
      
      {loading ? (
        <CircularProgress />
      ) : (
        <ServiceList 
          services={services} 
          onEdit={setEditingService} 
          onDelete={handleDelete}
          isProvider
        />
      )}
    </Container>
  );
};

export default ProviderDashboard;