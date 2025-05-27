import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { logger } from '../config/logger';
import { AuditService, AuditEventType } from '../services/audit.service';
import { validateCNPJ } from '../utils/validators';

const prisma = new PrismaClient();

// Validation schema for supplier registration
const supplierRegistrationSchema = z.object({
  companyName: z.string().min(3, 'O nome da empresa deve ter pelo menos 3 caracteres'),
  cnpj: z
    .string()
    .min(14, 'CNPJ deve ter 14 dígitos')
    .max(18, 'CNPJ deve ter no máximo 18 caracteres')
    .refine(validateCNPJ, 'CNPJ inválido'),
  description: z.string().min(10, 'A descrição deve ter pelo menos 10 caracteres'),
  website: z.string().url('URL inválida').optional(),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos').optional(),
  address: z.object({
    street: z.string().min(3, 'Rua deve ter pelo menos 3 caracteres'),
    number: z.string().min(1, 'Número é obrigatório'),
    complement: z.string().optional(),
    neighborhood: z.string().min(2, 'Bairro deve ter pelo menos 2 caracteres'),
    city: z.string().min(2, 'Cidade deve ter pelo menos 2 caracteres'),
    state: z.string().length(2, 'Estado deve ter 2 caracteres'),
    zipCode: z.string().min(8, 'CEP deve ter pelo menos 8 dígitos'),
  }).optional(),
  termsAccepted: z.boolean().refine((val) => val === true, 'Você deve aceitar os termos de serviço'),
});

/**
 * Supplier Controller
 */
