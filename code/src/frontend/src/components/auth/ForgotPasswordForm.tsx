import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Alert } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import authService from '../../services/authService';

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError('Ocorreu um erro ao processar sua solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Box
        sx={{
          maxWidth: 400,
          mx: 'auto',
          p: 3,
          borderRadius: 2,
          boxShadow: 3,
          bgcolor: 'background.paper',
          textAlign: 'center',
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom>
          Email Enviado
        </Typography>
        <Alert severity="success" sx={{ mb: 3 }}>
          Se o email fornecido estiver cadastrado em nosso sistema, você receberá as instruções para redefinir sua senha.
        </Alert>
        <Button
          component={RouterLink}
          to="/login"
          variant="contained"
          color="primary"
        >
          Voltar para Login
        </Button>
      </Box>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 400,
        mx: 'auto',
        p: 3,
        borderRadius: 2,
        boxShadow: 3,
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="h5" component="h1" gutterBottom align="center">
        Recuperação de Senha
      </Typography>
      <Typography variant="body1" gutterBottom align="center" sx={{ mb: 3 }}>
        Informe seu email para receber instruções de recuperação de senha.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        required
        margin="normal"
      />

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        size="large"
        disabled={loading}
        sx={{ mt: 3, mb: 2 }}
      >
        {loading ? 'Enviando...' : 'Enviar'}
      </Button>

      <Box textAlign="center">
        <Button
          component={RouterLink}
          to="/login"
          variant="text"
        >
          Voltar para Login
        </Button>
      </Box>
    </Box>
  );
};

export default ForgotPasswordForm;