import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Breadcrumbs,
  Link,
  Paper,
  Divider,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, FilterList as FilterListIcon } from '@mui/icons-material';
import ServiceList from '../../components/marketplace/ServiceList';
import serviceService from '../../services/serviceService';

const sortOptions = [
  { value: 'price_asc', label: 'Menor Preço' },
  { value: 'price_desc', label: 'Maior Preço' },
  { value: 'rating_desc', label: 'Melhor Avaliação' },
  { value: 'newest', label: 'Mais Recentes' },
];

const CategoryDetailPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch category details
  useEffect(() => {
    const fetchCategory = async () => {
      if (!categoryId) return;
      
      try {
        const categories = await serviceService.getAllCategories();
        const foundCategory = categories.find((cat: any) => cat.id === categoryId);
        
        if (foundCategory) {
          setCategory({
            ...foundCategory,
            serviceCount: 0, // Will be updated when services are loaded
          });
        } else {
          setError('Categoria não encontrada');
        }
      } catch (err: any) {
        console.error('Error fetching category:', err);
        setError(err.response?.data?.message || 'Erro ao carregar categoria');
      }
    };

    fetchCategory();
  }, [categoryId]);

  // Fetch services in this category
  useEffect(() => {
    const fetchServices = async () => {
      if (!categoryId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Determine sort parameters
        let orderBy = 'createdAt';
        let orderDirection = 'desc';
        
        switch (sortBy) {
          case 'price_asc':
            orderBy = 'price';
            orderDirection = 'asc';
            break;
          case 'price_desc':
            orderBy = 'price';
            orderDirection = 'desc';
            break;
          case 'rating_desc':
            orderBy = 'averageRating';
            orderDirection = 'desc';
            break;
          case 'newest':
          default:
            orderBy = 'createdAt';
            orderDirection = 'desc';
            break;
        }
        
        const response = await serviceService.getAllServices({
          categoryId,
          page,
          limit: 9,
          search: searchTerm,
          status: 'ACTIVE', // Only show active services
          orderBy,
          orderDirection,
        });
        
        setServices(response.services);
        setTotalPages(response.pagination.totalPages);
        
        // Update category service count
        if (category && page === 1 && !searchTerm) {
          setCategory({
            ...category,
            serviceCount: response.pagination.totalCount,
          });
        }
      } catch (err: any) {
        console.error('Error fetching services:', err);
        setError(err.response?.data?.message || 'Erro ao carregar serviços');
      } finally {
        setLoading(false);
      }
    };

    if (category || categoryId) {
      fetchServices();
    }
  }, [categoryId, page, sortBy, searchTerm, category]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page on search
  };

  const handleSortChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSortBy(event.target.value as string);
    setPage(1); // Reset to first page on sort change
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    // Scroll to top on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSortBy('newest');
    setPage(1);
  };

  if (!category && !loading && !error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Alert severity="warning">
            Categoria não encontrada
          </Alert>
          <Button
            component={RouterLink}
            to="/categorias"
            variant="contained"
            sx={{ mt: 2 }}
          >
            Ver todas as categorias
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/" color="inherit">
            Home
          </Link>
          <Link component={RouterLink} to="/categorias" color="inherit">
            Categorias
          </Link>
          <Typography color="text.primary">
            {loading ? 'Carregando...' : category?.name}
          </Typography>
        </Breadcrumbs>
        
        {error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : loading && !category ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {category?.name}
              </Typography>
              
              {category?.description && (
                <Typography variant="body1" paragraph color="text.secondary">
                  {category.description}
                </Typography>
              )}
              
              {category?.serviceCount !== undefined && (
                <Chip 
                  label={`${category.serviceCount} serviço${category.serviceCount !== 1 ? 's' : ''} disponível${category.serviceCount !== 1 ? 'is' : ''}`} 
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    label="Buscar nesta categoria"
                    variant="outlined"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel id="sort-by-label">Ordenar por</InputLabel>
                    <Select
                      labelId="sort-by-label"
                      value={sortBy}
                      label="Ordenar por"
                      onChange={handleSortChange as any}
                    >
                      {sortOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<FilterListIcon />}
                    onClick={handleClearFilters}
                  >
                    Limpar Filtros
                  </Button>
                </Grid>
              </Grid>
            </Paper>
            
            <ServiceList 
              services={services} 
              loading={loading}
              error={error}
              pagination={{
                page,
                totalPages,
                onPageChange: handlePageChange,
              }}
              emptyMessage={
                searchTerm 
                  ? `Nenhum serviço encontrado para "${searchTerm}" nesta categoria.`
                  : "Nenhum serviço disponível nesta categoria."
              }
            />
          </>
        )}
      </Box>
    </Container>
  );
};

export default CategoryDetailPage;