export class SupplierController {
  /**
   * Register a new supplier
   * @route POST /api/suppliers
   */
  static async registerSupplier(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: 'Não autorizado' });
        return;
      }

      // Validate request body
      const validatedData = supplierRegistrationSchema.parse(req.body);

      // Check if user already has a supplier profile
      const existingSupplierProfile = await prisma.supplierProfile.findFirst({
        where: { userId },
      });

      if (existingSupplierProfile) {
        logger.debug(`User ${userId} already has a supplier profile`);
        res.status(400).json({ message: 'Usuário já possui um perfil de fornecedor' });
        return;
      }

      // Check if CNPJ is already registered
      const existingCNPJ = await prisma.supplierProfile.findFirst({
        where: { cnpj: validatedData.cnpj },
      });

      if (existingCNPJ) {
        logger.debug(`CNPJ ${validatedData.cnpj} already registered`);
        res.status(400).json({ message: 'CNPJ já cadastrado' });
        return;
      }

      // Create supplier profile
      const supplierProfile = await prisma.supplierProfile.create({
        data: {
          userId,
          companyName: validatedData.companyName,
          cnpj: validatedData.cnpj.replace(/[^\d]/g, ''), // Remove non-numeric characters
          description: validatedData.description,
          website: validatedData.website,
          status: 'PENDING', // All suppliers start as pending
        },
      });

      // If address is provided, store it
      if (validatedData.address) {
        // In a real implementation, you would save the address
        // For the MVP, we're just logging it
        logger.debug(`Address for supplier ${supplierProfile.id}:`, validatedData.address);
      }

      // Update user role to SUPPLIER if it's a regular user
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (user && user.role === 'USER') {
        await prisma.user.update({
          where: { id: userId },
          data: { role: 'SUPPLIER' },
        });
      }

      // Audit supplier registration
      AuditService.log({
        eventType: AuditEventType.USER_CREATE,
        userId,
        targetId: supplierProfile.id,
        targetType: 'SupplierProfile',
        metadata: {
          companyName: validatedData.companyName,
          cnpj: validatedData.cnpj,
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      logger.info(`Supplier profile created for user ${userId}`);
      
      res.status(201).json({
        message: 'Perfil de fornecedor criado com sucesso',
        supplier: {
          id: supplierProfile.id,
          companyName: supplierProfile.companyName,
          status: supplierProfile.status,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Validation error
        logger.debug('Supplier registration validation error:', error.errors);
        res.status(400).json({ message: 'Dados inválidos', errors: error.errors });
        return;
      }

      logger.error('Error registering supplier:', error);
      res.status(500).json({ message: 'Erro ao cadastrar fornecedor' });
    }
  }

  /**
   * Get supplier profile
   * @route GET /api/suppliers/me
   */
  static async getSupplierProfile(req: Request, res: Response): Promise<void> {
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
        logger.debug(`Supplier profile not found for user ${userId}`);
        res.status(404).json({ message: 'Perfil de fornecedor não encontrado' });
        return;
      }

      logger.debug(`Supplier profile retrieved for user ${userId}`);
      res.json(supplierProfile);
    } catch (error) {
      logger.error('Error getting supplier profile:', error);
      res.status(500).json({ message: 'Erro ao obter perfil de fornecedor' });
    }
  }

  /**
   * Update supplier profile
   * @route PUT /api/suppliers/me
   */
  static async updateSupplierProfile(req: Request, res: Response): Promise<void> {
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
        logger.debug(`Supplier profile not found for user ${userId}`);
        res.status(404).json({ message: 'Perfil de fornecedor não encontrado' });
        return;
      }

      // Validate request body (partial validation)
      const validatedData = supplierRegistrationSchema
        .partial() // Make all fields optional
        .parse(req.body);

      // Check if CNPJ is being updated and is already registered
      if (validatedData.cnpj && validatedData.cnpj !== supplierProfile.cnpj) {
        const existingCNPJ = await prisma.supplierProfile.findFirst({
          where: { 
            cnpj: validatedData.cnpj,
            id: { not: supplierProfile.id } // Exclude current profile
          },
        });

        if (existingCNPJ) {
          logger.debug(`CNPJ ${validatedData.cnpj} already registered`);
          res.status(400).json({ message: 'CNPJ já cadastrado' });
          return;
        }
      }

      // Update supplier profile
      const updatedSupplierProfile = await prisma.supplierProfile.update({
        where: { id: supplierProfile.id },
        data: {
          companyName: validatedData.companyName,
          cnpj: validatedData.cnpj ? validatedData.cnpj.replace(/[^\d]/g, '') : undefined,
          description: validatedData.description,
          website: validatedData.website,
        },
      });

      // Audit supplier profile update
      AuditService.log({
        eventType: AuditEventType.USER_UPDATE,
        userId,
        targetId: supplierProfile.id,
        targetType: 'SupplierProfile',
        metadata: {
          companyName: validatedData.companyName,
          cnpj: validatedData.cnpj,
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      logger.info(`Supplier profile updated for user ${userId}`);
      
      res.json({
        message: 'Perfil de fornecedor atualizado com sucesso',
        supplier: updatedSupplierProfile,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Validation error
        logger.debug('Supplier profile update validation error:', error.errors);
        res.status(400).json({ message: 'Dados inválidos', errors: error.errors });
        return;
      }

      logger.error('Error updating supplier profile:', error);
      res.status(500).json({ message: 'Erro ao atualizar perfil de fornecedor' });
    }
  }

  /**
   * Get all suppliers (admin only)
   * @route GET /api/suppliers
   */
  static async getAllSuppliers(req: Request, res: Response): Promise<void> {
    try {
      // Extract query parameters
      const status = req.query.status as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};
      if (status) {
        where.status = status;
      }
      if (search) {
        where.OR = [
          { companyName: { contains: search, mode: 'insensitive' } },
          { cnpj: { contains: search } },
        ];
      }

      // Get suppliers
      const suppliers = await prisma.supplierProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              status: true,
              profile: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      });

      // Get total count
      const totalCount = await prisma.supplierProfile.count({ where });

      logger.debug(`Retrieved ${suppliers.length} suppliers`);
      res.json({
        suppliers,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      });
    } catch (error) {
      logger.error('Error getting suppliers:', error);
      res.status(500).json({ message: 'Erro ao obter fornecedores' });
    }
  }

  /**
   * Get supplier by ID (admin only)
   * @route GET /api/suppliers/:id
   */
  static async getSupplierById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Get supplier
      const supplier = await prisma.supplierProfile.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              status: true,
              profile: true,
            },
          },
          services: true,
        },
      });

      if (!supplier) {
        logger.debug(`Supplier ${id} not found`);
        res.status(404).json({ message: 'Fornecedor não encontrado' });
        return;
      }

      logger.debug(`Retrieved supplier ${id}`);
      res.json(supplier);
    } catch (error) {
      logger.error('Error getting supplier:', error);
      res.status(500).json({ message: 'Erro ao obter fornecedor' });
    }
  }
}