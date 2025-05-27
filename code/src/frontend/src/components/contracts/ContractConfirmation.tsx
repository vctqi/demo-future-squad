import React from 'react';
import {
  Typography,
  Box,
  Paper,
  Button,
  Alert,
  Divider,
  Grid,
  CircularProgress,
} from '@mui/material';
import { CheckCircle as CheckCircleIcon, Assignment as AssignmentIcon } from '@mui/icons-material';

interface ContractConfirmationProps {
  contractId: string | null;
  service: any;
  success: boolean;
}

const ContractConfirmation: React.FC<ContractConfirmationProps> = ({
  contractId,
  service,
  success,
}) => {
  if (!success || !contractId) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h6" gutterBottom>
          Processando sua contratação...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Por favor, aguarde enquanto finalizamos sua contratação.
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Contratação Realizada com Sucesso!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Seu contrato foi criado e o fornecedor foi notificado.
        </Typography>
      </Box>
      
      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="subtitle2">
          Número do Contrato: {contractId}
        </Typography>
        <Typography variant="body2">
          Guarde este número para referência futura. Todas as informações do contrato
          foram enviadas para seu email cadastrado.
        </Typography>
      </Alert>
      
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Serviço Contratado
            </Typography>
            <Typography variant="h6" gutterBottom>
              {service?.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Fornecedor: {service?.supplier?.companyName || 'Nome da Empresa'}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Próximos Passos
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
              <Typography variant="body2" component="span" sx={{ mr: 1 }}>
                1.
              </Typography>
              <Typography variant="body2">
                Você receberá um email de confirmação com os detalhes do contrato.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
              <Typography variant="body2" component="span" sx={{ mr: 1 }}>
                2.
              </Typography>
              <Typography variant="body2">
                O fornecedor entrará em contato em até 48 horas úteis para iniciar o serviço.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <Typography variant="body2" component="span" sx={{ mr: 1 }}>
                3.
              </Typography>
              <Typography variant="body2">
                Você pode acompanhar o status do serviço na área "Meus Contratos".
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Divider sx={{ my: 3 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<AssignmentIcon />}
          onClick={() => window.open(`/cliente/contratos/${contractId}`, '_blank')}
        >
          Ver Detalhes do Contrato
        </Button>
      </Box>
    </Box>
  );
};

export default ContractConfirmation;