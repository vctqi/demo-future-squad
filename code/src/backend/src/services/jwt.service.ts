import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';
import { redisClient } from '../config/redis';
import { logger } from '../config/logger';

const prisma = new PrismaClient();

// JWT configuration from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// Convert string duration to seconds
const parseExpiration = (duration: string): number => {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 3600; // Default to 1 hour

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 60 * 60;
    case 'd': return value * 24 * 60 * 60;
    default: return 3600;
  }
};

// Refresh token expiration in seconds
const refreshTokenExpiresIn = parseExpiration(REFRESH_TOKEN_EXPIRES_IN);

/**
 * JWT Service for token generation and validation
 */
export class JwtService {
  /**
   * Generate JWT access token
   * @param userId User ID
   * @param role User role
   * @returns JWT token
   */
  static generateAccessToken(userId: string, role: string): string {
    return jwt.sign(
      {
        sub: userId,
        role,
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      }
    );
  }

  /**
   * Generate refresh token and store in database
   * @param userId User ID
   * @returns Refresh token
   */
  static async generateRefreshToken(userId: string): Promise<string> {
    // Generate a unique token
    const token = uuidv4();

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + refreshTokenExpiresIn);

    // Store in database
    await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    // Also store in Redis for faster validation
    await redisClient.set(`refresh_token:${token}`, userId, {
      EX: refreshTokenExpiresIn,
    });

    logger.debug(`Refresh token generated for user ${userId}`);
    return token;
  }

  /**
   * Validate refresh token and generate new tokens
   * @param refreshToken Refresh token
   * @returns New access and refresh tokens
   */
  static async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
    try {
      // Check Redis first for faster validation
      const userId = await redisClient.get(`refresh_token:${token}`);

      if (!userId) {
        // If not in Redis, check database
        const tokenRecord = await prisma.refreshToken.findUnique({
          where: { token: refreshToken },
        });

        // Token not found or expired
        if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
          logger.debug(`Invalid or expired refresh token: ${refreshToken}`);
          return null;
        }

        // Use userId from database
        userId = tokenRecord.userId;
      }

      // Get user to check status and role
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      // User not found or not active
      if (!user || user.status !== 'ACTIVE') {
        logger.debug(`User inactive or not found for refresh token: ${refreshToken}`);
        return null;
      }

      // Delete old refresh token
      await prisma.refreshToken.delete({
        where: { token: refreshToken },
      });
      await redisClient.del(`refresh_token:${refreshToken}`);

      // Generate new tokens
      const newAccessToken = this.generateAccessToken(user.id, user.role);
      const newRefreshToken = await this.generateRefreshToken(user.id);

      logger.debug(`Tokens refreshed for user ${user.id}`);
      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      logger.error('Error refreshing tokens:', error);
      return null;
    }
  }

  /**
   * Revoke all refresh tokens for a user
   * @param userId User ID
   */
  static async revokeAllTokens(userId: string): Promise<void> {
    try {
      // Delete from database
      const tokens = await prisma.refreshToken.findMany({
        where: { userId },
      });

      await prisma.refreshToken.deleteMany({
        where: { userId },
      });

      // Delete from Redis
      const pipeline = redisClient.multi();
      tokens.forEach((token) => {
        pipeline.del(`refresh_token:${token.token}`);
      });
      await pipeline.exec();

      logger.debug(`All tokens revoked for user ${userId}`);
    } catch (error) {
      logger.error('Error revoking tokens:', error);
      throw error;
    }
  }

  /**
   * Verify JWT token
   * @param token JWT token
   * @returns Payload if valid, null otherwise
   */
  static verifyToken(token: string): any | null {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      logger.debug(`Invalid JWT token: ${error.message}`);
      return null;
    }
  }
}