import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Breadcrumbs,
  Link,
  Paper,
  Grid,
  Button,
  Divider,
  Chip,
  Rating,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Tab,
  Tabs,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Snackbar,
  AlertColor,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Check as CheckIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Star as StarIcon,
  Verified as VerifiedIcon,
  AccessTime as AccessTimeIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Web as WebIcon,
  Share as ShareIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import ServiceList from '../../components/marketplace/ServiceList';
import serviceService from '../../services/serviceService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`service-tabpanel-${index}`}
      aria-labelledby={`service-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `service-tab-${index}`,
    'aria-controls': `service-tabpanel-${index}`,
  };
}

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

const ServiceDetailPage: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [similarServices, setSimilarServices] = useState<any[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as AlertColor,
  });
  
  // Fetch service details
  useEffect(() => {
    const fetchService = async () => {
      if (!serviceId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await serviceService.getServiceById(serviceId);
        setService(data);
        
        // After getting service, load similar services
        fetchSimilarServices(data.categoryId);
      } catch (err: any) {
        console.error('Error fetching service:', err);
        setError(err.response?.data?.message || 'Erro ao carregar serviço');
      } finally {
        setLoading(false);
      }
    };
    
    fetchService();
  }, [serviceId]);
  
  // Fetch similar services
  const fetchSimilarServices = async (categoryId: string) => {
    if (!categoryId || !serviceId) return;
    
    setLoadingSimilar(true);
    
    try {
      const response = await serviceService.getAllServices({
        categoryId,
        limit: 3,
        status: 'ACTIVE',
        excludeId: serviceId,
      });
      
      setSimilarServices(response.services);
    } catch (err) {
      console.error('Error fetching similar services:', err);
      // Don't set error state here to avoid affecting the main content
    } finally {
      setLoadingSimilar(false);
    }
  };
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    
    // In a real app, we would call an API to save the favorite status
    setNotification({
      open: true,
      message: isFavorite ? 'Removido dos favoritos' : 'Adicionado aos favoritos',
      severity: 'success',
    });
  };
  
  const handleShare = () => {
    // In a real app, we would open a sharing dialog
    // For now, just copy the URL to clipboard
    navigator.clipboard.writeText(window.location.href);
    
    setNotification({
      open: true,
      message: 'Link copiado para a área de transferência',
      severity: 'success',
    });
  };
  
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  const handleHireService = () => {
    // Navigate to contract page
    navigate(`/servicos/${service.id}/contratar`);
  };
  
  const handlePreviousImage = () => {
    if (!service?.images?.length) return;
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? service.images.length - 1 : prevIndex - 1
    );
  };
  
  const handleNextImage = () => {
    if (!service?.images?.length) return;
    setCurrentImageIndex((prevIndex) => 
      prevIndex === service.images.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };
  
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error || !service) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || 'Serviço não encontrado'}
          </Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/servicos')}
          >
            Voltar para a lista de serviços
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
          <Link component={RouterLink} to="/servicos" color="inherit">
            Serviços
          </Link>
          {service.category && (
            <Link
              component={RouterLink}
              to={`/categorias/${service.category.id}`}
              color="inherit"
            >
              {service.category.name}
            </Link>
          )}
          <Typography color="text.primary">
            {service.title.length > 30 ? service.title.substring(0, 30) + '...' : service.title}
          </Typography>
        </Breadcrumbs>
        
        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {service.title}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {service.averageRating !== null && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                    <Rating value={service.averageRating} precision={0.5} readOnly />
                    <Typography variant="body2" sx={{ ml: 0.5 }}>
                      ({service.reviewCount || 0})
                    </Typography>
                  </Box>
                )}
                
                <Chip
                  label={service.category?.name}
                  variant="outlined"
                  size="small"
                  component={RouterLink}
                  to={`/categorias/${service.category?.id}`}
                  clickable
                />
                
                <Box sx={{ flexGrow: 1 }} />
                
                <IconButton onClick={handleFavoriteToggle} color={isFavorite ? 'primary' : 'default'}>
                  {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
                
                <IconButton onClick={handleShare}>
                  <ShareIcon />
                </IconButton>
              </Box>
              
              {/* Service Images Gallery */}
              <Box sx={{ mb: 3, position: 'relative' }}>
                {service.images && service.images.length > 0 ? (
                  <Box
                    sx={{
                      position: 'relative',
                      height: 400,
                      bgcolor: 'grey.100',
                      borderRadius: 1,
                      overflow: 'hidden',
                      '& img': {
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      },
                    }}
                  >
                    <img 
                      src={service.images[currentImageIndex]} 
                      alt={`${service.title} - Imagem ${currentImageIndex + 1}`} 
                      style={{ display: 'block' }}
                    />
                    {service.images.length > 1 && (
                      <>
                        <IconButton 
                          onClick={handlePreviousImage}
                          sx={{ 
                            position: 'absolute', 
                            left: 8, 
                            top: '50%', 
                            transform: 'translateY(-50%)',
                            bgcolor: 'rgba(255,255,255,0.8)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                          }}
                        >
                          <ArrowBackIcon />
                        </IconButton>
                        <IconButton 
                          onClick={handleNextImage}
                          sx={{ 
                            position: 'absolute', 
                            right: 8, 
                            top: '50%', 
                            transform: 'translateY(-50%)',
                            bgcolor: 'rgba(255,255,255,0.8)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                          }}
                        >
                          <ArrowForwardIcon />
                        </IconButton>
                        <Box 
                          sx={{ 
                            position: 'absolute',
                            bottom: 16,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            gap: 1,
                          }}
                        >
                          {service.images.map((_, idx) => (
                            <Box 
                              key={idx}
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: idx === currentImageIndex ? 'primary.main' : 'rgba(255,255,255,0.7)',
                                cursor: 'pointer',
                              }}
                              onClick={() => handleThumbnailClick(idx)}
                            />
                          ))}
                        </Box>
                      </>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ height: 300, bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 1 }}>
                    <Typography variant="body1" color="text.secondary">
                      Sem imagens disponíveis
                    </Typography>
                  </Box>
                )}
                
                {/* Thumbnails */}
                {service.images && service.images.length > 1 && (
                  <Box sx={{ display: 'flex', gap: 1, mt: 1, overflowX: 'auto', pb: 1 }}>
                    {service.images.map((img, idx) => (
                      <Box 
                        key={idx}
                        onClick={() => handleThumbnailClick(idx)}
                        sx={{ 
                          width: 80, 
                          height: 60, 
                          flexShrink: 0,
                          borderRadius: 1,
                          overflow: 'hidden',
                          border: idx === currentImageIndex ? '2px solid' : '1px solid',
                          borderColor: idx === currentImageIndex ? 'primary.main' : 'grey.300',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            opacity: 0.8,
                            transform: 'scale(1.05)',
                          },
                          '& img': {
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }
                        }}
                      >
                        <img src={img} alt={`Thumbnail ${idx + 1}`} />
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
              
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                  value={tabValue} 
                  onChange={handleTabChange} 
                  aria-label="service details tabs"
                  variant={isMobile ? 'scrollable' : 'standard'}
                  scrollButtons={isMobile ? 'auto' : undefined}
                >
                  <Tab label="Descrição" {...a11yProps(0)} />
                  <Tab label="Termos e Condições" {...a11yProps(1)} />
                  <Tab label="Avaliações" {...a11yProps(2)} />
                </Tabs>
              </Box>
              
              <TabPanel value={tabValue} index={0}>
                <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                  {service.description}
                </Typography>
                
                {service.features && service.features.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Características
                    </Typography>
                    <Grid container spacing={1}>
                      {service.features.map((feature: string, index: number) => (
                        <Grid item key={index}>
                          <Chip 
                            icon={<CheckIcon />} 
                            label={feature} 
                            color="primary" 
                            variant="outlined" 
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </TabPanel>
              
              <TabPanel value={tabValue} index={1}>
                <Typography variant="h6" gutterBottom>
                  Termos e Condições
                </Typography>
                <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                  {service.terms || 'Não há termos e condições específicos para este serviço.'}
                </Typography>
                
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  SLA (Acordo de Nível de Serviço)
                </Typography>
                <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                  {service.sla || 'Não há SLA específico para este serviço.'}
                </Typography>
              </TabPanel>
              
              <TabPanel value={tabValue} index={2}>
                {service.serviceReviews && service.serviceReviews?.length > 0 ? (
                  <List>
                    {service.serviceReviews.map((review: any) => (
                      <Box key={review.id} sx={{ mb: 3 }}>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar>
                              {review.client?.companyName?.charAt(0) || 'C'}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="subtitle1" component="span">
                                  {review.client?.companyName || 'Cliente'}
                                </Typography>
                                <Rating 
                                  value={review.rating} 
                                  readOnly 
                                  size="small" 
                                  sx={{ ml: 1 }}
                                />
                              </Box>
                            }
                            secondary={formatDate(review.createdAt)}
                          />
                        </ListItem>
                        <Typography variant="body1" sx={{ ml: 7 }}>
                          {review.comment || 'Sem comentários.'}
                        </Typography>
                        <Divider sx={{ mt: 2 }} />
                      </Box>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    Este serviço ainda não possui avaliações.
                  </Typography>
                )}
              </TabPanel>
            </Paper>
            
            {/* Similar Services */}
            {similarServices.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                  Serviços Similares
                </Typography>
                <ServiceList 
                  services={similarServices} 
                  loading={loadingSimilar} 
                />
              </Box>
            )}
          </Grid>
          
          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Box sx={{ position: 'sticky', top: 20 }}>
              {/* Price Card */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom color="primary">
                  R$ {service.price.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {getPriceTypeLabel(service.priceType)}
                </Typography>
                
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<ShoppingCartIcon />}
                  fullWidth
                  size="large"
                  sx={{ mt: 2, mb: 2 }}
                  onClick={handleHireService}
                >
                  Contratar Serviço
                </Button>
                
                <Box sx={{ mb: 2 }}>
                  <Chip 
                    icon={<AccessTimeIcon />} 
                    label="Entrega em até 5 dias úteis" 
                    variant="outlined" 
                    sx={{ mb: 1, width: '100%', justifyContent: 'flex-start' }}
                  />
                  <Chip 
                    icon={<VerifiedIcon />} 
                    label="Garantia de qualidade" 
                    variant="outlined" 
                    sx={{ width: '100%', justifyContent: 'flex-start' }}
                  />
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Cadastrado em {formatDate(service.createdAt)}
                </Typography>
              </Paper>
              
              {/* Supplier Card */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Sobre o Fornecedor
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ width: 60, height: 60, mr: 2 }}>
                    {service.supplier?.companyName?.charAt(0) || 'F'}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1">
                      {service.supplier?.companyName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Fornecedor Verificado
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <List dense disablePadding>
                  {service.supplier?.description && (
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary="Sobre"
                        secondary={service.supplier.description}
                        secondaryTypographyProps={{ 
                          variant: 'body2',
                          sx: { 
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }
                        }}
                      />
                    </ListItem>
                  )}
                  
                  {service.supplier?.website && (
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <WebIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Link 
                            href={service.supplier.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            {service.supplier.website}
                          </Link>
                        }
                      />
                    </ListItem>
                  )}
                  
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <BusinessIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="CNPJ"
                      secondary={service.supplier?.cnpj || '-'}
                    />
                  </ListItem>
                </List>
                
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => {
                    // In a real app, we would navigate to the supplier profile
                    setNotification({
                      open: true,
                      message: 'Perfil do fornecedor em desenvolvimento',
                      severity: 'info',
                    });
                  }}
                >
                  Ver Perfil do Fornecedor
                </Button>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Box>
      
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ServiceDetailPage;