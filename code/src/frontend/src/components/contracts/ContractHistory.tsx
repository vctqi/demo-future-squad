import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import {
  ReceiptLong as ContractIcon,
  Edit as EditIcon,
  Payment as PaymentIcon,
  Cancel as CancelIcon,
  History as HistoryIcon,
  Description as DocumentIcon,
  CloudDownload as DownloadIcon,
  Create as SignIcon,
} from '@mui/icons-material';
import contractService from '../../services/contractService';

interface ContractHistoryProps {
  contractId: string;
}

const ContractHistory: React.FC<ContractHistoryProps> = ({
  contractId,
}) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await contractService.getContractHistory(contractId);
        setHistory(data);
      } catch (err: any) {
        console.error('Error fetching contract history:', err);
        setError(err.response?.data?.message || 'Erro ao carregar histórico do contrato');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, [contractId]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('pt-BR');
    } catch (e) {
      console.error('Date formatting error:', e);
      return String(dateString);
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'CONTRACT_CREATE':
        return <ContractIcon color="primary" />;
      case 'CONTRACT_UPDATE':
        return <EditIcon color="primary" />;
      case 'CONTRACT_CANCEL':
        return <CancelIcon color="error" />;
      case 'CONTRACT_SIGNED':
        return <SignIcon color="success" />;
      case 'CONTRACT_DOCUMENT_GENERATED':
        return <DocumentIcon color="primary" />;
      case 'CONTRACT_DOCUMENT_DOWNLOADED':
        return <DownloadIcon color="primary" />;
      case 'PAYMENT_PROCESS':
        return <PaymentIcon color="success" />;
      default:
        return <HistoryIcon />;
    }
  };

  const getEventTitle = (eventType: string) => {
    switch (eventType) {
      case 'CONTRACT_CREATE':
        return 'Contrato Criado';
      case 'CONTRACT_UPDATE':
        return 'Contrato Atualizado';
      case 'CONTRACT_CANCEL':
        return 'Contrato Cancelado';
      case 'CONTRACT_SIGNED':
        return 'Contrato Assinado';
      case 'CONTRACT_DOCUMENT_GENERATED':
        return 'Documento Gerado';
      case 'CONTRACT_DOCUMENT_DOWNLOADED':
        return 'Documento Baixado';
      case 'PAYMENT_PROCESS':
        return 'Pagamento Processado';
      default:
        return 'Evento';
    }
  };

  const getEventDescription = (event: any) => {
    switch (event.eventType) {
      case 'CONTRACT_CREATE':
        return 'Contrato criado com sucesso.';
      case 'CONTRACT_UPDATE':
        return `Contrato atualizado. ${event.details?.newStatus ? `Novo status: ${event.details.newStatus}` : ''}`;
      case 'CONTRACT_CANCEL':
        return `Contrato cancelado. ${event.details?.reason ? `Motivo: ${event.details.reason}` : ''}`;
      case 'CONTRACT_SIGNED':
        return `Contrato assinado pelo ${event.details?.signatureType === 'CLIENT' ? 'cliente' : 'fornecedor'}.`;
      case 'CONTRACT_DOCUMENT_GENERATED':
        return 'Documento do contrato gerado.';
      case 'CONTRACT_DOCUMENT_DOWNLOADED':
        return 'Documento do contrato baixado.';
      case 'PAYMENT_PROCESS':
        return `Pagamento processado. Método: ${
          event.details?.paymentMethod === 'bank_account' ? 'Débito em Conta' :
          event.details?.paymentMethod === 'boleto' ? 'Boleto Bancário' :
          event.details?.paymentMethod === 'credit_card' ? 'Cartão de Crédito' :
          'Não especificado'
        }. Valor: R$ ${event.details?.amount?.toFixed(2) || '0.00'}`;
      default:
        return 'Evento registrado no sistema.';
    }
  };

  const getUserType = (userType: string) => {
    switch (userType) {
      case 'CLIENT':
        return 'Cliente';
      case 'SUPPLIER':
        return 'Fornecedor';
      case 'ADMIN':
        return 'Administrador';
      default:
        return 'Usuário';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (history.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Nenhum histórico disponível para este contrato.
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <HistoryIcon sx={{ mr: 1 }} />
        <Typography variant="h6">Histórico do Contrato</Typography>
      </Box>
      
      <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
        <List>
          {history.map((event, index) => (
            <React.Fragment key={event.id}>
              <ListItem alignItems="flex-start">
                <ListItemIcon>
                  {getEventIcon(event.eventType)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1">
                        {getEventTitle(event.eventType)}
                      </Typography>
                      <Chip 
                        label={getUserType(event.user.type)} 
                        size="small" 
                        color={
                          event.user.type === 'CLIENT' ? 'primary' :
                          event.user.type === 'SUPPLIER' ? 'secondary' :
                          'default'
                        }
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(event.timestamp)}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {getEventDescription(event)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              {index < history.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<DocumentIcon />}
          onClick={() => window.open(`/api/contracts/${contractId}/document`, '_blank')}
        >
          Visualizar Contrato
        </Button>
      </Box>
    </Box>
  );
};

export default ContractHistory;