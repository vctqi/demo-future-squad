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
import SupplierListItem from '../../components/admin/SupplierListItem';
import supplierService from '../../services/supplierService';
import permissionsService from '../../services/permissionsService';

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

const SuppliersPage: React.FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as AlertColor,
  });

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

  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatus(event.target.value);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const fetchSuppliers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await supplierService.getAllSuppliers({
        page,
        limit: 10,
        status,
        search: searchTerm,
      });
      setSuppliers(response.suppliers);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      console.error('Error fetching suppliers:', err);
      setError(err.response?.data?.message || 'Erro ao carregar fornecedores');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSupplier = async (supplierId: string) => {
    try {
      await permissionsService.approveSupplier(supplierId);
      fetchSuppliers();
      setNotification({
        open: true,
        message: 'Fornecedor aprovado com sucesso',
        severity: 'success',
      });
    } catch (err: any) {
      console.error('Error approving supplier:', err);
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Erro ao aprovar fornecedor',
        severity: 'error',
      });
    }
  };

  const handleRejectSupplier = async (supplierId: string, reason: string) => {
    try {
      await permissionsService.rejectSupplier(supplierId, reason);
      fetchSuppliers();
      setNotification({
        open: true,
        message: 'Fornecedor rejeitado',
        severity: 'info',
      });
    } catch (err: any) {
      console.error('Error rejecting supplier:', err);
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Erro ao rejeitar fornecedor',
        severity: 'error',
      });
    }
  };

  const handleViewDetails = (supplierId: string) => {
    navigate(`/admin/fornecedores/${supplierId}`);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  useEffect(() => {
    fetchSuppliers();
  }, [page, status, searchTerm]);

  const pendingCount = suppliers.filter(s => s.status === 'PENDING').length;
  const title = `Fornecedores ${pendingCount > 0 ? `(${pendingCount} pendentes)` : ''}`;
  
  return (
    <AdminLayout title={title} breadcrumbs={[{ label: 'Fornecedores' }]}>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
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
              placeholder="Nome, CNPJ ou e-mail"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={status} label="Status" onChange={handleStatusChange}>
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="PENDING">Pendentes</MenuItem>
                <MenuItem value="ACTIVE">Ativos</MenuItem>
                <MenuItem value="REJECTED">Rejeitados</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={12} md={5} sx={{ textAlign: { md: 'right' } }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchSuppliers}
              sx={{ mr: 1 }}
            >
              Atualizar
            </Button>
            <Button
              variant="contained"
              startIcon={<FilterListIcon />}
              disabled
            >
              Mais Filtros
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="supplier tabs"
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
        {renderSuppliersList()}
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        {renderSuppliersList()}
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        {renderSuppliersList()}
      </TabPanel>
      <TabPanel value={tabValue} index={3}>
        {renderSuppliersList()}
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

  function renderSuppliersList() {
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

    if (suppliers.length === 0) {
      return (
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Nenhum fornecedor encontrado.
          </Typography>
        </Box>
      );
    }

    return (
      <>
        {suppliers.map((supplier) => (
          <SupplierListItem
            key={supplier.id}
            supplier={supplier}
            onApprove={handleApproveSupplier}
            onReject={handleRejectSupplier}
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

export default SuppliersPage;