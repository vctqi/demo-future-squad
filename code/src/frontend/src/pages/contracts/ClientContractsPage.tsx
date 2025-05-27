import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  Breadcrumbs,
  Link,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Launch as LaunchIcon,
  Payment as PaymentIcon,
  Assessment as AssessmentIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import contractService from '../../services/contractService';

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
      id={`contracts-tabpanel-${index}`}
      aria-labelledby={`contracts-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `contracts-tab-${index}`,
    'aria-controls': `contracts-tabpanel-${index}`,
  };
}

const ClientContractsPage: React.FC = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchContracts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await contractService.getMyContracts();
        setContracts(data);
      } catch (err: any) {
        console.error('Error fetching contracts:', err);
        setError(err.response?.data?.message || 'Erro ao carregar contratos');
      } finally {
        setLoading(false);
      }
    };
    
    fetchContracts();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'COMPLETED':
        return 'info';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Ativo';
      case 'PENDING':
        return 'Pendente';
      case 'COMPLETED':
        return 'Concluído';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch (e) {
      console.error('Date formatting error:', e);
      return String(dateString);
    }
  };

  const filterContracts = () => {
    let filtered = [...contracts];
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(contract => 
        contract.service.title.toLowerCase().includes(term) ||
        contract.service.supplier.companyName.toLowerCase().includes(term) ||
        contract.id.toLowerCase().includes(term)
      );
    }
    
    // Filter by tab
    switch (tabValue) {
      case 0: // All
        return filtered;
      case 1: // Active
        return filtered.filter(contract => contract.status === 'ACTIVE');
      case 2: // Pending
        return filtered.filter(contract => contract.status === 'PENDING');
      case 3: // Completed
        return filtered.filter(contract => contract.status === 'COMPLETED');
      case 4: // Cancelled
        return filtered.filter(contract => contract.status === 'CANCELLED');
      default:
        return filtered;
    }
  };

  const filteredContracts = filterContracts();

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
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
          <Typography color="text.primary">Meus Contratos</Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Meus Contratos
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              size="small"
              placeholder="Buscar contratos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            
            <IconButton color="primary">
              <FilterListIcon />
            </IconButton>
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
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Todos" {...a11yProps(0)} />
            <Tab label="Ativos" {...a11yProps(1)} />
            <Tab label="Pendentes" {...a11yProps(2)} />
            <Tab label="Concluídos" {...a11yProps(3)} />
            <Tab label="Cancelados" {...a11yProps(4)} />
          </Tabs>
          
          <Divider />
          
          <TabPanel value={tabValue} index={0}>
            {renderContractList(filteredContracts)}
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            {renderContractList(filteredContracts)}
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            {renderContractList(filteredContracts)}
          </TabPanel>
          
          <TabPanel value={tabValue} index={3}>
            {renderContractList(filteredContracts)}
          </TabPanel>
          
          <TabPanel value={tabValue} index={4}>
            {renderContractList(filteredContracts)}
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
  
  function renderContractList(contracts: any[]) {
    if (contracts.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Nenhum contrato encontrado.
          </Typography>
        </Box>
      );
    }
    
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {contracts.map((contract) => (
            <Grid item xs={12} sm={6} md={4} key={contract.id}>
              <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="div" noWrap sx={{ maxWidth: '70%' }}>
                      {contract.service.title}
                    </Typography>
                    <Chip
                      label={getStatusLabel(contract.status)}
                      color={getStatusColor(contract.status) as any}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Fornecedor: {contract.service.supplier.companyName}
                  </Typography>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Grid container spacing={1} sx={{ mb: 1 }}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Início:
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(contract.startDate)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Término:
                      </Typography>
                      <Typography variant="body2">
                        {contract.endDate ? formatDate(contract.endDate) : 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Valor:
                    </Typography>
                    <Typography variant="subtitle1" color="primary" fontWeight="bold">
                      R$ {contract.totalPrice.toFixed(2)}
                    </Typography>
                  </Box>
                </CardContent>
                
                <Divider />
                
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<LaunchIcon />}
                    onClick={() => navigate(`/cliente/contratos/${contract.id}`)}
                  >
                    Detalhes
                  </Button>
                  
                  {contract.status === 'PENDING' && (
                    <Button
                      size="small"
                      startIcon={<PaymentIcon />}
                      color="primary"
                      onClick={() => navigate(`/cliente/contratos/${contract.id}/pagamento`)}
                    >
                      Pagar
                    </Button>
                  )}
                  
                  {contract.status === 'ACTIVE' && (
                    <Button
                      size="small"
                      startIcon={<AssessmentIcon />}
                      color="primary"
                    >
                      Avaliar
                    </Button>
                  )}
                  
                  {(contract.status === 'COMPLETED' || contract.status === 'ACTIVE') && (
                    <Button
                      size="small"
                      startIcon={<ReceiptIcon />}
                      onClick={() => alert('Em um ambiente real, isso mostraria o histórico de pagamentos')}
                    >
                      Recibos
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }
};

export default ClientContractsPage;