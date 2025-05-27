import React from 'react';
import { Container, Typography, Box, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SupplierRegistrationForm from '../../components/supplier/SupplierRegistrationForm';

const SupplierRegistrationPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box mt={4} mb={4}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/" color="inherit">
            Home
          </Link>
          <Typography color="text.primary">Cadastro de Fornecedor</Typography>
        </Breadcrumbs>
        
        <Typography variant="h4" component="h1" gutterBottom>
          Torne-se um Fornecedor
        </Typography>
        
        <Typography variant="body1" paragraph color="text.secondary">
          Preencha o formulário abaixo para se cadastrar como fornecedor em nosso marketplace de benefícios.
          Após o envio, sua solicitação será analisada pela nossa equipe e você receberá um retorno em até 48 horas úteis.
        </Typography>
        
        <SupplierRegistrationForm />
      </Box>
    </Container>
  );
};

export default SupplierRegistrationPage;