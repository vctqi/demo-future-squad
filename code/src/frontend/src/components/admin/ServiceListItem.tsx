import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Collapse,
  Divider,
  Grid,
  TextField,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Rating,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  Business as BusinessIcon,
  Category as CategoryIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

interface ServiceListItemProps {
  service: any;
  onApprove: (serviceId: string) => void;
  onReject: (serviceId: string, reason: string) => void;
  onViewDetails: (serviceId: string) => void;
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

const ServiceListItem: React.FC<ServiceListItemProps> = ({
  service,
  onApprove,
  onReject,
  onViewDetails,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleRejectDialogOpen = () => {
    setRejectDialogOpen(true);
  };

  const handleRejectDialogClose = () => {
    setRejectDialogOpen(false);
    setRejectReason('');
  };

  const handleRejectConfirm = () => {
    onReject(service.id, rejectReason);
    handleRejectDialogClose();
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Card sx={{ mb: 2, border: service.status === 'PENDING' ? '1px solid #ed6c02' : 'none' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" component="div">
              {service.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <BusinessIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Fornecedor: {service.supplier?.companyName}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={getStatusLabel(service.status)}
            color={getStatusColor(service.status) as any}
            size="small"
          />
        </Box>

        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
          <CategoryIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            Categoria: {service.category?.name}
          </Typography>
        </Box>

        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
          <AttachMoneyIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
          <Typography variant="body2">
            R$ {service.price.toFixed(2)} ({getPriceTypeLabel(service.priceType)})
          </Typography>
        </Box>

        <Box sx={{ mt: 1, display: 'flex', alignItems: 'flex-start' }}>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {service.description?.length > 150 && !expanded
              ? `${service.description.substring(0, 150)}...`
              : service.description}
          </Typography>
        </Box>

        {service.averageRating !== null && (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
            <Rating value={service.averageRating} precision={0.5} size="small" readOnly />
            <Typography variant="body2" sx={{ ml: 1 }}>
              ({service.reviewCount} avaliações)
            </Typography>
          </Box>
        )}
      </CardContent>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Detalhes do Serviço
              </Typography>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Cadastrado em: {formatDate(service.createdAt)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Última atualização: {formatDate(service.updatedAt)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Informações do Fornecedor
              </Typography>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Email: {service.supplier?.user?.email}
                </Typography>
                {service.supplier?.website && (
                  <Typography variant="body2" color="text.secondary">
                    Website: <Link href={service.supplier.website} target="_blank">{service.supplier.website}</Link>
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Collapse>

      <Divider />

      <CardActions>
        <Button
          size="small"
          startIcon={<InfoIcon />}
          onClick={() => onViewDetails(service.id)}
        >
          Detalhes
        </Button>

        {service.status === 'PENDING' && (
          <>
            <Button
              size="small"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={() => onApprove(service.id)}
            >
              Aprovar
            </Button>
            <Button
              size="small"
              color="error"
              startIcon={<CancelIcon />}
              onClick={handleRejectDialogOpen}
            >
              Rejeitar
            </Button>
          </>
        )}

        <Button
          size="small"
          onClick={handleExpandClick}
          endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{ ml: 'auto' }}
        >
          {expanded ? 'Menos' : 'Mais'}
        </Button>
      </CardActions>

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
            onClick={handleRejectConfirm} 
            color="error" 
            disabled={!rejectReason.trim()}
          >
            Rejeitar
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default ServiceListItem;