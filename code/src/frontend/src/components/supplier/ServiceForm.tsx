import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  FormHelperText,
  InputAdornment,
  Paper,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../common/FileUpload';
import serviceService from '../../services/serviceService';

interface ServiceFormProps {
  initialData?: any;
  isEditing?: boolean;
}

const ServiceForm: React.FC<ServiceFormProps> = ({
  initialData = {},
  isEditing = false,
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    categoryId: initialData.categoryId || '',
    price: initialData.price || '',
    priceType: initialData.priceType || 'FIXED',
    terms: initialData.terms || '',
    sla: initialData.sla || '',
    features: initialData.features || [],
  });
  
  const [categories, setCategories] = useState<any[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [featureInput, setFeatureInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await serviceService.getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    
    if (name) {
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
    }
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()],
      });
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures.splice(index, 1);
    setFormData({
      ...formData,
      features: updatedFeatures,
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Título deve ter pelo menos 3 caracteres';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Descrição deve ter pelo menos 10 caracteres';
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = 'Categoria é obrigatória';
    }
    
    if (!formData.price) {
      newErrors.price = 'Preço é obrigatório';
    } else if (Number(formData.price) <= 0) {
      newErrors.price = 'Preço deve ser maior que zero';
    }
    
    if (!formData.priceType) {
      newErrors.priceType = 'Tipo de preço é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Convert price to number
      const serviceData = {
        ...formData,
        price: Number(formData.price),
        // Add image information for the API
        images: images.map(img => ({
          name: img.name,
          type: img.type,
          size: img.size,
        })),
      };
      
      if (isEditing && initialData.id) {
        await serviceService.updateService(initialData.id, serviceData);
      } else {
        await serviceService.createService(serviceData);
      }
      
      setSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/fornecedor/servicos');
      }, 2000);
    } catch (err: any) {
      console.error('Error saving service:', err);
      setApiError(err.response?.data?.message || 'Falha ao salvar serviço. Tente novamente.');
      
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
      <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4 }}>
        <Alert severity="success" sx={{ mb: 2 }}>
          {isEditing 
            ? 'Serviço atualizado com sucesso!' 
            : 'Serviço cadastrado com sucesso!'}
        </Alert>
        
        <Typography variant="body1" paragraph>
          {isEditing 
            ? 'Suas alterações foram salvas. O serviço passará por uma nova aprovação caso informações importantes tenham sido modificadas.' 
            : 'Seu serviço foi cadastrado e está pendente de aprovação pela nossa equipe.'}
        </Typography>
        
        <Typography variant="body1" paragraph>
          Você será redirecionado para a lista de serviços em alguns segundos...
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/fornecedor/servicos')}
          fullWidth
        >
          Ir para Lista de Serviços
        </Button>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" component="h1" gutterBottom align="center">
        {isEditing ? 'Editar Serviço' : 'Cadastrar Novo Serviço'}
      </Typography>
      
      {apiError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {apiError}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              id="title"
              name="title"
              label="Título do Serviço"
              value={formData.title}
              onChange={handleChange}
              error={!!errors.title}
              helperText={errors.title}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              id="description"
              name="description"
              label="Descrição do Serviço"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleChange}
              error={!!errors.description}
              helperText={errors.description}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={!!errors.categoryId}>
              <InputLabel id="category-label">Categoria</InputLabel>
              <Select
                labelId="category-label"
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                label="Categoria"
                onChange={handleChange}
                disabled={loadingCategories}
              >
                {loadingCategories ? (
                  <MenuItem value="">
                    <CircularProgress size={20} />
                    <span style={{ marginLeft: 10 }}>Carregando...</span>
                  </MenuItem>
                ) : (
                  categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))
                )}
              </Select>
              {errors.categoryId && <FormHelperText>{errors.categoryId}</FormHelperText>}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={!!errors.priceType}>
              <InputLabel id="price-type-label">Tipo de Preço</InputLabel>
              <Select
                labelId="price-type-label"
                id="priceType"
                name="priceType"
                value={formData.priceType}
                label="Tipo de Preço"
                onChange={handleChange}
              >
                <MenuItem value="FIXED">Preço Fixo</MenuItem>
                <MenuItem value="HOURLY">Por Hora</MenuItem>
                <MenuItem value="MONTHLY">Mensal</MenuItem>
                <MenuItem value="YEARLY">Anual</MenuItem>
                <MenuItem value="CUSTOM">Personalizado</MenuItem>
              </Select>
              {errors.priceType && <FormHelperText>{errors.priceType}</FormHelperText>}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              id="price"
              name="price"
              label="Preço"
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
              }}
              value={formData.price}
              onChange={handleChange}
              error={!!errors.price}
              helperText={errors.price}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Características do Serviço
            </Typography>
            
            <Box sx={{ display: 'flex', mb: 2 }}>
              <TextField
                fullWidth
                id="feature"
                label="Adicionar característica"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddFeature}
                disabled={!featureInput.trim()}
                sx={{ ml: 1 }}
              >
                <AddIcon />
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.features.map((feature, index) => (
                <Chip
                  key={index}
                  label={feature}
                  onDelete={() => handleRemoveFeature(index)}
                  color="primary"
                  variant="outlined"
                />
              ))}
              
              {formData.features.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  Nenhuma característica adicionada
                </Typography>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Imagens do Serviço
            </Typography>
            
            <FileUpload
              onFilesChange={setImages}
              maxFiles={5}
              acceptedFileTypes=".jpg,.jpeg,.png"
              maxFileSize={2}
              label="Envie até 5 imagens para ilustrar seu serviço"
              error={errors.images}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Termos e Condições do Serviço
            </Typography>
            
            <TextField
              fullWidth
              id="terms"
              name="terms"
              label="Termos e Condições"
              multiline
              rows={3}
              value={formData.terms}
              onChange={handleChange}
              helperText="Descreva os termos e condições do serviço, como políticas de cancelamento, garantias, etc."
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="sla"
              name="sla"
              label="SLA (Acordo de Nível de Serviço)"
              multiline
              rows={3}
              value={formData.sla}
              onChange={handleChange}
              helperText="Descreva o SLA do serviço, como tempo de resposta, disponibilidade, etc."
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary" gutterBottom>
              * Campos obrigatórios
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              ** Seu serviço será analisado pela equipe antes de ser publicado
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/fornecedor/servicos')}
                disabled={loading}
              >
                Cancelar
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {loading 
                  ? (isEditing ? 'Salvando...' : 'Cadastrando...') 
                  : (isEditing ? 'Salvar Alterações' : 'Cadastrar Serviço')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default ServiceForm;