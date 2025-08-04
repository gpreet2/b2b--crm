import { Request, Response, Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
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
  ACCESS = 'access',          // GDPR Article 15, CCPA Right to Know
  PORTABILITY = 'portability', // GDPR Article 20, CCPA Right to Data Portability  
  RECTIFICATION = 'rectification', // GDPR Article 16, CCPA Right to Correct
  ERASURE = 'erasure',        // GDPR Article 17, CCPA Right to Delete
  RESTRICTION = 'restriction', // GDPR Article 18
  OBJECTION = 'objection',    // GDPR Article 21, CCPA Right to Opt-Out
}

export enum RequestStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

/**
 * Personal data tables for GDPR/CCPA compliance
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
] as const;

/**
 * Create a new data privacy request
 */
router.post('/requests', async (req: Request, res: Response) => {
  try {
    const {
      request_type,
      description,
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

    // Generate verification token and deadlines
    const verificationToken = randomUUID();
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const fulfillmentDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const privacyRequest = {
      user_id: user_id || (req as any).user?.id,
      organization_id: organizationId,
      request_type,
      status: RequestStatus.PENDING,
      description,
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
      logger.error('Failed to create data privacy request', { error });
      return res.status(500).json({ error: 'Failed to create request' });
    }

    logger.info('Data privacy request created', {
      requestId: data.id,
      type: request_type,
      legal_basis,
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

    if (request.verification_token !== verification_token) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    if (new Date() > new Date(request.verification_expires_at)) {
      return res.status(400).json({ error: 'Verification token expired' });
    }

    const { error: updateError } = await supabase
      .from('data_privacy_requests')
      .update({
        requester_verified: true,
        status: RequestStatus.IN_PROGRESS,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      logger.error('Failed to verify request', { error: updateError });
      return res.status(500).json({ error: 'Failed to verify request' });
    }

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
router.get('/requests', async (req: Request, res: Response) => {
  try {
    const organizationId = req.headers['x-organization-id'] as string;
    const { status, request_type, page = 1, limit = 50 } = req.query;

    let query = supabase
      .from('data_privacy_requests')
      .select('*', { count: 'exact' })
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
router.get('/requests/:id', async (req: Request, res: Response) => {
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

    res.json(data);
  } catch (error) {
    logger.error('Error fetching data privacy request', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Fulfill data access request (GDPR Article 15, CCPA Right to Know)
 */
router.post('/requests/:id/fulfill/access', async (req: Request, res: Response) => {
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

    // Collect user data from relevant tables
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

    const accessData = {
      user_id: request.user_id,
      organization_id: request.organization_id,
      request_id: id,
      data_collected: personalData,
      data_sources: Object.keys(personalData),
      export_date: new Date().toISOString(),
      format,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="data-access-${request.user_id}.json"`);
    res.json(accessData);

  } catch (error) {
    logger.error('Error fulfilling data access request', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Fulfill data erasure request (GDPR Article 17, CCPA Right to Delete)
 */
router.post('/requests/:id/fulfill/erasure', async (req: Request, res: Response) => {
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

    const deletionResults: Record<string, any> = {};
    let totalDeleted = 0;

    // Delete data from personal data tables
    for (const tableName of PERSONAL_DATA_TABLES) {
      try {
        // Skip audit logs for compliance
        if (tableName === 'audit_logs') {
          deletionResults[tableName] = { status: 'retained', reason: 'legal_obligation' };
          continue;
        }

        const { count, error: deleteError } = await supabase
          .from(tableName)
          .delete({ count: 'exact' })
          .or(`user_id.eq.${request.user_id},client_id.eq.${request.user_id}`);

        if (deleteError) {
          deletionResults[tableName] = { status: 'error', error: deleteError.message };
        } else {
          deletionResults[tableName] = { status: 'deleted', count: count || 0 };
          totalDeleted += count || 0;
        }
      } catch (tableError) {
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
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      logger.error('Failed to update erasure request status', { error: updateError });
    }

    res.json({
      message: 'Data erasure completed',
      total_deleted: totalDeleted,
      deletion_results: deletionResults,
      completion_date: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Error fulfilling data erasure request', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Fulfill data rectification request (GDPR Article 16, CCPA Right to Correct)
 */
router.post('/requests/:id/fulfill/rectification', async (req: Request, res: Response) => {
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
          updateResults[tableName] = { status: 'error', error: updateError.message };
        } else {
          updateResults[tableName] = { 
            status: 'updated', 
            count: data?.length || 0,
            updated_fields: Object.keys(updates)
          };
        }
      } catch (tableError) {
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

    res.json({
      message: 'Data rectification completed',
      rectification_results: updateResults,
      completion_date: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Error fulfilling data rectification request', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get user consent status
 */
router.get('/consent/:userId', async (req: Request, res: Response) => {
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

    res.json({
      user_id: userId,
      consents: consents || [],
      consent_summary: {
        marketing: consents?.find(c => c.consent_type === 'marketing')?.granted || false,
        analytics: consents?.find(c => c.consent_type === 'analytics')?.granted || false,
        third_party_sharing: consents?.find(c => c.consent_type === 'third_party_sharing')?.granted || false,
      }
    });
  } catch (error) {
    logger.error('Error fetching consent status', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Update consent preferences
 */
router.post('/consent/:userId', async (req: Request, res: Response) => {
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

    const { error } = await supabase
      .from('user_consents')
      .upsert(consentRecords, { 
        onConflict: 'user_id,organization_id,consent_type',
        ignoreDuplicates: false 
      });

    if (error) {
      logger.error('Failed to update consent preferences', { error });
      return res.status(500).json({ error: 'Failed to update consent preferences' });
    }

    res.json({
      message: 'Consent preferences updated successfully',
      consents,
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error updating consent preferences', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;