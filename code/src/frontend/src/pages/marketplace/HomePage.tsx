import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  TextField,
  InputAdornment,
  Divider,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Search as SearchIcon, ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import FeaturedCategories from '../../components/marketplace/FeaturedCategories';
import CategoryGrid from '../../components/marketplace/CategoryGrid';
import ServiceList from '../../components/marketplace/ServiceList';
import serviceService from '../../services/serviceService';

const HomePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredServices, setFeaturedServices] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
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
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch featured services
  useEffect(() => {
    const fetchFeaturedServices = async () => {
      setLoadingServices(true);
      try {
        const response = await serviceService.getAllServices({
          status: 'ACTIVE',
          limit: 6,
          orderBy: 'createdAt',
          orderDirection: 'desc',
        });
        
        setFeaturedServices(response.services);
      } catch (err: any) {
        console.error('Error fetching featured services:', err);
        // We don't set the error state here to avoid showing an error for the entire page
      } finally {
        setLoadingServices(false);
      }
    };

    fetchFeaturedServices();
  }, []);

  // Get featured categories (top 3 by service count)
  const featuredCategories = [...categories]
    .sort((a, b) => (b.serviceCount || 0) - (a.serviceCount || 0))
    .slice(0, 3);

  // Get popular categories (next 6 after featured)
  const popularCategories = [...categories]
    .sort((a, b) => (b.serviceCount || 0) - (a.serviceCount || 0))
    .slice(3, 9);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/servicos?search=${encodeURIComponent(searchTerm)}`;
    }
  };

  return (
    <Box>
      {/* Hero section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          py: { xs: 6, md: 10 },
          mb: 6,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="h3" component="h1" gutterBottom>
                Marketplace de Benefícios para Clientes PJ
              </Typography>
              
              <Typography variant="h6" component="div" sx={{ mb: 4, fontWeight: 'normal' }}>
                Encontre os melhores serviços para sua empresa em um só lugar
              </Typography>
              
              <Box component="form" onSubmit={handleSearchSubmit} sx={{ mb: 4 }}>
                <TextField
                  fullWidth
                  placeholder="O que sua empresa precisa hoje?"
                  variant="outlined"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'primary.contrastText' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button 
                          type="submit" 
                          variant="contained" 
                          color="secondary"
                          disabled={!searchTerm.trim()}
                        >
                          Buscar
                        </Button>
                      </InputAdornment>
                    ),
                    sx: { 
                      bgcolor: 'rgba(255, 255, 255, 0.1)', 
                      color: 'primary.contrastText',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.contrastText',
                      },
                      '& .MuiInputLabel-root': {
                        color: 'primary.contrastText',
                      }
                    }
                  }}
                />
              </Box>
              
              <Grid container spacing={2}>
                <Grid item>
                  <Button 
                    variant="outlined" 
                    color="inherit"
                    component={RouterLink}
                    to="/categorias"
                    size="large"
                  >
                    Ver Categorias
                  </Button>
                </Grid>
                
                <Grid item>
                  <Button 
                    variant="contained" 
                    color="secondary"
                    component={RouterLink}
                    to="/servicos"
                    size="large"
                  >
                    Explorar Serviços
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            
            {!isMobile && (
              <Grid item md={5}>
                {/* This would be an illustration in a real implementation */}
                <Box
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                    p: 2,
                    height: 300,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h5" align="center">
                    [Ilustração do Marketplace]
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>
      
      <Container maxWidth="lg">
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <FeaturedCategories 
          categories={featuredCategories} 
          loading={loadingCategories}
        />
        
        <Box sx={{ my: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2">
              Categorias Populares
            </Typography>
            
            <Button 
              component={RouterLink} 
              to="/categorias"
              endIcon={<ArrowForwardIcon />}
            >
              Ver Todas
            </Button>
          </Box>
          
          <CategoryGrid 
            categories={popularCategories} 
            loading={loadingCategories}
          />
        </Box>
        
        <Divider sx={{ my: 6 }} />
        
        <Box sx={{ my: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2">
              Serviços em Destaque
            </Typography>
            
            <Button 
              component={RouterLink} 
              to="/servicos"
              endIcon={<ArrowForwardIcon />}
            >
              Ver Todos
            </Button>
          </Box>
          
          <ServiceList 
            services={featuredServices} 
            loading={loadingServices}
          />
        </Box>
        
        <Paper sx={{ p: 4, my: 6, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h5" component="h2" gutterBottom>
                Você é um fornecedor de serviços?
              </Typography>
              
              <Typography variant="body1" paragraph>
                Cadastre-se como fornecedor e ofereça seus serviços para milhares de empresas clientes.
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Button 
                variant="contained" 
                color="secondary"
                size="large"
                component={RouterLink}
                to="/cadastro-fornecedor"
              >
                Torne-se um Fornecedor
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default HomePage;