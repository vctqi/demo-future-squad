import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import RegisterForm from '../../components/auth/RegisterForm';

const RegisterPage: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Marketplace de Benefícios
        </Typography>
        <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary" sx={{ mb: 4 }}>
          Crie sua conta para acessar o marketplace
        </Typography>

        <RegisterForm />
      </Box>
    </Container>
  );
};

export default RegisterPage;