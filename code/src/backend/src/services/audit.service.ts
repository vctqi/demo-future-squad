import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger';

const prisma = new PrismaClient();

// Define audit event types
export enum AuditEventType {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET = 'PASSWORD_RESET',
  USER_CREATE = 'USER_CREATE',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',
  USER_STATUS_CHANGE = 'USER_STATUS_CHANGE',
  SUPPLIER_APPROVE = 'SUPPLIER_APPROVE',
  SUPPLIER_REJECT = 'SUPPLIER_REJECT',
  SERVICE_CREATE = 'SERVICE_CREATE',
  SERVICE_UPDATE = 'SERVICE_UPDATE',
  SERVICE_DELETE = 'SERVICE_DELETE',
  SERVICE_APPROVE = 'SERVICE_APPROVE',
  SERVICE_REJECT = 'SERVICE_REJECT',
  SERVICE_ACTIVATED = 'SERVICE_ACTIVATED',
  SERVICE_DEACTIVATED = 'SERVICE_DEACTIVATED',
  CONTRACT_CREATE = 'CONTRACT_CREATE',
  CONTRACT_UPDATE = 'CONTRACT_UPDATE',
  CONTRACT_CANCEL = 'CONTRACT_CANCEL',
  CONTRACT_COMPLETE = 'CONTRACT_COMPLETE',
  CONTRACT_SIGNED = 'CONTRACT_SIGNED',
  CONTRACT_DOCUMENT_GENERATED = 'CONTRACT_DOCUMENT_GENERATED',
  CONTRACT_DOCUMENT_DOWNLOADED = 'CONTRACT_DOCUMENT_DOWNLOADED',
  PAYMENT_PROCESS = 'PAYMENT_PROCESS',
  ADMIN_ACTION = 'ADMIN_ACTION',
  API_ACCESS = 'API_ACCESS',
  ACCESS_DENIED = 'ACCESS_DENIED',
}

// Define audit log interface
interface AuditLogData {
  eventType: AuditEventType;
  userId: string;
  targetId?: string;
  targetType?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Audit service for logging security-relevant events
 */
export class AuditService {
  /**
   * Log an audit event
   * @param data Audit log data
   */
  static async log(data: AuditLogData): Promise<void> {
    try {
      // Clean metadata to remove sensitive information
      const cleanedMetadata = this.sanitizeMetadata(data.metadata || {});
      
      // Log to database (in a real implementation)
      // await prisma.auditLog.create({
      //   data: {
      //     eventType: data.eventType,
      //     userId: data.userId,
      //     targetId: data.targetId,
      //     targetType: data.targetType,
      //     metadata: cleanedMetadata,
      //     ipAddress: data.ipAddress,
      //     userAgent: data.userAgent,
      //     timestamp: new Date(),
      //   },
      // });

      // For MVP, log to console and file
      logger.info('AUDIT', {
        eventType: data.eventType,
        userId: data.userId,
        targetId: data.targetId,
        targetType: data.targetType,
        metadata: cleanedMetadata,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error logging audit event:', error);
    }
  }

  /**
   * Create audit middleware for Express
   * @param eventType Audit event type
   * @param getTargetInfo Function to extract target info from request
   */
  static createMiddleware(
    eventType: AuditEventType,
    getTargetInfo?: (req: any) => { targetId?: string; targetType?: string; metadata?: Record<string, any> }
  ) {
    return (req: any, res: any, next: any) => {
      // Store the original end method
      const originalEnd = res.end;

      // Override the end method
      res.end = function(chunk: any, encoding: any) {
        // Restore the original end method
        res.end = originalEnd;

        // Only log successful actions (2xx status codes)
        if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
          const targetInfo = getTargetInfo ? getTargetInfo(req) : {};
          
          AuditService.log({
            eventType,
            userId: req.user.id,
            targetId: targetInfo.targetId,
            targetType: targetInfo.targetType,
            metadata: {
              ...targetInfo.metadata,
              method: req.method,
              url: req.originalUrl,
              statusCode: res.statusCode,
            },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
          });
        }

        // Call the original end method
        return originalEnd.call(this, chunk, encoding);
      };

      next();
    };
  }

  /**
   * Log access denied events
   * @param req Express request
   * @param action Action that was denied
   * @param subject Subject that was denied
   */
  static logAccessDenied(req: any, action: string, subject: string): void {
    if (!req.user) return;

    this.log({
      eventType: AuditEventType.ACCESS_DENIED,
      userId: req.user.id,
      targetType: subject,
      metadata: {
        action,
        method: req.method,
        url: req.originalUrl,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
  }

  /**
   * Sanitize metadata to remove sensitive information
   * @param metadata Metadata object
   * @returns Sanitized metadata
   */
  private static sanitizeMetadata(metadata: Record<string, any>): Record<string, any> {
    const sensitiveFields = ['password', 'token', 'secret', 'credit_card', 'ssn', 'cpf', 'cnpj'];
    const sanitized = { ...metadata };
    
    // Recursively sanitize the metadata
    for (const [key, value] of Object.entries(sanitized)) {
      // Check if the key contains a sensitive field
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        sanitized[key] = '[REDACTED]';
      } 
      // Recursively sanitize nested objects
      else if (value && typeof value === 'object' && !Array.isArray(value)) {
        sanitized[key] = this.sanitizeMetadata(value);
      }
    }
    
    return sanitized;
  }
}