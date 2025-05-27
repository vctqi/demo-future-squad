import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  CircularProgress,
  Popper,
  Grow,
  ClickAwayListener,
} from '@mui/material';
import { 
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import serviceService from '../../services/serviceService';

interface SearchBarProps {
  placeholder?: string;
  initialValue?: string;
  onSearch?: (value: string) => void;
  fullWidth?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Buscar serviços...',
  initialValue = '',
  onSearch,
  fullWidth = false,
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Debounce search term
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      fetchSuggestions(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchSuggestions = async (term: string) => {
    setLoading(true);
    try {
      // In a real app, we would have an API endpoint for suggestions
      // For now, we'll just use the search endpoint with a limit
      const response = await serviceService.getAllServices({
        search: term,
        limit: 5,
        status: 'ACTIVE',
      });
      
      setSuggestions(response.services);
      setOpen(response.services.length > 0);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setSuggestions([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    setAnchorEl(event.currentTarget);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSuggestions([]);
    setOpen(false);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchTerm.trim()) {
      if (onSearch) {
        onSearch(searchTerm.trim());
      } else {
        navigate(`/servicos?search=${encodeURIComponent(searchTerm.trim())}`);
      }
      setOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    navigate(`/servicos/${suggestion.id}`);
    setOpen(false);
  };

  const handleClickAway = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ position: 'relative', width: fullWidth ? '100%' : 'auto' }}>
      <Box component="form" onSubmit={handleSearchSubmit}>
        <TextField
          fullWidth
          placeholder={placeholder}
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                {loading ? (
                  <CircularProgress size={20} />
                ) : (
                  <IconButton
                    edge="end"
                    onClick={handleClear}
                    aria-label="clear search"
                    size="small"
                  >
                    <ClearIcon />
                  </IconButton>
                )}
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Popper 
        open={open} 
        anchorEl={anchorEl} 
        placement="bottom-start" 
        transition
        style={{ 
          width: anchorEl?.clientWidth, 
          zIndex: 1300,
        }}
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps} style={{ transformOrigin: 'top left' }}>
            <Paper>
              <ClickAwayListener onClickAway={handleClickAway}>
                <List sx={{ p: 0 }}>
                  {suggestions.length > 0 ? (
                    suggestions.map((suggestion) => (
                      <React.Fragment key={suggestion.id}>
                        <ListItem 
                          button
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <ListItemText 
                            primary={suggestion.title}
                            secondary={
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {suggestion.category?.name} | R$ {suggestion.price.toFixed(2)}
                              </Typography>
                            }
                          />
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    ))
                  ) : (
                    loading ? (
                      <ListItem>
                        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 1 }}>
                          <CircularProgress size={24} />
                        </Box>
                      </ListItem>
                    ) : (
                      <ListItem>
                        <ListItemText 
                          primary="Nenhum resultado encontrado"
                          primaryTypographyProps={{ align: 'center', color: 'text.secondary' }}
                        />
                      </ListItem>
                    )
                  )}
                  <ListItem button onClick={handleSearchSubmit}>
                    <ListItemText 
                      primary={`Ver todos os resultados para "${searchTerm}"`}
                      primaryTypographyProps={{ align: 'center', color: 'primary' }}
                    />
                  </ListItem>
                </List>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </Box>
  );
};

export default SearchBar;