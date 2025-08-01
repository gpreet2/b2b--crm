import request from 'supertest';
import express from 'express';
import { monitoringRouter } from '../api/monitoring';
import { initializeDatabase, getDatabase } from '../config/database';

jest.mock('../config/database');

describe('Monitoring API', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use('/monitoring', monitoringRouter);
    jest.clearAllMocks();
  });

  describe('GET /monitoring/health', () => {
    it('should return healthy status when all checks pass', async () => {
      const mockDb = {
        query: jest.fn().mockResolvedValue({ rows: [{ '?column?': 1 }] }),
        getSupabaseClient: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({ error: { code: 'PGRST116' } }),
            }),
          }),
        }),
        getMetrics: jest.fn().mockReturnValue({
          isHealthy: true,
          totalConnections: 5,
          idleConnections: 3,
          avgQueryTime: 12.5,
        }),
      };

      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      const response = await request(app)
        .get('/monitoring/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'healthy',
        checks: {
          database: { status: 'pass' },
          supabase: { status: 'pass' },
          memory: { status: 'pass' },
        },
      });
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeGreaterThan(0);
    });

    it('should return unhealthy when database check fails', async () => {
      const mockDb = {
        query: jest.fn().mockRejectedValue(new Error('Connection refused')),
        getSupabaseClient: jest.fn().mockReturnValue(null),
        getMetrics: jest.fn().mockReturnValue({ isHealthy: false }),
      };

      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      const response = await request(app)
        .get('/monitoring/health')
        .expect(503);

      expect(response.body).toMatchObject({
        status: 'unhealthy',
        checks: {
          database: {
            status: 'fail',
            error: 'No database connection available',
          },
        },
      });
    });

    it('should return degraded when only Supabase fails', async () => {
      const mockDb = {
        query: jest.fn().mockResolvedValue({ rows: [{ '?column?': 1 }] }),
        getSupabaseClient: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({ 
                error: { code: 'NETWORK_ERROR', message: 'Network error' } 
              }),
            }),
          }),
        }),
        getMetrics: jest.fn().mockReturnValue({ isHealthy: true }),
      };

      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      const response = await request(app)
        .get('/monitoring/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'degraded',
        checks: {
          database: { status: 'pass' },
          supabase: { 
            status: 'fail',
            error: expect.any(String),
          },
        },
      });
    });

    it('should check memory usage', async () => {
      const mockDb = {
        query: jest.fn().mockResolvedValue({ rows: [{ '?column?': 1 }] }),
        getSupabaseClient: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({ error: { code: 'PGRST116' } }),
            }),
          }),
        }),
        getMetrics: jest.fn().mockReturnValue({ isHealthy: true }),
      };

      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      const response = await request(app)
        .get('/monitoring/health')
        .expect(200);

      expect(response.body.checks.memory).toMatchObject({
        status: 'pass',
        usage: expect.objectContaining({
          rss: expect.any(Number),
          heapTotal: expect.any(Number),
          heapUsed: expect.any(Number),
        }),
        percentUsed: expect.any(Number),
      });
    });
  });

  describe('GET /monitoring/live', () => {
    it('should always return alive status', async () => {
      const response = await request(app)
        .get('/monitoring/live')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'alive',
        timestamp: expect.any(String),
        pid: expect.any(Number),
      });
    });
  });

  describe('GET /monitoring/ready', () => {
    it('should return ready when database is healthy', async () => {
      const mockDb = {
        getMetrics: jest.fn().mockReturnValue({ isHealthy: true }),
      };

      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      const response = await request(app)
        .get('/monitoring/ready')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'ready',
        timestamp: expect.any(String),
      });
    });

    it('should return not ready when database is unhealthy', async () => {
      const mockDb = {
        getMetrics: jest.fn().mockReturnValue({ isHealthy: false }),
      };

      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      const response = await request(app)
        .get('/monitoring/ready')
        .expect(503);

      expect(response.body).toMatchObject({
        status: 'not ready',
        reason: 'Database not healthy',
      });
    });

    it('should return not ready when database is not initialized', async () => {
      (getDatabase as jest.Mock).mockImplementation(() => {
        throw new Error('Database not initialized');
      });

      const response = await request(app)
        .get('/monitoring/ready')
        .expect(503);

      expect(response.body).toMatchObject({
        status: 'not ready',
        reason: 'Database not initialized',
      });
    });
  });

  describe('GET /monitoring/metrics', () => {
    it('should return comprehensive metrics', async () => {
      const mockDb = {
        getMetrics: jest.fn().mockReturnValue({
          isHealthy: true,
          totalConnections: 5,
          idleConnections: 3,
          waitingClients: 0,
          totalQueries: 1000,
          failedQueries: 2,
          avgQueryTime: 15.5,
          circuitBreaker: {
            state: 'closed',
            failures: 0,
          },
        }),
      };

      (getDatabase as jest.Mock).mockReturnValue(mockDb);

      const response = await request(app)
        .get('/monitoring/metrics')
        .expect(200);

      expect(response.body).toMatchObject({
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        memory: expect.objectContaining({
          rss: expect.any(Number),
          heapTotal: expect.any(Number),
          heapUsed: expect.any(Number),
        }),
        database: expect.objectContaining({
          isHealthy: true,
          totalConnections: 5,
          idleConnections: 3,
        }),
        process: expect.objectContaining({
          pid: expect.any(Number),
          version: expect.any(String),
          platform: expect.any(String),
        }),
      });
    });

    it('should handle metrics retrieval errors', async () => {
      (getDatabase as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app)
        .get('/monitoring/metrics')
        .expect(500);

      expect(response.body).toEqual({
        error: 'Failed to retrieve metrics',
      });
    });
  });

  describe('GET /monitoring/test-sentry', () => {
    it('should be available in development', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const response = await request(app)
        .get('/monitoring/test-sentry')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Test error sent to Sentry',
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should not be available in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      // Clear module cache and re-import
      jest.resetModules();
      const { monitoringRouter: prodRouter } = require('../api/monitoring');
      
      const prodApp = express();
      prodApp.use('/monitoring', prodRouter);

      await request(prodApp)
        .get('/monitoring/test-sentry')
        .expect(404);

      process.env.NODE_ENV = originalEnv;
    });
  });
});