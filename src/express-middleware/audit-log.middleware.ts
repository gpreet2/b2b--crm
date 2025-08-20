import { createClient } from '@supabase/supabase-js';
import { Request, Response, NextFunction } from 'express';

import { logger } from '@/utils/logger';

// Initialize Supabase client for audit logging
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Audit log entry interface (matches existing database schema)
 */
export interface AuditLogEntry {
  id?: string;
  user_id?: string;
  organization_id?: string;
  action: string;
  entity_type: string; // Maps to existing column
  entity_id?: string; // Maps to existing column (UUID type)
  old_values?: Record<string, any>; // For tracking changes
  new_values?: Record<string, any>; // For tracking changes
  metadata?: Record<string, any>; // Additional context
  ip_address?: string;
  user_agent?: string;
  request_id?: string;
  session_id?: string;
  created_at?: string;
  // Note: existing table doesn't have status, error_message, risk_level, timestamp
  // We'll use metadata field to store these
}

/**
 * Actions that should be audited
 */
export const AUDITABLE_ACTIONS = {
  // Authentication
  AUTH_LOGIN: 'auth.login',
  AUTH_LOGOUT: 'auth.logout',
  AUTH_FAILED_LOGIN: 'auth.failed_login',
  AUTH_PASSWORD_RESET: 'auth.password_reset',
  AUTH_TOKEN_REFRESH: 'auth.token_refresh',

  // User management
  USER_CREATE: 'user.create',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
  USER_ROLE_CHANGE: 'user.role_change',
  USER_PERMISSION_CHANGE: 'user.permission_change',

  // Organization management
  ORG_CREATE: 'organization.create',
  ORG_UPDATE: 'organization.update',
  ORG_DELETE: 'organization.delete',
  ORG_MEMBER_ADD: 'organization.member_add',
  ORG_MEMBER_REMOVE: 'organization.member_remove',
  ORG_SETTINGS_CHANGE: 'organization.settings_change',

  // Data access
  DATA_READ: 'data.read',
  DATA_CREATE: 'data.create',
  DATA_UPDATE: 'data.update',
  DATA_DELETE: 'data.delete',
  DATA_EXPORT: 'data.export',
  DATA_IMPORT: 'data.import',

  // Security events
  SECURITY_PERMISSION_DENIED: 'security.permission_denied',
  SECURITY_RATE_LIMIT_EXCEEDED: 'security.rate_limit_exceeded',
  SECURITY_SUSPICIOUS_ACTIVITY: 'security.suspicious_activity',
  SECURITY_CONFIG_CHANGE: 'security.config_change',

  // System events
  SYSTEM_BACKUP: 'system.backup',
  SYSTEM_RESTORE: 'system.restore',
  SYSTEM_CONFIG_CHANGE: 'system.config_change',
  SYSTEM_MAINTENANCE: 'system.maintenance',
} as const;

/**
 * Resource types for audit logging
 */
export const RESOURCE_TYPES = {
  USER: 'user',
  ORGANIZATION: 'organization',
  CLIENT: 'client',
  EVENT: 'event',
  BOOKING: 'booking',
  MEMBERSHIP: 'membership',
  WORKOUT: 'workout',
  ACHIEVEMENT: 'achievement',
  DOCUMENT: 'document',
  SYSTEM: 'system',
  SETTINGS: 'settings',
  PERMISSION: 'permission',
  ROLE: 'role',
} as const;

/**
 * Determine risk level based on action and context
 */
