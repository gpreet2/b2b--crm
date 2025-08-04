// Mock Supabase client BEFORE importing the middleware
jest.mock('@supabase/supabase-js');

// Mock logger BEFORE importing the middleware
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

import request from 'supertest';
import express, { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
};

(createClient as jest.Mock).mockReturnValue(mockSupabase);

// Import AFTER mocks are set up
import {
  auditMiddleware,
  auditAction,
  auditAuth,
  auditData,
  auditSecurity,
  auditCRUD,
  createAuditLog,
  AUDITABLE_ACTIONS,
  RESOURCE_TYPES,
  AuditLogEntry,
} from '@/middleware/audit-log.middleware';

describe('Audit Logging System', () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock Supabase responses
    mockSupabase.insert.mockResolvedValue({ error: null });
    
    app = express();
    app.use(express.json());
    
    // Mock user and security context middleware
    app.use((req: Request, res: Response, next) => {
      (req as any).user = {
        id: 'user-123',
        email: 'test@example.com',
        session_id: 'session-abc',
      };
      (req as any).securityContext = {
        ip: '192.168.1.100',
        requestId: 'req-456',
        timestamp: new Date().toISOString(),
      };
      req.headers['x-organization-id'] = 'org-789';
      req.headers['x-request-id'] = 'req-456';
      next();
    });
  });

  describe('Core Audit Logging', () => {
    it('should create audit log entry with correct structure', async () => {
      const entry = {
        user_id: 'user-123',
        organization_id: 'org-789',
        action: AUDITABLE_ACTIONS.DATA_CREATE,
        entity_type: RESOURCE_TYPES.CLIENT,
        entity_id: 'client-456',
        metadata: { name: 'Test Client' },
        ip_address: '192.168.1.100',
        user_agent: 'Test Agent',
        request_id: 'req-456',
      };

      await createAuditLog(entry);

      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
      expect(mockSupabase.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          user_id: 'user-123',
          organization_id: 'org-789',
          action: AUDITABLE_ACTIONS.DATA_CREATE,
          entity_type: RESOURCE_TYPES.CLIENT,
          entity_id: 'client-456',
          ip_address: '192.168.1.100',
          user_agent: 'Test Agent',
          request_id: 'req-456',
          metadata: expect.objectContaining({
            name: 'Test Client',
            risk_level: expect.any(String),
            timestamp: expect.any(String),
            status: 'success',
          }),
        }),
      ]);
    });

    it('should determine correct risk levels', async () => {
      const testCases = [
        { action: AUDITABLE_ACTIONS.DATA_DELETE, expectedRisk: 'critical' },
        { action: AUDITABLE_ACTIONS.USER_ROLE_CHANGE, expectedRisk: 'high' },
        { action: AUDITABLE_ACTIONS.AUTH_FAILED_LOGIN, expectedRisk: 'medium' },
        { action: AUDITABLE_ACTIONS.DATA_READ, expectedRisk: 'low' },
      ];

      for (const testCase of testCases) {
        await createAuditLog({
          action: testCase.action,
          entity_type: RESOURCE_TYPES.CLIENT,
        });

        expect(mockSupabase.insert).toHaveBeenCalledWith([
          expect.objectContaining({
            metadata: expect.objectContaining({
              risk_level: testCase.expectedRisk,
            }),
          }),
        ]);
      }
    });

    it('should handle high-risk failed login attempts', async () => {
      await createAuditLog({
        action: AUDITABLE_ACTIONS.AUTH_FAILED_LOGIN,
        entity_type: RESOURCE_TYPES.USER,
        metadata: { attempt_count: 5 },
      });

      expect(mockSupabase.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          metadata: expect.objectContaining({
            risk_level: 'high', // Elevated due to high attempt count
          }),
        }),
      ]);
    });

    it('should handle Supabase errors gracefully', async () => {
      mockSupabase.insert.mockResolvedValueOnce({ error: new Error('Database error') });

      // Should not throw
      await expect(createAuditLog({
        action: AUDITABLE_ACTIONS.DATA_READ,
        entity_type: RESOURCE_TYPES.CLIENT,
      })).resolves.not.toThrow();
    });
  });

  describe('Audit Middleware', () => {
    it('should audit successful requests', async () => {
      app.get('/test/:id', 
        auditMiddleware(AUDITABLE_ACTIONS.DATA_READ, RESOURCE_TYPES.CLIENT, {
          extractEntityId: (req) => req.params.id,
        }),
        (req: Request, res: Response) => {
          res.json({ message: 'Success' });
        }
      );

      await request(app)
        .get('/test/client-123')
        .expect(200);

      // Allow time for async audit log creation
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockSupabase.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          action: AUDITABLE_ACTIONS.DATA_READ,
          entity_type: RESOURCE_TYPES.CLIENT,
          entity_id: 'client-123',
          user_id: 'user-123',
          organization_id: 'org-789',
          metadata: expect.objectContaining({
            status: 'success',
          }),
        }),
      ]);
    });

    it('should audit failed requests', async () => {
      app.get('/test/error',
        auditMiddleware(AUDITABLE_ACTIONS.DATA_READ, RESOURCE_TYPES.CLIENT),
        (req: Request, res: Response) => {
          res.status(404).json({ error: 'Not found' });
        }
      );

      await request(app)
        .get('/test/error')
        .expect(404);

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockSupabase.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          metadata: expect.objectContaining({
            status: 'failure',
            error_message: 'HTTP 404',
          }),
        }),
      ]);
    });

    it('should extract custom details', async () => {
      app.post('/test',
        auditMiddleware(AUDITABLE_ACTIONS.DATA_CREATE, RESOURCE_TYPES.CLIENT, {
          extractDetails: (req) => ({
            created_fields: Object.keys(req.body),
            custom_data: 'test',
          }),
        }),
        (req: Request, res: Response) => {
          res.json({ id: 'new-client-123' });
        }
      );

      await request(app)
        .post('/test')
        .send({ name: 'Test Client', email: 'test@example.com' })
        .expect(200);

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockSupabase.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          metadata: expect.objectContaining({
            created_fields: ['name', 'email'],
            custom_data: 'test',
            response_time_ms: expect.any(Number),
            status_code: 200,
          }),
        }),
      ]);
    });

    it('should skip auditing when shouldAudit returns false', async () => {
      app.get('/test/conditional',
        auditMiddleware(AUDITABLE_ACTIONS.DATA_READ, RESOURCE_TYPES.CLIENT, {
          shouldAudit: (req, res) => false, // Never audit
        }),
        (req: Request, res: Response) => {
          res.json({ message: 'Success' });
        }
      );

      await request(app)
        .get('/test/conditional')
        .expect(200);

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockSupabase.insert).not.toHaveBeenCalled();
    });
  });

  describe('Manual Audit Functions', () => {
    it('should audit action manually', async () => {
      const mockReq = {
        ip: '192.168.1.100',
        get: jest.fn().mockReturnValue('Test Agent'),
        headers: { 'x-organization-id': 'org-789' },
        user: { id: 'user-123' },
      } as any;

      await auditAction(
        mockReq,
        AUDITABLE_ACTIONS.DATA_UPDATE,
        RESOURCE_TYPES.CLIENT,
        'client-456',
        { updated_field: 'name' }
      );

      expect(mockSupabase.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          action: AUDITABLE_ACTIONS.DATA_UPDATE,
          entity_type: RESOURCE_TYPES.CLIENT,
          entity_id: 'client-456',
          metadata: expect.objectContaining({
            updated_field: 'name',
            status: 'success',
          }),
        }),
      ]);
    });
  });

  describe('Authentication Audit Helpers', () => {
    const mockReq = {
      ip: '192.168.1.100',
      get: jest.fn().mockReturnValue('Test Agent'),
      headers: { 'x-request-id': 'req-456' },
    } as any;

    it('should audit successful login', async () => {
      await auditAuth.login(mockReq, 'user-123', 'org-789');

      expect(mockSupabase.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          action: AUDITABLE_ACTIONS.AUTH_LOGIN,
          entity_type: RESOURCE_TYPES.USER,
          entity_id: 'user-123',
          metadata: expect.objectContaining({
            organization_id: 'org-789',
            login_method: 'workos',
            status: 'success',
          }),
        }),
      ]);
    });

    it('should audit failed login', async () => {
      await auditAuth.failedLogin(mockReq, 'test@example.com', 3);

      expect(mockSupabase.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          action: AUDITABLE_ACTIONS.AUTH_FAILED_LOGIN,
          entity_type: RESOURCE_TYPES.USER,
          metadata: expect.objectContaining({
            email: 'test@example.com',
            attempt_count: 3,
            status: 'failure',
          }),
        }),
      ]);
    });

    it('should audit logout', async () => {
      await auditAuth.logout(mockReq, 'user-123');

      expect(mockSupabase.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          action: AUDITABLE_ACTIONS.AUTH_LOGOUT,
          entity_type: RESOURCE_TYPES.USER,
          entity_id: 'user-123',
        }),
      ]);
    });

    it('should audit password reset', async () => {
      await auditAuth.passwordReset(mockReq, 'user-123');

      expect(mockSupabase.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          action: AUDITABLE_ACTIONS.AUTH_PASSWORD_RESET,
          entity_type: RESOURCE_TYPES.USER,
          entity_id: 'user-123',
        }),
      ]);
    });
  });

  describe('Data Audit Helpers', () => {
    const mockReq = {
      ip: '192.168.1.100',
      get: jest.fn().mockReturnValue('Test Agent'),
      headers: {},
    } as any;

    it('should audit data operations', async () => {
      const operations = [
        { method: auditData.read, action: AUDITABLE_ACTIONS.DATA_READ },
        { method: auditData.create, action: AUDITABLE_ACTIONS.DATA_CREATE },
        { method: auditData.update, action: AUDITABLE_ACTIONS.DATA_UPDATE },
        { method: auditData.delete, action: AUDITABLE_ACTIONS.DATA_DELETE },
        { method: auditData.export, action: AUDITABLE_ACTIONS.DATA_EXPORT },
      ];

      for (let i = 0; i < operations.length; i++) {
        const { method, action } = operations[i];
        jest.clearAllMocks(); // Clear previous calls
        
        // Call with different parameters for export vs other operations
        if (action === AUDITABLE_ACTIONS.DATA_EXPORT) {
          await method(mockReq, RESOURCE_TYPES.CLIENT, { test: 'data' });
        } else {
          await method(mockReq, RESOURCE_TYPES.CLIENT, 'client-123', { test: 'data' });
        }

        expect(mockSupabase.insert).toHaveBeenCalledWith([
          expect.objectContaining({
            action,
            entity_type: RESOURCE_TYPES.CLIENT,
            entity_id: action === AUDITABLE_ACTIONS.DATA_EXPORT ? undefined : 'client-123',
            metadata: expect.objectContaining({
              test: 'data',
            }),
          }),
        ]);
      }
    });
  });

  describe('Security Audit Helpers', () => {
    const mockReq = {
      ip: '192.168.1.100',
      get: jest.fn().mockReturnValue('Test Agent'),
      headers: {},
      path: '/api/clients',
    } as any;

    it('should audit permission denied', async () => {
      await auditSecurity.permissionDenied(
        mockReq,
        'clients:read',
        RESOURCE_TYPES.CLIENT,
        'client-123'
      );

      expect(mockSupabase.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          action: AUDITABLE_ACTIONS.SECURITY_PERMISSION_DENIED,
          entity_type: RESOURCE_TYPES.CLIENT,
          entity_id: 'client-123',
          metadata: expect.objectContaining({
            required_permission: 'clients:read',
            status: 'failure',
          }),
        }),
      ]);
    });

    it('should audit rate limit exceeded', async () => {
      await auditSecurity.rateLimitExceeded(mockReq, 'general', 60);

      expect(mockSupabase.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          action: AUDITABLE_ACTIONS.SECURITY_RATE_LIMIT_EXCEEDED,
          entity_type: RESOURCE_TYPES.SYSTEM,
          metadata: expect.objectContaining({
            limit_type: 'general',
            limit: 60,
            endpoint: '/api/clients',
            status: 'failure',
          }),
        }),
      ]);
    });

    it('should audit suspicious activity', async () => {
      await auditSecurity.suspiciousActivity(mockReq, 'sql_injection_attempt', {
        query_param: 'id=1; DROP TABLE users',
        blocked: true,
      });

      expect(mockSupabase.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          action: AUDITABLE_ACTIONS.SECURITY_SUSPICIOUS_ACTIVITY,
          entity_type: RESOURCE_TYPES.SYSTEM,
          metadata: expect.objectContaining({
            activity_type: 'sql_injection_attempt',
            query_param: 'id=1; DROP TABLE users',
            blocked: true,
            status: 'failure',
          }),
        }),
      ]);
    });
  });

  describe('CRUD Audit Middleware', () => {
    it('should audit read operations', async () => {
      app.get('/clients/:id', auditCRUD.read(RESOURCE_TYPES.CLIENT), (req: Request, res: Response) => {
        res.json({ id: req.params.id, name: 'Test Client' });
      });

      await request(app)
        .get('/clients/client-123')
        .expect(200);

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockSupabase.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          action: AUDITABLE_ACTIONS.DATA_READ,
          entity_type: RESOURCE_TYPES.CLIENT,
          entity_id: 'client-123',
        }),
      ]);
    });

    it('should audit create operations', async () => {
      app.post('/clients', auditCRUD.create(RESOURCE_TYPES.CLIENT), (req: Request, res: Response) => {
        res.json({ id: 'new-client-123', ...req.body });
      });

      await request(app)
        .post('/clients')
        .send({ name: 'New Client', email: 'new@example.com' })
        .expect(200);

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockSupabase.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          action: AUDITABLE_ACTIONS.DATA_CREATE,
          entity_type: RESOURCE_TYPES.CLIENT,
          metadata: expect.objectContaining({
            created_fields: ['name', 'email'],
          }),
        }),
      ]);
    });

    it('should audit update operations', async () => {
      app.put('/clients/:id', auditCRUD.update(RESOURCE_TYPES.CLIENT), (req: Request, res: Response) => {
        res.json({ id: req.params.id, ...req.body });
      });

      await request(app)
        .put('/clients/client-123')
        .send({ name: 'Updated Client' })
        .expect(200);

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockSupabase.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          action: AUDITABLE_ACTIONS.DATA_UPDATE,
          entity_type: RESOURCE_TYPES.CLIENT,
          entity_id: 'client-123',
          metadata: expect.objectContaining({
            updated_fields: ['name'],
          }),
        }),
      ]);
    });

    it('should audit delete operations', async () => {
      app.delete('/clients/:id', auditCRUD.delete(RESOURCE_TYPES.CLIENT), (req: Request, res: Response) => {
        res.status(204).send();
      });

      await request(app)
        .delete('/clients/client-123')
        .expect(204);

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockSupabase.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          action: AUDITABLE_ACTIONS.DATA_DELETE,
          entity_type: RESOURCE_TYPES.CLIENT,
          entity_id: 'client-123',
        }),
      ]);
    });
  });

  describe('Context Extraction', () => {
    it('should extract complete audit context from request', async () => {
      app.get('/test', 
        auditMiddleware(AUDITABLE_ACTIONS.DATA_READ, RESOURCE_TYPES.CLIENT),
        (req: Request, res: Response) => {
          res.json({ message: 'Success' });
        }
      );

      await request(app)
        .get('/test')
        .set('User-Agent', 'Test Browser')
        .set('X-Forwarded-For', '203.0.113.1')
        .expect(200);

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockSupabase.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          user_id: 'user-123',
          organization_id: 'org-789',
          ip_address: expect.any(String), // Should extract from X-Forwarded-For or req.ip
          user_agent: 'Test Browser',
          request_id: 'req-456',
        }),
      ]);
    });

    it('should handle missing context gracefully', async () => {
      // Create app without mock middleware
      const simpleApp = express();
      simpleApp.use(express.json());
      
      simpleApp.get('/test',
        auditMiddleware(AUDITABLE_ACTIONS.DATA_READ, RESOURCE_TYPES.CLIENT),
        (req: Request, res: Response) => {
          res.json({ message: 'Success' });
        }
      );

      await request(simpleApp)
        .get('/test')
        .expect(200);

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockSupabase.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          user_id: undefined,
          organization_id: undefined,
          // Should still create audit log even without user context
          action: AUDITABLE_ACTIONS.DATA_READ,
          entity_type: RESOURCE_TYPES.CLIENT,
        }),
      ]);
    });
  });

  describe('Performance and Error Handling', () => {
    it('should handle audit logging errors without affecting request', async () => {
      mockSupabase.insert.mockRejectedValueOnce(new Error('Supabase connection failed'));

      app.get('/test',
        auditMiddleware(AUDITABLE_ACTIONS.DATA_READ, RESOURCE_TYPES.CLIENT),
        (req: Request, res: Response) => {
          res.json({ message: 'Success' });
        }
      );

      // Request should still succeed even if audit logging fails
      await request(app)
        .get('/test')
        .expect(200);
    });

    it('should include response time in audit details', async () => {
      app.get('/slow-test',
        auditMiddleware(AUDITABLE_ACTIONS.DATA_READ, RESOURCE_TYPES.CLIENT),
        (req: Request, res: Response) => {
          // Simulate slow operation
          setTimeout(() => res.json({ message: 'Success' }), 10);
        }
      );

      await request(app)
        .get('/slow-test')
        .expect(200);

      await new Promise(resolve => setTimeout(resolve, 20));

      expect(mockSupabase.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          metadata: expect.objectContaining({
            response_time_ms: expect.any(Number),
          }),
        }),
      ]);

      const auditCall = mockSupabase.insert.mock.calls[0][0][0];
      expect(auditCall.metadata.response_time_ms).toBeGreaterThan(0);
    });
  });

  describe('Constants and Configuration', () => {
    it('should have all required auditable actions', () => {
      expect(AUDITABLE_ACTIONS).toHaveProperty('AUTH_LOGIN');
      expect(AUDITABLE_ACTIONS).toHaveProperty('DATA_CREATE');
      expect(AUDITABLE_ACTIONS).toHaveProperty('SECURITY_PERMISSION_DENIED');
      expect(AUDITABLE_ACTIONS).toHaveProperty('SYSTEM_CONFIG_CHANGE');
    });

    it('should have all required resource types', () => {
      expect(RESOURCE_TYPES).toHaveProperty('USER');
      expect(RESOURCE_TYPES).toHaveProperty('CLIENT');
      expect(RESOURCE_TYPES).toHaveProperty('ORGANIZATION');
      expect(RESOURCE_TYPES).toHaveProperty('SYSTEM');
    });
  });
});