import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Action, Subjects, defineAbilitiesFor } from '../services/access-control/ability';
import { logger } from '../config/logger';
import { AuditService, AuditEventType } from '../services/audit.service';

const prisma = new PrismaClient();

/**
 * Permissions Controller for managing user roles and permissions
 */
export class PermissionsController {
  /**
   * Get user permissions
   * @route GET /api/permissions/me
   */
  static async getUserPermissions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: 'Não autorizado' });
        return;
      }

      // Get user with profiles
      const user = await prisma.user.findUnique({
        where: { id: userId },
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
        logger.debug(`User not found: ${userId}`);
        res.status(404).json({ message: 'Usuário não encontrado' });
        return;
      }

      // Generate ability rules
      const ability = defineAbilitiesFor(user);
      
      // Extract rules in a format suitable for the frontend
      const rules = ability.rules.map(rule => ({
        action: rule.actions,
        subject: rule.subject,
        conditions: rule.conditions,
        inverted: rule.inverted,
      }));

      // Create a simpler permission map for common operations
      const permissions = {
        canManageUsers: ability.can(Action.Manage, 'User'),
        canApproveSuppliers: ability.can(Action.Approve, 'SupplierProfile'),
        canCreateServices: ability.can(Action.Create, 'Service'),
        canApproveServices: ability.can(Action.Approve, 'Service'),
        canManageCategories: ability.can(Action.Manage, 'Category'),
        canCreateContracts: ability.can(Action.Create, 'Contract'),
        canViewReports: ability.can(Action.Read, 'Report'),
        canViewDashboard: ability.can(Action.Read, 'Dashboard'),
        isAdmin: user.role === 'ADMIN',
        isSupplier: user.role === 'SUPPLIER',
        isClient: user.role === 'USER',
      };

      logger.debug(`Permissions retrieved for user ${userId}`);
      res.json({
        role: user.role,
        permissions,
        rules,
      });
    } catch (error) {
      logger.error('Error getting user permissions:', error);
      res.status(500).json({ message: 'Erro ao obter permissões' });
    }
  }

  /**
   * Update user role (admin only)
   * @route PUT /api/permissions/users/:userId/role
   */
  static async updateUserRole(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      const adminId = req.user?.id;

      if (!adminId) {
        res.status(401).json({ message: 'Não autorizado' });
        return;
      }

      // Validate role
      const validRoles = ['USER', 'SUPPLIER', 'ADMIN'];
      if (!validRoles.includes(role)) {
        res.status(400).json({ message: 'Papel inválido' });
        return;
      }

      // Get user to update
      const userToUpdate = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!userToUpdate) {
        logger.debug(`User not found for role update: ${userId}`);
        res.status(404).json({ message: 'Usuário não encontrado' });
        return;
      }

      // Update user role
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role },
      });

      // Audit role change
      AuditService.log({
        eventType: AuditEventType.USER_UPDATE,
        userId: adminId,
        targetId: userId,
        targetType: 'User',
        metadata: {
          oldRole: userToUpdate.role,
          newRole: role,
          action: 'role_change',
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      logger.info(`User ${userId} role updated to ${role} by admin ${adminId}`);
      
      res.json({
        message: 'Papel do usuário atualizado com sucesso',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          role: updatedUser.role,
        },
      });
    } catch (error) {
      logger.error('Error updating user role:', error);
      res.status(500).json({ message: 'Erro ao atualizar papel do usuário' });
    }
  }

  /**
   * Approve supplier (admin only)
   * @route PUT /api/permissions/suppliers/:supplierId/approve
   */
  static async approveSupplier(req: Request, res: Response): Promise<void> {
    try {
      const { supplierId } = req.params;
      const adminId = req.user?.id;

      if (!adminId) {
        res.status(401).json({ message: 'Não autorizado' });
        return;
      }

      // Get supplier profile
      const supplierProfile = await prisma.supplierProfile.findUnique({
        where: { id: supplierId },
        include: { user: true },
      });

      if (!supplierProfile) {
        logger.debug(`Supplier profile not found: ${supplierId}`);
        res.status(404).json({ message: 'Perfil de fornecedor não encontrado' });
        return;
      }

      // Update supplier status
      const updatedSupplier = await prisma.supplierProfile.update({
        where: { id: supplierId },
        data: { status: 'ACTIVE' },
      });

      // Ensure user has supplier role
      await prisma.user.update({
        where: { id: supplierProfile.userId },
        data: { role: 'SUPPLIER' },
      });

      // Audit supplier approval
      AuditService.log({
        eventType: AuditEventType.SUPPLIER_APPROVE,
        userId: adminId,
        targetId: supplierId,
        targetType: 'SupplierProfile',
        metadata: {
          supplierName: supplierProfile.companyName,
          supplierEmail: supplierProfile.user.email,
          oldStatus: supplierProfile.status,
          newStatus: 'ACTIVE',
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      logger.info(`Supplier ${supplierId} approved by admin ${adminId}`);
      
      res.json({
        message: 'Fornecedor aprovado com sucesso',
        supplier: updatedSupplier,
      });
    } catch (error) {
      logger.error('Error approving supplier:', error);
      res.status(500).json({ message: 'Erro ao aprovar fornecedor' });
    }
  }

  /**
   * Reject supplier (admin only)
   * @route PUT /api/permissions/suppliers/:supplierId/reject
   */
  static async rejectSupplier(req: Request, res: Response): Promise<void> {
    try {
      const { supplierId } = req.params;
      const { reason } = req.body;
      const adminId = req.user?.id;

      if (!adminId) {
        res.status(401).json({ message: 'Não autorizado' });
        return;
      }

      // Get supplier profile
      const supplierProfile = await prisma.supplierProfile.findUnique({
        where: { id: supplierId },
        include: { user: true },
      });

      if (!supplierProfile) {
        logger.debug(`Supplier profile not found: ${supplierId}`);
        res.status(404).json({ message: 'Perfil de fornecedor não encontrado' });
        return;
      }

      // Update supplier status
      const updatedSupplier = await prisma.supplierProfile.update({
        where: { id: supplierId },
        data: { status: 'REJECTED' },
      });

      // Audit supplier rejection
      AuditService.log({
        eventType: AuditEventType.SUPPLIER_REJECT,
        userId: adminId,
        targetId: supplierId,
        targetType: 'SupplierProfile',
        metadata: {
          supplierName: supplierProfile.companyName,
          supplierEmail: supplierProfile.user.email,
          oldStatus: supplierProfile.status,
          newStatus: 'REJECTED',
          reason,
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      logger.info(`Supplier ${supplierId} rejected by admin ${adminId}`);
      
      res.json({
        message: 'Fornecedor rejeitado',
        supplier: updatedSupplier,
      });
    } catch (error) {
      logger.error('Error rejecting supplier:', error);
      res.status(500).json({ message: 'Erro ao rejeitar fornecedor' });
    }
  }
}