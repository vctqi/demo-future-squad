import React from 'react';
import { Box, Typography, Grid, CircularProgress } from '@mui/material';
import CategoryCard from './CategoryCard';

interface FeaturedCategoriesProps {
  categories: any[];
  loading?: boolean;
  error?: string | null;
}

const FeaturedCategories: React.FC<FeaturedCategoriesProps> = ({
  categories,
  loading = false,
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
    return null;
  }

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Categorias em Destaque
      </Typography>
      
      <Grid container spacing={3}>
        {categories.slice(0, 3).map((category) => (
          <Grid item xs={12} key={category.id}>
            <CategoryCard category={category} variant="large" />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FeaturedCategories;