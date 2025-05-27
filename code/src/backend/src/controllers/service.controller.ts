import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { logger } from '../config/logger';
import { AuditService, AuditEventType } from '../services/audit.service';

const prisma = new PrismaClient();

// Validation schema for service registration
const serviceRegistrationSchema = z.object({
  title: z.string().min(3, 'O título deve ter pelo menos 3 caracteres'),
  description: z.string().min(10, 'A descrição deve ter pelo menos 10 caracteres'),
  categoryId: z.string().uuid('ID de categoria inválido'),
  price: z.number().positive('O preço deve ser positivo'),
  priceType: z.enum(['FIXED', 'HOURLY', 'MONTHLY', 'YEARLY', 'CUSTOM'], {
    errorMap: () => ({ message: 'Tipo de preço inválido' }),
  }),
  features: z.array(z.string()).optional(),
  terms: z.string().optional(),
  sla: z.string().optional(),
  images: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      size: z.number(),
      url: z.string().optional(),
    })
  ).optional(),
});

/**
 * Service Controller
 */
// Validation schema for service status update
const serviceStatusUpdateSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE'], {
    errorMap: () => ({ message: 'Status inválido. Deve ser ACTIVE ou INACTIVE' }),
  }),
});

export class ServiceController {
  /**
   * Register a new service
   * @route POST /api/services
   */
  static async createService(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: 'Não autorizado' });
        return;
      }

      // Validate request body
      const validatedData = serviceRegistrationSchema.parse(req.body);

      // Get supplier profile
      const supplierProfile = await prisma.supplierProfile.findFirst({
        where: { userId },
      });

      if (!supplierProfile) {
        logger.debug(`User ${userId} does not have a supplier profile`);
        res.status(400).json({ message: 'Usuário não possui um perfil de fornecedor' });
        return;
      }

      // Check if supplier is active
      if (supplierProfile.status !== 'ACTIVE') {
        logger.debug(`Supplier ${supplierProfile.id} is not active`);
        res.status(400).json({ message: 'Fornecedor não está ativo para cadastrar serviços' });
        return;
      }

      // Check if category exists
      const category = await prisma.category.findUnique({
        where: { id: validatedData.categoryId },
      });

      if (!category) {
        logger.debug(`Category ${validatedData.categoryId} not found`);
        res.status(400).json({ message: 'Categoria não encontrada' });
        return;
      }

      // Create service
      const service = await prisma.service.create({
        data: {
          supplierId: supplierProfile.id,
          categoryId: validatedData.categoryId,
          title: validatedData.title,
          description: validatedData.description,
          price: validatedData.price,
          priceType: validatedData.priceType,
          status: 'PENDING', // All services start as pending
          features: validatedData.features ? { set: validatedData.features } : undefined,
          terms: validatedData.terms,
          sla: validatedData.sla,
        },
      });

      // In a real implementation, we would save the images to cloud storage
      // For the MVP, we're just logging them
      if (validatedData.images && validatedData.images.length > 0) {
        logger.debug(`Images for service ${service.id}:`, validatedData.images);
      }

      // Audit service creation
      AuditService.log({
        eventType: AuditEventType.SERVICE_CREATE,
        userId,
        targetId: service.id,
        targetType: 'Service',
        metadata: {
          title: validatedData.title,
          price: validatedData.price,
          priceType: validatedData.priceType,
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      logger.info(`Service created by supplier ${supplierProfile.id}`);
      
      res.status(201).json({
        message: 'Serviço cadastrado com sucesso',
        service: {
          id: service.id,
          title: service.title,
          status: service.status,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Validation error
        logger.debug('Service registration validation error:', error.errors);
        res.status(400).json({ message: 'Dados inválidos', errors: error.errors });
        return;
      }

      logger.error('Error creating service:', error);
      res.status(500).json({ message: 'Erro ao cadastrar serviço' });
    }
  }

  /**
   * Get supplier's services
   * @route GET /api/services/my
   */
  static async getMyServices(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: 'Não autorizado' });
        return;
      }

      // Get supplier profile
      const supplierProfile = await prisma.supplierProfile.findFirst({
        where: { userId },
      });

      if (!supplierProfile) {
        logger.debug(`User ${userId} does not have a supplier profile`);
        res.status(400).json({ message: 'Usuário não possui um perfil de fornecedor' });
        return;
      }

      // Get services
      const services = await prisma.service.findMany({
        where: { supplierId: supplierProfile.id },
        include: {
          category: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      logger.debug(`Retrieved ${services.length} services for supplier ${supplierProfile.id}`);
      res.json(services);
    } catch (error) {
      logger.error('Error getting supplier services:', error);
      res.status(500).json({ message: 'Erro ao obter serviços do fornecedor' });
    }
  }

  /**
   * Get service by ID
   * @route GET /api/services/:id
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
        },
      });

      if (!service) {
        logger.debug(`Service ${id} not found`);
        res.status(404).json({ message: 'Serviço não encontrado' });
        return;
      }

      logger.debug(`Retrieved service ${id}`);
      res.json(service);
    } catch (error) {
      logger.error('Error getting service:', error);
      res.status(500).json({ message: 'Erro ao obter serviço' });
    }
  }

  /**
   * Update service
   * @route PUT /api/services/:id
   */
  static async updateService(req: Request, res: Response): Promise<void> {
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
          supplier: true,
        },
      });

      if (!service) {
        logger.debug(`Service ${id} not found`);
        res.status(404).json({ message: 'Serviço não encontrado' });
        return;
      }

      // Check if user is the supplier
      if (service.supplier.userId !== userId) {
        logger.debug(`User ${userId} is not the owner of service ${id}`);
        res.status(403).json({ message: 'Não autorizado a editar este serviço' });
        return;
      }

      // Validate request body (partial validation)
      const validatedData = serviceRegistrationSchema
        .partial() // Make all fields optional
        .parse(req.body);

      // Check if category exists if provided
      if (validatedData.categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: validatedData.categoryId },
        });

        if (!category) {
          logger.debug(`Category ${validatedData.categoryId} not found`);
          res.status(400).json({ message: 'Categoria não encontrada' });
          return;
        }
      }

      // Update service
      // If service was already approved, updating it resets it to pending
      const shouldResetStatus = 
        service.status === 'ACTIVE' && 
        (validatedData.title || validatedData.description || validatedData.price || validatedData.priceType);
      
      const updatedService = await prisma.service.update({
        where: { id },
        data: {
          title: validatedData.title,
          description: validatedData.description,
          categoryId: validatedData.categoryId,
          price: validatedData.price,
          priceType: validatedData.priceType,
          status: shouldResetStatus ? 'PENDING' : undefined, // Reset to pending if significant changes
          features: validatedData.features ? { set: validatedData.features } : undefined,
          terms: validatedData.terms,
          sla: validatedData.sla,
        },
      });

      // Audit service update
      AuditService.log({
        eventType: AuditEventType.SERVICE_UPDATE,
        userId,
        targetId: service.id,
        targetType: 'Service',
        metadata: {
          title: validatedData.title,
          price: validatedData.price,
          priceType: validatedData.priceType,
          statusChange: shouldResetStatus ? `${service.status} -> PENDING` : 'No change',
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      logger.info(`Service ${id} updated by supplier ${service.supplier.id}`);
      
      res.json({
        message: 'Serviço atualizado com sucesso',
        service: updatedService,
        statusReset: shouldResetStatus,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Validation error
        logger.debug('Service update validation error:', error.errors);
        res.status(400).json({ message: 'Dados inválidos', errors: error.errors });
        return;
      }

      logger.error('Error updating service:', error);
      res.status(500).json({ message: 'Erro ao atualizar serviço' });
    }
  }

  /**
   * Delete service
   * @route DELETE /api/services/:id
   */
  static async deleteService(req: Request, res: Response): Promise<void> {
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
          supplier: true,
        },
      });

      if (!service) {
        logger.debug(`Service ${id} not found`);
        res.status(404).json({ message: 'Serviço não encontrado' });
        return;
      }

      // Check if user is the supplier
      if (service.supplier.userId !== userId) {
        logger.debug(`User ${userId} is not the owner of service ${id}`);
        res.status(403).json({ message: 'Não autorizado a excluir este serviço' });
        return;
      }

      // Check if service has contracts
      const contractCount = await prisma.contract.count({
        where: { serviceId: id },
      });

      if (contractCount > 0) {
        logger.debug(`Service ${id} has ${contractCount} contracts and cannot be deleted`);
        res.status(400).json({ message: 'Serviço não pode ser excluído pois possui contratos' });
        return;
      }

      // Delete service
      await prisma.service.delete({
        where: { id },
      });

      // Audit service deletion
      AuditService.log({
        eventType: AuditEventType.SERVICE_DELETE,
        userId,
        targetId: service.id,
        targetType: 'Service',
        metadata: {
          title: service.title,
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      logger.info(`Service ${id} deleted by supplier ${service.supplier.id}`);
      
      res.json({
        message: 'Serviço excluído com sucesso',
      });
    } catch (error) {
      logger.error('Error deleting service:', error);
      res.status(500).json({ message: 'Erro ao excluir serviço' });
    }
  }

  /**
   * Get all services with filtering (for marketplace)
   * @route GET /api/services
   */
  static async getAllServices(req: Request, res: Response): Promise<void> {
    try {
      // Extract query parameters
      const categoryId = req.query.categoryId as string;
      const status = req.query.status as string || 'ACTIVE'; // Default to active services
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
      const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
      const supplierId = req.query.supplierId as string;
      const orderBy = req.query.orderBy as string || 'createdAt';
      const orderDirection = req.query.orderDirection as 'asc' | 'desc' || 'desc';

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};
      
      // Only show active services by default for marketplace
      if (status) {
        where.status = status;
      }
      
      if (categoryId) {
        where.categoryId = categoryId;
      }
      
      if (supplierId) {
        where.supplierId = supplierId;
      }
      
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }
      
      if (minPrice !== undefined) {
        where.price = { ...where.price, gte: minPrice };
      }
      
      if (maxPrice !== undefined) {
        where.price = { ...where.price, lte: maxPrice };
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
          serviceReviews: {
            select: {
              rating: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: orderByClause,
      });

      // Calculate average rating for each service
      const servicesWithRating = services.map(service => {
        const reviews = service.serviceReviews;
        const averageRating = reviews.length > 0
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
          : null;
        
        return {
          ...service,
          averageRating,
          reviewCount: reviews.length,
        };
      });

      // Get total count
      const totalCount = await prisma.service.count({ where });

      logger.debug(`Retrieved ${services.length} services`);
      res.json({
        services: servicesWithRating,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      });
    } catch (error) {
      logger.error('Error getting services:', error);
      res.status(500).json({ message: 'Erro ao obter serviços' });
    }
  }

  /**
   * Get all categories
   * @route GET /api/services/categories
   */
  static async getAllCategories(req: Request, res: Response): Promise<void> {
    try {
      // Get categories
      const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
      });

      logger.debug(`Retrieved ${categories.length} categories`);
      res.json(categories);
    } catch (error) {
      logger.error('Error getting categories:', error);
      res.status(500).json({ message: 'Erro ao obter categorias' });
    }
  }
  
  /**
   * Update service status (activate/deactivate)
   * @route PATCH /api/services/:id/status
   */
  static async updateServiceStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      
      // Validate request body
      const result = serviceStatusUpdateSchema.safeParse(req.body);
      if (!result.success) {
        logger.warn(`Invalid service status update data: ${JSON.stringify(result.error.errors)}`);
        res.status(400).json({ message: 'Dados inválidos', errors: result.error.errors });
        return;
      }
      
      const { status } = result.data;
      
      // Check if service exists and belongs to the current user
      const service = await prisma.service.findFirst({
        where: {
          id,
          supplier: {
            userId,
          },
        },
        include: {
          supplier: true,
        },
      });
      
      if (!service) {
        logger.warn(`Service not found or not owned by user: ${id}`);
        res.status(404).json({ message: 'Serviço não encontrado ou você não tem permissão para alterá-lo' });
        return;
      }
      
      // Service must be in ACTIVE or INACTIVE state to update
      if (service.status !== 'ACTIVE' && service.status !== 'INACTIVE') {
        logger.warn(`Cannot update status of service in ${service.status} state`);
        res.status(400).json({ message: `Não é possível atualizar o status de um serviço que está ${service.status === 'PENDING' ? 'pendente de aprovação' : 'rejeitado'}` });
        return;
      }
      
      // Update service status
      const updatedService = await prisma.service.update({
        where: { id },
        data: { status },
      });
      
      // Log the action
      await AuditService.logEvent({
        userId,
        eventType: status === 'ACTIVE' ? AuditEventType.SERVICE_ACTIVATED : AuditEventType.SERVICE_DEACTIVATED,
        resourceId: id,
        details: {
          serviceId: id,
          serviceName: service.title,
          previousStatus: service.status,
          newStatus: status,
        },
      });
      
      logger.info(`Service ${id} status updated to ${status} by user ${userId}`);
      res.json(updatedService);
    } catch (error) {
      logger.error('Error updating service status:', error);
      res.status(500).json({ message: 'Erro ao atualizar status do serviço' });
    }
  }
}