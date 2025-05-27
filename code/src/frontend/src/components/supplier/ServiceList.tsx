import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import serviceService from '../../services/serviceService';

interface ServiceListProps {
  services: any[];
  onRefresh: () => void;
  loading?: boolean;
}

const ServiceList: React.FC<ServiceListProps> = ({
  services,
  onRefresh,
  loading = false,
}) => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState<Record<string, boolean>>({});
  const [metricsDialogOpen, setMetricsDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

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

  const handleDeleteClick = (service: any) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setServiceToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;
    
    setDeleting(true);
    setError(null);
    
    try {
      await serviceService.deleteService(serviceToDelete.id);
      onRefresh();
    } catch (err: any) {
      console.error('Error deleting service:', err);
      setError(err.response?.data?.message || 'Erro ao excluir serviço');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
    }
  };
  
  const handleStatusChange = async (service: any, checked: boolean) => {
    const newStatus = checked ? 'ACTIVE' : 'INACTIVE';
    
    // Only allow status change for approved services
    if (service.status === 'PENDING' || service.status === 'REJECTED') {
      return;
    }
    
    setStatusLoading(prev => ({ ...prev, [service.id]: true }));
    setError(null);
    
    try {
      await serviceService.updateServiceStatus(service.id, newStatus);
      onRefresh();
    } catch (err: any) {
      console.error('Error updating service status:', err);
      setError(err.response?.data?.message || 'Erro ao atualizar status do serviço');
    } finally {
      setStatusLoading(prev => ({ ...prev, [service.id]: false }));
    }
  };
  
  const handleMetricsClick = (service: any) => {
    setSelectedService(service);
    setMetricsDialogOpen(true);
  };
  
  const handleCloseMetricsDialog = () => {
    setMetricsDialogOpen(false);
    setSelectedService(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (services.length === 0) {
    return (
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Você ainda não cadastrou nenhum serviço.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/fornecedor/servicos/novo')}
          sx={{ mt: 2 }}
        >
          Cadastrar Serviço
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {services.map((service) => (
          <Grid item xs={12} md={6} key={service.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="div">
                    {service.title}
                  </Typography>
                  <Chip
                    label={getStatusLabel(service.status)}
                    color={getStatusColor(service.status) as any}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Categoria: {service.category?.name || 'N/A'}
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 1, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                  {service.description}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Typography variant="h6" color="primary">
                    R$ {service.price.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getPriceTypeLabel(service.priceType)}
                  </Typography>
                </Box>
                
                {service.features && service.features.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Características:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {service.features.slice(0, 3).map((feature: string, index: number) => (
                        <Chip key={index} label={feature} size="small" variant="outlined" />
                      ))}
                      {service.features.length > 3 && (
                        <Chip label={`+${service.features.length - 3}`} size="small" />
                      )}
                    </Box>
                  </Box>
                )}
              </CardContent>
              
              <Divider />
              
              <CardActions sx={{ flexWrap: 'wrap', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => navigate(`/servicos/${service.id}`)}
                  >
                    Visualizar
                  </Button>
                  
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/fornecedor/servicos/editar/${service.id}`)}
                    disabled={service.status === 'PENDING'}
                  >
                    Editar
                  </Button>
                  
                  <Tooltip title="Métricas e desempenho do serviço">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleMetricsClick(service)}
                    >
                      <BarChartIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteClick(service)}
                    disabled={service.status === 'PENDING'}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                
                {(service.status === 'ACTIVE' || service.status === 'INACTIVE') && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={service.status === 'ACTIVE'}
                        onChange={(e) => handleStatusChange(service, e.target.checked)}
                        disabled={statusLoading[service.id]}
                        color="primary"
                        size="small"
                      />
                    }
                    label={statusLoading[service.id] ? 'Atualizando...' : 'Ativo'}
                    sx={{ m: 0 }}
                  />
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o serviço "{serviceToDelete?.title}"? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            Cancelar
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            disabled={deleting}
            startIcon={deleting && <CircularProgress size={20} />}
          >
            {deleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Metrics Dialog */}
      <Dialog
        open={metricsDialogOpen}
        onClose={handleCloseMetricsDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedService?.title ? `Métricas: ${selectedService.title}` : 'Métricas do Serviço'}
        </DialogTitle>
        <DialogContent dividers>
          {selectedService && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Visão Geral de Desempenho
              </Typography>
              
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Visualizações
                      </Typography>
                      <Typography variant="h4">
                        {selectedService.metrics?.views || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Últimos 30 dias
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Contratações
                      </Typography>
                      <Typography variant="h4">
                        {selectedService.metrics?.contracts || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Total acumulado
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Avaliação Média
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h4">
                          {(selectedService.metrics?.rating || 0).toFixed(1)}
                        </Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ ml: 1 }}>
                          /5
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {selectedService.metrics?.ratingCount || 0} avaliações
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Taxa de Conversão
                      </Typography>
                      <Typography variant="h4">
                        {selectedService.metrics?.views && selectedService.metrics?.contracts
                          ? ((selectedService.metrics.contracts / selectedService.metrics.views) * 100).toFixed(1)
                          : '0'}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Visualizações → Contratos
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              <Typography variant="subtitle1" gutterBottom>
                Histórico de Visualizações
              </Typography>
              
              <Box 
                sx={{ 
                  height: 200, 
                  bgcolor: 'background.default', 
                  borderRadius: 1,
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Gráfico de visualizações (simulado) - Em um sistema real, aqui teríamos um gráfico mostrando as visualizações ao longo do tempo.
                </Typography>
              </Box>
              
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                Comentários dos Clientes
              </Typography>
              
              {selectedService.serviceReviews && selectedService.serviceReviews.length > 0 ? (
                <Box>
                  {selectedService.serviceReviews.map((review: any) => (
                    <Card key={review.id} variant="outlined" sx={{ mb: 2 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle2">
                            {review.client?.companyName || 'Cliente'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            Avaliação: {review.rating}/5
                          </Typography>
                        </Box>
                        <Typography variant="body2">
                          {review.comment || 'Sem comentários.'}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Este serviço ainda não possui avaliações.
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMetricsDialog}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ServiceList;