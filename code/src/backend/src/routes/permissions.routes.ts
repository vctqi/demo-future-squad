import { Router } from 'express';
import { PermissionsController } from '../controllers/permissions.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/access-control.middleware';
import { AuditService, AuditEventType } from '../services/audit.service';

const router = Router();

/**
 * @route GET /api/permissions/me
 * @desc Get current user permissions
 * @access Private
 */
router.get(
  '/me',
  authenticate,
  PermissionsController.getUserPermissions
);

/**
 * @route PUT /api/permissions/users/:userId/role
 * @desc Update user role (admin only)
 * @access Admin
 */
router.put(
  '/users/:userId/role',
  authenticate,
  requireAdmin,
  AuditService.createMiddleware(AuditEventType.USER_STATUS_CHANGE, req => ({
    targetId: req.params.userId,
    targetType: 'User',
    metadata: { newRole: req.body.role }
  })),
  PermissionsController.updateUserRole
);

/**
 * @route PUT /api/permissions/suppliers/:supplierId/approve
 * @desc Approve supplier (admin only)
 * @access Admin
 */
router.put(
  '/suppliers/:supplierId/approve',
  authenticate,
  requireAdmin,
  AuditService.createMiddleware(AuditEventType.SUPPLIER_APPROVE, req => ({
    targetId: req.params.supplierId,
    targetType: 'SupplierProfile'
  })),
  PermissionsController.approveSupplier
);

/**
 * @route PUT /api/permissions/suppliers/:supplierId/reject
 * @desc Reject supplier (admin only)
 * @access Admin
 */
router.put(
  '/suppliers/:supplierId/reject',
  authenticate,
  requireAdmin,
  AuditService.createMiddleware(AuditEventType.SUPPLIER_REJECT, req => ({
    targetId: req.params.supplierId,
    targetType: 'SupplierProfile',
    metadata: { reason: req.body.reason }
  })),
  PermissionsController.rejectSupplier
);

export default router;