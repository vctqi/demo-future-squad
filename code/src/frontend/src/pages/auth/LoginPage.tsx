import React from 'react';
import { Container, Paper, Typography, Box } from '@mui/material';
import { useLocation } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';

const LoginPage: React.FC = () => {
  const location = useLocation();
  const message = location.state?.message;

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Marketplace de Benefícios
        </Typography>
        <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary" sx={{ mb: 4 }}>
          Acesse sua conta para gerenciar seus serviços
        </Typography>

        {message && (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              mb: 3, 
              backgroundColor: 'success.light', 
              color: 'success.contrastText' 
            }}
          >
            <Typography variant="body1">{message}</Typography>
          </Paper>
        )}

        <LoginForm />
      </Box>
    </Container>
  );
};

export default LoginPage;