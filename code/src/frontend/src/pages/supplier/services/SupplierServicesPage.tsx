import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Tabs,
  Tab,
  Divider,
  Alert,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import ServiceList from '../../../components/supplier/ServiceList';
import serviceService from '../../../services/serviceService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`services-tabpanel-${index}`}
      aria-labelledby={`services-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `services-tab-${index}`,
    'aria-controls': `services-tabpanel-${index}`,
  };
}

const SupplierServicesPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await serviceService.getMyServices();
      setServices(data);
    } catch (err: any) {
      console.error('Error fetching services:', err);
      setError(err.response?.data?.message || 'Erro ao carregar serviços');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getFilteredServices = () => {
    switch (tabValue) {
      case 0: // All
        return services;
      case 1: // Active
        return services.filter(service => service.status === 'ACTIVE');
      case 2: // Pending
        return services.filter(service => service.status === 'PENDING');
      case 3: // Rejected
        return services.filter(service => service.status === 'REJECTED');
      default:
        return services;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/" color="inherit">
            Home
          </Link>
          <Link component={RouterLink} to="/fornecedor" color="inherit">
            Fornecedor
          </Link>
          <Typography color="text.primary">Meus Serviços</Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Meus Serviços
          </Typography>
          
          <Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchServices}
              sx={{ mr: 1 }}
            >
              Atualizar
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              component={RouterLink}
              to="/fornecedor/servicos/novo"
            >
              Novo Serviço
            </Button>
          </Box>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Todos" {...a11yProps(0)} />
            <Tab label="Ativos" {...a11yProps(1)} />
            <Tab label="Pendentes" {...a11yProps(2)} />
            <Tab label="Rejeitados" {...a11yProps(3)} />
          </Tabs>
          
          <Divider />
          
          <Box sx={{ p: 3 }}>
            <TabPanel value={tabValue} index={0}>
              <ServiceList 
                services={getFilteredServices()} 
                onRefresh={fetchServices}
                loading={loading}
              />
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <ServiceList 
                services={getFilteredServices()} 
                onRefresh={fetchServices}
                loading={loading}
              />
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              <ServiceList 
                services={getFilteredServices()} 
                onRefresh={fetchServices}
                loading={loading}
              />
            </TabPanel>
            
            <TabPanel value={tabValue} index={3}>
              <ServiceList 
                services={getFilteredServices()} 
                onRefresh={fetchServices}
                loading={loading}
              />
            </TabPanel>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default SupplierServicesPage;