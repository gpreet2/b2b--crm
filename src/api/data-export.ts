
import { createClient } from '@supabase/supabase-js';
import archiver from 'archiver';
import { Request, Response, Router, NextFunction } from 'express';
import { Parser } from 'json2csv';


const router = Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Middleware to verify admin/owner permissions
const verifyExportPermission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if user is owner or admin of the organization
    const orgId = req.params.orgId || req.query.orgId;
    const { data: userOrg } = await supabase
      .from('user_organizations')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', orgId)
      .single();

    if (!userOrg || !['owner', 'admin'].includes(userOrg.role)) {
      return res.status(403).json({ error: 'Insufficient permissions for data export' });
    }

    // Map Supabase user to our User interface
    req.user = {
      id: user.id,
      name: user.email?.split('@')[0] ?? 'User', // Derive name from email or use default
      email: user.email ?? '',
      role: userOrg.role as 'admin' | 'coach' | 'staff',
      createdAt: new Date(user.created_at ?? Date.now()),
    };
    req.organizationId = orgId as string;
    next();
  } catch (_error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Export organization data
router.get(
  '/organizations/:orgId/export',
  verifyExportPermission,
  async (req: Request, res: Response) => {
    try {
      const { format = 'json' } = req.query;
      const orgId = req.params.orgId;

      // Fetch all organization data
      const [
        { data: organization },
        { data: users },
        { data: clients },
        { data: events },
        { data: memberships },
        { data: tags },
      ] = await Promise.all([
        supabase.from('organizations').select('*').eq('id', orgId).single(),
        supabase.from('user_organizations').select('*, users(*)').eq('organization_id', orgId),
        supabase.from('client_organizations').select('*, clients(*)').eq('organization_id', orgId),
        supabase.from('events').select('*').eq('organization_id', orgId),
        supabase.from('memberships').select('*, membership_plans(*)').eq('organization_id', orgId),
        supabase.from('tags').select('*').eq('organization_id', orgId),
      ]);

      const exportData = {
        organization,
        users: users ?? [],
        clients: clients ?? [],
        events: events ?? [],
        memberships: memberships ?? [],
        tags: tags ?? [],
        exported_at: new Date().toISOString(),
        version: '1.0',
      };

      if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="org-${orgId}-export.json"`);
        res.json(exportData);
      } else if (format === 'csv') {
        // Create ZIP with multiple CSV files
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="org-${orgId}-export.zip"`);

        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.pipe(res);

        // Convert each data type to CSV
        for (const [key, data] of Object.entries(exportData)) {
          if (Array.isArray(data) && data.length > 0) {
            const parser = new Parser();
            const csv = parser.parse(data);
            archive.append(csv, { name: `${key}.csv` });
          }
        }

        void archive.finalize();
      }
    } catch (error) {
      console.error('Export error:', error);
      res.status(500).json({ error: 'Export failed' });
    }
  }
);

// Export specific data types
router.get(
  '/organizations/:orgId/export/:dataType',
  verifyExportPermission,
  async (req: Request, res: Response) => {
    try {
      const { orgId, dataType } = req.params;
      const { format = 'json', startDate, endDate } = req.query;

      let query = supabase.from(dataType).select('*').eq('organization_id', orgId);

      // Add date filters if provided
      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (format === 'json') {
        res.json({ [dataType]: data, count: data?.length || 0 });
      } else if (format === 'csv') {
        const parser = new Parser();
        const csv = parser.parse(data || []);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${dataType}-export.csv"`);
        res.send(csv);
      }
    } catch (error) {
      console.error('Export error:', error);
      res.status(500).json({ error: 'Export failed' });
    }
  }
);

// Export audit logs
router.get(
  '/organizations/:orgId/export/audit-logs',
  verifyExportPermission,
  async (req: Request, res: Response) => {
    try {
      const { orgId } = req.params;
      const { startDate, endDate, userId, action } = req.query;

      let query = supabase
        .from('audit_logs')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (startDate) query = query.gte('created_at', startDate);
      if (endDate) query = query.lte('created_at', endDate);
      if (userId) query = query.eq('user_id', userId);
      if (action) query = query.eq('action', action);

      const { data, error } = await query;

      if (error) throw error;

      res.json({
        audit_logs: data,
        count: data?.length || 0,
        filters: { startDate, endDate, userId, action },
      });
    } catch (error) {
      console.error('Audit log export error:', error);
      res.status(500).json({ error: 'Audit log export failed' });
    }
  }
);

// Backup endpoint for admins
router.post('/backup/manual', (req: Request, res: Response) => {
  try {
    // Verify super admin token
    const adminToken = req.headers['x-admin-token'];
    if (adminToken !== process.env.ADMIN_BACKUP_TOKEN) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // This endpoint would trigger the backup script
    // In production, this would queue a job
    res.json({
      message: 'Backup job queued',
      job_id: `backup-${Date.now()}`,
      estimated_time: '5-10 minutes',
    });
  } catch (_error) {
    res.status(500).json({ error: 'Backup initiation failed' });
  }
});

// Data retention compliance export
router.get(
  '/organizations/:orgId/gdpr-export/:userId',
  verifyExportPermission,
  async (req: Request, res: Response) => {
    try {
      const { orgId: _orgId, userId } = req.params;

      // Fetch all user data across tables
      const userData = await Promise.all([
        supabase.from('users').select('*').eq('id', userId).single(),
        supabase.from('clients').select('*').eq('user_id', userId).single(),
        supabase.from('event_participants').select('*, events(*)').eq('user_id', userId),
        supabase.from('memberships').select('*').eq('client_id', userId),
        supabase.from('notifications').select('*').eq('user_id', userId),
        supabase.from('audit_logs').select('*').eq('user_id', userId),
      ]);

      const [user, client, participations, memberships, notifications, auditLogs] = userData;

      const gdprExport = {
        user: user.data,
        client: client.data,
        event_participations: participations.data ?? [],
        memberships: memberships.data ?? [],
        notifications: notifications.data ?? [],
        audit_logs: auditLogs.data ?? [],
        export_date: new Date().toISOString(),
        export_reason: 'GDPR Data Request',
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="gdpr-export-${userId}.json"`);
      res.json(gdprExport);
    } catch (error) {
      console.error('GDPR export error:', error);
      res.status(500).json({ error: 'GDPR export failed' });
    }
  }
);

export default router;
