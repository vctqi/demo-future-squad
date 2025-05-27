import { Router } from 'express';
import { SupplierController } from '../controllers/supplier.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/access-control.middleware';
import { Action } from '../services/access-control/ability';
import { checkAbility } from '../middleware/access-control.middleware';
import { AuditService, AuditEventType } from '../services/audit.service';

const router = Router();

/**
 * @route POST /api/suppliers
 * @desc Register a new supplier
 * @access Private
 */
router.post(
  '/',
  authenticate,
  AuditService.createMiddleware(AuditEventType.USER_CREATE, req => ({
    targetType: 'SupplierProfile',
    metadata: { companyName: req.body.companyName }
  })),
  SupplierController.registerSupplier
);

/**
 * @route GET /api/suppliers/me
 * @desc Get supplier profile
 * @access Private - Supplier only
 */
router.get(
  '/me',
  authenticate,
  checkAbility(Action.Read, 'SupplierProfile', req => ({ userId: req.user.id })),
  SupplierController.getSupplierProfile
);

/**
 * @route PUT /api/suppliers/me
 * @desc Update supplier profile
 * @access Private - Supplier only
 */
router.put(
  '/me',
  authenticate,
  checkAbility(Action.Update, 'SupplierProfile', req => ({ userId: req.user.id })),
  AuditService.createMiddleware(AuditEventType.USER_UPDATE, req => ({
    targetType: 'SupplierProfile',
    metadata: { companyName: req.body.companyName }
  })),
  SupplierController.updateSupplierProfile
);

/**
 * @route GET /api/suppliers
 * @desc Get all suppliers
 * @access Private - Admin only
 */
router.get(
  '/',
  authenticate,
  requireAdmin,
  SupplierController.getAllSuppliers
);

/**
 * @route GET /api/suppliers/:id
 * @desc Get supplier by ID
 * @access Private - Admin only
 */
router.get(
  '/:id',
  authenticate,
  requireAdmin,
  SupplierController.getSupplierById
);

export default router;