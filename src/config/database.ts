import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Pool, PoolConfig } from 'pg';

import { logger } from '../utils/logger';
import { retry, isRetryableError, CircuitBreaker } from '../utils/retry';

export interface DatabaseConfig {
  supabaseUrl: string;
  supabaseServiceKey: string;
  databaseUrl?: string;
  poolConfig?: PoolConfig;
}

export interface ConnectionPoolMetrics {
  totalConnections: number;
  idleConnections: number;
  waitingClients: number;
  totalQueries: number;
  failedQueries: number;
  avgQueryTime: number;
  lastHealthCheck: Date;
  isHealthy: boolean;
}

class DatabaseConnectionPool {
  private supabaseClient: SupabaseClient | null = null;
  private pgPool: Pool | null = null;
  private readonly config: DatabaseConfig;
  private metrics: ConnectionPoolMetrics = {
    totalConnections: 0,
    idleConnections: 0,
    waitingClients: 0,
    totalQueries: 0,
    failedQueries: 0,
    avgQueryTime: 0,
    lastHealthCheck: new Date(),
    isHealthy: false,
  };
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private readonly queryTimes: number[] = [];
  private readonly circuitBreaker: CircuitBreaker;

  constructor(config: DatabaseConfig) {
    this.config = config;
    this.validateConfig();
    this.circuitBreaker = new CircuitBreaker();
  }

  private validateConfig(): void {
    if (!this.config.supabaseUrl) {
      throw new Error('SUPABASE_URL is required');
    }
    if (!this.config.supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_KEY is required');
    }
  }

  async initialize(): Promise<void> {
    await retry(
      async () => {
        try {
          // Initialize Supabase client
          this.supabaseClient = createClient(
            this.config.supabaseUrl,
            this.config.supabaseServiceKey,
            {
              auth: {
                autoRefreshToken: false,
                persistSession: false,
              },
            }
          );

          // Initialize PostgreSQL pool if database URL is provided
          if (this.config.databaseUrl) {
            const poolConfig: PoolConfig = {
              connectionString: this.config.databaseUrl,
              max: this.config.poolConfig?.max || 20,
              min: this.config.poolConfig?.min || 5,
              idleTimeoutMillis: this.config.poolConfig?.idleTimeoutMillis || 30000,
              connectionTimeoutMillis: this.config.poolConfig?.connectionTimeoutMillis || 10000,
              ...this.config.poolConfig,
            };

            this.pgPool = new Pool(poolConfig);

            // Set up pool event listeners
            this.setupPoolEventListeners();

            // Test the connection
            const client = await this.pgPool.connect();
            try {
              await client.query('SELECT 1');
            } finally {
              client.release();
            }
          }

          // Start health checks
          this.startHealthChecks();

          logger.info('Database connection pool initialized', {
            hasSupabase: !!this.supabaseClient,
            hasPostgres: !!this.pgPool,
          });
        } catch (error) {
          logger.error('Failed to initialize database connection pool', { error });
          throw error;
        }
      },
      {
        maxAttempts: 5,
        initialDelayMs: 2000,
        maxDelayMs: 30000,
        shouldRetry: error => isRetryableError(error),
        onRetry: (error, attempt) => {
          logger.warn('Retrying database initialization', {
            attempt,
            error: error.message,
          });
        },
      }
    );
  }

