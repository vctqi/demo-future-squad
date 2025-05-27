import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
  Card,
  CardContent,
  CardMedia,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Tab,
  Tabs,
  AlertColor,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Web as WebIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Assignment as AssignmentIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import AdminLayout from '../../layouts/AdminLayout';
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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'INACTIVE':
      return 'error';
    case 'PENDING':
      return 'warning';
    case 'REJECTED':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'Ativo';
    case 'INACTIVE':
      return 'Inativo';
    case 'PENDING':
      return 'Pendente';
    case 'REJECTED':
      return 'Rejeitado';
    default:
      return status;
  }
};

const SupplierDetailPage: React.FC = () => {
  const { supplierId } = useParams<{ supplierId: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [supplier, setSupplier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as AlertColor,
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const fetchSupplier = async () => {
    if (!supplierId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await supplierService.getSupplierById(supplierId);
      setSupplier(data);
    } catch (err: any) {
      console.error('Error fetching supplier:', err);
      setError(err.response?.data?.message || 'Erro ao carregar dados do fornecedor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplier();
  }, [supplierId]);

  const handleRejectDialogOpen = () => {
    setRejectDialogOpen(true);
  };

  const handleRejectDialogClose = () => {
    setRejectDialogOpen(false);
    setRejectReason('');
  };

  const handleApproveSupplier = async () => {
    if (!supplierId) return;
    
    try {
      await permissionsService.approveSupplier(supplierId);
      fetchSupplier();
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

  const handleRejectSupplier = async () => {
    if (!supplierId) return;
    
    try {
      await permissionsService.rejectSupplier(supplierId, rejectReason);
      handleRejectDialogClose();
      fetchSupplier();
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

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Detalhes do Fornecedor" breadcrumbs={[{ label: 'Fornecedores', path: '/admin/fornecedores' }, { label: 'Detalhes' }]}>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Detalhes do Fornecedor" breadcrumbs={[{ label: 'Fornecedores', path: '/admin/fornecedores' }, { label: 'Detalhes' }]}>
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/fornecedores')}
          sx={{ mt: 2 }}
        >
          Voltar para Lista
        </Button>
      </AdminLayout>
    );
  }

  if (!supplier) {
    return (
      <AdminLayout title="Detalhes do Fornecedor" breadcrumbs={[{ label: 'Fornecedores', path: '/admin/fornecedores' }, { label: 'Detalhes' }]}>
        <Alert severity="warning" sx={{ my: 2 }}>
          Fornecedor não encontrado
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/fornecedores')}
          sx={{ mt: 2 }}
        >
          Voltar para Lista
        </Button>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title={supplier.companyName} 
      breadcrumbs={[
        { label: 'Fornecedores', path: '/admin/fornecedores' },
        { label: supplier.companyName }
      ]}
    >
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/fornecedores')}
        >
          Voltar para Lista
        </Button>
        
        <Box>
          {supplier.status === 'PENDING' && (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={handleApproveSupplier}
                sx={{ mr: 1 }}
              >
                Aprovar
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<CancelIcon />}
                onClick={handleRejectDialogOpen}
              >
                Rejeitar
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Informações Básicas</Typography>
              <Chip
                label={getStatusLabel(supplier.status)}
                color={getStatusColor(supplier.status) as any}
                size="small"
              />
            </Box>
            
            <List dense disablePadding>
              <ListItem>
                <ListItemIcon><BusinessIcon /></ListItemIcon>
                <ListItemText 
                  primary="Empresa" 
                  secondary={supplier.companyName} 
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon><BusinessIcon /></ListItemIcon>
                <ListItemText 
                  primary="CNPJ" 
                  secondary={supplier.cnpj} 
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon><EmailIcon /></ListItemIcon>
                <ListItemText 
                  primary="Email" 
                  secondary={supplier.user?.email} 
                />
              </ListItem>
              
              {supplier.website && (
                <ListItem>
                  <ListItemIcon><WebIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Website" 
                    secondary={
                      <a href={supplier.website} target="_blank" rel="noopener noreferrer">
                        {supplier.website}
                      </a>
                    } 
                  />
                </ListItem>
              )}
            </List>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Datas
            </Typography>
            <List dense disablePadding>
              <ListItem>
                <ListItemText 
                  primary="Cadastro" 
                  secondary={formatDate(supplier.createdAt)} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Última Atualização" 
                  secondary={formatDate(supplier.updatedAt)} 
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="supplier details tabs"
              >
                <Tab label="Descrição" {...a11yProps(0)} />
                <Tab label="Documentos" {...a11yProps(1)} />
                <Tab label="Serviços" {...a11yProps(2)} />
              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {supplier.description || 'Nenhuma descrição fornecida.'}
              </Typography>
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              {/* In a real application, we would list actual documents here */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachFileIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  CNPJ_123456789.pdf
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachFileIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  Contrato_Social.pdf
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AttachFileIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  Certidoes_Negativas.pdf
                </Typography>
              </Box>
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              {supplier.services && supplier.services.length > 0 ? (
                <Grid container spacing={2}>
                  {supplier.services.map((service: any) => (
                    <Grid item xs={12} sm={6} key={service.id}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" component="div">
                            {service.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {service.description?.substring(0, 100)}...
                          </Typography>
                          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body1" color="primary">
                              R$ {service.price.toFixed(2)}
                            </Typography>
                            <Chip
                              label={getStatusLabel(service.status)}
                              color={getStatusColor(service.status) as any}
                              size="small"
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  Este fornecedor ainda não cadastrou serviços.
                </Typography>
              )}
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={handleRejectDialogClose}>
        <DialogTitle>Rejeitar Fornecedor</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Por favor, informe o motivo da rejeição do cadastro de {supplier.companyName}. Esta informação será enviada ao fornecedor.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="reason"
            label="Motivo da Rejeição"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRejectDialogClose}>Cancelar</Button>
          <Button 
            onClick={handleRejectSupplier} 
            color="error" 
            disabled={!rejectReason.trim()}
          >
            Rejeitar
          </Button>
        </DialogActions>
      </Dialog>

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
};

export default SupplierDetailPage;