import React from 'react';
import {
  Typography,
  Box,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Switch,
  Divider,
  Paper,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  AccountBalance as BankIcon,
  CreditCard as CreditCardIcon,
  Receipt as BoletoIcon,
} from '@mui/icons-material';

interface PaymentDetailsProps {
  contract: any;
  paymentMethod: string;
  paymentDetails: any;
  isRecurring: boolean;
  onChange: (data: any) => void;
}

const PaymentDetails: React.FC<PaymentDetailsProps> = ({
  contract,
  paymentMethod,
  paymentDetails,
  isRecurring,
  onChange,
}) => {
  const handleDetailsChange = (field: string, value: any) => {
    onChange({
      details: {
        ...paymentDetails,
        [field]: value,
      },
    });
  };

  const handleRecurringChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ isRecurring: event.target.checked });
  };

  const renderPaymentMethodDetails = () => {
    switch (paymentMethod) {
      case 'bank_account':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="bank-label">Banco</InputLabel>
                <Select
                  labelId="bank-label"
                  id="bank"
                  value={paymentDetails?.bank || ''}
                  label="Banco"
                  onChange={(e) => handleDetailsChange('bank', e.target.value)}
                >
                  <MenuItem value="banco_digital">Banco Digital</MenuItem>
                  <MenuItem value="banco_brasil">Banco do Brasil</MenuItem>
                  <MenuItem value="caixa">Caixa Econômica Federal</MenuItem>
                  <MenuItem value="itau">Itaú</MenuItem>
                  <MenuItem value="bradesco">Bradesco</MenuItem>
                  <MenuItem value="santander">Santander</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="account-type-label">Tipo de Conta</InputLabel>
                <Select
                  labelId="account-type-label"
                  id="accountType"
                  value={paymentDetails?.accountType || ''}
                  label="Tipo de Conta"
                  onChange={(e) => handleDetailsChange('accountType', e.target.value)}
                >
                  <MenuItem value="checking">Conta Corrente</MenuItem>
                  <MenuItem value="savings">Conta Poupança</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                id="agency"
                label="Agência"
                value={paymentDetails?.agency || ''}
                onChange={(e) => handleDetailsChange('agency', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                id="accountNumber"
                label="Número da Conta"
                value={paymentDetails?.accountNumber || ''}
                onChange={(e) => handleDetailsChange('accountNumber', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mt: 2 }}>
                Ao confirmar, você autoriza o débito automático em sua conta.
              </Alert>
            </Grid>
          </Grid>
        );
      
      case 'boleto':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="taxId"
                label="CNPJ da Empresa"
                value={paymentDetails?.taxId || ''}
                onChange={(e) => handleDetailsChange('taxId', e.target.value)}
                helperText="Insira o CNPJ da empresa que irá pagar o boleto"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="email"
                label="Email para Recebimento"
                type="email"
                value={paymentDetails?.email || ''}
                onChange={(e) => handleDetailsChange('email', e.target.value)}
                helperText="O boleto será enviado para este email"
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mt: 2 }}>
                Um boleto será gerado e enviado para o email informado. O pagamento será confirmado automaticamente em até 3 dias úteis após o pagamento.
              </Alert>
            </Grid>
          </Grid>
        );
      
      case 'credit_card':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                id="cardName"
                label="Nome no Cartão"
                value={paymentDetails?.cardName || ''}
                onChange={(e) => handleDetailsChange('cardName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                id="cardNumber"
                label="Número do Cartão"
                value={paymentDetails?.cardNumber || ''}
                onChange={(e) => handleDetailsChange('cardNumber', e.target.value)}
                inputProps={{ maxLength: 19 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CreditCardIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                id="expiryDate"
                label="Data de Validade (MM/AA)"
                value={paymentDetails?.expiryDate || ''}
                onChange={(e) => handleDetailsChange('expiryDate', e.target.value)}
                placeholder="MM/AA"
                inputProps={{ maxLength: 5 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                id="cvv"
                label="CVV"
                value={paymentDetails?.cvv || ''}
                onChange={(e) => handleDetailsChange('cvv', e.target.value)}
                inputProps={{ maxLength: 4 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mt: 2 }}>
                Seus dados de cartão são criptografados e não são armazenados em nossos servidores.
              </Alert>
            </Grid>
          </Grid>
        );
      
      default:
        return (
          <Typography color="text.secondary">
            Selecione um método de pagamento para continuar.
          </Typography>
        );
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Detalhes do Pagamento
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Preencha os detalhes do método de pagamento selecionado.
      </Typography>
      
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {paymentMethod === 'bank_account' && <BankIcon color="primary" sx={{ mr: 1 }} />}
          {paymentMethod === 'boleto' && <BoletoIcon color="primary" sx={{ mr: 1 }} />}
          {paymentMethod === 'credit_card' && <CreditCardIcon color="primary" sx={{ mr: 1 }} />}
          <Typography variant="h6">
            {paymentMethod === 'bank_account' && 'Débito em Conta'}
            {paymentMethod === 'boleto' && 'Boleto Bancário'}
            {paymentMethod === 'credit_card' && 'Cartão de Crédito'}
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {renderPaymentMethodDetails()}
      </Paper>
      
      {/* Recurrent Payment Option */}
      {contract?.service?.priceType !== 'FIXED' && (
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={isRecurring}
                onChange={handleRecurringChange}
                color="primary"
              />
            }
            label="Ativar pagamento recorrente"
          />
          <Typography variant="body2" color="text.secondary">
            O pagamento será processado automaticamente na data de renovação do contrato.
          </Typography>
        </Box>
      )}
      
      {/* Payment Summary */}
      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
        <Typography variant="subtitle2" gutterBottom>
          Resumo do Pagamento
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Serviço:</Typography>
          <Typography variant="body2" fontWeight="medium">
            {contract?.service?.title}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Valor:</Typography>
          <Typography variant="body2" fontWeight="medium">
            R$ {contract?.totalPrice?.toFixed(2)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Frequência:</Typography>
          <Typography variant="body2" fontWeight="medium">
            {contract?.service?.priceType === 'FIXED' 
              ? 'Pagamento Único' 
              : isRecurring 
                ? 'Pagamento Recorrente' 
                : 'Pagamento Único (renovação manual)'}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default PaymentDetails;