import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import passport from 'passport';
import { JwtService } from '../services/jwt.service';
import { logger } from '../config/logger';
import { SessionService } from '../services/session.service';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for registration
const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'A senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'A senha deve conter pelo menos um número')
    .regex(/[^A-Za-z0-9]/, 'A senha deve conter pelo menos um caractere especial'),
  firstName: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  lastName: z.string().min(2, 'O sobrenome deve ter pelo menos 2 caracteres'),
  role: z.enum(['USER', 'SUPPLIER']).default('USER'),
});

// Validation schema for login
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

// Validation schema for password reset request
const passwordResetRequestSchema = z.object({
  email: z.string().email('Email inválido'),
});

// Validation schema for password reset
const passwordResetSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  password: z
    .string()
    .min(8, 'A senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'A senha deve conter pelo menos um número')
    .regex(/[^A-Za-z0-9]/, 'A senha deve conter pelo menos um caractere especial'),
});

/**
 * Authentication Controller
 */
export class AuthController {
  /**
   * Register a new user
   * @route POST /auth/register
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validatedData = registerSchema.parse(req.body);

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (existingUser) {
        logger.debug(`Registration attempt with existing email: ${validatedData.email}`);
        res.status(400).json({ message: 'Email já cadastrado' });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      // Create user and profile in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: {
            email: validatedData.email,
            password: hashedPassword,
            role: validatedData.role,
            status: 'ACTIVE', // Users are active by default, suppliers will be PENDING
          },
        });

        // Create profile
        const profile = await tx.profile.create({
          data: {
            userId: user.id,
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
          },
        });

        return { user, profile };
      });

      logger.info(`User registered successfully: ${result.user.id}`);

      // Return success response without sensitive data
      res.status(201).json({
        message: 'Usuário registrado com sucesso',
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          profile: {
            firstName: result.profile.firstName,
            lastName: result.profile.lastName,
          },
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Validation error
        logger.debug('Registration validation error:', error.errors);
        res.status(400).json({ message: 'Dados inválidos', errors: error.errors });
        return;
      }

      logger.error('Error during user registration:', error);
      res.status(500).json({ message: 'Erro ao registrar usuário' });
    }
  }

  /**
   * Login user
   * @route POST /auth/login
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validatedData = loginSchema.parse(req.body);

      // Authenticate with Passport
      passport.authenticate('local', { session: false }, async (err, user, info) => {
        if (err) {
          logger.error('Error during login authentication:', err);
          res.status(500).json({ message: 'Erro ao autenticar' });
          return;
        }

        if (!user) {
          logger.debug(`Login failed: ${info.message}`);
          res.status(401).json({ message: info.message || 'Credenciais inválidas' });
          return;
        }

        // Generate tokens
        const accessToken = JwtService.generateAccessToken(user.id, user.role);
        const refreshToken = await JwtService.generateRefreshToken(user.id);

        // Create session
        const sessionId = await SessionService.create(user.id, {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
        });

        logger.info(`User logged in: ${user.id}`);

        // Return tokens
        res.json({
          accessToken,
          refreshToken,
          sessionId,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            profile: user.profile,
          },
        });
      })(req, res);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Validation error
        logger.debug('Login validation error:', error.errors);
        res.status(400).json({ message: 'Dados inválidos', errors: error.errors });
        return;
      }

      logger.error('Error during login:', error);
      res.status(500).json({ message: 'Erro ao fazer login' });
    }
  }

  /**
   * Refresh tokens
   * @route POST /auth/refresh-token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({ message: 'Refresh token não fornecido' });
        return;
      }

      // Refresh tokens
      const tokens = await JwtService.refreshTokens(refreshToken);

      if (!tokens) {
        logger.debug(`Token refresh failed for token: ${refreshToken}`);
        res.status(401).json({ message: 'Refresh token inválido ou expirado' });
        return;
      }

      logger.debug('Tokens refreshed successfully');
      res.json(tokens);
    } catch (error) {
      logger.error('Error refreshing tokens:', error);
      res.status(500).json({ message: 'Erro ao atualizar tokens' });
    }
  }

  /**
   * Logout user
   * @route POST /auth/logout
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken, sessionId } = req.body;
      const userId = req.user?.id;

      if (sessionId) {
        // Delete session
        await SessionService.delete(sessionId);
      }

      if (refreshToken) {
        // Delete refresh token from database (handled by the refresh function)
        await JwtService.refreshTokens(refreshToken);
      }

      logger.info(`User logged out: ${userId}`);
      res.json({ message: 'Logout realizado com sucesso' });
    } catch (error) {
      logger.error('Error during logout:', error);
      res.status(500).json({ message: 'Erro ao fazer logout' });
    }
  }

  /**
   * Request password reset
   * @route POST /auth/forgot-password
   */
  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validatedData = passwordResetRequestSchema.parse(req.body);

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (!user) {
        // For security reasons, always return success even if the email doesn't exist
        logger.debug(`Password reset requested for non-existent email: ${validatedData.email}`);
        res.json({ message: 'Se o email existir, um link de recuperação será enviado' });
        return;
      }

