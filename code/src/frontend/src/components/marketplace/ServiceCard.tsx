import React from 'react';
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Rating,
  Divider,
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface ServiceCardProps {
  service: {
    id: string;
    title: string;
    description: string;
    price: number;
    priceType: string;
    imageUrl?: string;
    category?: {
      id: string;
      name: string;
    };
    supplier?: {
      id: string;
      companyName: string;
    };
    averageRating?: number;
    reviewCount?: number;
  };
}

// Array of colors for the service cards when no image is provided
const serviceColors = [
  '#42a5f5', // lighter blue
  '#66bb6a', // lighter green
  '#ef5350', // lighter red
  '#ffa726', // lighter orange
  '#ab47bc', // lighter purple
  '#26c6da', // lighter cyan
  '#ec407a', // lighter pink
  '#26a69a', // lighter teal
  '#8d6e63', // lighter brown
];

// Function to get a consistent color based on service title
const getServiceColor = (title: string): string => {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % serviceColors.length;
  return serviceColors[index];
};

const getPriceTypeLabel = (priceType: string): string => {
  switch (priceType) {
    case 'FIXED':
      return 'Preço Fixo';
    case 'HOURLY':
      return 'Por Hora';
    case 'MONTHLY':
      return 'Mensal';
    case 'YEARLY':
      return 'Anual';
    case 'CUSTOM':
      return 'Personalizado';
    default:
      return priceType;
  }
};

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const navigate = useNavigate();
  const color = getServiceColor(service.title);

  const handleClick = () => {
    navigate(`/servicos/${service.id}`);
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea onClick={handleClick} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {service.imageUrl ? (
          <CardMedia
            component="img"
            height="160"
            image={service.imageUrl}
            alt={service.title}
          />
        ) : (
          <Box 
            sx={{ 
              height: 160, 
              backgroundColor: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h5" component="div" color="white" align="center">
              {service.title.charAt(0).toUpperCase()}
            </Typography>
          </Box>
        )}
        
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {service.category && (
            <Typography variant="caption" color="text.secondary" gutterBottom>
              {service.category.name}
            </Typography>
          )}
          
          <Typography variant="h6" component="div" gutterBottom>
            {service.title}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
            {service.description.length > 120 
              ? `${service.description.substring(0, 120)}...` 
              : service.description}
          </Typography>
          
          {service.supplier && (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Fornecido por: {service.supplier.companyName}
            </Typography>
          )}
          
          {(service.averageRating !== undefined && service.averageRating !== null) && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Rating value={service.averageRating} precision={0.5} size="small" readOnly />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({service.reviewCount || 0})
              </Typography>
            </Box>
          )}
          
          <Divider sx={{ my: 1.5 }} />
          
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
              R$ {service.price.toFixed(2)}
            </Typography>
            
            <Chip 
              label={getPriceTypeLabel(service.priceType)} 
              size="small" 
              color="primary"
              variant="outlined"
            />
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ServiceCard;