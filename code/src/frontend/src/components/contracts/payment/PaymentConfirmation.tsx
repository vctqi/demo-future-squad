import React from 'react';
import {
  Typography,
  Box,
  Paper,
  Grid,
  Divider,
  Alert,
  Chip,
} from '@mui/material';
import {
  AccountBalance as BankIcon,
  CreditCard as CreditCardIcon,
  Receipt as BoletoIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface PaymentConfirmationProps {
  contract: any;
  paymentData: any;
}

const PaymentConfirmation: React.FC<PaymentConfirmationProps> = ({
  contract,
  paymentData,
}) => {
  const { method, details, isRecurring } = paymentData;

  const renderPaymentMethodDetails = () => {
    switch (method) {
      case 'bank_account':
        return (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Detalhes da Conta
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Banco:
                  </Typography>
                  <Typography variant="body1">
                    {details?.bank === 'banco_digital' && 'Banco Digital'}
                    {details?.bank === 'banco_brasil' && 'Banco do Brasil'}
                    {details?.bank === 'caixa' && 'Caixa Econômica Federal'}
                    {details?.bank === 'itau' && 'Itaú'}
                    {details?.bank === 'bradesco' && 'Bradesco'}
                    {details?.bank === 'santander' && 'Santander'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Tipo de Conta:
                  </Typography>
                  <Typography variant="body1">
                    {details?.accountType === 'checking' ? 'Conta Corrente' : 'Conta Poupança'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Agência:
                  </Typography>
                  <Typography variant="body1">
                    {details?.agency}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Número da Conta:
                  </Typography>
                  <Typography variant="body1">
                    {details?.accountNumber}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        );
      
      case 'boleto':
        return (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Detalhes do Boleto
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    CNPJ da Empresa:
                  </Typography>
                  <Typography variant="body1">
                    {details?.taxId || 'Não informado'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Email para Recebimento:
                  </Typography>
                  <Typography variant="body1">
                    {details?.email || 'Não informado'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        );
      
      case 'credit_card':
        return (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Detalhes do Cartão
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Nome no Cartão:
                  </Typography>
                  <Typography variant="body1">
                    {details?.cardName}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Número do Cartão:
                  </Typography>
                  <Typography variant="body1">
                    {details?.cardNumber && `**** **** **** ${details.cardNumber.slice(-4)}`}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Data de Validade:
                  </Typography>
                  <Typography variant="body1">
                    {details?.expiryDate}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        );
      
      default:
        return null;
    }
  };

  const renderPaymentMethodIcon = () => {
    switch (method) {
      case 'bank_account':
        return <BankIcon fontSize="large" color="primary" />;
      case 'boleto':
        return <BoletoIcon fontSize="large" color="primary" />;
      case 'credit_card':
        return <CreditCardIcon fontSize="large" color="primary" />;
      default:
        return <PaymentIcon fontSize="large" color="primary" />;
    }
  };

  const getPaymentMethodName = () => {
    switch (method) {
      case 'bank_account':
        return 'Débito em Conta';
      case 'boleto':
        return 'Boleto Bancário';
      case 'credit_card':
        return 'Cartão de Crédito';
      default:
        return 'Método Desconhecido';
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Confirmação de Pagamento
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Confira os detalhes do pagamento antes de finalizar.
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Esta é uma simulação de pagamento para fins de demonstração. Nenhum pagamento real será processado.
        </Typography>
      </Alert>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {renderPaymentMethodIcon()}
          <Box sx={{ ml: 2 }}>
            <Typography variant="h6">
              {getPaymentMethodName()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isRecurring && 'Pagamento Recorrente'}
              {!isRecurring && 'Pagamento Único'}
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {renderPaymentMethodDetails()}
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Resumo da Contratação
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Serviço:
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {contract?.service?.title}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Fornecedor:
              </Typography>
              <Typography variant="body1">
                {contract?.service?.supplier?.companyName}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Tipo de Contrato:
              </Typography>
              <Typography variant="body1">
                {contract?.service?.priceType === 'FIXED' ? 'Único' : 'Recorrente'}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Status do Contrato:
              </Typography>
              <Chip
                size="small"
                label={contract?.status}
                color={contract?.status === 'ACTIVE' ? 'success' : 'warning'}
              />
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1">
            Valor Total:
          </Typography>
          <Typography variant="h5" color="primary" fontWeight="bold">
            R$ {contract?.totalPrice?.toFixed(2)}
          </Typography>
        </Box>
      </Paper>
      
      <Alert 
        severity="warning" 
        icon={<WarningIcon />}
        sx={{ mb: 3 }}
      >
        <Typography variant="subtitle2">
          Termos de Pagamento
        </Typography>
        <Typography variant="body2">
          Ao confirmar, você concorda com os termos de pagamento e autoriza a cobrança do valor acima.
          {isRecurring && ' Este pagamento será recorrente conforme os termos do contrato.'}
        </Typography>
      </Alert>
    </Box>
  );
};

export default PaymentConfirmation;