      // Generate password reset token (UUID)
      const resetToken = uuidv4();
      const expiration = new Date();
      expiration.setHours(expiration.getHours() + 1); // Token valid for 1 hour

      // Store token in Redis
      await redisClient.set(`password_reset:${resetToken}`, user.id, {
        EX: 3600, // 1 hour in seconds
      });

      // In a real implementation, send email with reset link
      // For the MVP, we'll just return the token in the response
      logger.info(`Password reset token generated for user ${user.id}`);

      res.json({
        message: 'Se o email existir, um link de recuperação será enviado',
        // ONLY FOR MVP - remove in production
        token: resetToken,
        userId: user.id,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Validation error
        logger.debug('Password reset validation error:', error.errors);
        res.status(400).json({ message: 'Dados inválidos', errors: error.errors });
        return;
      }

      logger.error('Error generating password reset token:', error);
      res.status(500).json({ message: 'Erro ao solicitar redefinição de senha' });
    }
  }

  /**
   * Reset password
   * @route POST /auth/reset-password
   */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validatedData = passwordResetSchema.parse(req.body);

      // Check if token exists in Redis
      const userId = await redisClient.get(`password_reset:${validatedData.token}`);

      if (!userId) {
        logger.debug(`Invalid or expired password reset token: ${validatedData.token}`);
        res.status(400).json({ message: 'Token inválido ou expirado' });
        return;
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      // Update user password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      // Delete token from Redis
      await redisClient.del(`password_reset:${validatedData.token}`);

      // Revoke all refresh tokens for security
      await JwtService.revokeAllTokens(userId);

      logger.info(`Password reset successful for user ${userId}`);
      res.json({ message: 'Senha redefinida com sucesso' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Validation error
        logger.debug('Password reset validation error:', error.errors);
        res.status(400).json({ message: 'Dados inválidos', errors: error.errors });
        return;
      }

      logger.error('Error resetting password:', error);
      res.status(500).json({ message: 'Erro ao redefinir senha' });
    }
  }

  /**
   * Get current user
   * @route GET /auth/me
   */
  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      // User is attached to request by authentication middleware
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: 'Não autorizado' });
        return;
      }

      // Get user with profile
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          clientProfile: true,
          supplierProfile: true,
        },
      });

      if (!user) {
        logger.debug(`User not found: ${userId}`);
        res.status(404).json({ message: 'Usuário não encontrado' });
        return;
      }

      // Remove sensitive data
      const { password, ...userWithoutPassword } = user;

      logger.debug(`Current user data retrieved: ${userId}`);
      res.json(userWithoutPassword);
    } catch (error) {
      logger.error('Error getting current user:', error);
      res.status(500).json({ message: 'Erro ao obter dados do usuário' });
    }
  }
}