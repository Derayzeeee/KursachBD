import React from 'react';
import { Box, Typography } from '@mui/material';

const WelcomePage = () => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '80vh' 
    }}>
      <Typography variant="h2" component="h1" gutterBottom>
        Автосервис
      </Typography>
      <Typography variant="h5" color="textSecondary">
        Система управления автосервисом
      </Typography>
    </Box>
  );
};

export default WelcomePage;