  private setupPoolEventListeners(): void {
    if (!this.pgPool) return;

    this.pgPool.on('connect', () => {
      this.metrics.totalConnections++;
      logger.debug('New database connection established');
    });

    this.pgPool.on('acquire', () => {
      this.metrics.idleConnections--;
      logger.debug('Connection acquired from pool');
    });

    this.pgPool.on('release', () => {
      this.metrics.idleConnections++;
      logger.debug('Connection released to pool');
    });

    this.pgPool.on('error', err => {
      logger.error('Database pool error', { error: err });
      this.metrics.isHealthy = false;
    });

    this.pgPool.on('remove', () => {
      this.metrics.totalConnections--;
      logger.debug('Connection removed from pool');
    });
  }

  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, 30000); // Check every 30 seconds

    // Perform initial health check
    this.performHealthCheck();
  }

  private async performHealthCheck(): Promise<void> {
    const startTime = Date.now();
    let isHealthy = true;

    try {
      // Check Supabase client with simple connectivity test
      if (this.supabaseClient) {
        try {
          // Simple connectivity test using auth endpoint
          const { data, error } = await this.supabaseClient.auth.getSession();
          
          // Connection is healthy if we can reach the auth service (regardless of session state)
          if (error && error.message.includes('network') || error?.status >= 500) {
            isHealthy = false;
            logger.error('Supabase health check failed', { error });
          }
        } catch (error) {
          isHealthy = false;
          logger.error('Supabase health check failed', { error });
        }
      }

      // Check PostgreSQL pool
      if (this.pgPool) {
        const client = await this.pgPool.connect();
        try {
          await client.query('SELECT 1');
          this.metrics.idleConnections = this.pgPool.idleCount;
          this.metrics.totalConnections = this.pgPool.totalCount;
          this.metrics.waitingClients = this.pgPool.waitingCount;
        } finally {
          client.release();
        }
      }

      this.metrics.isHealthy = isHealthy;
      this.metrics.lastHealthCheck = new Date();

      const duration = Date.now() - startTime;
      logger.debug('Health check completed', {
        isHealthy,
        duration,
        metrics: this.getMetrics(),
      });
    } catch (error) {
      this.metrics.isHealthy = false;
      logger.error('Health check failed', { error });
    }
  }

  getSupabaseClient(): SupabaseClient {
    if (!this.supabaseClient) {
      throw new Error('Supabase client not initialized');
    }
    return this.supabaseClient;
  }

  async query<T = any>(sql: string, params?: any[]): Promise<T> {
    if (!this.pgPool) {
      throw new Error('PostgreSQL pool not initialized');
    }

    const startTime = Date.now();
    this.metrics.totalQueries++;

    try {
      const result = await this.circuitBreaker.execute(() =>
        retry(
          async () => {
            const client = await this.pgPool!.connect();
            try {
              return await client.query(sql, params);
            } finally {
              client.release();
            }
          },
          {
            maxAttempts: 3,
            initialDelayMs: 500,
            maxDelayMs: 5000,
            shouldRetry: error => isRetryableError(error),
            onRetry: (error, attempt) => {
              logger.warn('Retrying database query', {
                sql: sql.substring(0, 100),
                attempt,
                error: error.message,
              });
            },
          }
        )
      );

      // Track query time
      const queryTime = Date.now() - startTime;
      this.queryTimes.push(queryTime);
      if (this.queryTimes.length > 100) {
        this.queryTimes.shift();
      }
      this.metrics.avgQueryTime =
        this.queryTimes.reduce((a, b) => a + b, 0) / this.queryTimes.length;

      logger.debug('Query executed', {
        sql: sql.substring(0, 100),
        duration: queryTime,
        rowCount: result.rowCount,
      });

      return result as T;
    } catch (error) {
      this.metrics.failedQueries++;
      logger.error('Query failed', {
        sql: sql.substring(0, 100),
        error,
        circuitBreakerState: this.circuitBreaker.getState(),
      });
      throw error;
    }
  }

  getMetrics(): ConnectionPoolMetrics {
    return {
      ...this.metrics,
      circuitBreaker: this.circuitBreaker.getMetrics(),
    } as ConnectionPoolMetrics & { circuitBreaker: any };
  }

  async shutdown(): Promise<void> {
    logger.info('Shutting down database connection pool');

    // Stop health checks
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // Close PostgreSQL pool
    if (this.pgPool) {
      await this.pgPool.end();
    }

    // Reset metrics
    this.metrics = {
      totalConnections: 0,
      idleConnections: 0,
      waitingClients: 0,
      totalQueries: 0,
      failedQueries: 0,
      avgQueryTime: 0,
      lastHealthCheck: new Date(),
      isHealthy: false,
    };

    logger.info('Database connection pool shut down');
  }
}

// Singleton instance
let dbPool: DatabaseConnectionPool | null = null;

export function initializeDatabase(config: DatabaseConfig): DatabaseConnectionPool {
  if (!dbPool) {
    dbPool = new DatabaseConnectionPool(config);
  }
  return dbPool;
}

export function getDatabase(): DatabaseConnectionPool {
  if (!dbPool) {
    throw new Error('Database not initialized. Call initializeDatabase first.');
  }
  return dbPool;
}

export { DatabaseConnectionPool };
