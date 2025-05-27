import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { logger } from './config/logger';
import passport from './config/passport';
import { RedisMonitorService } from './services/redis-monitor.service';

// Import routes
import authRoutes from './routes/auth.routes';
import monitorRoutes from './routes/monitor.routes';
import permissionsRoutes from './routes/permissions.routes';
import supplierRoutes from './routes/supplier.routes';
import serviceRoutes from './routes/service.routes';
import serviceAdminRoutes from './routes/service-admin.routes';
import contractRoutes from './routes/contract.routes';

// Load environment variables
dotenv.config();

// Create Express application
const app = express();
const PORT = process.env.PORT || 3001;

// Create Prisma client
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/monitor', monitorRoutes);
app.use('/api/permissions', permissionsRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/admin', serviceAdminRoutes);
app.use('/api/contracts', contractRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'marketplace-api',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, async () => {
  try {
    // Connect to database
    await prisma.$connect();
    logger.info(`Connected to database`);

    // Start Redis monitoring
    RedisMonitorService.startMonitoring();

    logger.info(`Server running on port ${PORT}`);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  // Stop Redis monitoring
  RedisMonitorService.stopMonitoring();
  
  // Disconnect from database
  await prisma.$disconnect();
  
  process.exit(0);
});

export default app;