function determineRiskLevel(action: string, context: Partial<AuditLogEntry>): string {
  // Critical risk actions
  const criticalActions = [
    AUDITABLE_ACTIONS.USER_DELETE,
    AUDITABLE_ACTIONS.ORG_DELETE,
    AUDITABLE_ACTIONS.DATA_DELETE,
    AUDITABLE_ACTIONS.SYSTEM_CONFIG_CHANGE,
    AUDITABLE_ACTIONS.SECURITY_CONFIG_CHANGE,
  ];

  // High risk actions
  const highRiskActions = [
    AUDITABLE_ACTIONS.USER_ROLE_CHANGE,
    AUDITABLE_ACTIONS.USER_PERMISSION_CHANGE,
    AUDITABLE_ACTIONS.ORG_SETTINGS_CHANGE,
    AUDITABLE_ACTIONS.DATA_EXPORT,
    AUDITABLE_ACTIONS.SYSTEM_BACKUP,
    AUDITABLE_ACTIONS.SYSTEM_RESTORE,
  ];

  // Medium risk actions
  const mediumRiskActions = [
    AUDITABLE_ACTIONS.AUTH_FAILED_LOGIN,
    AUDITABLE_ACTIONS.USER_CREATE,
    AUDITABLE_ACTIONS.ORG_CREATE,
    AUDITABLE_ACTIONS.DATA_CREATE,
    AUDITABLE_ACTIONS.DATA_UPDATE,
    AUDITABLE_ACTIONS.SECURITY_PERMISSION_DENIED,
    AUDITABLE_ACTIONS.SECURITY_RATE_LIMIT_EXCEEDED,
  ];

  // Handle special cases first (before general arrays)

  // Consider multiple failed attempts as high risk
  if (action === AUDITABLE_ACTIONS.AUTH_FAILED_LOGIN) {
    const attemptCount = context.metadata?.attempt_count;
    if (attemptCount && attemptCount > 3) {
      return 'high';
    }
  }

  // Consider suspicious activity as high risk
  if (action === AUDITABLE_ACTIONS.SECURITY_SUSPICIOUS_ACTIVITY) {
    return 'high';
  }

  if (criticalActions.includes(action as any)) {
    return 'critical';
  }

  if (highRiskActions.includes(action as any)) {
    return 'high';
  }

  if (mediumRiskActions.includes(action as any)) {
    return 'medium';
  }

  return 'low';
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(
  entry: Partial<AuditLogEntry> & { action: string; entity_type: string }
): Promise<void> {
  try {
    const riskLevel = determineRiskLevel(entry.action, entry);

    // Prepare entry for existing database schema
    const auditEntry = {
      user_id: entry.user_id,
      organization_id: entry.organization_id,
      action: entry.action,
      entity_type: entry.entity_type,
      entity_id: entry.entity_id,
      old_values: entry.old_values,
      new_values: entry.new_values,
      ip_address: entry.ip_address,
      user_agent: entry.user_agent,
      request_id: entry.request_id,
      session_id: entry.session_id,
      metadata: {
        ...entry.metadata,
        risk_level: riskLevel,
        timestamp: new Date().toISOString(),
        // Store additional fields that don't exist in the table
        status: entry.metadata?.status || 'success',
        error_message: entry.metadata?.error_message,
      },
    };

    // Log to Supabase
    const { error } = await supabase.from('audit_logs').insert([auditEntry]);

    if (error) {
      logger.error('Failed to create audit log entry', {
        error,
        entry: auditEntry,
      });
      return;
    }

    // Also log to application logger for immediate visibility
    logger.info('Audit log created', {
      action: auditEntry.action,
      entity_type: auditEntry.entity_type,
      entity_id: auditEntry.entity_id,
      user_id: auditEntry.user_id,
      organization_id: auditEntry.organization_id,
      status: auditEntry.metadata.status,
      risk_level: riskLevel,
      request_id: auditEntry.request_id,
    });

    // Alert on high/critical risk events
    if (riskLevel === 'high' || riskLevel === 'critical') {
      logger.warn('High risk audit event', {
        action: auditEntry.action,
        user_id: auditEntry.user_id,
        ip_address: auditEntry.ip_address,
        metadata: auditEntry.metadata,
        risk_level: riskLevel,
      });
    }
  } catch (error) {
    logger.error('Unexpected error creating audit log', { error, entry });
  }
}

/**
 * Extract audit context from request
 */
function extractAuditContext(req: Request): Partial<AuditLogEntry> {
  const securityContext = (req as any).securityContext;
  const user = (req as any).user;
  const organizationId = req.headers['x-organization-id'] as string;

  return {
    user_id: user?.id,
    organization_id: organizationId,
    ip_address: req.ip || securityContext?.ip,
    user_agent: req.get('User-Agent'),
    request_id: (req.headers['x-request-id'] as string) || securityContext?.requestId,
    session_id: user?.session_id,
  };
}

/**
 * Middleware to automatically audit certain actions
 */
export function auditMiddleware(
  action: string,
  entityType: string,
  options: {
    extractEntityId?: (req: Request) => string | undefined;
    extractOldValues?: (req: Request, res: Response) => Record<string, any>;
    extractNewValues?: (req: Request, res: Response) => Record<string, any>;
    extractDetails?: (req: Request, res: Response) => Record<string, any>; // Legacy alias for extractMetadata
    extractMetadata?: (req: Request, res: Response) => Record<string, any>;
    shouldAudit?: (req: Request, res: Response) => boolean;
    status?: 'success' | 'failure' | 'pending';
  } = {}
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    // Skip if shouldAudit returns false
    if (options.shouldAudit && !options.shouldAudit(req, res)) {
      return next();
    }

    // Extract context
    const context = extractAuditContext(req);

    // Determine status based on response
    let status: 'success' | 'failure' | 'pending' = options.status || 'pending';

    // Intercept response to determine final status
    const originalSend = res.send;
    const originalJson = res.json;

    res.send = function (data) {
      status = res.statusCode >= 200 && res.statusCode < 400 ? 'success' : 'failure';
      return originalSend.call(this, data);
    };

    res.json = function (data) {
      status = res.statusCode >= 200 && res.statusCode < 400 ? 'success' : 'failure';
      return originalJson.call(this, data);
    };

    // Handle response completion
    res.on('finish', async () => {
      try {
        const entityId = options.extractEntityId?.(req);
        const oldValues = options.extractOldValues?.(req, res);
        const newValues = options.extractNewValues?.(req, res);
        // Support both extractDetails (legacy) and extractMetadata
        const extractedDetails = options.extractDetails?.(req, res) || {};
        const extractedMetadata = options.extractMetadata?.(req, res) || {};
        const baseMetadata = { ...extractedDetails, ...extractedMetadata };

        // Add response time and status to metadata
        const metadata: Record<string, any> = {
          ...baseMetadata,
          response_time_ms: Date.now() - startTime,
          status_code: res.statusCode,
          status,
        };

        // Add error message for failures
        if (status === 'failure') {
          metadata.error_message = `HTTP ${res.statusCode}`;
        }

        await createAuditLog({
          ...context,
          action,
          entity_type: entityType,
          entity_id: entityId,
          old_values: oldValues,
          new_values: newValues,
          metadata,
        });
      } catch (error) {
        logger.error('Error in audit middleware response handler', { error });
      }
    });

    next();
  };
}

