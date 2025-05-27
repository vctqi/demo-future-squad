import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis';
import { logger } from '../config/logger';

// Default configuration
const DEFAULT_WINDOW_MS = 60 * 1000; // 1 minute
const DEFAULT_MAX_REQUESTS = 100; // 100 requests per minute
const RATE_LIMIT_PREFIX = 'ratelimit:';

/**
 * Rate limiter middleware using Redis
 * @param windowMs Time window in milliseconds
 * @param maxRequests Maximum number of requests per window
 * @returns Express middleware
 */
export const rateLimiter = (windowMs = DEFAULT_WINDOW_MS, maxRequests = DEFAULT_MAX_REQUESTS) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get client IP address or user ID if authenticated
      const identifier = req.user?.id || req.ip || 'unknown';
      const key = `${RATE_LIMIT_PREFIX}${identifier}`;
      
      // Get current count
      const currentRequests = await redisClient.get(key);
      const requestCount = currentRequests ? parseInt(currentRequests, 10) : 0;
      
      // Check if limit is reached
      if (requestCount >= maxRequests) {
        logger.warn(`Rate limit exceeded for ${identifier}`);
        return res.status(429).json({
          error: 'Too many requests',
          message: 'Please try again later',
        });
      }
      
      // Increment request count
      if (requestCount === 0) {
        // First request in window, set with expiry
        await redisClient.set(key, '1', { PX: windowMs });
      } else {
        // Increment existing counter
        await redisClient.incr(key);
      }
      
      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', (maxRequests - requestCount - 1).toString());
      
      next();
    } catch (error) {
      logger.error('Error in rate limiter middleware:', error);
      // Allow request to proceed in case of Redis error
      next();
    }
  };
};

/**
 * More restrictive rate limiter for sensitive endpoints
 */
export const strictRateLimiter = rateLimiter(60 * 1000, 10); // 10 requests per minute

/**
 * Lenient rate limiter for public endpoints
 */
export const publicRateLimiter = rateLimiter(60 * 1000, 300); // 300 requests per minute