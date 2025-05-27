import { Router } from 'express';
import { ContractController } from '../controllers/contract.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireClient, requireSupplier, checkAbility } from '../middleware/access-control.middleware';
import { Action } from '../services/access-control/ability';
import { AuditService, AuditEventType } from '../services/audit.service';

const router = Router();

/**
 * @route POST /api/contracts
 * @desc Create a new contract
 * @access Private - Client only
 */
router.post(
  '/',
  authenticate,
  requireClient,
  AuditService.createMiddleware(AuditEventType.CONTRACT_CREATE, req => ({
    targetType: 'Contract',
    metadata: { serviceId: req.body.serviceId }
  })),
  ContractController.createContract
);

/**
 * @route GET /api/contracts/my
 * @desc Get client's contracts
 * @access Private - Client only
 */
router.get(
  '/my',
  authenticate,
  requireClient,
  ContractController.getMyContracts
);

/**
 * @route GET /api/contracts/:id
 * @desc Get contract by ID
 * @access Private - Contract parties only
 */
router.get(
  '/:id',
  authenticate,
  ContractController.getContractById
);

/**
 * @route PATCH /api/contracts/:id/status
 * @desc Update contract status
 * @access Private - Contract parties only
 */
router.patch(
  '/:id/status',
  authenticate,
  AuditService.createMiddleware(AuditEventType.CONTRACT_UPDATE, req => ({
    targetId: req.params.id,
    targetType: 'Contract',
    metadata: { status: req.body.status }
  })),
  ContractController.updateContractStatus
);

/**
 * @route POST /api/contracts/:id/cancel
 * @desc Cancel contract
 * @access Private - Contract parties only
 */
router.post(
  '/:id/cancel',
  authenticate,
  AuditService.createMiddleware(AuditEventType.CONTRACT_CANCEL, req => ({
    targetId: req.params.id,
    targetType: 'Contract',
    metadata: { reason: req.body.reason }
  })),
  ContractController.cancelContract
);

/**
 * @route GET /api/contracts/terms/:serviceId
 * @desc Get contract terms template
 * @access Private - Authenticated users
 */
router.get(
  '/terms/:serviceId',
  authenticate,
  ContractController.getContractTerms
);

/**
 * @route POST /api/contracts/:id/payment
 * @desc Process payment (mock)
 * @access Private - Client only
 */
router.post(
  '/:id/payment',
  authenticate,
  requireClient,
  AuditService.createMiddleware(AuditEventType.PAYMENT_PROCESS, req => ({
    targetId: req.params.id,
    targetType: 'Contract',
    metadata: { paymentMethod: req.body.paymentMethod }
  })),
  ContractController.processPayment
);

/**
 * @route GET /api/contracts/:id/document
 * @desc Generate contract document
 * @access Private - Contract parties only
 */
router.get(
  '/:id/document',
  authenticate,
  ContractController.generateContractDocument
);

/**
 * @route GET /api/contracts/:id/document/download
 * @desc Download contract document
 * @access Private - Contract parties only
 */
router.get(
  '/:id/document/download',
  authenticate,
  ContractController.downloadContractDocument
);

/**
 * @route POST /api/contracts/:id/sign
 * @desc Sign contract
 * @access Private - Contract parties only
 */
router.post(
  '/:id/sign',
  authenticate,
  AuditService.createMiddleware(AuditEventType.CONTRACT_SIGNED, req => ({
    targetId: req.params.id,
    targetType: 'Contract'
  })),
  ContractController.signContract
);

/**
 * @route GET /api/contracts/:id/history
 * @desc Get contract history
 * @access Private - Contract parties only
 */
router.get(
  '/:id/history',
  authenticate,
  ContractController.getContractHistory
);

export default router;