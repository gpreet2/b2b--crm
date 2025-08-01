import { retry, isRetryableError, RetryError, CircuitBreaker } from '../utils/retry';

describe('Retry Logic', () => {
  describe('retry function', () => {
    it('should succeed on first attempt', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const result = await retry(fn);
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValue('success');
      
      const result = await retry(fn, { initialDelayMs: 10 });
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should throw RetryError after max attempts', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Always fails'));
      
      await expect(retry(fn, { maxAttempts: 3, initialDelayMs: 10 }))
        .rejects.toThrow(RetryError);
      
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should not retry if shouldRetry returns false', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Non-retryable'));
      
      await expect(retry(fn, {
        shouldRetry: () => false,
      })).rejects.toThrow('Non-retryable');
      
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should call onRetry callback', async () => {
      const onRetry = jest.fn();
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('Failure'))
        .mockResolvedValue('success');
      
      await retry(fn, { onRetry, initialDelayMs: 10 });
      
      expect(onRetry).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Failure' }),
        1
      );
    });

    it('should use exponential backoff', async () => {
      const delays: number[] = [];
      const originalSetTimeout = global.setTimeout;
      
      global.setTimeout = jest.fn((fn, delay) => {
        delays.push(delay as number);
        return originalSetTimeout(fn, 0);
      }) as any;
      
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValue('success');
      
      await retry(fn, {
        initialDelayMs: 100,
        factor: 2,
        jitter: false,
      });
      
      expect(delays[0]).toBe(100);
      expect(delays[1]).toBe(200);
      
      global.setTimeout = originalSetTimeout;
    });

    it('should apply jitter when enabled', async () => {
      const delays: number[] = [];
      const originalSetTimeout = global.setTimeout;
      
      global.setTimeout = jest.fn((fn, delay) => {
        delays.push(delay as number);
        return originalSetTimeout(fn, 0);
      }) as any;
      
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('Fail'))
        .mockResolvedValue('success');
      
      await retry(fn, {
        initialDelayMs: 1000,
        jitter: true,
      });
      
      // With jitter, delay should be between 500 and 1000
      expect(delays[0]).toBeGreaterThanOrEqual(500);
      expect(delays[0]).toBeLessThanOrEqual(1000);
      
      global.setTimeout = originalSetTimeout;
    });

    it('should respect maxDelayMs', async () => {
      const delays: number[] = [];
      const originalSetTimeout = global.setTimeout;
      
      global.setTimeout = jest.fn((fn, delay) => {
        delays.push(delay as number);
        return originalSetTimeout(fn, 0);
      }) as any;
      
      const fn = jest.fn();
      for (let i = 0; i < 5; i++) {
        fn.mockRejectedValueOnce(new Error(`Fail ${i}`));
      }
      fn.mockResolvedValue('success');
      
      await retry(fn, {
        maxAttempts: 6,
        initialDelayMs: 1000,
        factor: 10,
        maxDelayMs: 5000,
        jitter: false,
      });
      
      // Last delays should be capped at maxDelayMs
      expect(delays[delays.length - 1]).toBe(5000);
      
      global.setTimeout = originalSetTimeout;
    });
  });

  describe('isRetryableError', () => {
    it('should identify retryable errors', () => {
      const retryableErrors = [
        new Error('Connection timeout'),
        new Error('ECONNREFUSED'),
        new Error('Too many connections'),
        new Error('deadlock detected'),
      ];
      
      retryableErrors.forEach(error => {
        expect(isRetryableError(error)).toBe(true);
      });
    });

    it('should not retry non-retryable errors', () => {
      const nonRetryableErrors = [
        new Error('Invalid credentials'),
        new Error('Permission denied'),
        new Error('Syntax error'),
      ];
      
      nonRetryableErrors.forEach(error => {
        expect(isRetryableError(error)).toBe(false);
      });
    });
  });

  describe('CircuitBreaker', () => {
    it('should allow requests when closed', async () => {
      const breaker = new CircuitBreaker();
      const fn = jest.fn().mockResolvedValue('success');
      
      const result = await breaker.execute(fn);
      
      expect(result).toBe('success');
      expect(breaker.getState()).toBe('closed');
    });

    it('should open after threshold failures', async () => {
      const breaker = new CircuitBreaker(3, 60000);
      const fn = jest.fn().mockRejectedValue(new Error('Failed'));
      
      // Fail 3 times to open the breaker
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(fn);
        } catch (e) {
          // Expected
        }
      }
      
      expect(breaker.getState()).toBe('open');
      
      // Should reject immediately when open
      await expect(breaker.execute(fn))
        .rejects.toThrow('Circuit breaker is open');
    });

    it('should transition to half-open after timeout', async () => {
      const breaker = new CircuitBreaker(1, 100); // 100ms timeout
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValue('success');
      
      // Open the breaker
      try {
        await breaker.execute(fn);
      } catch (e) {
        // Expected
      }
      
      expect(breaker.getState()).toBe('open');
      
      // Wait for timeout
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Should try to execute and succeed
      const result = await breaker.execute(fn);
      expect(result).toBe('success');
      expect(breaker.getState()).toBe('closed');
    });

    it('should stay open if half-open request fails', async () => {
      const breaker = new CircuitBreaker(1, 100);
      const fn = jest.fn().mockRejectedValue(new Error('Always fails'));
      
      // Open the breaker
      try {
        await breaker.execute(fn);
      } catch (e) {
        // Expected
      }
      
      // Wait for timeout
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Try again - should fail and stay open
      try {
        await breaker.execute(fn);
      } catch (e) {
        // Expected
      }
      
      expect(breaker.getState()).toBe('open');
    });

    it('should provide metrics', () => {
      const breaker = new CircuitBreaker();
      const metrics = breaker.getMetrics();
      
      expect(metrics).toHaveProperty('state');
      expect(metrics).toHaveProperty('failures');
      expect(metrics).toHaveProperty('lastFailureTime');
    });
  });
});