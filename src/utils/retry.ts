import { logger } from './logger';

export interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  factor?: number;
  jitter?: boolean;
  onRetry?: (error: Error, attempt: number) => void;
  shouldRetry?: (error: Error) => boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 5,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  factor: 2,
  jitter: true,
  onRetry: () => {},
  shouldRetry: () => true,
};

export class RetryError extends Error {
  constructor(
    message: string,
    public readonly attempts: number,
    public readonly lastError: Error
  ) {
    super(message);
    this.name = 'RetryError';
  }
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error = new Error('No attempts made');
  
  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === opts.maxAttempts) {
        throw new RetryError(
          `Failed after ${opts.maxAttempts} attempts: ${lastError.message}`,
          opts.maxAttempts,
          lastError
        );
      }
      
      if (!opts.shouldRetry(lastError)) {
        throw lastError;
      }
      
      const delay = calculateDelay(attempt, opts);
      
      logger.warn('Operation failed, retrying', {
        attempt,
        maxAttempts: opts.maxAttempts,
        delay,
        error: lastError.message,
      });
      
      opts.onRetry(lastError, attempt);
      
      await sleep(delay);
    }
  }
  
  throw new RetryError(
    `Failed after ${opts.maxAttempts} attempts: ${lastError.message}`,
    opts.maxAttempts,
    lastError
  );
}

function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  let delay = Math.min(
    options.initialDelayMs * Math.pow(options.factor, attempt - 1),
    options.maxDelayMs
  );
  
  if (options.jitter) {
    delay = delay * (0.5 + Math.random() * 0.5);
  }
  
  return Math.round(delay);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function isRetryableError(error: Error): boolean {
  const errorMessage = error.message.toLowerCase();
  const retryablePatterns = [
    'timeout',
    'econnrefused',
    'connection refused',
    'enotfound',
    'econnreset',
    'epipe',
    'ehostunreach',
    'enetunreach',
    'too many connections',
    'connection pool timeout',
    'deadlock',
    'lock timeout',
  ];
  
  return retryablePatterns.some(pattern => errorMessage.includes(pattern));
}

export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private readonly threshold: number = 5,
    private readonly timeout: number = 60000,
    private readonly halfOpenTimeout: number = 30000
  ) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      const now = Date.now();
      if (now - this.lastFailureTime < this.timeout) {
        throw new Error('Circuit breaker is open');
      }
      this.state = 'half-open';
    }
    
    try {
      const result = await fn();
      if (this.state === 'half-open') {
        this.reset();
      }
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }
  
  private recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'open';
      logger.error('Circuit breaker opened', {
        failures: this.failures,
        threshold: this.threshold,
      });
    }
  }
  
  private reset(): void {
    this.failures = 0;
    this.lastFailureTime = 0;
    this.state = 'closed';
    logger.info('Circuit breaker reset');
  }
  
  getState(): string {
    return this.state;
  }
  
  getMetrics() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
    };
  }
}