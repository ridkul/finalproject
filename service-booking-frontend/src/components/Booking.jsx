import { useState } from 'react';
import { TextField, Button, Grid, Box, Typography } from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';

const BookingForm = ({ service, onSubmit }) => {
  const [bookingDate, setBookingDate] = useState(null);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!bookingDate) {
      alert('Please select a date and time');
      return;
    }
    
    onSubmit({
      service_id: service.id,
      booking_date: bookingDate.toISOString(),
      booking_time: format(bookingDate, 'HH:mm'),
      notes
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Book This Service
      </Typography>
      
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DateTimePicker
          label="Select Date & Time"
          value={bookingDate}
          onChange={setBookingDate}
          renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
        />
      </LocalizationProvider>
      
      <TextField
        fullWidth
        label="Additional Notes"
        multiline
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        sx={{ mb: 2 }}
      />
      
      <Button type="submit" variant="contained" color="primary">
        Confirm Booking
      </Button>
    </Box>
  );
};

export default BookingForm;