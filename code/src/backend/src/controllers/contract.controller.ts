import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { logger } from '../config/logger';
import { AuditService, AuditEventType } from '../services/audit.service';
import { ContractDocumentService } from '../services/contract-document.service';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Validation schema for contract creation
const contractCreationSchema = z.object({
  serviceId: z.string().uuid('ID de serviço inválido'),
  totalPrice: z.number().positive('O preço deve ser positivo'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  customizations: z.array(z.string()).optional(),
  additionalInfo: z.string().optional(),
  planId: z.string().optional(),
});

// Validation schema for contract status update
const contractStatusUpdateSchema = z.object({
  status: z.enum(['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED'], {
    errorMap: () => ({ message: 'Status inválido. Deve ser PENDING, ACTIVE, COMPLETED ou CANCELLED' }),
  }),
});

/**
 * Contract Controller
 */
export class ContractController {
  /**
   * Create a new contract
   * @route POST /api/contracts
   */
  static async createContract(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      
      // Get client profile
      const clientProfile = await prisma.clientProfile.findUnique({
        where: { userId },
      });
      
      if (!clientProfile) {
        logger.warn(`User ${userId} tried to create a contract but has no client profile`);
        res.status(403).json({ message: 'Perfil de cliente não encontrado' });
        return;
      }
      
      // Validate request body
      const result = contractCreationSchema.safeParse(req.body);
      if (!result.success) {
        logger.warn(`Invalid contract data: ${JSON.stringify(result.error.errors)}`);
        res.status(400).json({ message: 'Dados inválidos', errors: result.error.errors });
        return;
      }
      
      const { serviceId, totalPrice, startDate, endDate, customizations, additionalInfo, planId } = result.data;
      
      // Verify that service exists and is active
      const service = await prisma.service.findFirst({
        where: {
          id: serviceId,
          status: 'ACTIVE',
        },
        include: {
          supplier: true,
        },
      });
      
      if (!service) {
        logger.warn(`Service not found or not active: ${serviceId}`);
        res.status(404).json({ message: 'Serviço não encontrado ou não está ativo' });
        return;
      }
      
      // Create the contract
      const contract = await prisma.contract.create({
        data: {
          clientId: clientProfile.id,
          serviceId,
          totalPrice,
          startDate,
          endDate,
          metadata: {
            customizations,
            additionalInfo,
            planId,
          },
        },
      });
      
      // Log the action
      await AuditService.logEvent({
        userId,
        eventType: AuditEventType.CONTRACT_CREATE,
        resourceId: contract.id,
        details: {
          serviceId,
          serviceName: service.title,
          supplierId: service.supplier.id,
          supplierName: service.supplier.companyName,
          totalPrice,
          startDate,
          endDate,
        },
      });
      
      logger.info(`Contract ${contract.id} created by user ${userId} for service ${serviceId}`);
      res.status(201).json(contract);
    } catch (error) {
      logger.error('Error creating contract:', error);
      res.status(500).json({ message: 'Erro ao criar contrato' });
    }
  }
  
  /**
   * Get all contracts for the current client
   * @route GET /api/contracts/my
   */
  static async getMyContracts(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      
      // Get client profile
      const clientProfile = await prisma.clientProfile.findUnique({
        where: { userId },
      });
      
      if (!clientProfile) {
        logger.warn(`User ${userId} tried to get contracts but has no client profile`);
        res.status(403).json({ message: 'Perfil de cliente não encontrado' });
        return;
      }
      
      // Get contracts
      const contracts = await prisma.contract.findMany({
        where: {
          clientId: clientProfile.id,
        },
        include: {
          service: {
            include: {
              supplier: true,
              category: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      res.json(contracts);
    } catch (error) {
      logger.error('Error getting contracts:', error);
      res.status(500).json({ message: 'Erro ao obter contratos' });
    }
  }
  
  /**
   * Get contract by ID
   * @route GET /api/contracts/:id
   */
  static async getContractById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      
      // Get contract
      const contract = await prisma.contract.findUnique({
        where: { id },
        include: {
          service: {
            include: {
              supplier: true,
              category: true,
            },
          },
          client: {
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
      
      if (!contract) {
        logger.warn(`Contract not found: ${id}`);
        res.status(404).json({ message: 'Contrato não encontrado' });
        return;
      }
      
      // Check if user is the client or supplier
      const isClient = contract.client.userId === userId;
      const isSupplier = contract.service.supplier.userId === userId;
      
      if (!isClient && !isSupplier && !(req as any).user.isAdmin) {
        logger.warn(`User ${userId} tried to access contract ${id} without permission`);
        res.status(403).json({ message: 'Acesso não autorizado a este contrato' });
        return;
      }
      
      res.json(contract);
    } catch (error) {
      logger.error('Error getting contract:', error);
      res.status(500).json({ message: 'Erro ao obter contrato' });
    }
  }
  
  /**
   * Update contract status
   * @route PATCH /api/contracts/:id/status
   */
  static async updateContractStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      
      // Validate request body
      const result = contractStatusUpdateSchema.safeParse(req.body);
      if (!result.success) {
        logger.warn(`Invalid contract status update data: ${JSON.stringify(result.error.errors)}`);
        res.status(400).json({ message: 'Dados inválidos', errors: result.error.errors });
        return;
      }
      
      const { status } = result.data;
      
      // Get contract
      const contract = await prisma.contract.findUnique({
        where: { id },
        include: {
          service: {
            include: {
              supplier: true,
            },
          },
          client: true,
        },
      });
      
      if (!contract) {
        logger.warn(`Contract not found: ${id}`);
        res.status(404).json({ message: 'Contrato não encontrado' });
        return;
      }
      
      // Check if user is authorized to update status
      const isClient = contract.client.userId === userId;
      const isSupplier = contract.service.supplier.userId === userId;
      const isAdmin = (req as any).user.isAdmin;
      
      // Clients can only cancel pending contracts
      if (isClient && !isAdmin) {
        if (status !== 'CANCELLED' || contract.status !== 'PENDING') {
          logger.warn(`Client ${userId} tried to update contract ${id} to ${status}`);
          res.status(403).json({ message: 'Clientes só podem cancelar contratos pendentes' });
          return;
        }
      }
      
      // Suppliers can set to ACTIVE or COMPLETED
      if (isSupplier && !isAdmin) {
        if (
          (status === 'ACTIVE' && contract.status !== 'PENDING') ||
          (status === 'COMPLETED' && contract.status !== 'ACTIVE') ||
          (status === 'PENDING' || status === 'CANCELLED')
        ) {
          logger.warn(`Supplier ${userId} tried to update contract ${id} to ${status}`);
          res.status(403).json({ message: 'Alteração de status não permitida' });
          return;
        }
      }
      
      // Update contract status
      const updatedContract = await prisma.contract.update({
        where: { id },
        data: { status },
        include: {
          service: {
            include: {
              supplier: true,
            },
          },
        },
      });
      
      // Log the action
      await AuditService.logEvent({
        userId,
        eventType: AuditEventType.CONTRACT_UPDATE,
        resourceId: id,
        details: {
          contractId: id,
          previousStatus: contract.status,
          newStatus: status,
          serviceId: contract.serviceId,
          serviceName: contract.service.title,
        },
      });
      
      logger.info(`Contract ${id} status updated to ${status} by user ${userId}`);
      res.json(updatedContract);
    } catch (error) {
      logger.error('Error updating contract status:', error);
      res.status(500).json({ message: 'Erro ao atualizar status do contrato' });
    }
  }
  
  /**
   * Cancel contract
   * @route POST /api/contracts/:id/cancel
   */
  static async cancelContract(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      const { reason } = req.body;
      
      if (!reason) {
        res.status(400).json({ message: 'Motivo do cancelamento é obrigatório' });
        return;
      }
      
      // Get contract
      const contract = await prisma.contract.findUnique({
        where: { id },
        include: {
          service: {
            include: {
              supplier: true,
            },
          },
          client: true,
        },
      });
      
      if (!contract) {
        logger.warn(`Contract not found: ${id}`);
        res.status(404).json({ message: 'Contrato não encontrado' });
        return;
      }
      
      // Check if user is authorized to cancel
      const isClient = contract.client.userId === userId;
      const isSupplier = contract.service.supplier.userId === userId;
      const isAdmin = (req as any).user.isAdmin;
      
      if (!isClient && !isSupplier && !isAdmin) {
        logger.warn(`User ${userId} tried to cancel contract ${id} without permission`);
        res.status(403).json({ message: 'Acesso não autorizado a este contrato' });
        return;
      }
      
      // Check if contract can be cancelled
      if (contract.status === 'COMPLETED' || contract.status === 'CANCELLED') {
        logger.warn(`Contract ${id} cannot be cancelled because it is already ${contract.status}`);
        res.status(400).json({ message: `Contrato não pode ser cancelado pois já está ${contract.status === 'COMPLETED' ? 'concluído' : 'cancelado'}` });
        return;
      }
      
      // Update contract status
      const updatedContract = await prisma.contract.update({
        where: { id },
        data: { 
          status: 'CANCELLED',
          metadata: {
            ...contract.metadata,
            cancellationReason: reason,
            cancelledBy: userId,
            cancelledAt: new Date(),
          }
        },
        include: {
          service: {
            include: {
              supplier: true,
            },
          },
        },
      });
      
      // Log the action
      await AuditService.logEvent({
        userId,
        eventType: AuditEventType.CONTRACT_CANCEL,
        resourceId: id,
        details: {
          contractId: id,
          previousStatus: contract.status,
          serviceId: contract.serviceId,
          serviceName: contract.service.title,
          reason,
        },
      });
      
      logger.info(`Contract ${id} cancelled by user ${userId}`);
      res.json(updatedContract);
    } catch (error) {
      logger.error('Error cancelling contract:', error);
      res.status(500).json({ message: 'Erro ao cancelar contrato' });
    }
  }
  
  /**
   * Get contract terms template
   * @route GET /api/contracts/terms/:serviceId
   */
  static async getContractTerms(req: Request, res: Response): Promise<void> {
    try {
      const { serviceId } = req.params;
      
      // Get service
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
        include: {
          supplier: true,
        },
      });
      
      if (!service) {
        logger.warn(`Service not found: ${serviceId}`);
        res.status(404).json({ message: 'Serviço não encontrado' });
        return;
      }
      
      // Generate contract terms template
      const termsTemplate = {
        serviceTitle: service.title,
        serviceDescription: service.description,
        supplierName: service.supplier.companyName,
        supplierCnpj: service.supplier.cnpj,
        baseTerms: service.terms || 'Termos e condições padrão do serviço.',
        servicePrice: service.price,
        priceType: service.priceType,
      };
      
      res.json(termsTemplate);
    } catch (error) {
      logger.error('Error getting contract terms:', error);
      res.status(500).json({ message: 'Erro ao obter termos do contrato' });
    }
  }
  
  /**
   * Process payment (mock)
   * @route POST /api/contracts/:id/payment
   */
  static async processPayment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      const { paymentMethod } = req.body;
      
      if (!paymentMethod) {
        res.status(400).json({ message: 'Método de pagamento é obrigatório' });
        return;
      }
      
      // Get contract
      const contract = await prisma.contract.findUnique({
        where: { id },
        include: {
          client: true,
        },
      });
      
      if (!contract) {
        logger.warn(`Contract not found: ${id}`);
        res.status(404).json({ message: 'Contrato não encontrado' });
        return;
      }
      
      // Check if user is the client
      if (contract.client.userId !== userId) {
        logger.warn(`User ${userId} tried to process payment for contract ${id} without permission`);
        res.status(403).json({ message: 'Acesso não autorizado a este contrato' });
        return;
      }
      
      // Mock payment processing
      // In a real app, this would integrate with a payment gateway
      
      // Update contract with payment information
      const updatedContract = await prisma.contract.update({
        where: { id },
        data: {
          status: 'ACTIVE', // Activate contract after payment
          metadata: {
            ...contract.metadata,
            paymentMethod,
            paymentStatus: 'PAID',
            paymentDate: new Date(),
            paymentReference: `PAY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          }
        },
      });
      
      // Log the action
      await AuditService.logEvent({
        userId,
        eventType: AuditEventType.PAYMENT_PROCESS,
        resourceId: id,
        details: {
          contractId: id,
          paymentMethod,
          amount: contract.totalPrice,
        },
      });
      
      logger.info(`Payment processed for contract ${id} by user ${userId}`);
      
      // Simulate payment processing delay
      setTimeout(() => {
        res.json({
          success: true,
          paymentReference: updatedContract.metadata.paymentReference,
          paymentDate: updatedContract.metadata.paymentDate,
          message: 'Pagamento processado com sucesso',
        });
      }, 1500);
    } catch (error) {
      logger.error('Error processing payment:', error);
      res.status(500).json({ message: 'Erro ao processar pagamento' });
    }
  }

  /**
   * Generate contract document
   * @route GET /api/contracts/:id/document
   */
  static async generateContractDocument(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      
      // Get contract with all relations
      const contract = await prisma.contract.findUnique({
        where: { id },
        include: {
          service: {
            include: {
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
              category: true,
            },
          },
          client: {
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
      
      if (!contract) {
        logger.warn(`Contract not found: ${id}`);
        res.status(404).json({ message: 'Contrato não encontrado' });
        return;
      }
      
      // Check if user is the client, supplier, or admin
      const isClient = contract.client.userId === userId;
      const isSupplier = contract.service.supplier.userId === userId;
      const isAdmin = (req as any).user.isAdmin;
      
      if (!isClient && !isSupplier && !isAdmin) {
        logger.warn(`User ${userId} tried to access contract document ${id} without permission`);
        res.status(403).json({ message: 'Acesso não autorizado a este documento' });
        return;
      }
      
      // Generate contract document
      const html = ContractDocumentService.generateContractHtml(contract);
      
      // Save contract document to disk
      const filePath = ContractDocumentService.saveContractDocument(id, html);
      
      // Update contract with document information
      await prisma.contract.update({
        where: { id },
        data: {
          metadata: {
            ...contract.metadata,
            documentGenerated: true,
            documentGeneratedAt: new Date(),
            documentPath: filePath,
          }
        },
      });
      
      // Log the action
      await AuditService.logEvent({
        userId,
        eventType: AuditEventType.CONTRACT_DOCUMENT_GENERATED,
        resourceId: id,
        details: {
          contractId: id,
          filePath,
        },
      });
      
      logger.info(`Contract document generated for contract ${id} by user ${userId}`);
      
      // Return HTML content
      res.header('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      logger.error('Error generating contract document:', error);
      res.status(500).json({ message: 'Erro ao gerar documento do contrato' });
    }
  }

  /**
   * Download contract document as HTML
   * @route GET /api/contracts/:id/document/download
   */
  static async downloadContractDocument(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      
      // Get contract
      const contract = await prisma.contract.findUnique({
        where: { id },
        include: {
          service: {
            include: {
              supplier: true,
            },
          },
          client: true,
        },
      });
      
      if (!contract) {
        logger.warn(`Contract not found: ${id}`);
        res.status(404).json({ message: 'Contrato não encontrado' });
        return;
      }
      
      // Check if user is the client, supplier, or admin
      const isClient = contract.client.userId === userId;
      const isSupplier = contract.service.supplier.userId === userId;
      const isAdmin = (req as any).user.isAdmin;
      
      if (!isClient && !isSupplier && !isAdmin) {
        logger.warn(`User ${userId} tried to download contract document ${id} without permission`);
        res.status(403).json({ message: 'Acesso não autorizado a este documento' });
        return;
      }
      
      // Check if document exists
      const contractsDir = path.join(__dirname, '../../contracts');
      const filePath = path.join(contractsDir, `${id}.html`);
      
      if (fs.existsSync(filePath)) {
        // Read existing file
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        // Set headers for download
        res.header('Content-Type', 'text/html');
        res.header('Content-Disposition', `attachment; filename="contrato-${id}.html"`);
        
        // Send file
        res.send(fileContent);
      } else {
        // Generate document first
        const contractWithRelations = await prisma.contract.findUnique({
          where: { id },
          include: {
            service: {
              include: {
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
                category: true,
              },
            },
            client: {
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
        
        if (!contractWithRelations) {
          throw new Error('Contract not found with all relations');
        }
        
        // Generate and save document
        const html = ContractDocumentService.generateContractHtml(contractWithRelations);
        ContractDocumentService.saveContractDocument(id, html);
        
        // Update contract with document information
        await prisma.contract.update({
          where: { id },
          data: {
            metadata: {
              ...contract.metadata,
              documentGenerated: true,
              documentGeneratedAt: new Date(),
              documentPath: filePath,
            }
          },
        });
        
        // Set headers for download
        res.header('Content-Type', 'text/html');
        res.header('Content-Disposition', `attachment; filename="contrato-${id}.html"`);
        
        // Send content
        res.send(html);
      }
      
      // Log the action
      await AuditService.logEvent({
        userId,
        eventType: AuditEventType.CONTRACT_DOCUMENT_DOWNLOADED,
        resourceId: id,
        details: {
          contractId: id,
        },
      });
      
      logger.info(`Contract document downloaded for contract ${id} by user ${userId}`);
    } catch (error) {
      logger.error('Error downloading contract document:', error);
      res.status(500).json({ message: 'Erro ao baixar documento do contrato' });
    }
  }

  /**
   * Sign contract
   * @route POST /api/contracts/:id/sign
   */
  static async signContract(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      
      // Get contract
      const contract = await prisma.contract.findUnique({
        where: { id },
        include: {
          service: {
            include: {
              supplier: true,
            },
          },
          client: true,
        },
      });
      
      if (!contract) {
        logger.warn(`Contract not found: ${id}`);
        res.status(404).json({ message: 'Contrato não encontrado' });
        return;
      }
      
      // Check if user is the client or supplier
      const isClient = contract.client.userId === userId;
      const isSupplier = contract.service.supplier.userId === userId;
      
      if (!isClient && !isSupplier) {
        logger.warn(`User ${userId} tried to sign contract ${id} without permission`);
        res.status(403).json({ message: 'Acesso não autorizado a este contrato' });
        return;
      }
      
      // Get current signatures
      const currentSignatures = contract.metadata?.signatures || {};
      
      // Add new signature
      const newSignature = {
        userId,
        timestamp: new Date(),
        userType: isClient ? 'CLIENT' : 'SUPPLIER',
        userName: isClient 
          ? contract.client.user?.profile?.name || contract.client.user?.email
          : contract.service.supplier.user?.profile?.name || contract.service.supplier.user?.email,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };
      
      // Update contract with signature information
      await prisma.contract.update({
        where: { id },
        data: {
          metadata: {
            ...contract.metadata,
            signatures: {
              ...currentSignatures,
              [isClient ? 'client' : 'supplier']: newSignature,
            }
          }
        },
      });
      
      // Log the action
      await AuditService.logEvent({
        userId,
        eventType: AuditEventType.CONTRACT_SIGNED,
        resourceId: id,
        details: {
          contractId: id,
          signatureType: isClient ? 'CLIENT' : 'SUPPLIER',
        },
      });
      
      logger.info(`Contract ${id} signed by user ${userId} as ${isClient ? 'CLIENT' : 'SUPPLIER'}`);
      
      res.json({
        success: true,
        message: 'Contrato assinado com sucesso',
        signature: newSignature,
      });
    } catch (error) {
      logger.error('Error signing contract:', error);
      res.status(500).json({ message: 'Erro ao assinar contrato' });
    }
  }

  /**
   * Get contract version history
   * @route GET /api/contracts/:id/history
   */
  static async getContractHistory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      
      // Get contract
      const contract = await prisma.contract.findUnique({
        where: { id },
        include: {
          service: {
            include: {
              supplier: true,
            },
          },
          client: true,
        },
      });
      
      if (!contract) {
        logger.warn(`Contract not found: ${id}`);
        res.status(404).json({ message: 'Contrato não encontrado' });
        return;
      }
      
      // Check if user is the client, supplier, or admin
      const isClient = contract.client.userId === userId;
      const isSupplier = contract.service.supplier.userId === userId;
      const isAdmin = (req as any).user.isAdmin;
      
      if (!isClient && !isSupplier && !isAdmin) {
        logger.warn(`User ${userId} tried to access contract history ${id} without permission`);
        res.status(403).json({ message: 'Acesso não autorizado a este contrato' });
        return;
      }
      
      // Get contract history from audit logs
      const auditLogs = await prisma.auditLog.findMany({
        where: {
          resourceId: id,
          eventType: {
            in: [
              AuditEventType.CONTRACT_CREATE,
              AuditEventType.CONTRACT_UPDATE,
              AuditEventType.CONTRACT_CANCEL,
              AuditEventType.CONTRACT_SIGNED,
              AuditEventType.CONTRACT_DOCUMENT_GENERATED,
              AuditEventType.PAYMENT_PROCESS,
            ],
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
      });
      
      // Map audit logs to contract history events
      const history = auditLogs.map(log => ({
        id: log.id,
        eventType: log.eventType,
        timestamp: log.timestamp,
        user: {
          id: log.userId,
          type: log.userId === contract.client.userId 
            ? 'CLIENT' 
            : log.userId === contract.service.supplier.userId 
              ? 'SUPPLIER' 
              : 'ADMIN',
        },
        details: log.details,
      }));
      
      res.json(history);
    } catch (error) {
      logger.error('Error getting contract history:', error);
      res.status(500).json({ message: 'Erro ao obter histórico do contrato' });
    }
  }
}