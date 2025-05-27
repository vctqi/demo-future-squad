import { Router } from 'express';
import { ServiceController } from '../controllers/service.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin, requireSupplier, checkAbility } from '../middleware/access-control.middleware';
import { Action } from '../services/access-control/ability';
import { AuditService, AuditEventType } from '../services/audit.service';

const router = Router();

/**
 * @route POST /api/services
 * @desc Create a new service
 * @access Private - Supplier only
 */
router.post(
  '/',
  authenticate,
  requireSupplier,
  AuditService.createMiddleware(AuditEventType.SERVICE_CREATE, req => ({
    targetType: 'Service',
    metadata: { title: req.body.title }
  })),
  ServiceController.createService
);

/**
 * @route GET /api/services/my
 * @desc Get supplier's services
 * @access Private - Supplier only
 */
router.get(
  '/my',
  authenticate,
  requireSupplier,
  ServiceController.getMyServices
);

/**
 * @route GET /api/services/categories
 * @desc Get all categories
 * @access Public
 */
router.get(
  '/categories',
  ServiceController.getAllCategories
);

/**
 * @route GET /api/services/:id
 * @desc Get service by ID
 * @access Public
 */
router.get(
  '/:id',
  ServiceController.getServiceById
);

/**
 * @route PUT /api/services/:id
 * @desc Update service
 * @access Private - Service owner only
 */
router.put(
  '/:id',
  authenticate,
  checkAbility(Action.Update, 'Service', req => ({ id: req.params.id })),
  AuditService.createMiddleware(AuditEventType.SERVICE_UPDATE, req => ({
    targetId: req.params.id,
    targetType: 'Service',
    metadata: { title: req.body.title }
  })),
  ServiceController.updateService
);

/**
 * @route DELETE /api/services/:id
 * @desc Delete service
 * @access Private - Service owner only
 */
router.delete(
  '/:id',
  authenticate,
  checkAbility(Action.Delete, 'Service', req => ({ id: req.params.id })),
  AuditService.createMiddleware(AuditEventType.SERVICE_DELETE, req => ({
    targetId: req.params.id,
    targetType: 'Service'
  })),
  ServiceController.deleteService
);

/**
 * @route GET /api/services
 * @desc Get all services with filtering
 * @access Public
 */
router.get(
  '/',
  ServiceController.getAllServices
);

/**
 * @route PATCH /api/services/:id/status
 * @desc Update service status (activate/deactivate)
 * @access Private - Service owner only
 */
router.patch(
  '/:id/status',
  authenticate,
  checkAbility(Action.Update, 'Service', req => ({ id: req.params.id })),
  AuditService.createMiddleware(AuditEventType.SERVICE_UPDATE, req => ({
    targetId: req.params.id,
    targetType: 'Service',
    metadata: { status: req.body.status }
  })),
  ServiceController.updateServiceStatus
);

export default router;