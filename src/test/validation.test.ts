import express from 'express';
import request from 'supertest';
import { z } from 'zod';

import { validate, schemas, requireOrganizationContext } from '../middleware/validation';
// Simple error handler for tests
const errorHandler = (err: any, req: any, res: any, next: any) => {
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message,
      statusCode: status,
      details: err.details,
    },
  });
};

describe('Validation Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('validate middleware', () => {
    it('should validate request body', async () => {
      const bodySchema = z.object({
        name: z.string().min(1),
        email: schemas.email,
      });

      app.post('/test', validate({ body: bodySchema }), (req, res) => {
        res.json({ success: true, data: req.body });
      });
      app.use(errorHandler);

      // Valid request
      const validResponse = await request(app)
        .post('/test')
        .send({ name: 'John Doe', email: 'JOHN@EXAMPLE.COM' })
        .expect(200);

      expect(validResponse.body.data).toEqual({
        name: 'John Doe',
        email: 'john@example.com', // Should be lowercased
      });

      // Invalid request
      const invalidResponse = await request(app)
        .post('/test')
        .send({ name: '', email: 'invalid-email' })
        .expect(400);

      expect(invalidResponse.body.error.code).toBe('VALIDATION_ERROR');
      expect(invalidResponse.body.error.details.fields).toHaveProperty('name');
      expect(invalidResponse.body.error.details.fields).toHaveProperty('email');
    });

    it('should validate query parameters', async () => {
      app.get('/test', validate({ query: schemas.pagination }), (req, res) => {
        res.json({ success: true, data: req.query });
      });
      app.use(errorHandler);

      const response = await request(app)
        .get('/test?page=2&limit=50&sortBy=name&sortOrder=desc')
        .expect(200);

      expect(response.body.data).toEqual({
        page: 2,
        limit: 50,
        sortBy: 'name',
        sortOrder: 'desc',
      });

      // Test default values
      const defaultResponse = await request(app).get('/test').expect(200);

      expect(defaultResponse.body.data).toEqual({
        page: 1,
        limit: 20,
        sortOrder: 'asc',
      });

      // Invalid pagination
      await request(app).get('/test?page=0&limit=200').expect(400);
    });

    it('should validate route parameters', async () => {
      app.get('/test/:id', validate({ params: z.object({ id: schemas.uuid }) }), (req, res) => {
        res.json({ success: true, id: req.params.id });
      });
      app.use(errorHandler);

      // Valid UUID
      await request(app).get('/test/550e8400-e29b-41d4-a716-446655440000').expect(200);

      // Invalid UUID
      const response = await request(app).get('/test/invalid-uuid').expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should validate headers', async () => {
      const headerSchema = z.object({
        'x-api-key': z.string().min(10),
      });

      app.get('/test', validate({ headers: headerSchema }), (req, res) => {
        res.json({ success: true });
      });
      app.use(errorHandler);

      // Valid headers
      await request(app).get('/test').set('X-API-Key', 'valid-api-key-123').expect(200);

      // Missing header
      await request(app).get('/test').expect(400);
    });

    it('should validate multiple parts of request', async () => {
      const validation = {
        params: z.object({ id: schemas.uuid }),
        query: schemas.pagination,
        body: z.object({ name: z.string() }),
      };

      app.put('/test/:id', validate(validation), (req, res) => {
        res.json({
          id: req.params.id,
          query: req.query,
          body: req.body,
        });
      });
      app.use(errorHandler);

      const response = await request(app)
        .put('/test/550e8400-e29b-41d4-a716-446655440000?page=1&limit=10')
        .send({ name: 'Updated' })
        .expect(200);

      expect(response.body).toMatchObject({
        id: '550e8400-e29b-41d4-a716-446655440000',
        query: { page: 1, limit: 10, sortOrder: 'asc' },
        body: { name: 'Updated' },
      });
    });
  });

  describe('common schemas', () => {
    it('should validate email addresses', () => {
      expect(schemas.email.parse('test@example.com')).toBe('test@example.com');
      expect(schemas.email.parse('TEST@EXAMPLE.COM')).toBe('test@example.com');

      expect(() => schemas.email.parse('invalid')).toThrow();
      expect(() => schemas.email.parse('test@')).toThrow();
      expect(() => schemas.email.parse('@example.com')).toThrow();
    });

    it('should validate phone numbers in E.164 format', () => {
      expect(schemas.phone.parse('+1234567890')).toBe('+1234567890');
      expect(schemas.phone.parse('+447123456789')).toBe('+447123456789');

      expect(() => schemas.phone.parse('1234567890')).toThrow();
      expect(() => schemas.phone.parse('+0123456789')).toThrow();
      expect(() => schemas.phone.parse('invalid')).toThrow();
    });

    it('should validate UUIDs', () => {
      expect(schemas.uuid.parse('550e8400-e29b-41d4-a716-446655440000')).toBe(
        '550e8400-e29b-41d4-a716-446655440000'
      );

      expect(() => schemas.uuid.parse('invalid')).toThrow();
      expect(() => schemas.uuid.parse('550e8400-e29b-41d4-a716')).toThrow();
    });

    it('should validate passwords', () => {
      expect(schemas.password.parse('SecureP@ss1')).toBe('SecureP@ss1');

      expect(() => schemas.password.parse('short')).toThrow(); // Too short
      expect(() => schemas.password.parse('lowercase1!')).toThrow(); // No uppercase
      expect(() => schemas.password.parse('UPPERCASE1!')).toThrow(); // No lowercase
      expect(() => schemas.password.parse('NoNumbers!')).toThrow(); // No numbers
      expect(() => schemas.password.parse('NoSpecial1')).toThrow(); // No special chars
    });

    it('should validate money amounts', () => {
      expect(schemas.money.parse(100)).toBe(100); // $1.00
      expect(schemas.money.parse(999999999)).toBe(999999999); // $9,999,999.99

      expect(() => schemas.money.parse(-1)).toThrow();
      expect(() => schemas.money.parse(1000000000)).toThrow();
      expect(() => schemas.money.parse(1.5)).toThrow(); // Not an integer
    });

    it('should validate date ranges', () => {
      const validRange = {
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
      };
      expect(schemas.dateRange.parse(validRange)).toEqual(validRange);

      const invalidRange = {
        startDate: '2024-12-31T23:59:59Z',
        endDate: '2024-01-01T00:00:00Z',
      };
      expect(() => schemas.dateRange.parse(invalidRange)).toThrow();
    });
  });

  describe('requireOrganizationContext middleware', () => {
    it('should require organization ID header', async () => {
      app.get('/test', requireOrganizationContext, (req, res) => {
        res.json({ organizationId: (req as any).organizationId });
      });
      app.use(errorHandler);

      // Missing header
      const response = await request(app).get('/test').expect(400);

      expect(response.body.error.message).toBe('Organization context required');
    });

    it('should validate organization ID format', async () => {
      app.get('/test', requireOrganizationContext, (req, res) => {
        res.json({ organizationId: (req as any).organizationId });
      });
      app.use(errorHandler);

      // Invalid format
      await request(app).get('/test').set('X-Organization-ID', 'invalid-id').expect(400);

      // Valid UUID
      const response = await request(app)
        .get('/test')
        .set('X-Organization-ID', '550e8400-e29b-41d4-a716-446655440000')
        .expect(200);

      expect(response.body.organizationId).toBe('550e8400-e29b-41d4-a716-446655440000');
    });
  });
});
