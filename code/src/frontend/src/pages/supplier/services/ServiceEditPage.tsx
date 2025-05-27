import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Breadcrumbs,
  Link,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import ServiceForm from '../../../components/supplier/ServiceForm';
import serviceService from '../../../services/serviceService';

const ServiceEditPage: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      if (!serviceId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await serviceService.getServiceById(serviceId);
        setService(data);
      } catch (err: any) {
        console.error('Error fetching service:', err);
        setError(err.response?.data?.message || 'Erro ao carregar dados do serviço');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId]);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !service) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || 'Serviço não encontrado'}
          </Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/fornecedor/servicos')}
          >
            Voltar para Meus Serviços
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/" color="inherit">
            Home
          </Link>
          <Link component={RouterLink} to="/fornecedor" color="inherit">
            Fornecedor
          </Link>
          <Link component={RouterLink} to="/fornecedor/servicos" color="inherit">
            Meus Serviços
          </Link>
          <Typography color="text.primary">Editar Serviço</Typography>
        </Breadcrumbs>
        
        <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
          Editar Serviço
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" paragraph>
            Edite as informações do seu serviço abaixo. Se você modificar informações importantes, 
            o serviço precisará passar por uma nova aprovação antes de voltar a ser exibido no marketplace.
          </Typography>
        </Box>
        
        <ServiceForm initialData={service} isEditing={true} />
      </Box>
    </Container>
  );
};

export default ServiceEditPage;