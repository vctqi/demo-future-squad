import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Grid, 
  Typography, 
  Box, 
  Alert, 
  FormControlLabel,
  Checkbox,
  InputAdornment,
  Paper,
  Link,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import supplierService from '../../services/supplierService';
import FileUpload from '../common/FileUpload';

// CNPJ mask function
const formatCNPJ = (value: string): string => {
  const cnpj = value.replace(/\D/g, '');
  if (cnpj.length <= 2) return cnpj;
  if (cnpj.length <= 5) return `${cnpj.slice(0, 2)}.${cnpj.slice(2)}`;
  if (cnpj.length <= 8) return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5)}`;
  if (cnpj.length <= 12) return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8)}`;
  return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12, 14)}`;
};

const SupplierRegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    cnpj: '',
    description: '',
    website: '',
    phone: '',
    termsAccepted: false,
  });
  
  const [documents, setDocuments] = useState<File[]>([]);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    // Handle checkbox
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked,
      });
      return;
    }
    
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
    
    // Validate terms
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'Você deve aceitar os termos de serviço';
    }
    
    // Validate documents
    if (documents.length === 0) {
      newErrors.documents = 'Você deve enviar pelo menos um documento comprobatório';
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
      // For the actual implementation, we would use FormData to send files
      // For MVP, we'll just log the documents that would be uploaded
      console.log('Documents to upload:', documents);
      
      // Create a new object that includes document info for the API
      const supplierData = {
        ...formData,
        documents: documents.map(doc => ({
          name: doc.name,
          size: doc.size,
          type: doc.type
        }))
      };
      
      await supplierService.registerSupplier(supplierData);
      setSuccess(true);
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Falha ao cadastrar fornecedor. Tente novamente.');
      
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

  if (success) {
    return (
      <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert severity="success" sx={{ mb: 2 }}>
          Seu cadastro de fornecedor foi enviado com sucesso!
        </Alert>
        
        <Typography variant="body1" paragraph>
          Seu cadastro está pendente de aprovação pela nossa equipe. Você receberá um e-mail quando for aprovado.
        </Typography>
        
        <Typography variant="body1" paragraph>
          Você será redirecionado para o dashboard em alguns segundos...
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/dashboard')}
          fullWidth
        >
          Ir para o Dashboard
        </Button>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom align="center">
        Cadastro de Fornecedor
      </Typography>
      
      <Typography variant="body1" paragraph align="center" color="text.secondary">
        Preencha o formulário abaixo para se cadastrar como fornecedor no marketplace.
      </Typography>
      
      {apiError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {apiError}
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
              helperText={errors.description || 'Descreva os serviços oferecidos por sua empresa'}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              fullWidth
              error={!!errors.website}
              helperText={errors.website || 'Opcional, comece com http:// ou https://'}
              InputProps={{
                startAdornment: !formData.website.startsWith('http') && formData.website ? (
                  <InputAdornment position="start">https://</InputAdornment>
                ) : null,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Telefone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              fullWidth
              error={!!errors.phone}
              helperText={errors.phone}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Documentação Comprobatória
            </Typography>
            <FileUpload 
              onFilesChange={setDocuments}
              maxFiles={5}
              acceptedFileTypes=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              maxFileSize={5}
              label="Envie documentos que comprovem a existência da sua empresa"
              error={errors.documents}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Exemplos: Cartão CNPJ, Contrato Social, Alvará de Funcionamento, Certificações
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            
            <FormControlLabel
              control={
                <Checkbox
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  color="primary"
                />
              }
              label={
                <span>
                  Li e aceito os{' '}
                  <Link href="/termos" target="_blank">
                    Termos de Serviço
                  </Link>{' '}
                  e a{' '}
                  <Link href="/privacidade" target="_blank">
                    Política de Privacidade
                  </Link>
                </span>
              }
            />
            
            {errors.termsAccepted && (
              <Typography variant="caption" color="error">
                {errors.termsAccepted}
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Cadastrar como Fornecedor'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default SupplierRegistrationForm;