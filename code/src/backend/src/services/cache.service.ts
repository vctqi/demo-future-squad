import { redisClient } from '../config/redis';
import { logger } from '../config/logger';

// Default TTL (Time To Live) values in seconds
const DEFAULT_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
};

// Cache key prefixes for different data types
export const CACHE_PREFIXES = {
  USER: 'user:',
  SERVICE: 'service:',
  CATEGORY: 'category:',
  SUPPLIER: 'supplier:',
  CLIENT: 'client:',
  LIST: 'list:',
  SEARCH: 'search:',
};

/**
 * Cache service providing a wrapper for Redis operations
 */
export class CacheService {
  /**
   * Set a value in cache
   * @param key Cache key
   * @param value Value to cache (will be JSON stringified)
   * @param ttl Time to live in seconds
   */
  static async set(key: string, value: any, ttl = DEFAULT_TTL.MEDIUM): Promise<void> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await redisClient.set(key, stringValue, { EX: ttl });
      logger.debug(`Cache set: ${key} (TTL: ${ttl}s)`);
    } catch (error) {
      logger.error(`Error setting cache for key ${key}:`, error);
      // Don't throw - cache errors shouldn't break the application
    }
  }

  /**
   * Get a value from cache
   * @param key Cache key
   * @param parse Whether to parse the result as JSON
   * @returns The cached value or null if not found
   */
  static async get<T>(key: string, parse = true): Promise<T | null> {
    try {
      const value = await redisClient.get(key);
      
      if (!value) {
        logger.debug(`Cache miss: ${key}`);
        return null;
      }
      
      logger.debug(`Cache hit: ${key}`);
      return parse ? JSON.parse(value) : (value as unknown as T);
    } catch (error) {
      logger.error(`Error getting cache for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Delete a value from cache
   * @param key Cache key
   */
  static async delete(key: string): Promise<void> {
    try {
      await redisClient.del(key);
      logger.debug(`Cache deleted: ${key}`);
    } catch (error) {
      logger.error(`Error deleting cache for key ${key}:`, error);
    }
  }

  /**
   * Delete multiple keys by pattern
   * @param pattern Key pattern to match (e.g., "user:*")
   */
  static async deleteByPattern(pattern: string): Promise<void> {
    try {
      // SCAN is more efficient than KEYS for production use
      let cursor = 0;
      do {
        const result = await redisClient.scan(cursor, { MATCH: pattern, COUNT: 100 });
        cursor = result.cursor;
        
        if (result.keys.length > 0) {
          await redisClient.del(result.keys);
          logger.debug(`Deleted ${result.keys.length} keys matching pattern: ${pattern}`);
        }
      } while (cursor !== 0);
    } catch (error) {
      logger.error(`Error deleting cache by pattern ${pattern}:`, error);
    }
  }

  /**
   * Check if a key exists in cache
   * @param key Cache key
   * @returns True if the key exists
   */
  static async exists(key: string): Promise<boolean> {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Error checking if key ${key} exists:`, error);
      return false;
    }
  }

  /**
   * Set a key's time to live
   * @param key Cache key
   * @param ttl Time to live in seconds
   */
  static async expire(key: string, ttl: number): Promise<void> {
    try {
      await redisClient.expire(key, ttl);
      logger.debug(`Cache TTL set: ${key} (${ttl}s)`);
    } catch (error) {
      logger.error(`Error setting TTL for key ${key}:`, error);
    }
  }

  /**
   * Add item to a list
   * @param key List key
   * @param value Value to add
   */
  static async listPush(key: string, value: any): Promise<void> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await redisClient.rPush(key, stringValue);
      logger.debug(`Item added to list: ${key}`);
    } catch (error) {
      logger.error(`Error adding item to list ${key}:`, error);
    }
  }

  /**
   * Get all items from a list
   * @param key List key
   * @param parse Whether to parse the results as JSON
   * @returns Array of list items
   */
  static async listGetAll<T>(key: string, parse = true): Promise<T[]> {
    try {
      const values = await redisClient.lRange(key, 0, -1);
      
      if (parse) {
        return values.map(value => JSON.parse(value)) as T[];
      }
      
      return values as unknown as T[];
    } catch (error) {
      logger.error(`Error getting list items for key ${key}:`, error);
      return [];
    }
  }

  /**
   * Increment a counter
   * @param key Counter key
   * @param increment Amount to increment by
   * @returns The new value
   */
  static async increment(key: string, increment = 1): Promise<number> {
    try {
      const result = await redisClient.incrBy(key, increment);
      logger.debug(`Counter incremented: ${key} (+${increment})`);
      return result;
    } catch (error) {
      logger.error(`Error incrementing counter ${key}:`, error);
      return 0;
    }
  }

  /**
   * Add key-value pair to a hash
   * @param key Hash key
   * @param field Field name
   * @param value Value to set
   */
  static async hashSet(key: string, field: string, value: any): Promise<void> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await redisClient.hSet(key, field, stringValue);
      logger.debug(`Hash field set: ${key}.${field}`);
    } catch (error) {
      logger.error(`Error setting hash field ${key}.${field}:`, error);
    }
  }

  /**
   * Get a value from a hash
   * @param key Hash key
   * @param field Field name
   * @param parse Whether to parse the result as JSON
   * @returns The value or null if not found
   */
  static async hashGet<T>(key: string, field: string, parse = true): Promise<T | null> {
    try {
      const value = await redisClient.hGet(key, field);
      
      if (!value) {
        logger.debug(`Hash field miss: ${key}.${field}`);
        return null;
      }
      
      logger.debug(`Hash field hit: ${key}.${field}`);
      return parse ? JSON.parse(value) : (value as unknown as T);
    } catch (error) {
      logger.error(`Error getting hash field ${key}.${field}:`, error);
      return null;
    }
  }

  /**
   * Get all fields and values from a hash
   * @param key Hash key
   * @param parse Whether to parse the values as JSON
   * @returns Object with all hash fields and values
   */
  static async hashGetAll<T>(key: string, parse = true): Promise<Record<string, T>> {
    try {
      const result = await redisClient.hGetAll(key);
      
      if (!result || Object.keys(result).length === 0) {
        logger.debug(`Hash miss: ${key}`);
        return {} as Record<string, T>;
      }
      
      logger.debug(`Hash hit: ${key}`);
      
      if (parse) {
        const parsedResult: Record<string, T> = {};
        for (const [field, value] of Object.entries(result)) {
          parsedResult[field] = JSON.parse(value);
        }
        return parsedResult;
      }
      
      return result as unknown as Record<string, T>;
    } catch (error) {
      logger.error(`Error getting hash ${key}:`, error);
      return {} as Record<string, T>;
    }
  }
}