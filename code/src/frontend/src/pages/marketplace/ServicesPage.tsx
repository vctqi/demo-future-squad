import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Breadcrumbs,
  Link,
  Paper,
  Grid,
  Button,
  Chip,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Alert,
  Pagination,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  TuneOutlined as TuneIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import SearchBar from '../../components/marketplace/SearchBar';
import SearchFilters from '../../components/marketplace/SearchFilters';
import ServiceList from '../../components/marketplace/ServiceList';
import serviceService from '../../services/serviceService';

const ServicesPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Get search params from URL
  const queryParams = new URLSearchParams(location.search);
  const searchParam = queryParams.get('search') || '';
  const categoryIdParam = queryParams.get('categoryId') || '';
  const minPriceParam = queryParams.get('minPrice') ? Number(queryParams.get('minPrice')) : 0;
  const maxPriceParam = queryParams.get('maxPrice') ? Number(queryParams.get('maxPrice')) : 5000;
  const minRatingParam = queryParams.get('minRating') ? Number(queryParams.get('minRating')) : 0;
  const sortParam = queryParams.get('sort') || 'relevance';
  const pageParam = queryParams.get('page') ? Number(queryParams.get('page')) : 1;
  
  const [filters, setFilters] = useState({
    search: searchParam,
    categoryId: categoryIdParam,
    minPrice: minPriceParam,
    maxPrice: maxPriceParam,
    minRating: minRatingParam,
    sort: sortParam,
  });
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(pageParam);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [currentCategory, setCurrentCategory] = useState<any>(null);
  
  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.search) params.set('search', filters.search);
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    if (filters.minPrice > 0) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice < 5000) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.minRating > 0) params.set('minRating', filters.minRating.toString());
    if (filters.sort !== 'relevance') params.set('sort', filters.sort);
    if (page > 1) params.set('page', page.toString());
    
    const newSearch = params.toString();
    navigate({
      pathname: location.pathname,
      search: newSearch ? `?${newSearch}` : '',
    }, { replace: true });
  }, [filters, page, navigate, location.pathname]);
  
  // Fetch services when filters change
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Determine sort parameters
        let orderBy = 'createdAt';
        let orderDirection = 'desc';
        
        switch (filters.sort) {
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
            orderBy = 'createdAt';
            orderDirection = 'desc';
            break;
          case 'relevance':
          default:
            // In a real app, we'd have a relevance score
            // For now, default to newest
            orderBy = 'createdAt';
            orderDirection = 'desc';
            break;
        }
        
        const response = await serviceService.getAllServices({
          search: filters.search,
          categoryId: filters.categoryId,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          minRating: filters.minRating,
          page,
          limit: 9,
          status: 'ACTIVE', // Only show active services
          orderBy,
          orderDirection,
        });
        
        setServices(response.services);
        setTotalPages(response.pagination.totalPages);
      } catch (err: any) {
        console.error('Error fetching services:', err);
        setError(err.response?.data?.message || 'Erro ao carregar serviços');
      } finally {
        setLoading(false);
      }
    };
    
    fetchServices();
  }, [filters, page]);
  
  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await serviceService.getAllCategories();
        setCategories(data);
        
        // If categoryId is set, find the category
        if (filters.categoryId) {
          const category = data.find((cat: any) => cat.id === filters.categoryId);
          if (category) {
            setCurrentCategory(category);
          }
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    
    fetchCategories();
  }, [filters.categoryId]);
  
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1); // Reset page when filters change
    if (isMobile) {
      setDrawerOpen(false);
    }
  };
  
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleSearchChange = (value: string) => {
    setFilters({
      ...filters,
      search: value,
    });
    setPage(1);
  };
  
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleCategoryClick = (categoryId: string) => {
    setFilters({
      ...filters,
      categoryId,
    });
    setPage(1);
  };
  
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.categoryId) count++;
    if (filters.minPrice > 0) count++;
    if (filters.maxPrice < 5000) count++;
    if (filters.minRating > 0) count++;
    if (filters.sort !== 'relevance') count++;
    return count;
  };
  
  const activeFiltersCount = getActiveFiltersCount();
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/" color="inherit">
            Home
          </Link>
          {currentCategory ? (
            <>
              <Link component={RouterLink} to="/servicos" color="inherit">
                Serviços
              </Link>
              <Typography color="text.primary">{currentCategory.name}</Typography>
            </>
          ) : (
            <Typography color="text.primary">Serviços</Typography>
          )}
        </Breadcrumbs>
        
        <Typography variant="h4" component="h1" gutterBottom>
          {currentCategory ? currentCategory.name : 'Todos os Serviços'}
        </Typography>
        
        {/* Search and Filter Bar */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <SearchBar 
                initialValue={filters.search}
                onSearch={handleSearchChange}
                placeholder="Buscar serviços..."
                fullWidth
              />
            </Grid>
            
            {isMobile ? (
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<TuneIcon />}
                  onClick={toggleDrawer}
                  color={activeFiltersCount > 0 ? 'primary' : 'inherit'}
                >
                  Filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                </Button>
              </Grid>
            ) : (
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {categories.slice(0, 3).map((category) => (
                    <Chip
                      key={category.id}
                      label={category.name}
                      onClick={() => handleCategoryClick(category.id)}
                      color={filters.categoryId === category.id ? 'primary' : 'default'}
                      variant={filters.categoryId === category.id ? 'filled' : 'outlined'}
                    />
                  ))}
                  {categories.length > 3 && (
                    <Chip
                      label="Mais..."
                      variant="outlined"
                      component={RouterLink}
                      to="/categorias"
                      clickable
                    />
                  )}
                </Box>
              </Grid>
            )}
          </Grid>
        </Paper>
        
        <Grid container spacing={3}>
          {/* Filters - Desktop */}
          {!isMobile && (
            <Grid item xs={12} md={3}>
              <SearchFilters
                onFilter={handleFilterChange}
                currentFilters={filters}
              />
            </Grid>
          )}
          
          {/* Service List */}
          <Grid item xs={12} md={isMobile ? 12 : 9}>
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
                filters.search
                  ? `Nenhum serviço encontrado para "${filters.search}".`
                  : "Nenhum serviço disponível com os filtros selecionados."
              }
            />
          </Grid>
        </Grid>
        
        {/* Mobile Filters Drawer */}
        {isMobile && (
          <Drawer
            anchor="bottom"
            open={drawerOpen}
            onClose={toggleDrawer}
            PaperProps={{
              sx: { maxHeight: '80vh' },
            }}
          >
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Filtros</Typography>
                <IconButton onClick={toggleDrawer} edge="end">
                  <CloseIcon />
                </IconButton>
              </Box>
              <SearchFilters
                onFilter={handleFilterChange}
                currentFilters={filters}
                mobile
              />
            </Box>
          </Drawer>
        )}
      </Box>
    </Container>
  );
};

export default ServicesPage;