/**
 * Manual audit logging helper
 */
export async function auditAction(
  req: Request,
  action: string,
  entityType: string,
  entityId?: string,
  additionalMetadata?: Record<string, any>,
  status: 'success' | 'failure' | 'pending' = 'success'
): Promise<void> {
  const context = extractAuditContext(req);

  await createAuditLog({
    ...context,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata: {
      ...additionalMetadata,
      status,
    },
  });
}

/**
 * Audit authentication events
 */
export const auditAuth = {
  login: (req: Request, userId: string, organizationId?: string) =>
    auditAction(req, AUDITABLE_ACTIONS.AUTH_LOGIN, RESOURCE_TYPES.USER, userId, {
      organization_id: organizationId,
      login_method: 'workos',
    }),

  logout: (req: Request, userId: string) =>
    auditAction(req, AUDITABLE_ACTIONS.AUTH_LOGOUT, RESOURCE_TYPES.USER, userId),

  failedLogin: (req: Request, email?: string, attemptCount = 1) =>
    auditAction(
      req,
      AUDITABLE_ACTIONS.AUTH_FAILED_LOGIN,
      RESOURCE_TYPES.USER,
      undefined,
      {
        email,
        attempt_count: attemptCount,
      },
      'failure'
    ),

  passwordReset: (req: Request, userId: string) =>
    auditAction(req, AUDITABLE_ACTIONS.AUTH_PASSWORD_RESET, RESOURCE_TYPES.USER, userId),
};

