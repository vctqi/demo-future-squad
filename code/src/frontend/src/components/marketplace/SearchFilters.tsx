import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  InputAdornment,
  Rating,
  Grid,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import serviceService from '../../services/serviceService';

interface SearchFiltersProps {
  onFilter: (filters: any) => void;
  currentFilters: any;
  mobile?: boolean;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ 
  onFilter, 
  currentFilters,
  mobile = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [categories, setCategories] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({
    category: true,
    price: true,
    rating: true,
  });
  const [filters, setFilters] = useState({
    search: currentFilters.search || '',
    categoryId: currentFilters.categoryId || '',
    minPrice: currentFilters.minPrice || 0,
    maxPrice: currentFilters.maxPrice || 5000,
    minRating: currentFilters.minRating || 0,
    sort: currentFilters.sort || 'relevance',
  });
  const [priceRange, setPriceRange] = useState<number[]>([
    filters.minPrice,
    filters.maxPrice,
  ]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await serviceService.getAllCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  const handleExpandChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded({
      ...expanded,
      [panel]: isExpanded,
    });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const handleSelectChange = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = event.target;
    if (name) {
      setFilters({
        ...filters,
        [name]: value,
      });
    }
  };

  const handlePriceChange = (event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as number[]);
  };

  const handlePriceChangeCommitted = (event: React.SyntheticEvent | Event, newValue: number | number[]) => {
    const [min, max] = newValue as number[];
    setFilters({
      ...filters,
      minPrice: min,
      maxPrice: max,
    });
  };

  const handleRatingChange = (event: React.SyntheticEvent, value: number | null) => {
    setFilters({
      ...filters,
      minRating: value || 0,
    });
  };

  const handleApplyFilters = () => {
    onFilter(filters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      categoryId: '',
      minPrice: 0,
      maxPrice: 5000,
      minRating: 0,
      sort: 'relevance',
    };
    setFilters(clearedFilters);
    setPriceRange([0, 5000]);
    onFilter(clearedFilters);
  };

  const formatPrice = (value: number) => {
    return `R$ ${value}`;
  };

  // For mobile view
  if (mobile) {
    return (
      <Box>
        <TextField
          fullWidth
          name="search"
          label="Buscar serviços"
          variant="outlined"
          value={filters.search}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
        
        <Accordion 
          expanded={expanded.category} 
          onChange={handleExpandChange('category')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Categorias</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormControl fullWidth size="small">
              <InputLabel id="category-label">Categoria</InputLabel>
              <Select
                labelId="category-label"
                name="categoryId"
                value={filters.categoryId}
                label="Categoria"
                onChange={handleSelectChange as any}
              >
                <MenuItem value="">Todas as categorias</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </AccordionDetails>
        </Accordion>
        
        <Accordion 
          expanded={expanded.price} 
          onChange={handleExpandChange('price')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Preço</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ px: 2 }}>
              <Typography gutterBottom>
                Faixa de preço: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
              </Typography>
              <Slider
                value={priceRange}
                onChange={handlePriceChange}
                onChangeCommitted={handlePriceChangeCommitted}
                valueLabelDisplay="auto"
                valueLabelFormat={formatPrice}
                min={0}
                max={5000}
                step={50}
              />
            </Box>
          </AccordionDetails>
        </Accordion>
        
        <Accordion 
          expanded={expanded.rating} 
          onChange={handleExpandChange('rating')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Avaliação</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography component="legend">Mínimo: </Typography>
              <Rating
                name="minRating"
                value={filters.minRating}
                onChange={handleRatingChange}
                precision={0.5}
              />
              <Typography sx={{ ml: 1 }}>
                ({filters.minRating})
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>
        
        <Divider sx={{ my: 2 }} />
        
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="sort-label">Ordenar por</InputLabel>
          <Select
            labelId="sort-label"
            name="sort"
            value={filters.sort}
            label="Ordenar por"
            onChange={handleSelectChange as any}
          >
            <MenuItem value="relevance">Relevância</MenuItem>
            <MenuItem value="price_asc">Menor Preço</MenuItem>
            <MenuItem value="price_desc">Maior Preço</MenuItem>
            <MenuItem value="rating_desc">Melhor Avaliação</MenuItem>
            <MenuItem value="newest">Mais Recentes</MenuItem>
          </Select>
        </FormControl>
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
            >
              Limpar
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<FilterListIcon />}
              onClick={handleApplyFilters}
            >
              Filtrar
            </Button>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // For desktop view
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Filtros
      </Typography>
      
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Busca por palavra-chave
        </Typography>
        <TextField
          fullWidth
          name="search"
          placeholder="O que você procura?"
          variant="outlined"
          size="small"
          value={filters.search}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Categoria
        </Typography>
        <FormControl fullWidth size="small">
          <InputLabel id="category-label">Selecione uma categoria</InputLabel>
          <Select
            labelId="category-label"
            name="categoryId"
            value={filters.categoryId}
            label="Selecione uma categoria"
            onChange={handleSelectChange as any}
          >
            <MenuItem value="">Todas as categorias</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Faixa de preço
        </Typography>
        <Box sx={{ px: 1 }}>
          <Typography variant="body2" gutterBottom>
            {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
          </Typography>
          <Slider
            value={priceRange}
            onChange={handlePriceChange}
            onChangeCommitted={handlePriceChangeCommitted}
            valueLabelDisplay="auto"
            valueLabelFormat={formatPrice}
            min={0}
            max={5000}
            step={50}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption">R$ 0</Typography>
            <Typography variant="caption">R$ 5.000</Typography>
          </Box>
        </Box>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Avaliação mínima
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Rating
            name="minRating"
            value={filters.minRating}
            onChange={handleRatingChange}
            precision={0.5}
          />
          <Typography variant="body2" sx={{ ml: 1 }}>
            ({filters.minRating})
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Ordenação
        </Typography>
        <FormControl fullWidth size="small">
          <InputLabel id="sort-label">Ordenar por</InputLabel>
          <Select
            labelId="sort-label"
            name="sort"
            value={filters.sort}
            label="Ordenar por"
            onChange={handleSelectChange as any}
          >
            <MenuItem value="relevance">Relevância</MenuItem>
            <MenuItem value="price_asc">Menor Preço</MenuItem>
            <MenuItem value="price_desc">Maior Preço</MenuItem>
            <MenuItem value="rating_desc">Melhor Avaliação</MenuItem>
            <MenuItem value="newest">Mais Recentes</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<FilterListIcon />}
          onClick={handleApplyFilters}
          fullWidth
        >
          Aplicar Filtros
        </Button>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ClearIcon />}
          onClick={handleClearFilters}
          fullWidth
        >
          Limpar Filtros
        </Button>
      </Box>
    </Paper>
  );
};

export default SearchFilters;