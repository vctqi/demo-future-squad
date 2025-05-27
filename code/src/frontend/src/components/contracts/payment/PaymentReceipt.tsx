import React from 'react';
import {
  Typography,
  Box,
  Paper,
  Grid,
  Divider,
  Button,
  Alert,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  FileDownload as FileDownloadIcon,
  Print as PrintIcon,
  Email as EmailIcon,
} from '@mui/icons-material';

interface PaymentReceiptProps {
  contract: any;
  paymentResult: any;
}

const PaymentReceipt: React.FC<PaymentReceiptProps> = ({
  contract,
  paymentResult,
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      console.error('Date formatting error:', e);
      return String(dateString);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleDownloadReceipt = () => {
    // In a real app, this would generate and download a PDF receipt
    alert('Em um ambiente real, isso geraria um PDF para download.');
  };

  const handleEmailReceipt = () => {
    // In a real app, this would send the receipt via email
    alert('Em um ambiente real, isso enviaria o recibo por email.');
  };

  return (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Pagamento Processado com Sucesso
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Seu pagamento foi processado e o serviço está ativo.
        </Typography>
      </Box>
      
      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="subtitle2">
          Código de Transação: {paymentResult?.paymentReference || 'PAY-' + Math.random().toString(36).substring(2, 10).toUpperCase()}
        </Typography>
        <Typography variant="body2">
          Guarde este código para referência futura.
        </Typography>
      </Alert>
      
      <Paper sx={{ p: 3, mb: 3, position: 'relative' }} elevation={2}>
        <Box sx={{ position: 'absolute', top: 20, right: 20, opacity: 0.1, transform: 'rotate(-30deg)' }}>
          <Typography variant="h3" fontWeight="bold">RECIBO</Typography>
        </Box>
        
        <Typography variant="h6" gutterBottom align="center">
          Recibo de Pagamento
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Detalhes do Pagamento
            </Typography>
            
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Data do Pagamento:
              </Typography>
              <Typography variant="body1">
                {formatDate(paymentResult?.paymentDate) || formatDate(new Date().toISOString())}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Forma de Pagamento:
              </Typography>
              <Typography variant="body1">
                {paymentResult?.paymentMethod === 'bank_account' && 'Débito em Conta'}
                {paymentResult?.paymentMethod === 'boleto' && 'Boleto Bancário'}
                {paymentResult?.paymentMethod === 'credit_card' && 'Cartão de Crédito'}
                {!paymentResult?.paymentMethod && 'Pagamento Processado'}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Referência:
              </Typography>
              <Typography variant="body1">
                {paymentResult?.paymentReference || 'PAY-' + Math.random().toString(36).substring(2, 10).toUpperCase()}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Detalhes do Serviço
            </Typography>
            
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Serviço:
              </Typography>
              <Typography variant="body1">
                {contract?.service?.title}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Fornecedor:
              </Typography>
              <Typography variant="body1">
                {contract?.service?.supplier?.companyName}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Contrato:
              </Typography>
              <Typography variant="body1">
                #{contract?.id?.substring(0, 8)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1">
            Valor Pago:
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            R$ {contract?.totalPrice?.toFixed(2)}
          </Typography>
        </Box>
        
        <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Este recibo serve como comprovante de pagamento para fins administrativos.
            Este serviço está sujeito aos termos e condições do contrato acordado.
          </Typography>
        </Box>
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={handlePrintReceipt}
        >
          Imprimir
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<FileDownloadIcon />}
          onClick={handleDownloadReceipt}
        >
          Download PDF
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<EmailIcon />}
          onClick={handleEmailReceipt}
        >
          Enviar por Email
        </Button>
      </Box>
    </Box>
  );
};

export default PaymentReceipt;