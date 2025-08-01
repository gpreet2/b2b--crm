import { DatabaseConnectionPool, initializeDatabase } from '../config/database';
import { logger } from '../utils/logger';
import { createClient } from '@supabase/supabase-js';

// Mock logger to avoid console output in tests
jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    fatal: jest.fn(),
  },
}));

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue({ error: { code: 'PGRST116' } }),
      }),
    }),
  })),
}));

// Mock pg
jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue({
      query: jest.fn().mockResolvedValue({ rows: [] }),
      release: jest.fn(),
    }),
    on: jest.fn(),
    end: jest.fn().mockResolvedValue(undefined),
    totalCount: 5,
    idleCount: 3,
    waitingCount: 0,
  })),
}));

describe('Database Connection Failover and Recovery', () => {
  let db: DatabaseConnectionPool;
  const mockConfig = {
    supabaseUrl: 'https://test.supabase.co',
    supabaseServiceKey: 'test-key',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the createClient mock to default behavior
    (createClient as jest.Mock).mockImplementation(() => ({
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({ error: { code: 'PGRST116' } }),
        }),
      }),
    }));
  });

  afterEach(async () => {
    if (db) {
      await db.shutdown();
    }
    jest.clearAllMocks();
  });

  describe('Connection Pool Initialization', () => {
    it('should initialize with default pool settings', async () => {
      db = initializeDatabase(mockConfig);
      await db.initialize();

      const metrics = db.getMetrics();
      expect(metrics.isHealthy).toBe(true);
      expect(logger.info).toHaveBeenCalledWith(
        'Database connection pool initialized',
        expect.any(Object)
      );
    });

    it('should retry initialization on failure', async () => {
      let attempts = 0;
      
      (createClient as jest.Mock).mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Connection timeout');
        }
        return {
          from: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({ error: { code: 'PGRST116' } }),
            }),
          }),
        };
      });

      db = initializeDatabase(mockConfig);
      await db.initialize();

      expect(attempts).toBe(3);
      expect(logger.warn).toHaveBeenCalledWith(
        'Retrying database initialization',
        expect.objectContaining({
          attempt: 1,
          error: 'Connection timeout',
        })
      );
      expect(logger.warn).toHaveBeenCalledWith(
        'Retrying database initialization',
        expect.objectContaining({
          attempt: 2,
          error: 'Connection timeout',
        })
      );
    });

    it('should fail after max retry attempts', async () => {
      (createClient as jest.Mock).mockImplementation(() => {
        throw new Error('Connection refused');
      });

      db = initializeDatabase(mockConfig);
      
      await expect(db.initialize()).rejects.toThrow('Failed after 5 attempts: Connection refused');
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to initialize database connection pool',
        expect.any(Object)
      );
    });
  });

  describe('Query Retry and Circuit Breaker', () => {
    let mockPool: any;
    
    beforeEach(async () => {
      // Reset mocks
      jest.clearAllMocks();
      
      mockPool = {
        connect: jest.fn().mockResolvedValue({
          query: jest.fn().mockResolvedValue({ rows: [] }),
          release: jest.fn(),
        }),
        on: jest.fn(),
        end: jest.fn().mockResolvedValue(undefined),
        totalCount: 5,
        idleCount: 3,
        waitingCount: 0,
      };

      const { Pool } = require('pg');
      (Pool as jest.Mock).mockImplementation(() => mockPool);
      
      db = initializeDatabase({
        ...mockConfig,
        databaseUrl: 'postgresql://test:test@localhost:5432/test',
      });
      await db.initialize();
    });

    it('should retry queries on transient failures', async () => {
      let queryAttempts = 0;
      
      mockPool.connect.mockResolvedValue({
        query: jest.fn().mockImplementation(() => {
          queryAttempts++;
          if (queryAttempts < 3) {
            throw new Error('Connection timeout');
          }
          return { rows: [{ id: 1 }] };
        }),
        release: jest.fn(),
      });

      const result = await db.query('SELECT * FROM test');
      
      expect(queryAttempts).toBe(3);
      expect(result.rows).toEqual([{ id: 1 }]);
      expect(logger.warn).toHaveBeenCalledWith(
        'Retrying database query',
        expect.objectContaining({
          attempt: 1,
          error: 'Connection timeout',
        })
      );
    });

    it('should not retry non-retryable errors', async () => {
      mockPool.connect.mockResolvedValue({
        query: jest.fn().mockRejectedValue(new Error('Syntax error')),
        release: jest.fn(),
      });

      await expect(db.query('INVALID SQL')).rejects.toThrow('Syntax error');
      
      // Should only try once for non-retryable errors (3 attempts with retries)
      expect(mockPool.connect).toHaveBeenCalledTimes(1);
    });

    it('should open circuit breaker after threshold failures', async () => {
      mockPool.connect.mockResolvedValue({
        query: jest.fn().mockRejectedValue(new Error('Connection refused')),
        release: jest.fn(),
      });

      // Fail 5 times to open the circuit breaker
      for (let i = 0; i < 5; i++) {
        try {
          await db.query('SELECT 1');
        } catch (e) {
          // Expected to fail
        }
      }

      // Next query should fail immediately due to open circuit
      await expect(db.query('SELECT 1')).rejects.toThrow('Circuit breaker is open');
      
      const metrics = db.getMetrics();
      expect(metrics.circuitBreaker.state).toBe('open');
    });
  });

  describe('Connection Pool Metrics', () => {
    beforeEach(async () => {
      db = initializeDatabase(mockConfig);
      await db.initialize();
    });

    it('should track connection metrics', () => {
      const metrics = db.getMetrics();
      
      expect(metrics).toMatchObject({
        totalConnections: expect.any(Number),
        idleConnections: expect.any(Number),
        waitingClients: expect.any(Number),
        totalQueries: expect.any(Number),
        failedQueries: expect.any(Number),
        avgQueryTime: expect.any(Number),
        isHealthy: expect.any(Boolean),
        lastHealthCheck: expect.any(Date),
      });
    });

    it('should update metrics after queries', async () => {
      const initialMetrics = db.getMetrics();
      
      // Mock a successful query
      const mockClient = db.getSupabaseClient();
      if (mockClient) {
        jest.spyOn(mockClient, 'from').mockReturnValue({
          select: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        } as any);
      }

      // Force a health check
      await (db as any).performHealthCheck();
      
      const updatedMetrics = db.getMetrics();
      expect(updatedMetrics.lastHealthCheck.getTime())
        .toBeGreaterThanOrEqual(initialMetrics.lastHealthCheck.getTime());
    });
  });

  describe('Graceful Shutdown', () => {
    it('should clean up resources on shutdown', async () => {
      db = initializeDatabase(mockConfig);
      await db.initialize();
      
      const initialMetrics = db.getMetrics();
      expect(initialMetrics.isHealthy).toBe(true);
      
      await db.shutdown();
      
      const shutdownMetrics = db.getMetrics();
      expect(shutdownMetrics.isHealthy).toBe(false);
      expect(shutdownMetrics.totalConnections).toBe(0);
      
      expect(logger.info).toHaveBeenCalledWith('Database connection pool shut down');
    });

    it('should stop health checks on shutdown', async () => {
      db = initializeDatabase(mockConfig);
      await db.initialize();
      
      // Get initial health check time
      const initialCheck = db.getMetrics().lastHealthCheck;
      
      // Shutdown
      await db.shutdown();
      
      // Wait to ensure no more health checks run
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const finalCheck = db.getMetrics().lastHealthCheck;
      expect(finalCheck.getTime()).toBe(initialCheck.getTime());
    });
  });

  describe('Health Check Monitoring', () => {
    it('should mark pool as unhealthy on connection failure', async () => {
      db = initializeDatabase(mockConfig);
      await db.initialize();
      
      // Mock Supabase client to fail health check
      const mockClient = db.getSupabaseClient();
      jest.spyOn(mockClient, 'from').mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({ 
            error: { code: 'CONNECTION_ERROR', message: 'Connection failed' } 
          }),
        }),
      } as any);
      
      // Trigger health check manually
      await (db as any).performHealthCheck();
      
      const metrics = db.getMetrics();
      expect(metrics.isHealthy).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(
        'Supabase health check failed',
        expect.any(Object)
      );
    });

    it('should recover health status when connection is restored', async () => {
      db = initializeDatabase(mockConfig);
      await db.initialize();
      
      const mockClient = db.getSupabaseClient();
      
      // First fail the health check
      jest.spyOn(mockClient, 'from').mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({ 
            error: { code: 'CONNECTION_ERROR', message: 'Connection failed' } 
          }),
        }),
      } as any);
      
      await (db as any).performHealthCheck();
      expect(db.getMetrics().isHealthy).toBe(false);
      
      // Then restore it
      jest.spyOn(mockClient, 'from').mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({ error: { code: 'PGRST116' } }),
        }),
      } as any);
      
      await (db as any).performHealthCheck();
      expect(db.getMetrics().isHealthy).toBe(true);
    });
  });
});