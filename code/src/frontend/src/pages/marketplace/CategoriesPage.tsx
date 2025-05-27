import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Breadcrumbs,
  Link,
  Paper,
  Divider,
  Alert,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import FeaturedCategories from '../../components/marketplace/FeaturedCategories';
import CategoryGrid from '../../components/marketplace/CategoryGrid';
import serviceService from '../../services/serviceService';

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await serviceService.getAllCategories();
        
        // Add service count to categories
        // In a real app, this would come from the API
        const categoriesWithCounts = data.map((category: any) => ({
          ...category,
          serviceCount: Math.floor(Math.random() * 100) + 1, // Mock data
        }));
        
        setCategories(categoriesWithCounts);
      } catch (err: any) {
        console.error('Error fetching categories:', err);
        setError(err.response?.data?.message || 'Erro ao carregar categorias');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Get featured categories (top 3 by service count)
  const featuredCategories = [...categories]
    .sort((a, b) => (b.serviceCount || 0) - (a.serviceCount || 0))
    .slice(0, 3);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/" color="inherit">
            Home
          </Link>
          <Typography color="text.primary">Categorias</Typography>
        </Breadcrumbs>
        
        <Typography variant="h4" component="h1" gutterBottom>
          Categorias de Serviços
        </Typography>
        
        <Typography variant="body1" paragraph color="text.secondary">
          Explore nosso marketplace por categorias para encontrar os serviços que sua empresa precisa.
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <FeaturedCategories 
          categories={featuredCategories} 
          loading={loading}
          error={error}
        />
        
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Todas as Categorias
          </Typography>
          
          <Divider sx={{ mb: 3 }} />
          
          <CategoryGrid 
            categories={categories} 
            loading={loading}
            error={error}
          />
        </Paper>
      </Box>
    </Container>
  );
};

export default CategoriesPage;