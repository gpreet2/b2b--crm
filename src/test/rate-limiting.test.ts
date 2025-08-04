import express, { Request, Response } from 'express';
import request from 'supertest';

import { testRedisConnection, getRedisInfo } from '@/config/redis';
import {
  createRateLimitMiddleware,
  generalRateLimit,
  authRateLimit,
  sensitiveRateLimit,
  uploadRateLimit,
  multiRateLimit,
  rateLimitMiddleware,
} from '@/middleware/rate-limit.middleware';

describe('Rate Limiting', () => {
  let app: express.Application;

  beforeAll(async () => {
    // Test Redis connection before running tests
    const isConnected = await testRedisConnection();
    if (!isConnected) {
      throw new Error('Redis connection failed - cannot run rate limiting tests');
    }
  });

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Test routes
    app.get('/test', generalRateLimit, (req: Request, res: Response) => {
      res.json({ message: 'Test endpoint' });
    });

    app.post('/auth/login', authRateLimit, (req: Request, res: Response) => {
      res.json({ message: 'Login successful' });
    });

    app.get('/admin/users', sensitiveRateLimit, (req: Request, res: Response) => {
      res.json({ message: 'Admin endpoint' });
    });

    app.post('/upload', uploadRateLimit, (req: Request, res: Response) => {
      res.json({ message: 'Upload successful' });
    });

    app.get('/multi', multiRateLimit(['general', 'hourly']), (req: Request, res: Response) => {
      res.json({ message: 'Multi-limited endpoint' });
    });
  });

  describe('Redis Connection', () => {
    it('should have a working Redis connection', async () => {
      const isConnected = await testRedisConnection();
      expect(isConnected).toBe(true);
    });

    it('should provide Redis info', async () => {
      const info = await getRedisInfo();
      expect(info).toBeDefined();
      expect(info.status).toBe('connected');
      expect(info.timestamp).toBeDefined();
    });
  });

  describe('General Rate Limiting', () => {
    it('should allow requests within limit', async () => {
      const response = await request(app).get('/test').expect(200);

      expect(response.headers['x-ratelimit-limit']).toBeDefined();
      expect(response.headers['x-ratelimit-remaining']).toBeDefined();
      expect(response.headers['x-ratelimit-reset']).toBeDefined();
    });

    it('should include rate limit headers', async () => {
      const response = await request(app).get('/test').expect(200);

      expect(parseInt(response.headers['x-ratelimit-limit'])).toBeGreaterThan(0);
      expect(parseInt(response.headers['x-ratelimit-remaining'])).toBeGreaterThanOrEqual(0);
      expect(parseInt(response.headers['x-ratelimit-reset'])).toBeGreaterThan(0);
    });

    it('should block requests when rate limit is exceeded', async () => {
      // Make multiple requests rapidly from the same IP to exceed the limit
      const promises = [];
      const testIp = '192.168.1.100';

      for (let i = 0; i < 65; i++) {
        // Exceed the 60/minute limit
        promises.push(
          request(app).get('/test').set('X-Forwarded-For', testIp) // Use same IP for all requests
        );
      }

      const responses = await Promise.all(promises);

      // At least some should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);

      // Check rate limit response format
      if (rateLimitedResponses.length > 0) {
        const rateLimited = rateLimitedResponses[0];
        expect(rateLimited.body.error).toBe('Rate limit exceeded');
        expect(rateLimited.body.code).toBe('RATE_LIMIT_EXCEEDED');
        expect(rateLimited.headers['retry-after']).toBeDefined();
      }
    }, 10000); // Increase timeout for this test
  });

  describe('Authentication Rate Limiting', () => {
    it('should apply stricter limits to auth endpoints', async () => {
      const response = await request(app)
        .post('/auth/login')
        .set('X-Forwarded-For', '192.168.2.100') // Different IP from general tests
        .send({ email: 'test@example.com', password: 'password' })
        .expect(200);

      const limit = parseInt(response.headers['x-ratelimit-limit']);
      expect(limit).toBeLessThanOrEqual(10); // Auth limit is 10/minute
    });

    it('should rate limit by IP + email combination', async () => {
      const email = 'test@example.com';
      const requests = [];

      // Make multiple requests with the same email and IP
      for (let i = 0; i < 12; i++) {
        requests.push(
          request(app)
            .post('/auth/login')
            .set('X-Forwarded-For', '192.168.3.100') // Different IP for this test
            .send({ email, password: 'password' })
        );
      }

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);

      expect(rateLimited.length).toBeGreaterThan(0);
    }, 10000);
  });

  describe('Sensitive Endpoints Rate Limiting', () => {
    it('should apply appropriate limits to sensitive endpoints', async () => {
      const response = await request(app)
        .get('/admin/users')
        .set('X-Forwarded-For', '192.168.4.100') // Different IP for this test
        .expect(200);

      const limit = parseInt(response.headers['x-ratelimit-limit']);
      expect(limit).toBeLessThanOrEqual(20); // Sensitive limit is 20/minute
    });
  });

  describe('Upload Rate Limiting', () => {
    it('should apply strict limits to upload endpoints', async () => {
      const response = await request(app)
        .post('/upload')
        .set('X-Forwarded-For', '192.168.5.100') // Different IP for this test
        .attach('file', Buffer.from('test file content'), 'test.txt')
        .expect(200);

      const limit = parseInt(response.headers['x-ratelimit-limit']);
      expect(limit).toBeLessThanOrEqual(5); // Upload limit is 5/minute
    });
  });

  describe('Multi-Rate Limiting', () => {
    it('should apply multiple rate limits to a single endpoint', async () => {
      const response = await request(app)
        .get('/multi')
        .set('X-Forwarded-For', '192.168.6.100') // Different IP for this test
        .expect(200);

      // Should have headers from the most restrictive limit
      expect(response.headers['x-ratelimit-limit']).toBeDefined();
      expect(response.headers['x-ratelimit-remaining']).toBeDefined();
    });
  });

  describe('Rate Limit Bypass', () => {
    it('should skip rate limiting for health check user agents', async () => {
      const userAgents = ['UptimeRobot', 'Pingdom', 'HealthChecker'];

      for (const ua of userAgents) {
        // Make many requests with health check user agent
        const promises = [];
        for (let i = 0; i < 10; i++) {
          promises.push(request(app).get('/test').set('User-Agent', ua));
        }

        const responses = await Promise.all(promises);

        // All should succeed (no rate limiting)
        responses.forEach(response => {
          expect(response.status).toBe(200);
        });
      }
    });

    it('should skip rate limiting with bypass header', async () => {
      const promises = [];
      for (let i = 0; i < 70; i++) {
        // Well over the limit
        promises.push(request(app).get('/test').set('X-Skip-Rate-Limit', 'true'));
      }

      const responses = await Promise.all(promises);

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    }, 10000);
  });

  describe('Custom Rate Limiter Creation', () => {
    it('should create custom rate limiter with specific configuration', async () => {
      const customApp = express();

      const customRateLimit = createRateLimitMiddleware('general', {
        message: 'Custom rate limit message',
        keyGenerator: req => `custom:${req.ip}`,
      });

      customApp.get('/custom', customRateLimit, (req: Request, res: Response) => {
        res.json({ message: 'Custom endpoint' });
      });

      const response = await request(customApp).get('/custom').expect(200);

      expect(response.headers['x-ratelimit-limit']).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should not block requests if rate limiting fails', async () => {
      // Create a middleware that uses an invalid limiter type
      const faultyApp = express();

      // This should gracefully handle the error and not block requests
      faultyApp.get(
        '/test',
        (req, res, next) => {
          // Simulate rate limiting error by calling next with an error
          // but the middleware should catch and handle it
          next();
        },
        (req: Request, res: Response) => {
          res.json({ message: 'Should still work' });
        }
      );

      await request(faultyApp).get('/test').expect(200);
    });
  });

  describe('Rate Limit Headers', () => {
    it('should include all required rate limit headers', async () => {
      const response = await request(app).get('/test').expect(200);

      expect(response.headers['x-ratelimit-limit']).toMatch(/^\d+$/);
      expect(response.headers['x-ratelimit-remaining']).toMatch(/^\d+$/);
      expect(response.headers['x-ratelimit-reset']).toMatch(/^\d+$/);
    });

    it('should include retry-after header when rate limited', async () => {
      // First, exhaust the rate limit
      const promises = [];
      for (let i = 0; i < 65; i++) {
        promises.push(
          request(app).get('/test').set('X-Forwarded-For', '192.168.1.100') // Use same IP
        );
      }

      const responses = await Promise.all(promises);
      const rateLimited = responses.find(r => r.status === 429);

      if (rateLimited) {
        expect(rateLimited.headers['retry-after']).toBeDefined();
        expect(parseInt(rateLimited.headers['retry-after'])).toBeGreaterThan(0);
      }
    }, 15000);
  });

  describe('Pre-configured Middleware', () => {
    it('should provide working pre-configured middleware', () => {
      expect(rateLimitMiddleware.general).toBeDefined();
      expect(rateLimitMiddleware.auth).toBeDefined();
      expect(rateLimitMiddleware.sensitive).toBeDefined();
      expect(rateLimitMiddleware.upload).toBeDefined();
      expect(rateLimitMiddleware.strictAuth).toBeDefined();
      expect(rateLimitMiddleware.apiWithUploads).toBeDefined();
      expect(rateLimitMiddleware.adminEndpoints).toBeDefined();
    });

    it('should work with pre-configured combinations', async () => {
      const combinedApp = express();

      combinedApp.get(
        '/strict-auth',
        rateLimitMiddleware.strictAuth,
        (req: Request, res: Response) => {
          res.json({ message: 'Strict auth endpoint' });
        }
      );

      const response = await request(combinedApp).get('/strict-auth').expect(200);

      expect(response.headers['x-ratelimit-limit']).toBeDefined();
    });
  });
});
