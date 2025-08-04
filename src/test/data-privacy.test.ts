import request from 'supertest';
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dataPrivacyRouter, { DataRequestType, RequestStatus } from '@/routes/simple-data-privacy';

const app = express();
app.use(express.json());

// Mock Supabase
jest.mock('@supabase/supabase-js');
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  or: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  upsert: jest.fn().mockReturnThis(),
};

(createClient as jest.Mock).mockReturnValue(mockSupabase);

// Mock crypto module
jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'mock-uuid-123'),
}));

// Mock logger
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// Add middleware to mock user context
app.use((req: any, res: any, next) => {
  req.user = {
    id: 'user-123',
    email: 'test@example.com',
  };
  req.headers['x-organization-id'] = 'org-789';
  next();
});

app.use('/api/privacy', dataPrivacyRouter);

describe('Data Privacy API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/privacy/requests', () => {
    it('should create a new data privacy request', async () => {
      const mockRequest = {
        id: 'req-123',
        status: RequestStatus.PENDING,
        fulfillment_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      mockSupabase.insert.mockResolvedValueOnce({ data: mockRequest, error: null });

      const response = await request(app)
        .post('/api/privacy/requests')
        .send({
          request_type: DataRequestType.ACCESS,
          description: 'I need access to my personal data',
          legal_basis: 'gdpr',
          requester_email: 'test@example.com',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        id: 'req-123',
        status: RequestStatus.PENDING,
        verification_required: true,
        message: 'Request created. Verification email sent.',
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('data_privacy_requests');
      expect(mockSupabase.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          request_type: DataRequestType.ACCESS,
          legal_basis: 'gdpr',
          requester_email: 'test@example.com',
          organization_id: 'org-789',
          status: RequestStatus.PENDING,
        }),
      ]);
    });

    it('should reject invalid request types', async () => {
      const response = await request(app)
        .post('/api/privacy/requests')
        .send({
          request_type: 'invalid_type',
          requester_email: 'test@example.com',
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid request type');
    });

    it('should require organization ID', async () => {
      const appWithoutOrgId = express();
      appWithoutOrgId.use(express.json());
      appWithoutOrgId.use((req: any, res: any, next) => {
        req.user = { id: 'user-123' };
        // No organization ID header
        next();
      });
      appWithoutOrgId.use('/api/privacy', dataPrivacyRouter);

      const response = await request(appWithoutOrgId)
        .post('/api/privacy/requests')
        .send({
          request_type: DataRequestType.ACCESS,
          requester_email: 'test@example.com',
        })
        .expect(400);

      expect(response.body.error).toBe('Organization ID required');
    });
  });

  describe('POST /api/privacy/requests/:id/verify', () => {
    it('should verify a data privacy request', async () => {
      const mockRequest = {
        id: 'req-123',
        verification_token: 'token-456',
        verification_expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        status: RequestStatus.PENDING,
      };

      mockSupabase.select.mockResolvedValueOnce({ data: mockRequest, error: null });
      mockSupabase.update.mockResolvedValueOnce({ error: null });

      const response = await request(app)
        .post('/api/privacy/requests/req-123/verify')
        .send({
          verification_token: 'token-456',
        })
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'Request verified successfully',
        status: RequestStatus.IN_PROGRESS,
      });

      expect(mockSupabase.update).toHaveBeenCalledWith({
        requester_verified: true,
        status: RequestStatus.IN_PROGRESS,
        updated_at: expect.any(String),
      });
    });

    it('should reject invalid verification tokens', async () => {
      const mockRequest = {
        id: 'req-123',
        verification_token: 'token-456',
        verification_expires_at: new Date(Date.now() + 3600000).toISOString(),
      };

      mockSupabase.select.mockResolvedValueOnce({ data: mockRequest, error: null });

      const response = await request(app)
        .post('/api/privacy/requests/req-123/verify')
        .send({
          verification_token: 'wrong-token',
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid verification token');
    });

    it('should reject expired verification tokens', async () => {
      const mockRequest = {
        id: 'req-123',
        verification_token: 'token-456',
        verification_expires_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      };

      mockSupabase.select.mockResolvedValueOnce({ data: mockRequest, error: null });

      const response = await request(app)
        .post('/api/privacy/requests/req-123/verify')
        .send({
          verification_token: 'token-456',
        })
        .expect(400);

      expect(response.body.error).toBe('Verification token expired');
    });
  });

  describe('GET /api/privacy/requests', () => {
    it('should list all data privacy requests for organization', async () => {
      const mockRequests = [
        {
          id: 'req-1',
          request_type: DataRequestType.ACCESS,
          status: RequestStatus.PENDING,
          created_at: new Date().toISOString(),
        },
        {
          id: 'req-2',
          request_type: DataRequestType.ERASURE,
          status: RequestStatus.COMPLETED,
          created_at: new Date().toISOString(),
        },
      ];

      mockSupabase.select.mockResolvedValueOnce({ 
        data: mockRequests, 
        error: null, 
        count: 2 
      });

      const response = await request(app)
        .get('/api/privacy/requests')
        .expect(200);

      expect(response.body).toMatchObject({
        requests: mockRequests,
        total: 2,
        page: 1,
        limit: 50,
      });

      expect(mockSupabase.eq).toHaveBeenCalledWith('organization_id', 'org-789');
    });

    it('should filter requests by status', async () => {
      mockSupabase.select.mockResolvedValueOnce({ 
        data: [], 
        error: null, 
        count: 0 
      });

      await request(app)
        .get('/api/privacy/requests?status=pending&request_type=access')
        .expect(200);

      expect(mockSupabase.eq).toHaveBeenCalledWith('status', 'pending');
      expect(mockSupabase.eq).toHaveBeenCalledWith('request_type', 'access');
    });
  });

  describe('GET /api/privacy/requests/:id', () => {
    it('should get specific data privacy request', async () => {
      const mockRequest = {
        id: 'req-123',
        request_type: DataRequestType.ACCESS,
        status: RequestStatus.PENDING,
        created_at: new Date().toISOString(),
      };

      mockSupabase.single.mockResolvedValueOnce({ data: mockRequest, error: null });

      const response = await request(app)
        .get('/api/privacy/requests/req-123')
        .expect(200);

      expect(response.body).toMatchObject(mockRequest);
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'req-123');
      expect(mockSupabase.eq).toHaveBeenCalledWith('organization_id', 'org-789');
    });

    it('should return 404 for non-existent request', async () => {
      mockSupabase.single.mockResolvedValueOnce({ data: null, error: new Error('Not found') });

      const response = await request(app)
        .get('/api/privacy/requests/non-existent')
        .expect(404);

      expect(response.body.error).toBe('Request not found');
    });
  });

  describe('POST /api/privacy/requests/:id/fulfill/access', () => {
    it('should fulfill data access request', async () => {
      const mockRequest = {
        id: 'req-123',
        request_type: DataRequestType.ACCESS,
        user_id: 'user-456',
        organization_id: 'org-789',
        requester_verified: true,
      };

      mockSupabase.single.mockResolvedValueOnce({ data: mockRequest, error: null });
      
      // Mock data from various tables
      mockSupabase.select.mockResolvedValue({ data: [{ id: 'data-1', name: 'Test Data' }], error: null });
      mockSupabase.update.mockResolvedValueOnce({ error: null });

      const response = await request(app)
        .post('/api/privacy/requests/req-123/fulfill/access')
        .send({ format: 'json' })
        .expect(200);

      expect(response.headers['content-type']).toContain('application/json');
      expect(response.headers['content-disposition']).toContain('attachment');
      
      expect(mockSupabase.update).toHaveBeenCalledWith({
        status: RequestStatus.COMPLETED,
        fulfilled_at: expect.any(String),
        fulfillment_data: { access_data_generated: true, format: 'json' },
        updated_at: expect.any(String),
      });
    });

    it('should reject unverified requests', async () => {
      const mockRequest = {
        id: 'req-123',
        request_type: DataRequestType.ACCESS,
        requester_verified: false,
      };

      mockSupabase.single.mockResolvedValueOnce({ data: mockRequest, error: null });

      const response = await request(app)
        .post('/api/privacy/requests/req-123/fulfill/access')
        .expect(400);

      expect(response.body.error).toBe('Request not verified');
    });

    it('should reject wrong request type', async () => {
      const mockRequest = {
        id: 'req-123',
        request_type: DataRequestType.ERASURE,
        requester_verified: true,
      };

      mockSupabase.single.mockResolvedValueOnce({ data: mockRequest, error: null });

      const response = await request(app)
        .post('/api/privacy/requests/req-123/fulfill/access')
        .expect(400);

      expect(response.body.error).toBe('Invalid request type for this operation');
    });
  });

  describe('POST /api/privacy/requests/:id/fulfill/erasure', () => {
    it('should fulfill data erasure request', async () => {
      const mockRequest = {
        id: 'req-123',
        request_type: DataRequestType.ERASURE,
        user_id: 'user-456',
        requester_verified: true,
      };

      mockSupabase.single.mockResolvedValueOnce({ data: mockRequest, error: null });
      
      // Mock audit logs check
      mockSupabase.select.mockResolvedValueOnce({ data: [], error: null });
      
      // Mock deletion results
      mockSupabase.delete.mockResolvedValue({ count: 5, error: null });
      mockSupabase.update.mockResolvedValueOnce({ error: null });

      const response = await request(app)
        .post('/api/privacy/requests/req-123/fulfill/erasure')
        .send({ confirm_deletion: true })
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'Data erasure completed',
        total_deleted: expect.any(Number),
        deletion_results: expect.any(Object),
        completion_date: expect.any(String),
      });

      expect(mockSupabase.update).toHaveBeenCalledWith({
        status: RequestStatus.COMPLETED,
        fulfilled_at: expect.any(String),
        fulfillment_data: expect.objectContaining({
          total_deleted: expect.any(Number),
        }),
        updated_at: expect.any(String),
      });
    });

    it('should require deletion confirmation', async () => {
      const response = await request(app)
        .post('/api/privacy/requests/req-123/fulfill/erasure')
        .send({ confirm_deletion: false })
        .expect(400);

      expect(response.body.error).toBe('Deletion confirmation required');
    });
  });

  describe('POST /api/privacy/requests/:id/fulfill/rectification', () => {
    it('should fulfill data rectification request', async () => {
      const mockRequest = {
        id: 'req-123',
        request_type: DataRequestType.RECTIFICATION,
        user_id: 'user-456',
        requester_verified: true,
      };

      const corrections = {
        users: { name: 'Corrected Name', email: 'new@example.com' },
        clients: { phone: '+1234567890' },
      };

      mockSupabase.single.mockResolvedValueOnce({ data: mockRequest, error: null });
      mockSupabase.update.mockResolvedValue({ data: [{ id: 'updated-1' }], error: null });

      const response = await request(app)
        .post('/api/privacy/requests/req-123/fulfill/rectification')
        .send({ corrections })
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'Data rectification completed',
        rectification_results: expect.any(Object),
        completion_date: expect.any(String),
      });

      // Verify updates were called for each table
      expect(mockSupabase.update).toHaveBeenCalledWith(corrections.users);
      expect(mockSupabase.update).toHaveBeenCalledWith(corrections.clients);
    });

    it('should require corrections data', async () => {
      const response = await request(app)
        .post('/api/privacy/requests/req-123/fulfill/rectification')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Corrections data required');
    });
  });

  describe('GET /api/privacy/consent/:userId', () => {
    it('should get user consent status', async () => {
      const mockConsents = [
        { consent_type: 'marketing', granted: true },
        { consent_type: 'analytics', granted: false },
      ];

      mockSupabase.select.mockResolvedValueOnce({ data: mockConsents, error: null });

      const response = await request(app)
        .get('/api/privacy/consent/user-456')
        .expect(200);

      expect(response.body).toMatchObject({
        user_id: 'user-456',
        consents: mockConsents,
        consent_summary: {
          marketing: true,
          analytics: false,
          third_party_sharing: false,
        },
      });

      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', 'user-456');
      expect(mockSupabase.eq).toHaveBeenCalledWith('organization_id', 'org-789');
    });
  });

  describe('POST /api/privacy/consent/:userId', () => {
    it('should update consent preferences', async () => {
      const consents = {
        marketing: true,
        analytics: false,
        third_party_sharing: true,
      };

      mockSupabase.upsert.mockResolvedValueOnce({ error: null });

      const response = await request(app)
        .post('/api/privacy/consent/user-456')
        .send({ consents })
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'Consent preferences updated successfully',
        consents,
        updated_at: expect.any(String),
      });

      expect(mockSupabase.upsert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            user_id: 'user-456',
            organization_id: 'org-789',
            consent_type: 'marketing',
            granted: true,
          }),
          expect.objectContaining({
            user_id: 'user-456',
            organization_id: 'org-789',
            consent_type: 'analytics',
            granted: false,
          }),
          expect.objectContaining({
            user_id: 'user-456',
            organization_id: 'org-789',
            consent_type: 'third_party_sharing',
            granted: true,
          }),
        ]),
        expect.any(Object)
      );
    });

    it('should require consents data', async () => {
      const response = await request(app)
        .post('/api/privacy/consent/user-456')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Consents data required');
    });
  });

  describe('Data Request Type Validation', () => {
    it('should accept all valid request types', async () => {
      const validTypes = [
        DataRequestType.ACCESS,
        DataRequestType.PORTABILITY,
        DataRequestType.RECTIFICATION,
        DataRequestType.ERASURE,
        DataRequestType.RESTRICTION,
        DataRequestType.OBJECTION,
      ];

      mockSupabase.insert.mockResolvedValue({ 
        data: { id: 'req-123', status: RequestStatus.PENDING }, 
        error: null 
      });

      for (const requestType of validTypes) {
        await request(app)
          .post('/api/privacy/requests')
          .send({
            request_type: requestType,
            requester_email: 'test@example.com',
          })
          .expect(201);
      }
    });
  });

  describe('Request Status Validation', () => {
    it('should handle all valid request statuses', () => {
      const validStatuses = [
        RequestStatus.PENDING,
        RequestStatus.IN_PROGRESS,
        RequestStatus.COMPLETED,
        RequestStatus.REJECTED,
        RequestStatus.EXPIRED,
      ];

      expect(validStatuses).toHaveLength(5);
      expect(validStatuses).toContain(RequestStatus.PENDING);
      expect(validStatuses).toContain(RequestStatus.COMPLETED);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockSupabase.insert.mockResolvedValueOnce({ 
        data: null, 
        error: new Error('Database connection failed') 
      });

      const response = await request(app)
        .post('/api/privacy/requests')
        .send({
          request_type: DataRequestType.ACCESS,
          requester_email: 'test@example.com',
        })
        .expect(500);

      expect(response.body.error).toBe('Failed to create request');
    });

    it('should handle unexpected errors', async () => {
      mockSupabase.insert.mockRejectedValueOnce(new Error('Unexpected error'));

      const response = await request(app)
        .post('/api/privacy/requests')
        .send({
          request_type: DataRequestType.ACCESS,
          requester_email: 'test@example.com',
        })
        .expect(500);

      expect(response.body.error).toBe('Internal server error');
    });
  });
});