/**
 * Audit data events
 */
export const auditData = {
  read: (req: Request, entityType: string, entityId?: string, metadata?: Record<string, any>) =>
    auditAction(req, AUDITABLE_ACTIONS.DATA_READ, entityType, entityId, metadata),

  create: (req: Request, entityType: string, entityId?: string, metadata?: Record<string, any>) =>
    auditAction(req, AUDITABLE_ACTIONS.DATA_CREATE, entityType, entityId, metadata),

  update: (req: Request, entityType: string, entityId?: string, metadata?: Record<string, any>) =>
    auditAction(req, AUDITABLE_ACTIONS.DATA_UPDATE, entityType, entityId, metadata),

  delete: (req: Request, entityType: string, entityId?: string, metadata?: Record<string, any>) =>
    auditAction(req, AUDITABLE_ACTIONS.DATA_DELETE, entityType, entityId, metadata),

  export: (req: Request, entityType: string, metadata?: Record<string, any>) =>
    auditAction(req, AUDITABLE_ACTIONS.DATA_EXPORT, entityType, undefined, metadata),
};

/**
 * Audit security events
 */
export const auditSecurity = {
  permissionDenied: (
    req: Request,
    requiredPermission: string,
    entityType: string,
    entityId?: string
  ) =>
    auditAction(
      req,
      AUDITABLE_ACTIONS.SECURITY_PERMISSION_DENIED,
      entityType,
      entityId,
      {
        required_permission: requiredPermission,
      },
      'failure'
    ),

  rateLimitExceeded: (req: Request, limitType: string, limit: number) =>
    auditAction(
      req,
      AUDITABLE_ACTIONS.SECURITY_RATE_LIMIT_EXCEEDED,
      RESOURCE_TYPES.SYSTEM,
      undefined,
      {
        limit_type: limitType,
        limit,
        endpoint: req.path,
      },
      'failure'
    ),

  suspiciousActivity: (req: Request, activityType: string, details: Record<string, any>) =>
    auditAction(
      req,
      AUDITABLE_ACTIONS.SECURITY_SUSPICIOUS_ACTIVITY,
      RESOURCE_TYPES.SYSTEM,
      undefined,
      {
        activity_type: activityType,
        ...details,
      },
      'failure'
    ),
};

/**
 * Common audit middleware for CRUD operations
 */
export const auditCRUD = {
  read: (entityType: string) =>
    auditMiddleware(AUDITABLE_ACTIONS.DATA_READ, entityType, {
      extractEntityId: req => req.params.id,
      shouldAudit: (req, res) => res.statusCode === 200,
    }),

  create: (entityType: string) =>
    auditMiddleware(AUDITABLE_ACTIONS.DATA_CREATE, entityType, {
      extractEntityId: (req: any) => {
        // Try to get ID from params for create operations
        return req.params.id;
      },
      extractMetadata: req => ({
        created_fields: Object.keys(req.body || {}),
      }),
      shouldAudit: (req, res) => res.statusCode >= 200 && res.statusCode < 300,
    }),

  update: (entityType: string) =>
    auditMiddleware(AUDITABLE_ACTIONS.DATA_UPDATE, entityType, {
      extractEntityId: req => req.params.id,
      extractMetadata: req => ({
        updated_fields: Object.keys(req.body || {}),
      }),
    }),

  delete: (entityType: string) =>
    auditMiddleware(AUDITABLE_ACTIONS.DATA_DELETE, entityType, {
      extractEntityId: req => req.params.id,
    }),
};
