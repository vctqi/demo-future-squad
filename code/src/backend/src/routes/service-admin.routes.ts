import { Router } from 'express';
import { ServiceAdminController } from '../controllers/service-admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/access-control.middleware';
import { AuditService, AuditEventType } from '../services/audit.service';

const router = Router();

/**
 * @route GET /api/admin/services
 * @desc Get all services with filtering (admin view)
 * @access Private - Admin only
 */
router.get(
  '/services',
  authenticate,
  requireAdmin,
  ServiceAdminController.getAllServices
);

/**
 * @route GET /api/admin/services/:id
 * @desc Get service by ID (admin view)
 * @access Private - Admin only
 */
router.get(
  '/services/:id',
  authenticate,
  requireAdmin,
  ServiceAdminController.getServiceById
);

/**
 * @route PUT /api/admin/services/:id/approve
 * @desc Approve service
 * @access Private - Admin only
 */
router.put(
  '/services/:id/approve',
  authenticate,
  requireAdmin,
  AuditService.createMiddleware(AuditEventType.SERVICE_APPROVE, req => ({
    targetId: req.params.id,
    targetType: 'Service'
  })),
  ServiceAdminController.approveService
);

/**
 * @route PUT /api/admin/services/:id/reject
 * @desc Reject service
 * @access Private - Admin only
 */
router.put(
  '/services/:id/reject',
  authenticate,
  requireAdmin,
  AuditService.createMiddleware(AuditEventType.SERVICE_REJECT, req => ({
    targetId: req.params.id,
    targetType: 'Service',
    metadata: { reason: req.body.reason }
  })),
  ServiceAdminController.rejectService
);

export default router;