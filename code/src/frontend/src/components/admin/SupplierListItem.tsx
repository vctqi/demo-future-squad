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
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Web as WebIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

interface SupplierListItemProps {
  supplier: any;
  onApprove: (supplierId: string) => void;
  onReject: (supplierId: string, reason: string) => void;
  onViewDetails: (supplierId: string) => void;
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

const SupplierListItem: React.FC<SupplierListItemProps> = ({
  supplier,
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
    onReject(supplier.id, rejectReason);
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
    <Card sx={{ mb: 2, border: supplier.status === 'PENDING' ? '1px solid #ed6c02' : 'none' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" component="div">
              {supplier.companyName}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              CNPJ: {supplier.cnpj}
            </Typography>
          </Box>
          <Chip
            label={getStatusLabel(supplier.status)}
            color={getStatusColor(supplier.status) as any}
            size="small"
          />
        </Box>

        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
          <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2">{supplier.user?.email}</Typography>
        </Box>

        {supplier.website && (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
            <WebIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Link href={supplier.website} target="_blank" variant="body2">
              {supplier.website}
            </Link>
          </Box>
        )}

        <Box sx={{ mt: 1, display: 'flex', alignItems: 'flex-start' }}>
          <DescriptionIcon fontSize="small" sx={{ mr: 1, mt: 0.5, color: 'text.secondary' }} />
          <Typography variant="body2">
            {supplier.description?.length > 100 && !expanded
              ? `${supplier.description.substring(0, 100)}...`
              : supplier.description}
          </Typography>
        </Box>
      </CardContent>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Detalhes do Fornecedor
              </Typography>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Cadastrado em: {formatDate(supplier.createdAt)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Última atualização: {formatDate(supplier.updatedAt)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Documentos
              </Typography>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {supplier.documents ? `${supplier.documents.length} documentos enviados` : 'Nenhum documento disponível'}
                </Typography>
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
          onClick={() => onViewDetails(supplier.id)}
        >
          Detalhes
        </Button>

        {supplier.status === 'PENDING' && (
          <>
            <Button
              size="small"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={() => onApprove(supplier.id)}
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

export default SupplierListItem;