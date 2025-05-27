import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  People as PeopleIcon,
  Store as StoreIcon,
  Assignment as AssignmentIcon,
  ShoppingCart as ShoppingCartIcon,
  Warning as WarningIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import AdminLayout from '../../layouts/AdminLayout';
import supplierService from '../../services/supplierService';

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [pendingSuppliers, setPendingSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPendingSuppliers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await supplierService.getAllSuppliers({
          status: 'PENDING',
          limit: 5,
        });
        setPendingSuppliers(response.suppliers);
      } catch (err: any) {
        console.error('Error fetching pending suppliers:', err);
        setError(err.response?.data?.message || 'Erro ao carregar fornecedores pendentes');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingSuppliers();
  }, []);

  const DashboardCard = ({ title, count, icon, color, onClick }: any) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="h6" component="div" gutterBottom>
            {title}
          </Typography>
          <Box sx={{ 
            bgcolor: `${color}.light`, 
            color: `${color}.main`, 
            borderRadius: '50%', 
            p: 1, 
            display: 'flex' 
          }}>
            {icon}
          </Box>
        </Box>
        <Typography variant="h3" component="div" sx={{ my: 2 }}>
          {count}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={onClick}>
          Ver Detalhes
        </Button>
      </CardActions>
    </Card>
  );

  return (
    <AdminLayout title="Dashboard">
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <DashboardCard
            title="Fornecedores"
            count="125"
            icon={<PeopleIcon />}
            color="primary"
            onClick={() => navigate('/admin/fornecedores')}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <DashboardCard
            title="Serviços"
            count="348"
            icon={<StoreIcon />}
            color="success"
            onClick={() => navigate('/admin/servicos')}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <DashboardCard
            title="Contratos"
            count="57"
            icon={<AssignmentIcon />}
            color="info"
            onClick={() => navigate('/admin/contratos')}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <DashboardCard
            title="Vendas Totais"
            count="R$ 125.890"
            icon={<ShoppingCartIcon />}
            color="secondary"
            onClick={() => {}}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Fornecedores Pendentes
              </Typography>
              <Button 
                size="small" 
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/admin/fornecedores?status=PENDING')}
              >
                Ver Todos
              </Button>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : pendingSuppliers.length === 0 ? (
              <Typography variant="body1" color="text.secondary" sx={{ py: 2 }}>
                Não há fornecedores pendentes de aprovação.
              </Typography>
            ) : (
              <List>
                {pendingSuppliers.map((supplier) => (
                  <React.Fragment key={supplier.id}>
                    <ListItem 
                      button
                      onClick={() => navigate(`/admin/fornecedores/${supplier.id}`)}
                    >
                      <ListItemIcon>
                        <WarningIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary={supplier.companyName}
                        secondary={`CNPJ: ${supplier.cnpj}`}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {new Date(supplier.createdAt).toLocaleDateString()}
                      </Typography>
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Serviços Pendentes de Aprovação
              </Typography>
              <Button 
                size="small" 
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/admin/servicos?status=PENDING')}
              >
                Ver Todos
              </Button>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="body1" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              Não há serviços pendentes de aprovação no momento.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </AdminLayout>
  );
};

export default AdminDashboardPage;