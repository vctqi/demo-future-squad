import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import PaymentMethodSelection from '../../../components/contracts/payment/PaymentMethodSelection';
import PaymentDetails from '../../../components/contracts/payment/PaymentDetails';
import PaymentConfirmation from '../../../components/contracts/payment/PaymentConfirmation';
import PaymentReceipt from '../../../components/contracts/payment/PaymentReceipt';
import contractService from '../../../services/contractService';

const steps = [
  'Método de Pagamento',
  'Detalhes do Pagamento',
  'Confirmação',
  'Recibo',
];

const PaymentPage: React.FC = () => {
  const { contractId } = useParams<{ contractId: string }>();
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [contract, setContract] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>({
    method: '',
    details: {},
    isRecurring: false,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<any>(null);

  useEffect(() => {
    const fetchContract = async () => {
      if (!contractId) {
        setError('ID do contrato não fornecido');
        setLoading(false);
        return;
      }

      try {
        const data = await contractService.getContractById(contractId);
        setContract(data);
      } catch (err: any) {
        console.error('Error fetching contract:', err);
        setError(err.response?.data?.message || 'Erro ao carregar detalhes do contrato');
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [contractId]);

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const handlePaymentDataChange = (data: any) => {
    setPaymentData(prevData => ({
      ...prevData,
      ...data,
    }));
  };

  const handleSubmitPayment = async () => {
    setSubmitting(true);
    setError(null);

    try {
      // Prepare payment data
      const paymentRequest = {
        paymentMethod: paymentData.method,
        details: paymentData.details,
        isRecurring: paymentData.isRecurring,
      };
      
      // Process payment
      const result = await contractService.processPayment(contractId!, paymentRequest);
      
      setPaymentResult(result);
      handleNext();
    } catch (err: any) {
      console.error('Error processing payment:', err);
      setError(err.response?.data?.message || 'Erro ao processar pagamento. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <PaymentMethodSelection
            selectedMethod={paymentData.method}
            onMethodSelect={(method) => handlePaymentDataChange({ method })}
          />
        );
      case 1:
        return (
          <PaymentDetails
            contract={contract}
            paymentMethod={paymentData.method}
            paymentDetails={paymentData.details}
            isRecurring={paymentData.isRecurring}
            onChange={handlePaymentDataChange}
          />
        );
      case 2:
        return (
          <PaymentConfirmation
            contract={contract}
            paymentData={paymentData}
          />
        );
      case 3:
        return (
          <PaymentReceipt
            contract={contract}
            paymentResult={paymentResult}
          />
        );
      default:
        return 'Unknown step';
    }
  };

  // Check if current step is valid and can proceed
  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return paymentData.method !== '';
      case 1:
        if (paymentData.method === 'bank_account') {
          return paymentData.details?.accountNumber && 
                 paymentData.details?.accountType && 
                 paymentData.details?.bank;
        } else if (paymentData.method === 'boleto') {
          return true; // No required fields for boleto
        } else if (paymentData.method === 'credit_card') {
          return paymentData.details?.cardNumber && 
                 paymentData.details?.cardName && 
                 paymentData.details?.expiryDate && 
                 paymentData.details?.cvv;
        }
        return false;
      case 2:
        return true; // No validation needed for confirmation
      default:
        return false;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error && !contract) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button
            variant="outlined"
            onClick={() => navigate('/cliente/contratos')}
          >
            Voltar para meus contratos
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/" color="inherit">
            Home
          </Link>
          <Link component={RouterLink} to="/cliente/contratos" color="inherit">
            Meus Contratos
          </Link>
          {contract && (
            <Link component={RouterLink} to={`/cliente/contratos/${contract.id}`} color="inherit">
              Contrato #{contract.id.substring(0, 8)}
            </Link>
          )}
          <Typography color="text.primary">Pagamento</Typography>
        </Breadcrumbs>

        <Typography variant="h4" component="h1" gutterBottom>
          {contract ? `Pagamento: ${contract.service.title}` : 'Pagamento de Serviço'}
        </Typography>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            {getStepContent(activeStep)}
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={activeStep === 0 ? () => navigate(`/cliente/contratos/${contractId}`) : handleBack}
              disabled={submitting}
            >
              {activeStep === 0 ? 'Cancelar' : 'Voltar'}
            </Button>

            {activeStep < steps.length - 1 && (
              <Button
                variant="contained"
                color="primary"
                onClick={activeStep === 2 ? handleSubmitPayment : handleNext}
                disabled={!isStepValid() || submitting}
              >
                {activeStep === 2 ? (
                  submitting ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                      Processando...
                    </>
                  ) : (
                    'Confirmar Pagamento'
                  )
                ) : (
                  'Próximo'
                )}
              </Button>
            )}

            {activeStep === steps.length - 1 && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/cliente/contratos')}
              >
                Voltar para Meus Contratos
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default PaymentPage;