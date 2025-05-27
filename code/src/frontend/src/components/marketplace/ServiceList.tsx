import React from 'react';
import { Grid, Box, Typography, CircularProgress, Pagination } from '@mui/material';
import ServiceCard from './ServiceCard';

interface ServiceListProps {
  services: any[];
  loading?: boolean;
  error?: string | null;
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (event: React.ChangeEvent<unknown>, page: number) => void;
  };
  emptyMessage?: string;
}

const ServiceList: React.FC<ServiceListProps> = ({
  services,
  loading = false,
  error = null,
  pagination,
  emptyMessage = 'Nenhum serviço encontrado.',
}) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (services.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {services.map((service) => (
          <Grid item xs={12} sm={6} md={4} key={service.id}>
            <ServiceCard service={service} />
          </Grid>
        ))}
      </Grid>
      
      {pagination && pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.page}
            onChange={pagination.onPageChange}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
};

export default ServiceList;