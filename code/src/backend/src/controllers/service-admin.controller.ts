import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger';
import { AuditService, AuditEventType } from '../services/audit.service';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for service approval/rejection
const serviceStatusUpdateSchema = z.object({
  reason: z.string().optional(),
});

/**
 * Service Admin Controller
 * Handles administrative actions on services such as approval and rejection
 */
export class ServiceAdminController {
  /**
   * Get all services with filtering (admin view)
   * @route GET /api/admin/services
   */
  static async getAllServices(req: Request, res: Response): Promise<void> {
    try {
      // Extract query parameters
      const status = req.query.status as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const supplierId = req.query.supplierId as string;
      const categoryId = req.query.categoryId as string;
      const orderBy = req.query.orderBy as string || 'createdAt';
      const orderDirection = req.query.orderDirection as 'asc' | 'desc' || 'desc';

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};
      
      if (status) {
        where.status = status;
      }
      
      if (supplierId) {
        where.supplierId = supplierId;
      }
      
      if (categoryId) {
        where.categoryId = categoryId;
      }
      
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Build order by
      const orderByClause: any = {};
      orderByClause[orderBy] = orderDirection;

      // Get services
      const services = await prisma.service.findMany({
        where,
        include: {
          category: true,
          supplier: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  profile: true,
                },
              },
            },
          },
          contracts: {
            select: {
              id: true,
            },
          },
          serviceReviews: {
            select: {
              id: true,
              rating: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: orderByClause,
      });

      // Calculate average rating for each service
      const servicesWithStats = services.map(service => {
        const reviews = service.serviceReviews;
        const averageRating = reviews.length > 0
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
          : null;
        
        return {
          ...service,
          averageRating,
          reviewCount: reviews.length,
          contractCount: service.contracts.length,
        };
      });

      // Get total count
      const totalCount = await prisma.service.count({ where });

      logger.debug(`Retrieved ${services.length} services for admin`);
      res.json({
        services: servicesWithStats,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      });
    } catch (error) {
      logger.error('Error getting services for admin:', error);
      res.status(500).json({ message: 'Erro ao obter serviços' });
    }
  }

  /**
   * Get service by ID (admin view)
   * @route GET /api/admin/services/:id
   */
  static async getServiceById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Get service
      const service = await prisma.service.findUnique({
        where: { id },
        include: {
          category: true,
          supplier: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  profile: true,
                },
              },
            },
          },
          contracts: {
            select: {
              id: true,
              status: true,
              startDate: true,
              endDate: true,
              totalPrice: true,
              client: {
                select: {
                  id: true,
                  companyName: true,
                },
              },
            },
          },
          serviceReviews: {
            select: {
              id: true,
              rating: true,
              comment: true,
              createdAt: true,
              client: {
                select: {
                  id: true,
                  companyName: true,
                },
              },
            },
          },
        },
      });

      if (!service) {
        logger.debug(`Service ${id} not found`);
        res.status(404).json({ message: 'Serviço não encontrado' });
        return;
      }

      // Calculate average rating
      const reviews = service.serviceReviews;
      const averageRating = reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : null;

      // Format response
      const responseData = {
        ...service,
        averageRating,
        reviewCount: reviews.length,
        contractCount: service.contracts.length,
      };

      logger.debug(`Retrieved service ${id} for admin`);
      res.json(responseData);
    } catch (error) {
      logger.error('Error getting service for admin:', error);
      res.status(500).json({ message: 'Erro ao obter serviço' });
    }
  }

  /**
   * Approve service
   * @route PUT /api/admin/services/:id/approve
   */
  static async approveService(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: 'Não autorizado' });
        return;
      }

      // Get service
      const service = await prisma.service.findUnique({
        where: { id },
        include: {
          supplier: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!service) {
        logger.debug(`Service ${id} not found`);
        res.status(404).json({ message: 'Serviço não encontrado' });
        return;
      }

      // Check if service is already approved
      if (service.status === 'ACTIVE') {
        logger.debug(`Service ${id} is already approved`);
        res.status(400).json({ message: 'Serviço já está aprovado' });
        return;
      }

      // Update service status
      const updatedService = await prisma.service.update({
        where: { id },
        data: { status: 'ACTIVE' },
      });

      // Audit service approval
      AuditService.log({
        eventType: AuditEventType.SERVICE_APPROVE,
        userId,
        targetId: service.id,
        targetType: 'Service',
        metadata: {
          serviceTitle: service.title,
          supplierName: service.supplier.companyName,
          supplierEmail: service.supplier.user.email,
          oldStatus: service.status,
          newStatus: 'ACTIVE',
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      // TODO: Notify supplier about service approval

      logger.info(`Service ${id} approved by admin ${userId}`);
      res.json({
        message: 'Serviço aprovado com sucesso',
        service: updatedService,
      });
    } catch (error) {
      logger.error('Error approving service:', error);
      res.status(500).json({ message: 'Erro ao aprovar serviço' });
    }
  }

  /**
   * Reject service
   * @route PUT /api/admin/services/:id/reject
   */
  static async rejectService(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: 'Não autorizado' });
        return;
      }

      // Validate request body
      const validatedData = serviceStatusUpdateSchema.parse(req.body);
      const { reason } = validatedData;

      // Get service
      const service = await prisma.service.findUnique({
        where: { id },
        include: {
          supplier: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!service) {
        logger.debug(`Service ${id} not found`);
        res.status(404).json({ message: 'Serviço não encontrado' });
        return;
      }

      // Check if service is already rejected
      if (service.status === 'REJECTED') {
        logger.debug(`Service ${id} is already rejected`);
        res.status(400).json({ message: 'Serviço já está rejeitado' });
        return;
      }

      // Update service status
      const updatedService = await prisma.service.update({
        where: { id },
        data: { status: 'REJECTED' },
      });

      // Audit service rejection
      AuditService.log({
        eventType: AuditEventType.SERVICE_REJECT,
        userId,
        targetId: service.id,
        targetType: 'Service',
        metadata: {
          serviceTitle: service.title,
          supplierName: service.supplier.companyName,
          supplierEmail: service.supplier.user.email,
          oldStatus: service.status,
          newStatus: 'REJECTED',
          reason,
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      // TODO: Notify supplier about service rejection

      logger.info(`Service ${id} rejected by admin ${userId}`);
      res.json({
        message: 'Serviço rejeitado com sucesso',
        service: updatedService,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Validation error
        logger.debug('Service rejection validation error:', error.errors);
        res.status(400).json({ message: 'Dados inválidos', errors: error.errors });
        return;
      }

      logger.error('Error rejecting service:', error);
      res.status(500).json({ message: 'Erro ao rejeitar serviço' });
    }
  }
}