import { redisClient } from '../config/redis';
import { logger } from '../config/logger';
import { v4 as uuidv4 } from 'uuid';

// Session TTL in seconds (default: 24 hours)
const SESSION_TTL = 86400;

// Session key prefix
const SESSION_PREFIX = 'session:';

/**
 * Session Service for managing user sessions with Redis
 */
export class SessionService {
  /**
   * Create a new session
   * @param userId User ID
   * @param data Additional session data
   * @param ttl Session time to live in seconds
   * @returns Session ID
   */
  static async create(userId: string, data: Record<string, any> = {}, ttl = SESSION_TTL): Promise<string> {
    try {
      // Generate unique session ID
      const sessionId = uuidv4();
      const key = `${SESSION_PREFIX}${sessionId}`;
      
      // Combine user ID with session data
      const sessionData = {
        userId,
        createdAt: new Date().toISOString(),
        ...data,
      };
      
      // Store session in Redis with TTL
      await redisClient.set(key, JSON.stringify(sessionData), { EX: ttl });
      
      // Add session to user's sessions set
      await redisClient.sAdd(`user:${userId}:sessions`, sessionId);
      
      logger.debug(`Session created: ${sessionId} for user ${userId}`);
      return sessionId;
    } catch (error) {
      logger.error('Error creating session:', error);
      throw new Error('Failed to create session');
    }
  }

  /**
   * Get session data
   * @param sessionId Session ID
   * @returns Session data or null if not found
   */
  static async get(sessionId: string): Promise<Record<string, any> | null> {
    try {
      const key = `${SESSION_PREFIX}${sessionId}`;
      const data = await redisClient.get(key);
      
      if (!data) {
        logger.debug(`Session not found: ${sessionId}`);
        return null;
      }
      
      return JSON.parse(data);
    } catch (error) {
      logger.error(`Error getting session ${sessionId}:`, error);
      return null;
    }
  }

  /**
   * Update session data
   * @param sessionId Session ID
   * @param data New session data (merged with existing)
   * @returns true if successful, false if session not found
   */
  static async update(sessionId: string, data: Record<string, any>): Promise<boolean> {
    try {
      const key = `${SESSION_PREFIX}${sessionId}`;
      
      // Get current session data
      const currentData = await redisClient.get(key);
      if (!currentData) {
        logger.debug(`Session not found for update: ${sessionId}`);
        return false;
      }
      
      // Get current TTL
      const ttl = await redisClient.ttl(key);
      if (ttl < 0) {
        logger.debug(`Session expired for update: ${sessionId}`);
        return false;
      }
      
      // Merge existing data with new data
      const sessionData = {
        ...JSON.parse(currentData),
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      // Update session with same TTL
      await redisClient.set(key, JSON.stringify(sessionData), { EX: ttl });
      
      logger.debug(`Session updated: ${sessionId}`);
      return true;
    } catch (error) {
      logger.error(`Error updating session ${sessionId}:`, error);
      return false;
    }
  }

  /**
   * Delete a session
   * @param sessionId Session ID
   * @returns true if successful, false otherwise
   */
  static async delete(sessionId: string): Promise<boolean> {
    try {
      const key = `${SESSION_PREFIX}${sessionId}`;
      
      // Get user ID from session before deleting
      const sessionData = await redisClient.get(key);
      if (sessionData) {
        const { userId } = JSON.parse(sessionData);
        
        // Delete session
        await redisClient.del(key);
        
        // Remove from user's sessions set
        if (userId) {
          await redisClient.sRem(`user:${userId}:sessions`, sessionId);
        }
        
        logger.debug(`Session deleted: ${sessionId}`);
        return true;
      }
      
      logger.debug(`Session not found for deletion: ${sessionId}`);
      return false;
    } catch (error) {
      logger.error(`Error deleting session ${sessionId}:`, error);
      return false;
    }
  }

  /**
   * Extend session TTL
   * @param sessionId Session ID
   * @param ttl New TTL in seconds
   * @returns true if successful, false if session not found
   */
  static async extend(sessionId: string, ttl = SESSION_TTL): Promise<boolean> {
    try {
      const key = `${SESSION_PREFIX}${sessionId}`;
      const exists = await redisClient.exists(key);
      
      if (exists) {
        await redisClient.expire(key, ttl);
        logger.debug(`Session extended: ${sessionId} (${ttl}s)`);
        return true;
      }
      
      logger.debug(`Session not found for extension: ${sessionId}`);
      return false;
    } catch (error) {
      logger.error(`Error extending session ${sessionId}:`, error);
      return false;
    }
  }

  /**
   * Delete all sessions for a user
   * @param userId User ID
   * @returns Number of sessions deleted
   */
  static async deleteUserSessions(userId: string): Promise<number> {
    try {
      const userSessionsKey = `user:${userId}:sessions`;
      
      // Get all session IDs for the user
      const sessionIds = await redisClient.sMembers(userSessionsKey);
      
      if (sessionIds.length === 0) {
        logger.debug(`No sessions found for user ${userId}`);
        return 0;
      }
      
      // Delete each session
      const sessionKeys = sessionIds.map(id => `${SESSION_PREFIX}${id}`);
      await redisClient.del(sessionKeys);
      
      // Clear the user's sessions set
      await redisClient.del(userSessionsKey);
      
      logger.debug(`Deleted ${sessionIds.length} sessions for user ${userId}`);
      return sessionIds.length;
    } catch (error) {
      logger.error(`Error deleting sessions for user ${userId}:`, error);
      return 0;
    }
  }

  /**
   * Get all active sessions for a user
   * @param userId User ID
   * @returns Array of session IDs
   */
  static async getUserSessions(userId: string): Promise<string[]> {
    try {
      const userSessionsKey = `user:${userId}:sessions`;
      const sessionIds = await redisClient.sMembers(userSessionsKey);
      
      // Filter out expired sessions
      const activeSessions: string[] = [];
      
      for (const sessionId of sessionIds) {
        const key = `${SESSION_PREFIX}${sessionId}`;
        const exists = await redisClient.exists(key);
        
        if (exists) {
          activeSessions.push(sessionId);
        } else {
          // Clean up expired session from the set
          await redisClient.sRem(userSessionsKey, sessionId);
        }
      }
      
      logger.debug(`Found ${activeSessions.length} active sessions for user ${userId}`);
      return activeSessions;
    } catch (error) {
      logger.error(`Error getting sessions for user ${userId}:`, error);
      return [];
    }
  }
}