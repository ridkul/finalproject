import { Card, CardContent, Typography, Button, Grid, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';

const ServiceList = ({ services, onEdit, onDelete, isProvider = false, loading = false, error = null }) => {
  if (loading) {
    return <Typography variant="body1">Loading services...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!services || services.length === 0) {
    return <Typography variant="body1">No services found</Typography>;
  }

  return (
    <Grid container spacing={3}>
      {services.map(service => (
        <Grid item xs={12} sm={6} md={4} key={service.id}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom>
                {service.title}
              </Typography>
              <Typography color="textSecondary" gutterBottom>
                {service.category}
              </Typography>
              <Typography variant="body2" paragraph sx={{ mb: 1 }}>
                {service.description.substring(0, 100)}...
              </Typography>
              <Typography variant="h6" color="primary">
                ${service.price.toFixed(2)}
              </Typography>
              <Typography variant="body2">
                Location: {service.location}
              </Typography>
            </CardContent>
            
            <CardContent>
              {isProvider ? (
                <div>
                  <IconButton onClick={() => onEdit(service)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => onDelete(service.id)}>
                    <DeleteIcon />
                  </IconButton>
                </div>
              ) : (
                <Button 
                  component={Link} 
                  to={`/services/${service.id}`}
                  variant="contained" 
                  fullWidth
                >
                  View Details
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ServiceList;