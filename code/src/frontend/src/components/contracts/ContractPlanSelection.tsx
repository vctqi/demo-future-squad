import React from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
} from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  features: string[];
  isPopular?: boolean;
}

interface ContractPlanSelectionProps {
  service: any;
  selectedPlan: Plan | null;
  onPlanSelect: (plan: Plan) => void;
}

const ContractPlanSelection: React.FC<ContractPlanSelectionProps> = ({
  service,
  selectedPlan,
  onPlanSelect,
}) => {
  // Generate mock plans based on service data
  const generatePlans = (service: any): Plan[] => {
    if (!service) return [];

    // Base price from the service
    const basePrice = service.price || 100;
    
    // Generate plans
    return [
      {
        id: 'basic',
        name: 'Básico',
        description: 'Plano básico ideal para pequenas empresas',
        price: basePrice,
        duration: 1, // 1 month
        features: [
          'Acesso básico ao serviço',
          `Suporte por email`,
          `Até 5 usuários`,
        ],
      },
      {
        id: 'standard',
        name: 'Padrão',
        description: 'Nosso plano mais popular com bom custo-benefício',
        price: basePrice * 2.5,
        duration: 3, // 3 months
        features: [
          'Acesso completo ao serviço',
          `Suporte por email e telefone`,
          `Até 10 usuários`,
          `Relatórios mensais`,
        ],
        isPopular: true,
      },
      {
        id: 'premium',
        name: 'Premium',
        description: 'Plano premium com todos os recursos disponíveis',
        price: basePrice * 5,
        duration: 6, // 6 months
        features: [
          'Acesso completo ao serviço',
          `Suporte prioritário 24/7`,
          `Usuários ilimitados`,
          `Relatórios semanais`,
          `Consultoria personalizada`,
        ],
      }
    ];
  };

  const plans = generatePlans(service);

  const handlePlanSelect = (plan: Plan) => {
    onPlanSelect(plan);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Selecione um Plano
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Escolha o plano que melhor atende às necessidades da sua empresa.
      </Typography>
      
      <RadioGroup
        value={selectedPlan?.id || ''}
        onChange={(e) => {
          const selectedPlan = plans.find(plan => plan.id === e.target.value);
          if (selectedPlan) {
            handlePlanSelect(selectedPlan);
          }
        }}
      >
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {plans.map((plan) => (
            <Grid item xs={12} md={4} key={plan.id}>
              <Card 
                variant="outlined" 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  position: 'relative',
                  borderColor: selectedPlan?.id === plan.id ? 'primary.main' : 'divider',
                  borderWidth: selectedPlan?.id === plan.id ? 2 : 1,
                  boxShadow: plan.isPopular ? 3 : 0,
                }}
              >
                {plan.isPopular && (
                  <Chip
                    label="Mais Popular"
                    color="primary"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}
                  />
                )}
                
                <CardContent sx={{ flexGrow: 1, pt: plan.isPopular ? 3 : 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="div">
                      {plan.name}
                    </Typography>
                    <FormControlLabel
                      value={plan.id}
                      control={<Radio />}
                      label=""
                      sx={{ m: 0 }}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {plan.description}
                  </Typography>
                  
                  <Typography variant="h5" color="primary" gutterBottom>
                    R$ {plan.price.toFixed(2)}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Duração: {plan.duration} {plan.duration === 1 ? 'mês' : 'meses'}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Inclui:
                  </Typography>
                  
                  <Box sx={{ mt: 1 }}>
                    {plan.features.map((feature, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CheckIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2">{feature}</Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
                
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    variant={selectedPlan?.id === plan.id ? "contained" : "outlined"}
                    color="primary"
                    fullWidth
                    onClick={() => handlePlanSelect(plan)}
                  >
                    {selectedPlan?.id === plan.id ? 'Selecionado' : 'Selecionar'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </RadioGroup>
    </Box>
  );
};

export default ContractPlanSelection;