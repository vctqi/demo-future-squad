import React from 'react';
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    serviceCount?: number;
  };
  variant?: 'small' | 'large';
}

// Array of colors for the category cards when no image is provided
const categoryColors = [
  '#1976d2', // blue
  '#388e3c', // green
  '#d32f2f', // red
  '#f57c00', // orange
  '#7b1fa2', // purple
  '#0288d1', // light blue
  '#c2185b', // pink
  '#00796b', // teal
  '#5d4037', // brown
];

// Function to get a consistent color based on category name
const getCategoryColor = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % categoryColors.length;
  return categoryColors[index];
};

const CategoryCard: React.FC<CategoryCardProps> = ({ 
  category, 
  variant = 'small' 
}) => {
  const navigate = useNavigate();
  const color = getCategoryColor(category.name);

  const handleClick = () => {
    navigate(`/categorias/${category.id}`);
  };

  // For small variant (grid view)
  if (variant === 'small') {
    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardActionArea onClick={handleClick} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
          {category.imageUrl ? (
            <CardMedia
              component="img"
              height="140"
              image={category.imageUrl}
              alt={category.name}
            />
          ) : (
            <Box 
              sx={{ 
                height: 140, 
                backgroundColor: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h5" component="div" color="white" align="center">
                {category.name.charAt(0).toUpperCase()}
              </Typography>
            </Box>
          )}
          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" component="div" gutterBottom>
              {category.name}
            </Typography>
            
            {category.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {category.description.length > 60 
                  ? `${category.description.substring(0, 60)}...` 
                  : category.description}
              </Typography>
            )}
            
            {category.serviceCount !== undefined && (
              <Box sx={{ mt: 'auto' }}>
                <Chip 
                  label={`${category.serviceCount} serviço${category.serviceCount !== 1 ? 's' : ''}`} 
                  size="small" 
                  variant="outlined"
                />
              </Box>
            )}
          </CardContent>
        </CardActionArea>
      </Card>
    );
  }

  // For large variant (featured)
  return (
    <Card sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, height: { md: 200 } }}>
      <CardActionArea onClick={handleClick} sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
        {category.imageUrl ? (
          <CardMedia
            component="img"
            sx={{ width: { xs: '100%', md: 200 }, height: { xs: 140, md: '100%' } }}
            image={category.imageUrl}
            alt={category.name}
          />
        ) : (
          <Box 
            sx={{ 
              width: { xs: '100%', md: 200 }, 
              height: { xs: 140, md: '100%' },
              backgroundColor: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h3" component="div" color="white">
              {category.name.charAt(0).toUpperCase()}
            </Typography>
          </Box>
        )}
        <CardContent sx={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column' }}>
          <Typography component="div" variant="h5">
            {category.name}
          </Typography>
          
          {category.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
              {category.description}
            </Typography>
          )}
          
          {category.serviceCount !== undefined && (
            <Box sx={{ mt: 'auto' }}>
              <Chip 
                label={`${category.serviceCount} serviço${category.serviceCount !== 1 ? 's' : ''}`} 
                color="primary"
                variant="outlined"
              />
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default CategoryCard;