import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Grid,
  Button,
  Paper,
  Tab,
  Tabs,
  Pagination,
  CircularProgress,
  Snackbar,
  Alert,
  AlertColor,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import ServiceListItem from '../../components/admin/ServiceListItem';
import adminService from '../../services/adminService';
import serviceService from '../../services/serviceService';

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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const ServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as AlertColor,
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await serviceService.getAllCategories();
        setCategories(data);
      } catch (err: any) {
        console.error('Error fetching categories:', err);
        // We don't set the error state here to avoid showing an error for the entire page
      }
    };

    fetchCategories();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // Set status filter based on tab
    switch (newValue) {
      case 0: // All
        setStatus('');
        break;
      case 1: // Pending
        setStatus('PENDING');
        break;
      case 2: // Active
        setStatus('ACTIVE');
        break;
      case 3: // Rejected
        setStatus('REJECTED');
        break;
      default:
        setStatus('');
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setCategoryId(event.target.value);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getAllServices({
        page,
        limit: 10,
        status,
        search: searchTerm,
        categoryId: categoryId || undefined,
      });
      setServices(response.services);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      console.error('Error fetching services:', err);
      setError(err.response?.data?.message || 'Erro ao carregar serviços');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [page, status, searchTerm, categoryId]);

  const handleApproveService = async (serviceId: string) => {
    try {
      await adminService.approveService(serviceId);
      fetchServices();
      setNotification({
        open: true,
        message: 'Serviço aprovado com sucesso',
        severity: 'success',
      });
    } catch (err: any) {
      console.error('Error approving service:', err);
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Erro ao aprovar serviço',
        severity: 'error',
      });
    }
  };

  const handleRejectService = async (serviceId: string, reason: string) => {
    try {
      await adminService.rejectService(serviceId, reason);
      fetchServices();
      setNotification({
        open: true,
        message: 'Serviço rejeitado',
        severity: 'info',
      });
    } catch (err: any) {
      console.error('Error rejecting service:', err);
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Erro ao rejeitar serviço',
        severity: 'error',
      });
    }
  };

  const handleViewDetails = (serviceId: string) => {
    navigate(`/admin/servicos/${serviceId}`);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const pendingCount = services.filter(s => s.status === 'PENDING').length;
  const title = `Serviços ${pendingCount > 0 ? `(${pendingCount} pendentes)` : ''}`;
  
  return (
    <AdminLayout title={title} breadcrumbs={[{ label: 'Serviços' }]}>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5} md={4}>
            <TextField
              fullWidth
              label="Pesquisar"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              placeholder="Título ou descrição"
            />
          </Grid>
          
          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="category-label">Categoria</InputLabel>
              <Select
                labelId="category-label"
                value={categoryId}
                label="Categoria"
                onChange={handleCategoryChange}
              >
                <MenuItem value="">Todas</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                value={status}
                label="Status"
                onChange={(e) => setStatus(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="PENDING">Pendentes</MenuItem>
                <MenuItem value="ACTIVE">Ativos</MenuItem>
                <MenuItem value="REJECTED">Rejeitados</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3} sx={{ textAlign: { md: 'right' } }}>
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
              startIcon={<FilterListIcon />}
              onClick={() => {
                setSearchTerm('');
                setCategoryId('');
                setStatus('');
                setPage(1);
              }}
            >
              Limpar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="service tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Todos" {...a11yProps(0)} />
          <Tab 
            label={`Pendentes ${pendingCount > 0 ? `(${pendingCount})` : ''}`} 
            {...a11yProps(1)} 
            sx={{ 
              color: pendingCount > 0 ? 'warning.main' : 'inherit',
              fontWeight: pendingCount > 0 ? 'bold' : 'normal',
            }}
          />
          <Tab label="Ativos" {...a11yProps(2)} />
          <Tab label="Rejeitados" {...a11yProps(3)} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {renderServicesList()}
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        {renderServicesList()}
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        {renderServicesList()}
      </TabPanel>
      <TabPanel value={tabValue} index={3}>
        {renderServicesList()}
      </TabPanel>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </AdminLayout>
  );

  function renderServicesList() {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      );
    }

    if (services.length === 0) {
      return (
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Nenhum serviço encontrado.
          </Typography>
        </Box>
      );
    }

    return (
      <>
        {services.map((service) => (
          <ServiceListItem
            key={service.id}
            service={service}
            onApprove={handleApproveService}
            onReject={handleRejectService}
            onViewDetails={handleViewDetails}
          />
        ))}

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}
      </>
    );
  }
};

export default ServicesPage;