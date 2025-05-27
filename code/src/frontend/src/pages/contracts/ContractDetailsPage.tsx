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
import ContractPlanSelection from '../../components/contracts/ContractPlanSelection';
import ContractPersonalization from '../../components/contracts/ContractPersonalization';
import ContractSummary from '../../components/contracts/ContractSummary';
import ContractTerms from '../../components/contracts/ContractTerms';
import ContractConfirmation from '../../components/contracts/ContractConfirmation';
import serviceService from '../../services/serviceService';
import contractService from '../../services/contractService';

const steps = [
  'Seleção de Plano',
  'Personalização',
  'Termos e Condições',
  'Resumo',
  'Confirmação',
];

const ContractDetailsPage: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [service, setService] = useState<any>(null);
  const [contractData, setContractData] = useState<any>({
    serviceId: serviceId || '',
    selectedPlan: null,
    customizations: [],
    additionalInfo: '',
    termsAccepted: false,
    startDate: new Date(),
    duration: 1, // months
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [contractId, setContractId] = useState<string | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      if (!serviceId) {
        setError('ID do serviço não fornecido');
        setLoading(false);
        return;
      }

      try {
        const data = await serviceService.getServiceById(serviceId);
        setService(data);
        setContractData(prevData => ({
          ...prevData,
          totalPrice: data.price,
        }));
      } catch (err: any) {
        console.error('Error fetching service:', err);
        setError(err.response?.data?.message || 'Erro ao carregar detalhes do serviço');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId]);

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const handleContractDataChange = (data: any) => {
    setContractData(prevData => ({
      ...prevData,
      ...data,
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      // Calculate contract duration based on selected plan
      const duration = contractData.selectedPlan?.duration || contractData.duration || 1;
      
      // Calculate end date
      const startDate = contractData.startDate || new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + duration);
      
      // Prepare contract data for submission
      const contract = {
        serviceId,
        totalPrice: contractData.totalPrice,
        startDate,
        endDate,
        customizations: contractData.customizations,
        additionalInfo: contractData.additionalInfo,
        planId: contractData.selectedPlan?.id,
      };
      
      // Submit contract
      const response = await contractService.createContract(contract);
      
      setContractId(response.id);
      setSuccess(true);
      handleNext();
    } catch (err: any) {
      console.error('Error creating contract:', err);
      setError(err.response?.data?.message || 'Erro ao criar contrato. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <ContractPlanSelection
            service={service}
            selectedPlan={contractData.selectedPlan}
            onPlanSelect={(plan) => handleContractDataChange({ selectedPlan: plan })}
          />
        );
      case 1:
        return (
          <ContractPersonalization
            service={service}
            contractData={contractData}
            onChange={handleContractDataChange}
          />
        );
      case 2:
        return (
          <ContractTerms
            service={service}
            contractData={contractData}
            termsAccepted={contractData.termsAccepted}
            onTermsAcceptedChange={(accepted) => handleContractDataChange({ termsAccepted: accepted })}
          />
        );
      case 3:
        return (
          <ContractSummary
            service={service}
            contractData={contractData}
          />
        );
      case 4:
        return (
          <ContractConfirmation
            contractId={contractId}
            service={service}
            success={success}
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
        return contractData.selectedPlan !== null;
      case 1:
        // No required fields in personalization
        return true;
      case 2:
        return contractData.termsAccepted;
      case 3:
        // Summary doesn't have validation
        return true;
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

  if (error && !service) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button
            variant="outlined"
            onClick={() => navigate('/servicos')}
          >
            Voltar para serviços
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/" color="inherit">
            Home
          </Link>
          <Link component={RouterLink} to="/servicos" color="inherit">
            Serviços
          </Link>
          {service && (
            <Link component={RouterLink} to={`/servicos/${service.id}`} color="inherit">
              {service.title}
            </Link>
          )}
          <Typography color="text.primary">Contratação</Typography>
        </Breadcrumbs>

        <Typography variant="h4" component="h1" gutterBottom>
          {service ? `Contratar: ${service.title}` : 'Contratação de Serviço'}
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
              onClick={activeStep === 0 ? () => navigate(`/servicos/${serviceId}`) : handleBack}
              disabled={submitting}
            >
              {activeStep === 0 ? 'Cancelar' : 'Voltar'}
            </Button>

            {activeStep < steps.length - 1 && (
              <Button
                variant="contained"
                color="primary"
                onClick={activeStep === 3 ? handleSubmit : handleNext}
                disabled={!isStepValid() || submitting}
              >
                {activeStep === 3 ? (
                  submitting ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                      Processando...
                    </>
                  ) : (
                    'Contratar'
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
                Meus Contratos
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ContractDetailsPage;