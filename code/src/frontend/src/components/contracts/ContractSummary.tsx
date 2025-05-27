import React from 'react';
import {
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

interface ContractSummaryProps {
  service: any;
  contractData: any;
}

const ContractSummary: React.FC<ContractSummaryProps> = ({
  service,
  contractData,
}) => {
  const formatDate = (date: Date) => {
    if (!date) return '';
    
    try {
      return format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (e) {
      console.error('Date formatting error:', e);
      return String(date);
    }
  };
  
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Resumo da Contratação
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Revise os detalhes da sua contratação antes de confirmar.
      </Typography>
      
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Serviço
            </Typography>
            <Typography variant="h6" gutterBottom>
              {service?.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {service?.description?.substring(0, 150)}...
            </Typography>
            <Chip 
              label={service?.category?.name || 'Categoria'} 
              variant="outlined" 
              size="small" 
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Plano Selecionado
            </Typography>
            <Typography variant="h6">
              {contractData.selectedPlan?.name || 'Plano Básico'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {contractData.selectedPlan?.description || 'Descrição do plano'}
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Inclui:</Typography>
              {contractData.selectedPlan?.features?.map((feature: string, index: number) => (
                <Typography key={index} variant="body2" sx={{ mt: 0.5 }}>
                  • {feature}
                </Typography>
              ))}
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Detalhes do Contrato
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Data de Início:</Typography>
              <Typography variant="body2" fontWeight="medium">
                {formatDate(contractData.startDate)}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Duração:</Typography>
              <Typography variant="body2" fontWeight="medium">
                {contractData.selectedPlan?.duration || 1} {(contractData.selectedPlan?.duration || 1) === 1 ? 'mês' : 'meses'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Forma de Pagamento:</Typography>
              <Typography variant="body2" fontWeight="medium">
                Débito em Conta (simulado)
              </Typography>
            </Box>
          </Grid>
          
          {contractData.customizations?.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Personalizações
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {contractData.customizations.map((customization: string, index: number) => (
                  <Chip key={index} label={customization} variant="outlined" />
                ))}
              </Box>
            </Grid>
          )}
          
          {contractData.additionalInfo && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Informações Adicionais
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="body2">
                  {contractData.additionalInfo}
                </Typography>
              </Paper>
            </Grid>
          )}
          
          <Grid item xs={12}>
            <Divider />
          </Grid>
          
          <Grid item xs={12}>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'background.default' }}>
                    <TableCell>Item</TableCell>
                    <TableCell align="right">Valor</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Typography variant="body2">
                        {contractData.selectedPlan?.name || 'Plano Básico'} ({contractData.selectedPlan?.duration || 1} {(contractData.selectedPlan?.duration || 1) === 1 ? 'mês' : 'meses'})
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        R$ {contractData.selectedPlan?.price.toFixed(2) || service?.price.toFixed(2) || '0.00'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  
                  {contractData.customizations?.length > 0 && (
                    <TableRow>
                      <TableCell>
                        <Typography variant="body2">
                          Personalizações ({contractData.customizations.length})
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          Incluído no plano
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  
                  <TableRow>
                    <TableCell>
                      <Typography variant="subtitle2">Total</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" color="primary">
                        R$ {contractData.selectedPlan?.price.toFixed(2) || service?.price.toFixed(2) || '0.00'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ContractSummary;