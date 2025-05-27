import { Request, Response, NextFunction } from 'express';
import { Action, Subjects, defineAbilitiesFor } from '../services/access-control/ability';
import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger';

const prisma = new PrismaClient();

/**
 * Middleware to check if user can perform an action on a subject
 * @param action Action to check
 * @param subject Subject to check
 * @param getSubjectData Optional function to get subject data from request
 */
export const checkAbility = (
  action: Action,
  subject: Subjects,
  getSubjectData?: (req: Request) => Promise<any> | any
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // User should be attached by the authentication middleware
      if (!req.user) {
        logger.debug('Authorization failed: No user attached to request');
        return res.status(401).json({ message: 'Não autorizado' });
      }

      // Get the user with profiles for permission checking
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          clientProfile: true,
          supplierProfile: {
            include: {
              services: {
                select: { id: true }
              }
            }
          }
        }
      });

      if (!user) {
        logger.debug(`Authorization failed: User ${req.user.id} not found`);
        return res.status(401).json({ message: 'Não autorizado' });
      }

      // Get subject data if needed
      let subjectData;
      if (getSubjectData) {
        subjectData = await Promise.resolve(getSubjectData(req));
      }

      // Define abilities and check permission
      const ability = defineAbilitiesFor(user);
      
      if (subjectData) {
        // Check permission with subject data
        if (!ability.can(action, subject, subjectData)) {
          logger.debug(`Authorization failed: User ${user.id} cannot ${action} ${subject}`);
          return res.status(403).json({
            message: 'Acesso negado',
            details: 'Você não tem permissão para realizar esta ação',
          });
        }
      } else {
        // Check permission without subject data
        if (!ability.can(action, subject)) {
          logger.debug(`Authorization failed: User ${user.id} cannot ${action} ${subject}`);
          return res.status(403).json({
            message: 'Acesso negado',
            details: 'Você não tem permissão para realizar esta ação',
          });
        }
      }

      // User has permission, continue
      next();
    } catch (error) {
      logger.error('Error in access control middleware:', error);
      res.status(500).json({ message: 'Erro interno ao verificar permissões' });
    }
  };
};

/**
 * Middleware to check if user is an admin
 */
export const requireAdmin = checkAbility(Action.Manage, 'all');

/**
 * Middleware to check if user is a supplier
 */
export const requireSupplier = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Não autorizado' });
  }

  if (req.user.role !== 'SUPPLIER' && req.user.role !== 'ADMIN') {
    return res.status(403).json({
      message: 'Acesso negado',
      details: 'Apenas fornecedores podem acessar este recurso',
    });
  }

  next();
};

/**
 * Middleware to check if user is a client
 */
export const requireClient = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Não autorizado' });
  }

  if (req.user.role !== 'USER' && req.user.role !== 'ADMIN') {
    return res.status(403).json({
      message: 'Acesso negado',
      details: 'Apenas clientes podem acessar este recurso',
    });
  }

  next();
};