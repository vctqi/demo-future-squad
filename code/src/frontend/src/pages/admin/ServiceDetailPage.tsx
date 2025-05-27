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
  Rating,
  Stack,
  Card,
  CardContent,
  AlertColor,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Web as WebIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon,
  AttachMoney as AttachMoneyIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Assignment as AssignmentIcon,
  Star as StarIcon,
  LocalOffer as LocalOfferIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import AdminLayout from '../../layouts/AdminLayout';
import adminService from '../../services/adminService';

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
      id={`service-tabpanel-${index}`}
      aria-labelledby={`service-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `service-tab-${index}`,
    'aria-controls': `service-tabpanel-${index}`,
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

const getPriceTypeLabel = (priceType: string) => {
  switch (priceType) {
    case 'FIXED':
      return 'Preço Fixo';
    case 'HOURLY':
      return 'Por Hora';
    case 'MONTHLY':
      return 'Mensal';
    case 'YEARLY':
      return 'Anual';
    case 'CUSTOM':
      return 'Personalizado';
    default:
      return priceType;
  }
};

const ServiceDetailPage: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [service, setService] = useState<any>(null);
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

  const fetchService = async () => {
    if (!serviceId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getServiceById(serviceId);
      setService(data);
    } catch (err: any) {
      console.error('Error fetching service:', err);
      setError(err.response?.data?.message || 'Erro ao carregar dados do serviço');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchService();
  }, [serviceId]);

  const handleRejectDialogOpen = () => {
    setRejectDialogOpen(true);
  };

  const handleRejectDialogClose = () => {
    setRejectDialogOpen(false);
    setRejectReason('');
  };

  const handleApproveService = async () => {
    if (!serviceId) return;
    
    try {
      await adminService.approveService(serviceId);
      fetchService();
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

  const handleRejectService = async () => {
    if (!serviceId) return;
    
    try {
      await adminService.rejectService(serviceId, rejectReason);
      handleRejectDialogClose();
      fetchService();
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
      <AdminLayout title="Detalhes do Serviço" breadcrumbs={[{ label: 'Serviços', path: '/admin/servicos' }, { label: 'Detalhes' }]}>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Detalhes do Serviço" breadcrumbs={[{ label: 'Serviços', path: '/admin/servicos' }, { label: 'Detalhes' }]}>
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/servicos')}
          sx={{ mt: 2 }}
        >
          Voltar para Lista
        </Button>
      </AdminLayout>
    );
  }

  if (!service) {
    return (
      <AdminLayout title="Detalhes do Serviço" breadcrumbs={[{ label: 'Serviços', path: '/admin/servicos' }, { label: 'Detalhes' }]}>
        <Alert severity="warning" sx={{ my: 2 }}>
          Serviço não encontrado
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/servicos')}
          sx={{ mt: 2 }}
        >
          Voltar para Lista
        </Button>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title={service.title} 
      breadcrumbs={[
        { label: 'Serviços', path: '/admin/servicos' },
        { label: service.title.length > 30 ? service.title.substring(0, 30) + '...' : service.title }
      ]}
    >
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/servicos')}
        >
          Voltar para Lista
        </Button>
        
        <Box>
          {service.status === 'PENDING' && (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={handleApproveService}
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
                label={getStatusLabel(service.status)}
                color={getStatusColor(service.status) as any}
                size="small"
              />
            </Box>
            
            <List dense disablePadding>
              <ListItem>
                <ListItemIcon><CategoryIcon /></ListItemIcon>
                <ListItemText 
                  primary="Categoria" 
                  secondary={service.category?.name} 
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon><AttachMoneyIcon /></ListItemIcon>
                <ListItemText 
                  primary="Preço" 
                  secondary={`R$ ${service.price.toFixed(2)} (${getPriceTypeLabel(service.priceType)})`} 
                />
              </ListItem>
              
              {service.features && service.features.length > 0 && (
                <ListItem>
                  <ListItemIcon><LocalOfferIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Características" 
                    secondary={
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {service.features.map((feature: string, index: number) => (
                          <Chip key={index} label={feature} size="small" variant="outlined" />
                        ))}
                      </Box>
                    } 
                  />
                </ListItem>
              )}
              
              {service.averageRating !== null && (
                <ListItem>
                  <ListItemIcon><StarIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Avaliação" 
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Rating value={service.averageRating} precision={0.5} size="small" readOnly />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          ({service.reviewCount} avaliações)
                        </Typography>
                      </Box>
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
                  secondary={formatDate(service.createdAt)} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Última Atualização" 
                  secondary={formatDate(service.updatedAt)} 
                />
              </ListItem>
            </List>
          </Paper>
          
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Informações do Fornecedor
            </Typography>
            
            <List dense disablePadding>
              <ListItem>
                <ListItemIcon><BusinessIcon /></ListItemIcon>
                <ListItemText 
                  primary="Empresa" 
                  secondary={service.supplier?.companyName} 
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon><EmailIcon /></ListItemIcon>
                <ListItemText 
                  primary="Email" 
                  secondary={service.supplier?.user?.email} 
                />
              </ListItem>
              
              {service.supplier?.website && (
                <ListItem>
                  <ListItemIcon><WebIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Website" 
                    secondary={
                      <a href={service.supplier.website} target="_blank" rel="noopener noreferrer">
                        {service.supplier.website}
                      </a>
                    } 
                  />
                </ListItem>
              )}
            </List>
            
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => navigate(`/admin/fornecedores/${service.supplier?.id}`)}
              >
                Ver Perfil do Fornecedor
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="service details tabs"
              >
                <Tab label="Descrição" {...a11yProps(0)} />
                <Tab label="Contratos" {...a11yProps(1)} />
                <Tab label="Avaliações" {...a11yProps(2)} />
              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>
                Descrição do Serviço
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {service.description || 'Nenhuma descrição fornecida.'}
              </Typography>
              
              {service.terms && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Termos e Condições
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {service.terms}
                  </Typography>
                </>
              )}
              
              {service.sla && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    SLA (Acordo de Nível de Serviço)
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {service.sla}
                  </Typography>
                </>
              )}
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>
                Contratos
              </Typography>
              
              {service.contracts && service.contracts.length > 0 ? (
                <Stack spacing={2}>
                  {service.contracts.map((contract: any) => (
                    <Card key={contract.id} variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography variant="subtitle1">
                            Cliente: {contract.client?.companyName}
                          </Typography>
                          <Chip 
                            label={contract.status} 
                            size="small" 
                            color={contract.status === 'ACTIVE' ? 'success' : 'default'}
                          />
                        </Box>
                        
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Início: {formatDate(contract.startDate)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Fim: {contract.endDate ? formatDate(contract.endDate) : 'N/A'}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="body1" color="primary" fontWeight="bold">
                              Valor: R$ {contract.totalPrice.toFixed(2)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  Este serviço ainda não possui contratos.
                </Typography>
              )}
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>
                Avaliações
              </Typography>
              
              {service.serviceReviews && service.serviceReviews.length > 0 ? (
                <Stack spacing={2}>
                  {service.serviceReviews.map((review: any) => (
                    <Card key={review.id} variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography variant="subtitle1">
                            Cliente: {review.client?.companyName}
                          </Typography>
                          <Box>
                            <Rating value={review.rating} precision={0.5} size="small" readOnly />
                          </Box>
                        </Box>
                        
                        {review.comment && (
                          <Typography variant="body1" sx={{ mt: 1 }}>
                            {review.comment}
                          </Typography>
                        )}
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Data: {formatDate(review.createdAt)}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  Este serviço ainda não possui avaliações.
                </Typography>
              )}
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={handleRejectDialogClose}>
        <DialogTitle>Rejeitar Serviço</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Por favor, informe o motivo da rejeição do serviço "{service.title}". Esta informação será enviada ao fornecedor.
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
            onClick={handleRejectService} 
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

export default ServiceDetailPage;