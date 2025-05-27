import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import ResetPasswordForm from '../../components/auth/ResetPasswordForm';

const ResetPasswordPage: React.FC = () => {
  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Marketplace de Benefícios
        </Typography>
        <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary" sx={{ mb: 4 }}>
          Definir nova senha
        </Typography>

        <ResetPasswordForm />
      </Box>
    </Container>
  );
};

export default ResetPasswordPage;