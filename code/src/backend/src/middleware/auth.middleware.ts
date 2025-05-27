import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { logger } from '../config/logger';
import { AuditService, AuditEventType } from '../services/audit.service';

/**
 * Authentication middleware using JWT
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      logger.error('Authentication error:', err);
      return next(err);
    }

    if (!user) {
      logger.debug('Authentication failed:', info?.message);
      
      // Audit failed authentication attempts (if there's a token provided but invalid)
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        AuditService.log({
          eventType: AuditEventType.ACCESS_DENIED,
          userId: 'unknown',
          targetType: 'Authentication',
          metadata: {
            reason: info?.message || 'Invalid token',
            url: req.originalUrl,
            method: req.method
          },
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        });
      }
      
      return res.status(401).json({
        message: 'Não autorizado',
        details: info?.message || 'Token inválido ou expirado',
      });
    }

    // Attach user to request
    req.user = user;
    
    // Audit successful API access for sensitive endpoints
    if (req.originalUrl.includes('/admin') || 
        req.originalUrl.includes('/profile') || 
        req.method !== 'GET') {
      AuditService.log({
        eventType: AuditEventType.API_ACCESS,
        userId: user.id,
        targetType: 'API',
        metadata: {
          url: req.originalUrl,
          method: req.method
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
    }
    
    next();
  })(req, res, next);
};

/**
 * Role-based authorization middleware
 * @param roles Allowed roles
 */
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if user exists (should be attached by authenticate middleware)
    if (!req.user) {
      logger.debug('Authorization failed: No user attached to request');
      return res.status(401).json({ message: 'Não autorizado' });
    }

    // Check if user has required role
    if (!roles.includes(req.user.role)) {
      logger.debug(`Authorization failed: User role ${req.user.role} not in allowed roles ${roles}`);
      
      // Audit access denied events
      AuditService.logAccessDenied(req, 'access', req.originalUrl);
      
      return res.status(403).json({
        message: 'Acesso negado',
        details: 'Você não tem permissão para acessar este recurso',
      });
    }

    next();
  };
};

/**
 * Combined middleware for authentication and authorization
 * @param roles Allowed roles
 */
export const requireRoles = (roles: string[]) => {
  return [authenticate, authorize(roles)];
};