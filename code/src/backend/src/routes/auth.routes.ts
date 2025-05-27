import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import passport from 'passport';
import { strictRateLimiter } from '../middleware/rate-limiter.middleware';

const router = Router();

// Apply stricter rate limiting to auth endpoints
router.use(strictRateLimiter);

/**
 * @route POST /auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', AuthController.register);

/**
 * @route POST /auth/login
 * @desc Login user and get tokens
 * @access Public
 */
router.post('/login', AuthController.login);

/**
 * @route POST /auth/refresh-token
 * @desc Refresh access token using refresh token
 * @access Public
 */
router.post('/refresh-token', AuthController.refreshToken);

/**
 * @route POST /auth/logout
 * @desc Logout user and invalidate tokens
 * @access Private
 */
router.post(
  '/logout',
  passport.authenticate('jwt', { session: false }),
  AuthController.logout
);

/**
 * @route POST /auth/forgot-password
 * @desc Request password reset
 * @access Public
 */
router.post('/forgot-password', AuthController.forgotPassword);

/**
 * @route POST /auth/reset-password
 * @desc Reset password with token
 * @access Public
 */
router.post('/reset-password', AuthController.resetPassword);

/**
 * @route GET /auth/me
 * @desc Get current user information
 * @access Private
 */
router.get(
  '/me',
  passport.authenticate('jwt', { session: false }),
  AuthController.getCurrentUser
);

export default router;