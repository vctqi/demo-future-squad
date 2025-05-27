import React from 'react';
import {
  Container,
  Typography,
  Box,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ServiceForm from '../../../components/supplier/ServiceForm';

const ServiceCreatePage: React.FC = () => {
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
          <Typography color="text.primary">Novo Serviço</Typography>
        </Breadcrumbs>
        
        <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
          Cadastrar Novo Serviço
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" paragraph>
            Preencha o formulário abaixo para cadastrar um novo serviço em seu catálogo.
            Após o cadastro, seu serviço passará por uma análise antes de ser publicado no marketplace.
          </Typography>
        </Box>
        
        <ServiceForm />
      </Box>
    </Container>
  );
};

export default ServiceCreatePage;