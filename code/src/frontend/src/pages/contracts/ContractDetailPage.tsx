import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Grid,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  CancelScheduleSend as CancelIcon,
  ArrowBack as ArrowBackIcon,
  Receipt as ReceiptIcon,
  ChatBubbleOutline as ChatIcon,
  Assessment as AssessmentIcon,
  CalendarToday as CalendarIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import contractService from '../../services/contractService';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

const ContractDetailPage: React.FC = () => {
  const { contractId } = useParams<{ contractId: string }>();
  const navigate = useNavigate();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContract = async () => {
      if (!contractId) {
        setError('ID do contrato não fornecido');
        setLoading(false);
        return;
      }

      try {
        const data = await contractService.getContractById(contractId);
        setContract(data);
      } catch (err: any) {
        console.error('Error fetching contract:', err);
        setError(err.response?.data?.message || 'Erro ao carregar detalhes do contrato');
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [contractId]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (e) {
      console.error('Date formatting error:', e);
      return String(dateString);
    }
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

  const handleCancelContract = async () => {
    if (!contractId || !cancelReason.trim()) return;
    
    setCancelling(true);
    setCancelError(null);
    
    try {
      await contractService.cancelContract(contractId, cancelReason);
      
      // Reload contract data
      const updatedContract = await contractService.getContractById(contractId);
      setContract(updatedContract);
      
      // Close dialog
      setCancelDialogOpen(false);
      setCancelReason('');
    } catch (err: any) {
      console.error('Error cancelling contract:', err);
      setCancelError(err.response?.data?.message || 'Erro ao cancelar contrato');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !contract) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || 'Contrato não encontrado'}
          </Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/cliente/contratos')}
          >
            Voltar para meus contratos
          </Button>
        </Box>
      </Container>
    );
  }

  const isContractCancellable = contract.status === 'PENDING';
  const isPendingPayment = contract.status === 'PENDING';

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/" color="inherit">
            Home
          </Link>
          <Link component={RouterLink} to="/cliente/contratos" color="inherit">
            Meus Contratos
          </Link>
          <Typography color="text.primary">
            Contrato #{contractId?.substring(0, 8)}
          </Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" component="h1">
            Detalhes do Contrato
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/cliente/contratos')}
            >
              Voltar
            </Button>
            
            {contract.status === 'ACTIVE' && (
              <Button
                variant="outlined"
                startIcon={<AssessmentIcon />}
                color="primary"
              >
                Avaliar Serviço
              </Button>
            )}
            
            {isPendingPayment && (
              <Button
                variant="contained"
                startIcon={<PaymentIcon />}
                color="primary"
                onClick={() => navigate(`/cliente/contratos/${contractId}/pagamento`)}
              >
                Realizar Pagamento
              </Button>
            )}
            
            {isContractCancellable && (
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                color="error"
                onClick={() => setCancelDialogOpen(true)}
              >
                Cancelar Contrato
              </Button>
            )}
          </Box>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5">
                  {contract.service.title}
                </Typography>
                <Chip
                  label={getStatusLabel(contract.status)}
                  color={getStatusColor(contract.status) as any}
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                {contract.service.description?.substring(0, 200)}...
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Detalhes do Contrato
                  </Typography>
                  
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      ID do Contrato:
                    </Typography>
                    <Typography variant="body1">
                      {contract.id}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Data de Início:
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(contract.startDate)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Data de Término:
                    </Typography>
                    <Typography variant="body1">
                      {contract.endDate ? formatDate(contract.endDate) : 'N/A'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Valor Total:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="primary">
                      R$ {contract.totalPrice.toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Fornecedor
                  </Typography>
                  
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Empresa:
                    </Typography>
                    <Typography variant="body1">
                      {contract.service.supplier.companyName}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      CNPJ:
                    </Typography>
                    <Typography variant="body1">
                      {contract.service.supplier.cnpj}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Contato:
                    </Typography>
                    <Typography variant="body1">
                      {contract.service.supplier.user.email}
                    </Typography>
                  </Box>
                  
                  <Button
                    variant="outlined"
                    startIcon={<ChatIcon />}
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    Contactar Fornecedor
                  </Button>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Histórico de Atividades
              </Typography>
              
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'background.default' }}>
                      <TableCell>Data</TableCell>
                      <TableCell>Atividade</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>{formatDate(contract.createdAt)}</TableCell>
                      <TableCell>Contrato criado</TableCell>
                      <TableCell>
                        <Chip size="small" label="Concluído" color="success" />
                      </TableCell>
                    </TableRow>
                    
                    {contract.status === 'PENDING' && (
                      <TableRow>
                        <TableCell>-</TableCell>
                        <TableCell>Aguardando pagamento</TableCell>
                        <TableCell>
                          <Chip size="small" label="Pendente" color="warning" />
                        </TableCell>
                      </TableRow>
                    )}
                    
                    {contract.status === 'ACTIVE' && (
                      <TableRow>
                        <TableCell>{formatDate(contract.updatedAt)}</TableCell>
                        <TableCell>Pagamento realizado</TableCell>
                        <TableCell>
                          <Chip size="small" label="Concluído" color="success" />
                        </TableCell>
                      </TableRow>
                    )}
                    
                    {contract.status === 'CANCELLED' && (
                      <TableRow>
                        <TableCell>{formatDate(contract.updatedAt)}</TableCell>
                        <TableCell>Contrato cancelado</TableCell>
                        <TableCell>
                          <Chip size="small" label="Cancelado" color="error" />
                        </TableCell>
                      </TableRow>
                    )}
                    
                    {contract.status === 'COMPLETED' && (
                      <TableRow>
                        <TableCell>{formatDate(contract.updatedAt)}</TableCell>
                        <TableCell>Contrato concluído</TableCell>
                        <TableCell>
                          <Chip size="small" label="Concluído" color="success" />
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Detalhes do Serviço
              </Typography>
              
              <Typography variant="body1" paragraph>
                {contract.service.description}
              </Typography>
              
              {contract.service.features && contract.service.features.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Características Incluídas:
                  </Typography>
                  
                  <Grid container spacing={1}>
                    {contract.service.features.map((feature: string, index: number) => (
                      <Grid item key={index}>
                        <Chip label={feature} variant="outlined" size="small" />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Próximas Etapas
                </Typography>
                
                {contract.status === 'PENDING' && (
                  <Box>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      Este contrato está pendente de pagamento.
                    </Alert>
                    
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<PaymentIcon />}
                      fullWidth
                      sx={{ mb: 2 }}
                      onClick={() => navigate(`/cliente/contratos/${contractId}/pagamento`)}
                    >
                      Realizar Pagamento
                    </Button>
                  </Box>
                )}
                
                {contract.status === 'ACTIVE' && (
                  <Box>
                    <Alert severity="success" sx={{ mb: 2 }}>
                      Este contrato está ativo e o serviço está em andamento.
                    </Alert>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CalendarIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Término previsto: {formatDate(contract.endDate)}
                      </Typography>
                    </Box>
                    
                    <Button
                      variant="outlined"
                      startIcon={<AssessmentIcon />}
                      fullWidth
                      sx={{ mb: 1 }}
                    >
                      Avaliar Serviço
                    </Button>
                    
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      fullWidth
                    >
                      Renovar Contrato
                    </Button>
                  </Box>
                )}
                
                {contract.status === 'COMPLETED' && (
                  <Box>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Este contrato foi concluído com sucesso.
                    </Alert>
                    
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      fullWidth
                      sx={{ mb: 1 }}
                    >
                      Contratar Novamente
                    </Button>
                  </Box>
                )}
                
                {contract.status === 'CANCELLED' && (
                  <Box>
                    <Alert severity="error" sx={{ mb: 2 }}>
                      Este contrato foi cancelado.
                    </Alert>
                    
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      fullWidth
                    >
                      Contratar Novamente
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
            
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Pagamentos
                </Typography>
                
                {contract.status === 'PENDING' && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Nenhum pagamento registrado.
                  </Alert>
                )}
                
                {contract.status !== 'PENDING' && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Método:
                      </Typography>
                      <Typography variant="body2">
                        {contract.metadata?.paymentMethod === 'bank_account' && 'Débito em Conta'}
                        {contract.metadata?.paymentMethod === 'boleto' && 'Boleto Bancário'}
                        {contract.metadata?.paymentMethod === 'credit_card' && 'Cartão de Crédito'}
                        {!contract.metadata?.paymentMethod && 'Pagamento Processado'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Data:
                      </Typography>
                      <Typography variant="body2">
                        {contract.metadata?.paymentDate 
                          ? formatDate(contract.metadata.paymentDate) 
                          : formatDate(contract.updatedAt)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Valor:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        R$ {contract.totalPrice.toFixed(2)}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Button
                      variant="outlined"
                      startIcon={<ReceiptIcon />}
                      fullWidth
                      size="small"
                    >
                      Ver Recibo
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
            
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Documento do Contrato
                </Typography>
                
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mb: 1 }}
                  onClick={() => window.open(`/api/contracts/${contractId}/document/download`, '_blank')}
                >
                  Baixar Contrato
                </Button>
                
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mb: 1 }}
                  onClick={() => window.open(`/api/contracts/${contractId}/document`, '_blank')}
                >
                  Visualizar Contrato
                </Button>
                
                {contract.status === 'ACTIVE' && !contract.metadata?.signatures?.client && (
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={async () => {
                      try {
                        await contractService.signContract(contractId!);
                        alert('Contrato assinado com sucesso!');
                        // Refresh contract data
                        const updatedContract = await contractService.getContractById(contractId!);
                        setContract(updatedContract);
                      } catch (err) {
                        alert('Erro ao assinar contrato. Tente novamente.');
                      }
                    }}
                  >
                    Assinar Contrato
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      
      {/* Cancel Contract Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cancelar Contrato</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Tem certeza que deseja cancelar este contrato? Esta ação não pode ser desfeita.
          </DialogContentText>
          
          {cancelError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {cancelError}
            </Alert>
          )}
          
          <TextField
            autoFocus
            label="Motivo do Cancelamento"
            fullWidth
            multiline
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            required
            error={cancelReason.trim() === ''}
            helperText={cancelReason.trim() === '' ? 'O motivo é obrigatório' : ''}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setCancelDialogOpen(false)} 
            disabled={cancelling}
          >
            Voltar
          </Button>
          <Button 
            onClick={handleCancelContract} 
            color="error" 
            disabled={cancelling || cancelReason.trim() === ''}
            variant="contained"
          >
            {cancelling ? 'Cancelando...' : 'Confirmar Cancelamento'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ContractDetailPage;