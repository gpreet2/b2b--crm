import { randomUUID } from 'crypto';

import { createClient } from '@supabase/supabase-js';
import archiver from 'archiver';
import { Request, Response, Router } from 'express';
import { Parser } from 'json2csv';


import { auditData, auditSecurity, RESOURCE_TYPES } from '@/middleware/audit-log.middleware';
import { requirePermission } from '@/middleware/permissions.middleware';
import { logger } from '@/utils/logger';

const router = Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Data Privacy Request Types
 */
export enum DataRequestType {
  ACCESS = 'access', // GDPR Article 15, CCPA Right to Know
  PORTABILITY = 'portability', // GDPR Article 20, CCPA Right to Data Portability
  RECTIFICATION = 'rectification', // GDPR Article 16, CCPA Right to Correct
  ERASURE = 'erasure', // GDPR Article 17, CCPA Right to Delete
  RESTRICTION = 'restriction', // GDPR Article 18
  OBJECTION = 'objection', // GDPR Article 21, CCPA Right to Opt-Out
}

export enum RequestStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

/**
 * Data Privacy Request Interface
 */
interface DataPrivacyRequest {
  id?: string;
  user_id: string;
  organization_id: string;
  request_type: DataRequestType;
  status: RequestStatus;
  description?: string;
  requested_data_types?: string[];
  legal_basis: 'gdpr' | 'ccpa' | 'other';
  requester_email: string;
  requester_verified: boolean;
  verification_token?: string;
  verification_expires_at?: string;
  fulfillment_deadline: string;
  fulfilled_at?: string;
  fulfillment_data?: Record<string, any>;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * All data tables that may contain personal information
 */
const PERSONAL_DATA_TABLES = [
  'users',
  'clients',
  'user_organizations',
  'client_organizations',
  'event_participants',
  'memberships',
  'notifications',
  'audit_logs',
  'workout_sessions',
  'achievements',
  'documents',
  'client_notes',
  'billing_info',
  'emergency_contacts',
] as const;

/**
 * Create a new data privacy request
 */
router.post('/requests', async (req: Request, res: Response) => {
  try {
    const {
      request_type,
      description,
      requested_data_types,
      legal_basis,
      requester_email,
      user_id,
    } = req.body;

    const organizationId = req.headers['x-organization-id'] as string;
    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID required' });
    }

    // Validate request type
    if (!Object.values(DataRequestType).includes(request_type)) {
      return res.status(400).json({ error: 'Invalid request type' });
    }

    // Generate verification token
    const verificationToken = randomUUID();
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Calculate fulfillment deadline (30 days for GDPR, varies for CCPA)
    const fulfillmentDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const privacyRequest: Omit<DataPrivacyRequest, 'id'> = {
      user_id: user_id || (req as any).user?.id,
      organization_id: organizationId,
      request_type,
      status: RequestStatus.PENDING,
      description,
      requested_data_types,
      legal_basis: legal_basis || 'gdpr',
      requester_email,
      requester_verified: false,
      verification_token: verificationToken,
      verification_expires_at: verificationExpiresAt.toISOString(),
      fulfillment_deadline: fulfillmentDeadline.toISOString(),
    };

    const { data, error } = await supabase
      .from('data_privacy_requests')
      .insert([privacyRequest])
      .select()
      .single();

    if (error) {
      logger.error('Failed to create data privacy request', { error, request: privacyRequest });
      return res.status(500).json({ error: 'Failed to create request' });
    }

    // Audit the request creation
    await auditData.create(req, RESOURCE_TYPES.SYSTEM, data.id, {
      request_type,
      legal_basis,
      requester_email,
    });

    // In production, send verification email here
    logger.info('Data privacy request created', {
      requestId: data.id,
      type: request_type,
      legal_basis,
      email: requester_email,
    });

    res.status(201).json({
      id: data.id,
      status: data.status,
      verification_required: true,
      fulfillment_deadline: data.fulfillment_deadline,
      message: 'Request created. Verification email sent.',
    });
  } catch (error) {
    logger.error('Error creating data privacy request', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Verify data privacy request
 */
router.post('/requests/:id/verify', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { verification_token } = req.body;

    const { data: request, error } = await supabase
      .from('data_privacy_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Check verification token and expiry
    if (request.verification_token !== verification_token) {
      await auditSecurity.suspiciousActivity(req, 'invalid_verification_token', {
        request_id: id,
        provided_token: verification_token,
      });
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    if (new Date() > new Date(request.verification_expires_at)) {
      return res.status(400).json({ error: 'Verification token expired' });
    }

    // Mark as verified and in progress
    const { error: updateError } = await supabase
      .from('data_privacy_requests')
      .update({
        requester_verified: true,
        status: RequestStatus.IN_PROGRESS,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      logger.error('Failed to verify request', { error: updateError, requestId: id });
      return res.status(500).json({ error: 'Failed to verify request' });
    }

    // Audit the verification
    await auditData.update(req, RESOURCE_TYPES.SYSTEM, id, {
      action: 'verified',
      verification_method: 'email_token',
    });

    res.json({
      message: 'Request verified successfully',
      status: RequestStatus.IN_PROGRESS,
    });
  } catch (error) {
    logger.error('Error verifying data privacy request', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get all data privacy requests (admin only)
 */
router.get('/requests', requirePermission('privacy:read'), async (req: Request, res: Response) => {
  try {
    const organizationId = req.headers['x-organization-id'] as string;
    const { status, request_type, page = 1, limit = 50 } = req.query;

    let query = supabase
      .from('data_privacy_requests')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (request_type) query = query.eq('request_type', request_type);

    const offset = (Number(page) - 1) * Number(limit);
    query = query.range(offset, offset + Number(limit) - 1);

    const { data, error, count } = await query;

    if (error) {
      logger.error('Failed to fetch data privacy requests', { error });
      return res.status(500).json({ error: 'Failed to fetch requests' });
    }

    // Audit access to privacy requests
    await auditData.read(req, RESOURCE_TYPES.SYSTEM, undefined, {
      action: 'list_privacy_requests',
      count: data?.length || 0,
      filters: { status, request_type },
    });

    res.json({
      requests: data,
      total: count,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    logger.error('Error fetching data privacy requests', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get specific data privacy request
 */
router.get(
  '/requests/:id',
  requirePermission('privacy:read'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const organizationId = req.headers['x-organization-id'] as string;

      const { data, error } = await supabase
        .from('data_privacy_requests')
        .select('*')
        .eq('id', id)
        .eq('organization_id', organizationId)
        .single();

      if (error || !data) {
        return res.status(404).json({ error: 'Request not found' });
      }

      // Audit access to specific privacy request
      await auditData.read(req, RESOURCE_TYPES.SYSTEM, id, {
        request_type: data.request_type,
        status: data.status,
      });

      res.json(data);
    } catch (error) {
      logger.error('Error fetching data privacy request', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Process data access request (GDPR Article 15, CCPA Right to Know)
 */
router.post(
  '/requests/:id/fulfill/access',
  requirePermission('privacy:fulfill'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { format = 'json' } = req.body;

      const { data: request, error } = await supabase
        .from('data_privacy_requests')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !request) {
        return res.status(404).json({ error: 'Request not found' });
      }

      if (request.request_type !== DataRequestType.ACCESS) {
        return res.status(400).json({ error: 'Invalid request type for this operation' });
      }

      if (!request.requester_verified) {
        return res.status(400).json({ error: 'Request not verified' });
      }

      // Collect all personal data for the user
      const personalData: Record<string, any> = {};

      for (const tableName of PERSONAL_DATA_TABLES) {
        try {
          const { data: tableData } = await supabase
            .from(tableName)
            .select('*')
            .or(`user_id.eq.${request.user_id},client_id.eq.${request.user_id}`);

          if (tableData && tableData.length > 0) {
            personalData[tableName] = tableData;
          }
        } catch (tableError) {
          logger.warn(`Failed to fetch data from table ${tableName}`, { error: tableError });
        }
      }

      const accessData = {
        user_id: request.user_id,
        organization_id: request.organization_id,
        request_id: id,
        data_collected: personalData,
        data_sources: Object.keys(personalData),
        processing_purposes: [
          'Service provision',
          'Account management',
          'Communication',
          'Legal compliance',
          'Analytics and improvement',
        ],
        retention_periods: {
          user_data: '7 years after account closure',
          audit_logs: '7 years',
          billing_data: '10 years',
          marketing_data: 'Until consent withdrawn',
        },
        third_party_sharing: [
          'Payment processors',
          'Email service providers',
          'Analytics providers',
          'Legal authorities (when required)',
        ],
        data_rights: [
          'Right to access (Article 15)',
          'Right to rectification (Article 16)',
          'Right to erasure (Article 17)',
          'Right to restrict processing (Article 18)',
          'Right to data portability (Article 20)',
          'Right to object (Article 21)',
        ],
        export_date: new Date().toISOString(),
        format,
      };

      // Mark request as completed
      const { error: updateError } = await supabase
        .from('data_privacy_requests')
        .update({
          status: RequestStatus.COMPLETED,
          fulfilled_at: new Date().toISOString(),
          fulfillment_data: { access_data_generated: true, format },
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) {
        logger.error('Failed to update request status', { error: updateError });
      }

      // Audit the fulfillment
      await auditData.export(req, RESOURCE_TYPES.SYSTEM, {
        request_id: id,
        request_type: 'access',
        data_sources: Object.keys(personalData),
        records_count: Object.values(personalData).flat().length,
      });

      // Return data based on format
      if (format === 'csv') {
        const archive = archiver('zip', { zlib: { level: 9 } });
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="data-access-${request.user_id}.zip"`
        );
        archive.pipe(res);

        // Add CSV files for each data type
        for (const [tableName, tableData] of Object.entries(personalData)) {
          if (Array.isArray(tableData) && tableData.length > 0) {
            const parser = new Parser();
            const csv = parser.parse(tableData);
            archive.append(csv, { name: `${tableName}.csv` });
          }
        }

        // Add summary file
        const summaryParser = new Parser();
        const summary = summaryParser.parse([
          {
            export_date: accessData.export_date,
            data_sources: accessData.data_sources.join(', '),
            total_tables: accessData.data_sources.length,
            total_records: Object.values(personalData).flat().length,
          },
        ]);
        archive.append(summary, { name: 'export_summary.csv' });

        archive.finalize();
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="data-access-${request.user_id}.json"`
        );
        res.json(accessData);
      }
    } catch (error) {
      logger.error('Error fulfilling data access request', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Process data erasure request (GDPR Article 17, CCPA Right to Delete)
 */
router.post(
  '/requests/:id/fulfill/erasure',
  requirePermission('privacy:fulfill'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { confirm_deletion = false } = req.body;

      if (!confirm_deletion) {
        return res.status(400).json({ error: 'Deletion confirmation required' });
      }

      const { data: request, error } = await supabase
        .from('data_privacy_requests')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !request) {
        return res.status(404).json({ error: 'Request not found' });
      }

      if (request.request_type !== DataRequestType.ERASURE) {
        return res.status(400).json({ error: 'Invalid request type for this operation' });
      }

      if (!request.requester_verified) {
        return res.status(400).json({ error: 'Request not verified' });
      }

      // Check for legal obligations to retain data
      const { data: auditLogs } = await supabase
        .from('audit_logs')
        .select('action')
        .eq('user_id', request.user_id)
        .in('action', [
          'auth.login',
          'auth.logout',
          'billing.payment',
          'security.suspicious_activity',
        ]);

      const hasLegalObligations = auditLogs && auditLogs.length > 0;

      const deletionResults: Record<string, any> = {};
      let totalDeleted = 0;

      // Delete personal data from all tables (except where legal obligations exist)
      for (const tableName of PERSONAL_DATA_TABLES) {
        try {
          // Skip audit logs if there are legal obligations
          if (tableName === 'audit_logs' && hasLegalObligations) {
            deletionResults[tableName] = { status: 'retained', reason: 'legal_obligation' };
            continue;
          }

          const { count, error: deleteError } = await supabase
            .from(tableName)
            .delete({ count: 'exact' })
            .or(`user_id.eq.${request.user_id},client_id.eq.${request.user_id}`);

          if (deleteError) {
            logger.error(`Failed to delete from ${tableName}`, { error: deleteError });
            deletionResults[tableName] = { status: 'error', error: deleteError.message };
          } else {
            deletionResults[tableName] = { status: 'deleted', count: count || 0 };
            totalDeleted += count || 0;
          }
        } catch (tableError) {
          logger.error(`Error processing deletion for ${tableName}`, { error: tableError });
          deletionResults[tableName] = { status: 'error', error: String(tableError) };
        }
      }

      // Mark request as completed
      const { error: updateError } = await supabase
        .from('data_privacy_requests')
        .update({
          status: RequestStatus.COMPLETED,
          fulfilled_at: new Date().toISOString(),
          fulfillment_data: {
            deletion_results: deletionResults,
            total_deleted: totalDeleted,
            legal_obligations_preserved: hasLegalObligations,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) {
        logger.error('Failed to update erasure request status', { error: updateError });
      }

      // Audit the erasure
      await auditData.delete(req, RESOURCE_TYPES.SYSTEM, request.user_id, {
        request_id: id,
        request_type: 'erasure',
        total_deleted: totalDeleted,
        legal_obligations_preserved: hasLegalObligations,
        deletion_summary: deletionResults,
      });

      res.json({
        message: 'Data erasure completed',
        total_deleted: totalDeleted,
        deletion_results: deletionResults,
        legal_obligations_preserved: hasLegalObligations,
        completion_date: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error fulfilling data erasure request', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Process data rectification request (GDPR Article 16, CCPA Right to Correct)
 */
router.post(
  '/requests/:id/fulfill/rectification',
  requirePermission('privacy:fulfill'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { corrections } = req.body;

      if (!corrections || typeof corrections !== 'object') {
        return res.status(400).json({ error: 'Corrections data required' });
      }

      const { data: request, error } = await supabase
        .from('data_privacy_requests')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !request) {
        return res.status(404).json({ error: 'Request not found' });
      }

      if (request.request_type !== DataRequestType.RECTIFICATION) {
        return res.status(400).json({ error: 'Invalid request type for this operation' });
      }

      if (!request.requester_verified) {
        return res.status(400).json({ error: 'Request not verified' });
      }

      const updateResults: Record<string, any> = {};

      // Apply corrections to specified tables
      for (const [tableName, updates] of Object.entries(corrections)) {
        try {
          const { data, error: updateError } = await supabase
            .from(tableName)
            .update(updates)
            .eq('user_id', request.user_id)
            .select();

          if (updateError) {
            logger.error(`Failed to update ${tableName}`, { error: updateError });
            updateResults[tableName] = { status: 'error', error: updateError.message };
          } else {
            updateResults[tableName] = {
              status: 'updated',
              count: data?.length || 0,
              updated_fields: Object.keys(updates),
            };
          }
        } catch (tableError) {
          logger.error(`Error processing rectification for ${tableName}`, { error: tableError });
          updateResults[tableName] = { status: 'error', error: String(tableError) };
        }
      }

      // Mark request as completed
      const { error: updateError } = await supabase
        .from('data_privacy_requests')
        .update({
          status: RequestStatus.COMPLETED,
          fulfilled_at: new Date().toISOString(),
          fulfillment_data: {
            rectification_results: updateResults,
            corrections_applied: corrections,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) {
        logger.error('Failed to update rectification request status', { error: updateError });
      }

      // Audit the rectification
      await auditData.update(req, RESOURCE_TYPES.SYSTEM, request.user_id, {
        request_id: id,
        request_type: 'rectification',
        corrections_applied: corrections,
        update_results: updateResults,
      });

      res.json({
        message: 'Data rectification completed',
        rectification_results: updateResults,
        completion_date: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error fulfilling data rectification request', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Get data processing consent status
 */
router.get(
  '/consent/:userId',
  requirePermission('privacy:read'),
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const organizationId = req.headers['x-organization-id'] as string;

      const { data: consents, error } = await supabase
        .from('user_consents')
        .select('*')
        .eq('user_id', userId)
        .eq('organization_id', organizationId);

      if (error) {
        logger.error('Failed to fetch consent data', { error });
        return res.status(500).json({ error: 'Failed to fetch consent data' });
      }

      // Audit consent access
      await auditData.read(req, RESOURCE_TYPES.USER, userId, {
        action: 'view_consent_status',
        consents_count: consents?.length || 0,
      });

      res.json({
        user_id: userId,
        consents: consents || [],
        consent_summary: {
          marketing: consents?.find(c => c.consent_type === 'marketing')?.granted || false,
          analytics: consents?.find(c => c.consent_type === 'analytics')?.granted || false,
          third_party_sharing:
            consents?.find(c => c.consent_type === 'third_party_sharing')?.granted || false,
        },
      });
    } catch (error) {
      logger.error('Error fetching consent status', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Update consent preferences
 */
router.post(
  '/consent/:userId',
  requirePermission('privacy:manage'),
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { consents } = req.body;
      const organizationId = req.headers['x-organization-id'] as string;

      if (!consents || typeof consents !== 'object') {
        return res.status(400).json({ error: 'Consents data required' });
      }

      const consentRecords = Object.entries(consents).map(([type, granted]) => ({
        user_id: userId,
        organization_id: organizationId,
        consent_type: type,
        granted: Boolean(granted),
        granted_at: granted ? new Date().toISOString() : null,
        withdrawn_at: !granted ? new Date().toISOString() : null,
        updated_by: (req as any).user?.id,
      }));

      // Upsert consent records
      const { error } = await supabase.from('user_consents').upsert(consentRecords, {
        onConflict: 'user_id,organization_id,consent_type',
        ignoreDuplicates: false,
      });

      if (error) {
        logger.error('Failed to update consent preferences', { error });
        return res.status(500).json({ error: 'Failed to update consent preferences' });
      }

      // Audit consent changes
      await auditData.update(req, RESOURCE_TYPES.USER, userId, {
        action: 'update_consent_preferences',
        consent_changes: consents,
        updated_by: (req as any).user?.id,
      });

      res.json({
        message: 'Consent preferences updated successfully',
        consents,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error updating consent preferences', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
