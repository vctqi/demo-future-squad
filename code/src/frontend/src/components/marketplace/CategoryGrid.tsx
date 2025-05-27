import React from 'react';
import { Grid, Typography, Box, CircularProgress } from '@mui/material';
import CategoryCard from './CategoryCard';

interface CategoryGridProps {
  categories: any[];
  loading?: boolean;
  title?: string;
  error?: string | null;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ 
  categories, 
  loading = false,
  title,
  error = null,
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

  if (categories.length === 0) {
    return (
      <Box sx={{ py: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Nenhuma categoria encontrada.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ my: 3 }}>
      {title && (
        <Typography variant="h5" component="h2" gutterBottom>
          {title}
        </Typography>
      )}
      
      <Grid container spacing={3}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category.id}>
            <CategoryCard category={category} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CategoryGrid;