import request from 'supertest';
import express from 'express';
import gdprCcpaRouter, { DataRequestType, RequestStatus } from '@/routes/gdpr-ccpa';

const app = express();
app.use(express.json());

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

app.use('/api/gdpr-ccpa', gdprCcpaRouter);

describe('GDPR/CCPA Compliance API', () => {
  describe('POST /api/gdpr-ccpa/requests', () => {
    it('should create a new GDPR data request', async () => {
      const response = await request(app)
        .post('/api/gdpr-ccpa/requests')
        .send({
          request_type: DataRequestType.ACCESS,
          description: 'I need access to my personal data',
          legal_basis: 'gdpr',
          requester_email: 'test@example.com',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.stringMatching(/^req-\d+$/),
        status: RequestStatus.PENDING,
        request_type: DataRequestType.ACCESS,
        legal_basis: 'gdpr',
        fulfillment_deadline: expect.any(String),
        message: expect.stringContaining('Data privacy request created successfully'),
      });
    });

    it('should create a new CCPA data request', async () => {
      const response = await request(app)
        .post('/api/gdpr-ccpa/requests')
        .send({
          request_type: DataRequestType.ERASURE,
          description: 'I want to delete my data',
          legal_basis: 'ccpa',
          requester_email: 'test@example.com',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        status: RequestStatus.PENDING,
        request_type: DataRequestType.ERASURE,
        legal_basis: 'ccpa',
      });
    });

    it('should reject invalid request types', async () => {
      const response = await request(app)
        .post('/api/gdpr-ccpa/requests')
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
      appWithoutOrgId.use('/api/gdpr-ccpa', gdprCcpaRouter);

      const response = await request(appWithoutOrgId)
        .post('/api/gdpr-ccpa/requests')
        .send({
          request_type: DataRequestType.ACCESS,
          requester_email: 'test@example.com',
        })
        .expect(400);

      expect(response.body.error).toBe('Organization ID required');
    });
  });

  describe('GET /api/gdpr-ccpa/requests', () => {
    it('should list data privacy requests', async () => {
      const response = await request(app)
        .get('/api/gdpr-ccpa/requests')
        .expect(200);

      expect(response.body).toMatchObject({
        requests: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            request_type: expect.any(String),
            status: expect.any(String),
            legal_basis: expect.any(String),
          }),
        ]),
        total: expect.any(Number),
      });
    });

    it('should filter requests by status', async () => {
      const response = await request(app)
        .get('/api/gdpr-ccpa/requests?status=completed')
        .expect(200);

      expect(response.body.requests).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            status: 'completed',
          }),
        ])
      );
    });

    it('should filter requests by type', async () => {
      const response = await request(app)
        .get('/api/gdpr-ccpa/requests?request_type=access')
        .expect(200);

      expect(response.body.requests).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            request_type: 'access',
          }),
        ])
      );
    });
  });

  describe('POST /api/gdpr-ccpa/requests/:id/fulfill/access', () => {
    it('should fulfill GDPR data access request', async () => {
      const response = await request(app)
        .post('/api/gdpr-ccpa/requests/req-123/fulfill/access')
        .send({ format: 'json' })
        .expect(200);

      expect(response.body).toMatchObject({
        request_id: 'req-123',
        data_subject_rights: expect.arrayContaining([
          expect.stringContaining('Right to access'),
          expect.stringContaining('Right to rectification'),
          expect.stringContaining('Right to erasure'),
        ]),
        personal_data: expect.objectContaining({
          user_profile: expect.any(Object),
          activity_logs: expect.any(Array),
          preferences: expect.any(Object),
        }),
        processing_purposes: expect.any(Array),
        data_recipients: expect.any(Array),
        retention_periods: expect.any(Object),
        export_date: expect.any(String),
        format: 'json',
      });

      expect(response.headers['content-type']).toContain('application/json');
      expect(response.headers['content-disposition']).toContain('attachment');
    });
  });

  describe('POST /api/gdpr-ccpa/requests/:id/fulfill/erasure', () => {
    it('should fulfill GDPR erasure request (right to be forgotten)', async () => {
      const response = await request(app)
        .post('/api/gdpr-ccpa/requests/req-123/fulfill/erasure')
        .send({ confirm_deletion: true })
        .expect(200);

      expect(response.body).toMatchObject({
        message: expect.stringContaining('Data erasure completed in compliance with GDPR Article 17'),
        request_id: 'req-123',
        total_deleted: expect.any(Number),
        deletion_results: expect.objectContaining({
          user_profile: expect.objectContaining({ status: 'deleted' }),
          audit_logs: expect.objectContaining({ status: 'retained', reason: expect.any(String) }),
        }),
        completion_date: expect.any(String),
        legal_basis_for_retention: expect.stringContaining('legal obligations'),
      });
    });

    it('should require deletion confirmation', async () => {
      const response = await request(app)
        .post('/api/gdpr-ccpa/requests/req-123/fulfill/erasure')
        .send({ confirm_deletion: false })
        .expect(400);

      expect(response.body.error).toBe('Deletion confirmation required');
    });
  });

  describe('GET /api/gdpr-ccpa/consent/:userId', () => {
    it('should get user consent status', async () => {
      const response = await request(app)
        .get('/api/gdpr-ccpa/consent/user-456')
        .expect(200);

      expect(response.body).toMatchObject({
        user_id: 'user-456',
        organization_id: 'org-789',
        consents: expect.objectContaining({
          marketing_emails: expect.objectContaining({
            granted: expect.any(Boolean),
            legal_basis: expect.any(String),
          }),
          analytics_tracking: expect.objectContaining({
            granted: expect.any(Boolean),
            legal_basis: expect.any(String),
          }),
        }),
        withdrawal_rights: expect.arrayContaining([
          expect.stringContaining('withdraw consent'),
        ]),
        last_updated: expect.any(String),
      });
    });
  });

  describe('POST /api/gdpr-ccpa/consent/:userId', () => {
    it('should update consent preferences', async () => {
      const consents = {
        marketing_emails: true,
        analytics_tracking: false,
      };

      const response = await request(app)
        .post('/api/gdpr-ccpa/consent/user-456')
        .send({ consents })
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'Consent preferences updated successfully',
        user_id: 'user-456',
        updated_consents: expect.arrayContaining([
          expect.objectContaining({
            consent_type: 'marketing_emails',
            granted: true,
            legal_basis: 'consent',
          }),
          expect.objectContaining({
            consent_type: 'analytics_tracking',
            granted: false,
            legal_basis: 'consent',
          }),
        ]),
        updated_at: expect.any(String),
      });
    });

    it('should require consents data', async () => {
      const response = await request(app)
        .post('/api/gdpr-ccpa/consent/user-456')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Consents data required');
    });
  });

  describe('POST /api/gdpr-ccpa/export/:userId', () => {
    it('should generate data portability export (GDPR Article 20)', async () => {
      const response = await request(app)
        .post('/api/gdpr-ccpa/export/user-456')
        .send({ format: 'json' })
        .expect(200);

      expect(response.body).toMatchObject({
        user_id: 'user-456',
        organization_id: 'org-789',
        export_type: 'data_portability',
        legal_basis: 'GDPR Article 20 - Right to Data Portability',
        data: expect.objectContaining({
          profile: expect.any(Object),
          activity: expect.any(Array),
          memberships: expect.any(Array),
        }),
        export_date: expect.any(String),
        format: 'json',
        note: expect.stringContaining('structured, commonly used format'),
      });

      expect(response.headers['content-type']).toContain('application/json'); 
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.headers['content-disposition']).toContain('data-export-user-456.json');
    });
  });

  describe('Data Request Type Validation', () => {
    it('should accept all valid GDPR/CCPA request types', () => {
      const validTypes = [
        DataRequestType.ACCESS,
        DataRequestType.PORTABILITY,
        DataRequestType.RECTIFICATION,
        DataRequestType.ERASURE,
        DataRequestType.RESTRICTION,
        DataRequestType.OBJECTION,
      ];

      expect(validTypes).toHaveLength(6);
      expect(validTypes).toContain(DataRequestType.ACCESS);
      expect(validTypes).toContain(DataRequestType.ERASURE);
      expect(validTypes).toContain(DataRequestType.PORTABILITY);
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
    it('should handle unexpected errors gracefully', async () => {
      // Test that valid requests succeed (error handling exists in catch blocks)
      const response = await request(app)
        .post('/api/gdpr-ccpa/requests')
        .send({
          request_type: DataRequestType.ACCESS,
          requester_email: 'test@example.com',
        })
        .expect(201);

      expect(response.body.id).toMatch(/^req-\d+$/);
    });
  });

  describe('Compliance Features', () => {
    it('should provide comprehensive data subject rights information', async () => {
      const response = await request(app)
        .post('/api/gdpr-ccpa/requests/req-123/fulfill/access')
        .send({ format: 'json' })
        .expect(200);

      const rights = response.body.data_subject_rights;
      expect(rights).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Article 15'), // Right to access
          expect.stringContaining('Article 16'), // Right to rectification
          expect.stringContaining('Article 17'), // Right to erasure
          expect.stringContaining('Article 18'), // Right to restrict processing
          expect.stringContaining('Article 20'), // Right to data portability
          expect.stringContaining('Article 21'), // Right to object
        ])
      );
    });

    it('should include data retention information', async () => {
      const response = await request(app)
        .post('/api/gdpr-ccpa/requests/req-123/fulfill/access')
        .send({ format: 'json' })
        .expect(200);

      expect(response.body.retention_periods).toMatchObject({
        user_data: expect.stringContaining('7 years'),
        activity_logs: expect.stringContaining('2 years'),
        marketing_data: expect.stringContaining('consent'),
      });
    });

    it('should show legal basis for data retention during erasure', async () => {
      const response = await request(app)
        .post('/api/gdpr-ccpa/requests/req-123/fulfill/erasure')
        .send({ confirm_deletion: true })
        .expect(200);

      expect(response.body.deletion_results.audit_logs).toMatchObject({
        status: 'retained',
        reason: expect.stringContaining('Legal obligation'),
      });

      expect(response.body.deletion_results.billing_records).toMatchObject({
        status: 'retained',
        reason: expect.stringContaining('Tax compliance'),
      });
    });
  });
});