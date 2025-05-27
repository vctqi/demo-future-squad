import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Grid, 
  Typography, 
  Box, 
  Alert, 
  Paper,
  Divider,
  CircularProgress,
  Chip
} from '@mui/material';
import supplierService from '../../services/supplierService';

// CNPJ mask function
const formatCNPJ = (value: string): string => {
  const cnpj = value.replace(/\D/g, '');
  if (cnpj.length <= 2) return cnpj;
  if (cnpj.length <= 5) return `${cnpj.slice(0, 2)}.${cnpj.slice(2)}`;
  if (cnpj.length <= 8) return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5)}`;
  if (cnpj.length <= 12) return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8)}`;
  return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12, 14)}`;
};

const SupplierProfile: React.FC = () => {
  const [formData, setFormData] = useState({
    id: '',
    companyName: '',
    cnpj: '',
    description: '',
    website: '',
    status: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  
  useEffect(() => {
    const fetchSupplierProfile = async () => {
      try {
        setFetchLoading(true);
        const profile = await supplierService.getSupplierProfile();
        
        setFormData({
          id: profile.id,
          companyName: profile.companyName,
          cnpj: formatCNPJ(profile.cnpj),
          description: profile.description,
          website: profile.website || '',
          status: profile.status,
        });
      } catch (err: any) {
        setApiError(err.response?.data?.message || 'Falha ao carregar perfil de fornecedor.');
      } finally {
        setFetchLoading(false);
      }
    };
    
    fetchSupplierProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Handle CNPJ formatting
    if (name === 'cnpj') {
      setFormData({
        ...formData,
        [name]: formatCNPJ(value),
      });
      return;
    }
    
    // Handle other inputs
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear field-specific error when field is modified
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate company name
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Nome da empresa é obrigatório';
    } else if (formData.companyName.length < 3) {
      newErrors.companyName = 'Nome da empresa deve ter pelo menos 3 caracteres';
    }
    
    // Validate CNPJ
    if (!formData.cnpj.trim()) {
      newErrors.cnpj = 'CNPJ é obrigatório';
    } else {
      const cnpj = formData.cnpj.replace(/\D/g, '');
      if (cnpj.length !== 14) {
        newErrors.cnpj = 'CNPJ deve ter 14 dígitos';
      }
    }
    
    // Validate description
    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Descrição deve ter pelo menos 10 caracteres';
    }
    
    // Validate website (optional)
    if (formData.website && !formData.website.startsWith('http')) {
      newErrors.website = 'Website deve começar com http:// ou https://';
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
    
    setLoading(true);

    try {
      await supplierService.updateSupplierProfile({
        companyName: formData.companyName,
        cnpj: formData.cnpj,
        description: formData.description,
        website: formData.website,
      });
      
      setSuccess(true);
      setEditing(false);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Falha ao atualizar perfil de fornecedor.');
      
      // Set field-specific errors if available
      if (err.response?.data?.errors) {
        const fieldErrors: Record<string, string> = {};
        err.response.data.errors.forEach((error: any) => {
          fieldErrors[error.path[0]] = error.message;
        });
        setErrors(fieldErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status: string) => {
    let color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" = "default";
    let label = status;
    
    switch (status) {
      case 'ACTIVE':
        color = 'success';
        label = 'Ativo';
        break;
      case 'PENDING':
        color = 'warning';
        label = 'Pendente de Aprovação';
        break;
      case 'REJECTED':
        color = 'error';
        label = 'Rejeitado';
        break;
      case 'INACTIVE':
        color = 'error';
        label = 'Inativo';
        break;
    }
    
    return <Chip label={label} color={color} />;
  };

  if (fetchLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          Perfil de Fornecedor
        </Typography>
        
        {getStatusChip(formData.status)}
      </Box>
      
      {formData.status === 'PENDING' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Seu cadastro de fornecedor está pendente de aprovação. Você será notificado quando for aprovado.
        </Alert>
      )}
      
      {formData.status === 'REJECTED' && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Seu cadastro de fornecedor foi rejeitado. Entre em contato com o suporte para mais informações.
        </Alert>
      )}
      
      {apiError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {apiError}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Perfil de fornecedor atualizado com sucesso!
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Nome da Empresa"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.companyName}
              helperText={errors.companyName}
              disabled={!editing}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="CNPJ"
              name="cnpj"
              value={formData.cnpj}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.cnpj}
              helperText={errors.cnpj}
              InputProps={{
                inputProps: { maxLength: 18 }
              }}
              disabled={!editing}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Descrição da Empresa"
              name="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              required
              multiline
              rows={4}
              error={!!errors.description}
              helperText={errors.description}
              disabled={!editing}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              fullWidth
              error={!!errors.website}
              helperText={errors.website}
              disabled={!editing}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            
            {editing ? (
              <Box display="flex" justifyContent="space-between">
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setEditing(false)}
                >
                  Cancelar
                </Button>
                
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </Box>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setEditing(true)}
                fullWidth
                disabled={formData.status === 'REJECTED'}
              >
                Editar Perfil
              </Button>
            )}
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default SupplierProfile;