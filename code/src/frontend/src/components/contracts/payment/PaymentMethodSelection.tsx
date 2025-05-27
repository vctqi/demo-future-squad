import React from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Radio,
  FormControlLabel,
  FormControl,
  RadioGroup,
  Divider,
} from '@mui/material';
import {
  AccountBalance as BankIcon,
  CreditCard as CreditCardIcon,
  Receipt as BoletoIcon,
} from '@mui/icons-material';

interface PaymentMethodSelectionProps {
  selectedMethod: string;
  onMethodSelect: (method: string) => void;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const PaymentMethodSelection: React.FC<PaymentMethodSelectionProps> = ({
  selectedMethod,
  onMethodSelect,
}) => {
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'bank_account',
      name: 'Débito em Conta',
      description: 'Débito automático na sua conta corrente cadastrada',
      icon: <BankIcon fontSize="large" color="primary" />,
    },
    {
      id: 'boleto',
      name: 'Boleto Bancário',
      description: 'Gere um boleto para pagamento em qualquer banco',
      icon: <BoletoIcon fontSize="large" color="primary" />,
    },
    {
      id: 'credit_card',
      name: 'Cartão de Crédito',
      description: 'Pague com seu cartão de crédito corporativo',
      icon: <CreditCardIcon fontSize="large" color="primary" />,
    },
  ];

  const handleMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onMethodSelect(event.target.value);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Escolha o Método de Pagamento
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Selecione a forma de pagamento que você deseja utilizar para esta contratação.
      </Typography>
      
      <FormControl component="fieldset" fullWidth>
        <RadioGroup
          aria-label="payment-method"
          name="payment-method"
          value={selectedMethod}
          onChange={handleMethodChange}
        >
          <Grid container spacing={2}>
            {paymentMethods.map((method) => (
              <Grid item xs={12} sm={4} key={method.id}>
                <Card 
                  variant="outlined"
                  sx={{ 
                    height: '100%',
                    borderColor: selectedMethod === method.id ? 'primary.main' : 'divider',
                    borderWidth: selectedMethod === method.id ? 2 : 1,
                  }}
                >
                  <CardActionArea
                    onClick={() => onMethodSelect(method.id)}
                    sx={{ height: '100%' }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                          {method.icon}
                        </Box>
                        <FormControlLabel
                          value={method.id}
                          control={<Radio />}
                          label=""
                          sx={{ margin: 0 }}
                        />
                      </Box>
                      
                      <Typography variant="h6" gutterBottom>
                        {method.name}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                        {method.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </RadioGroup>
      </FormControl>
      
      <Divider sx={{ my: 3 }} />
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          * Este é um ambiente de simulação. Nenhum pagamento real será processado.
        </Typography>
      </Box>
    </Box>
  );
};

export default PaymentMethodSelection;