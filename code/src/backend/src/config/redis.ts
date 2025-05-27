import { createClient } from 'redis';
import { logger } from './logger';

// Get Redis URL from environment variable or use default
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Create Redis client
const redisClient = createClient({
  url: redisUrl,
});

// Handle connection events
redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

redisClient.on('error', (err) => {
  logger.error('Redis client error', err);
});

// Connect to Redis
const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    logger.error('Failed to connect to Redis', error);
    // Retry connection after delay
    setTimeout(connectRedis, 5000);
  }
};

// Initialize connection
connectRedis();

export { redisClient };