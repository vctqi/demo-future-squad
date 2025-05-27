import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Alert } from '@mui/material';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const ResetPasswordForm: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate password
    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 8) {
      newErrors.password = 'A senha deve ter pelo menos 8 caracteres';
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = 'A senha deve conter pelo menos uma letra maiúscula';
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = 'A senha deve conter pelo menos uma letra minúscula';
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = 'A senha deve conter pelo menos um número';
    } else if (!/[^A-Za-z0-9]/.test(password)) {
      newErrors.password = 'A senha deve conter pelo menos um caractere especial';
    }
    
    // Validate password confirmation
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não conferem';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    if (!token) {
      setApiError('Token inválido ou ausente');
      return;
    }
    
    setLoading(true);

    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Senha redefinida com sucesso! Faça login com sua nova senha.' } 
        });
      }, 3000);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Falha ao redefinir a senha. O token pode ser inválido ou ter expirado.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    setter(e.target.value);
    
    // Clear field-specific error when field is modified
    const field = e.target.name;
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: '',
      });
    }
  };

  if (success) {
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
          Senha Redefinida
        </Typography>
        <Alert severity="success" sx={{ mb: 3 }}>
          Sua senha foi redefinida com sucesso! Você será redirecionado para a página de login.
        </Alert>
        <Button
          component={RouterLink}
          to="/login"
          variant="contained"
          color="primary"
        >
          Ir para Login
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
        Redefinir Senha
      </Typography>
      <Typography variant="body1" gutterBottom align="center" sx={{ mb: 3 }}>
        Crie uma nova senha para sua conta.
      </Typography>

      {apiError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {apiError}
        </Alert>
      )}

      <TextField
        label="Nova Senha"
        name="password"
        type="password"
        value={password}
        onChange={(e) => handleChange(e, setPassword)}
        fullWidth
        required
        error={!!errors.password}
        helperText={errors.password}
        margin="normal"
      />

      <TextField
        label="Confirmar Nova Senha"
        name="confirmPassword"
        type="password"
        value={confirmPassword}
        onChange={(e) => handleChange(e, setConfirmPassword)}
        fullWidth
        required
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword}
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
        {loading ? 'Redefinindo...' : 'Redefinir Senha'}
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

export default ResetPasswordForm;