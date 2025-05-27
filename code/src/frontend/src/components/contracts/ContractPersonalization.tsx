import React, { useState } from 'react';
import {
  Typography,
  Box,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText,
  FormControlLabel,
  Switch,
  Paper,
  Divider,
  InputAdornment,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { addMonths } from 'date-fns';

interface ContractPersonalizationProps {
  service: any;
  contractData: any;
  onChange: (data: any) => void;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const ContractPersonalization: React.FC<ContractPersonalizationProps> = ({
  service,
  contractData,
  onChange,
}) => {
  const [customizations, setCustomizations] = useState<string[]>(contractData.customizations || []);
  
  // Generate mock customization options based on service data
  const getCustomizationOptions = () => {
    const baseOptions = [
      'Suporte Prioritário',
      'Relatórios Personalizados',
      'Onboarding Premium',
      'Treinamento de Equipe',
      'Implementação Personalizada',
    ];
    
    // Add service-specific customizations if service has features
    if (service?.features?.length > 0) {
      service.features.forEach((feature: string) => {
        if (!baseOptions.includes(feature)) {
          baseOptions.push(`Upgrade: ${feature}`);
        }
      });
    }
    
    return baseOptions;
  };
  
  const customizationOptions = getCustomizationOptions();
  
  const handleCustomizationsChange = (event: any) => {
    const value = event.target.value;
    setCustomizations(value);
    onChange({ customizations: value });
  };
  
  const handleDateChange = (newDate: Date | null) => {
    if (newDate) {
      onChange({ 
        startDate: newDate,
        endDate: addMonths(newDate, contractData.selectedPlan?.duration || 1)
      });
    }
  };
  
  const handleAdditionalInfoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ additionalInfo: event.target.value });
  };
  
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Personalização do Serviço
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Personalize sua contratação de acordo com as necessidades da sua empresa.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <DatePicker
              label="Data de Início"
              value={contractData.startDate || null}
              onChange={handleDateChange}
              slotProps={{ textField: { fullWidth: true } }}
              disablePast
            />
          </LocalizationProvider>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            O serviço começará nesta data e terminará em {' '}
            {contractData.endDate ? new Date(contractData.endDate).toLocaleDateString('pt-BR') : 'data a ser calculada'}.
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="customizations-label">Personalizações</InputLabel>
            <Select
              labelId="customizations-label"
              id="customizations"
              multiple
              value={customizations}
              onChange={handleCustomizationsChange}
              input={<OutlinedInput label="Personalizações" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
              MenuProps={MenuProps}
            >
              {customizationOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  <Checkbox checked={customizations.indexOf(option) > -1} />
                  <ListItemText primary={option} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Selecione opções adicionais para personalizar o serviço. Algumas opções podem alterar o valor final.
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="additionalInfo"
            name="additionalInfo"
            label="Informações Adicionais"
            multiline
            rows={4}
            value={contractData.additionalInfo || ''}
            onChange={handleAdditionalInfoChange}
            placeholder="Informe requisitos específicos, detalhes ou outras informações importantes para o fornecedor."
          />
        </Grid>
        
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="subtitle2" gutterBottom>
              Valor Estimado
            </Typography>
            <Typography variant="h5" color="primary">
              R$ {contractData.selectedPlan?.price.toFixed(2) || service?.price.toFixed(2) || '0.00'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Baseado no plano selecionado: {contractData.selectedPlan?.name || 'Plano não selecionado'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ContractPersonalization;