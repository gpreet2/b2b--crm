import request from 'supertest';
import express, { Request, Response } from 'express';
import { 
  corsMiddleware, 
  corsMiddlewareVariants, 
  validateCorsConfig, 
  getCorsConfigSummary 
} from '@/middleware/cors.middleware';

describe('CORS Middleware', () => {
  let app: express.Application;
  let originalEnv: string | undefined;

  beforeAll(() => {
    // Ensure we're in development mode for consistent testing
    originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
  });

  afterAll(() => {
    // Restore original environment
    if (originalEnv !== undefined) {
      process.env.NODE_ENV = originalEnv;
    } else {
      delete process.env.NODE_ENV;
    }
  });

  beforeEach(() => {
    app = express();
    
    // Test routes with different CORS configurations
    app.use('/api', corsMiddleware);
    app.get('/api/test', (req: Request, res: Response) => {
      res.json({ message: 'API endpoint' });
    });
    
    app.use('/api/strict', corsMiddlewareVariants.strict);
    app.get('/api/strict/test', (req: Request, res: Response) => {
      res.json({ message: 'Strict endpoint' });
    });
    
    app.use('/public', corsMiddlewareVariants.public);
    app.get('/public/health', (req: Request, res: Response) => {
      res.json({ status: 'healthy' });
    });
  });

  describe('Basic CORS Functionality', () => {
    it('should allow requests from allowed origins', async () => {
      const allowedOrigin = 'http://localhost:3000';
      
      const response = await request(app)
        .get('/api/test')
        .set('Origin', allowedOrigin)
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe(allowedOrigin);
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should allow requests with no origin (mobile apps, Postman)', async () => {
      const response = await request(app)
        .get('/api/test')
        .expect(200);

      // Should not block requests without origin
      expect(response.status).toBe(200);
    });

    it('should expose required headers', async () => {
      const response = await request(app)
        .get('/api/test')
        .set('Origin', 'http://localhost:3000')
        .expect(200);

      const exposedHeaders = response.headers['access-control-expose-headers'];
      expect(exposedHeaders).toBeDefined();
      expect(exposedHeaders).toContain('X-RateLimit-Limit');
      expect(exposedHeaders).toContain('X-Request-ID');
      expect(exposedHeaders).toContain('X-API-Version');
    });
  });

  describe('Preflight Requests', () => {
    it('should handle OPTIONS preflight requests correctly', async () => {
      const origin = 'http://localhost:3000';
      
      const response = await request(app)
        .options('/api/test')
        .set('Origin', origin)
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type, Authorization')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBe(origin);
      expect(response.headers['access-control-allow-methods']).toContain('POST');
      expect(response.headers['access-control-allow-headers']).toContain('Content-Type');
      expect(response.headers['access-control-allow-headers']).toContain('Authorization');
      expect(response.headers['access-control-max-age']).toBeDefined();
    });

    it('should block preflight requests from disallowed origins', async () => {
      const disallowedOrigin = 'https://malicious-site.com';
      
      const response = await request(app)
        .options('/api/test')
        .set('Origin', disallowedOrigin)
        .set('Access-Control-Request-Method', 'POST')
        .expect(403);

      expect(response.body.error).toBe('CORS policy violation');
      expect(response.body.code).toBe('CORS_NOT_ALLOWED');
    });

    it('should allow all preflight methods specified in config', async () => {
      const response = await request(app)
        .options('/api/test')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'DELETE')
        .expect(204);

      const allowedMethods = response.headers['access-control-allow-methods'];
      expect(allowedMethods).toContain('GET');
      expect(allowedMethods).toContain('POST');
      expect(allowedMethods).toContain('PUT');
      expect(allowedMethods).toContain('PATCH');
      expect(allowedMethods).toContain('DELETE');
      expect(allowedMethods).toContain('OPTIONS');
    });
  });

  describe('Development vs Production Behavior', () => {
    it('should be more permissive in development environment', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      // Create fresh app for development mode
      const devApp = express();
      devApp.use('/api', corsMiddleware);
      devApp.get('/api/test', (req: Request, res: Response) => {
        res.json({ message: 'Dev test' });
      });

      // Should allow localhost with different ports in development
      const response = await request(devApp)
        .get('/api/test')
        .set('Origin', 'http://localhost:8080')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:8080');
      
      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });

    it('should have shorter preflight cache in development', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const devApp = express();
      devApp.use('/api', corsMiddleware);
      devApp.get('/api/test', (req: Request, res: Response) => {
        res.json({ message: 'Dev test' });
      });

      const response = await request(devApp)
        .options('/api/test')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET')
        .expect(204);

      const maxAge = parseInt(response.headers['access-control-max-age']);
      expect(maxAge).toBeLessThanOrEqual(300); // 5 minutes or less in development
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should have longer preflight cache in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const prodApp = express();
      prodApp.use('/api', corsMiddleware);
      prodApp.get('/api/test', (req: Request, res: Response) => {
        res.json({ message: 'Prod test' });
      });

      // In production, localhost won't be allowed unless it's in the explicit allowed origins
      // So we'll use a production-style allowed origin for this test
      const response = await request(prodApp)
        .options('/api/test')
        .set('Origin', 'https://app.tryzore.com') // Use production origin
        .set('Access-Control-Request-Method', 'GET')
        .expect(204);

      const maxAge = parseInt(response.headers['access-control-max-age']);
      expect(maxAge).toBeGreaterThan(300); // More than 5 minutes in production
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Strict CORS Mode', () => {
    it('should block requests without valid origin in strict mode', async () => {
      const response = await request(app)
        .get('/api/strict/test')
        .expect(403);

      expect(response.body.error).toBe('CORS policy violation');
      expect(response.body.code).toBe('CORS_STRICT_MODE');
    });

    it('should allow requests from allowed origins in strict mode', async () => {
      const response = await request(app)
        .get('/api/strict/test')
        .set('Origin', 'http://localhost:3000')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });

    it('should block requests from disallowed origins in strict mode', async () => {
      const response = await request(app)
        .get('/api/strict/test')
        .set('Origin', 'https://evil-site.com')
        .expect(403);

      expect(response.body.code).toBe('CORS_STRICT_MODE');
    });
  });

  describe('Public CORS Mode', () => {
    it('should allow all origins for public endpoints', async () => {
      const response = await request(app)
        .get('/public/health')
        .set('Origin', 'https://any-domain.com')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('*');
    });

    it('should handle preflight for public endpoints', async () => {
      const response = await request(app)
        .options('/public/health')
        .set('Origin', 'https://any-domain.com')
        .set('Access-Control-Request-Method', 'GET')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBe('*');
      expect(response.headers['access-control-allow-methods']).toContain('GET');
    });

    it('should limit methods for public endpoints', async () => {
      const response = await request(app)
        .options('/public/health')
        .set('Access-Control-Request-Method', 'GET')
        .expect(204);

      const allowedMethods = response.headers['access-control-allow-methods'];
      expect(allowedMethods).toContain('GET');
      expect(allowedMethods).toContain('HEAD');
      expect(allowedMethods).toContain('OPTIONS');
      expect(allowedMethods).not.toContain('POST');
      expect(allowedMethods).not.toContain('DELETE');
    });
  });

  describe('Security Headers', () => {
    it('should include credentials header when appropriate', async () => {
      const response = await request(app)
        .get('/api/test')
        .set('Origin', 'http://localhost:3000')
        .expect(200);

      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should include proper allowed headers', async () => {
      const response = await request(app)
        .options('/api/test')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Authorization, X-API-Key')
        .expect(204);

      const allowedHeaders = response.headers['access-control-allow-headers'];
      expect(allowedHeaders).toContain('Authorization');
      expect(allowedHeaders).toContain('X-API-Key');
      expect(allowedHeaders).toContain('Content-Type');
      expect(allowedHeaders).toContain('X-Organization-ID');
    });

    it('should expose security-related headers', async () => {
      const response = await request(app)
        .get('/api/test')
        .set('Origin', 'http://localhost:3000')
        .expect(200);

      const exposedHeaders = response.headers['access-control-expose-headers'];
      expect(exposedHeaders).toContain('X-RateLimit-Limit');
      expect(exposedHeaders).toContain('X-RateLimit-Remaining');
      expect(exposedHeaders).toContain('X-RateLimit-Reset');
      expect(exposedHeaders).toContain('X-Response-Time');
    });
  });

  describe('Error Handling', () => {
    it('should not crash on malformed origin headers', async () => {
      const response = await request(app)
        .get('/api/test')
        .set('Origin', 'not-a-valid-url')
        .expect(200);

      // Should handle gracefully and not crash
      expect(response.status).toBe(200);
    });

    it('should handle missing required headers gracefully', async () => {
      const response = await request(app)
        .options('/api/test')
        .set('Origin', 'http://localhost:3000')
        // Missing Access-Control-Request-Method
        .expect(204);

      expect(response.status).toBe(204);
    });
  });

  describe('Custom Headers', () => {
    it('should allow custom API headers', async () => {
      const response = await request(app)
        .options('/api/test')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'X-Organization-ID, X-Client-Version')
        .expect(204);

      const allowedHeaders = response.headers['access-control-allow-headers'];
      expect(allowedHeaders).toContain('X-Organization-ID');
      expect(allowedHeaders).toContain('X-Client-Version');
    });

    it('should allow monitoring and tracing headers', async () => {
      const response = await request(app)
        .options('/api/test')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'sentry-trace, baggage')
        .expect(204);

      const allowedHeaders = response.headers['access-control-allow-headers'];
      expect(allowedHeaders).toContain('sentry-trace');
      expect(allowedHeaders).toContain('baggage');
    });
  });

  describe('Configuration Validation', () => {
    it('should validate CORS configuration', () => {
      const validation = validateCorsConfig();
      
      expect(validation).toBeDefined();
      expect(typeof validation.isValid).toBe('boolean');
      expect(Array.isArray(validation.errors)).toBe(true);
    });

    it('should provide configuration summary', () => {
      const summary = getCorsConfigSummary();
      
      expect(summary).toBeDefined();
      expect(summary.environment).toBeDefined();
      expect(Array.isArray(summary.allowedOrigins)).toBe(true);
      expect(Array.isArray(summary.methods)).toBe(true);
      expect(Array.isArray(summary.allowedHeaders)).toBe(true);
      expect(summary.validation).toBeDefined();
    });

    it('should include proper configuration in summary', () => {
      const summary = getCorsConfigSummary();
      
      expect(summary.credentials).toBe(true);
      expect(summary.methods).toContain('GET');
      expect(summary.methods).toContain('POST');
      expect(summary.allowedHeaders).toContain('Authorization');
      expect(summary.exposedHeaders).toContain('X-RateLimit-Limit');
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle multiple concurrent preflight requests', async () => {
      const origin = 'http://localhost:3000';
      const promises = [];
      
      // Send multiple preflight requests simultaneously
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .options('/api/test')
            .set('Origin', origin)
            .set('Access-Control-Request-Method', 'POST')
        );
      }
      
      const responses = await Promise.all(promises);
      
      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(204);
        expect(response.headers['access-control-allow-origin']).toBe(origin);
      });
    });

    it('should work with various client configurations', async () => {
      const testCases = [
        { origin: 'http://localhost:3000', userAgent: 'Mozilla/5.0 Chrome' },
        { origin: 'http://localhost:3001', userAgent: 'React Native' },
        { origin: 'http://127.0.0.1:3000', userAgent: 'Expo' },
      ];
      
      for (const testCase of testCases) {
        const response = await request(app)
          .get('/api/test')
          .set('Origin', testCase.origin)
          .set('User-Agent', testCase.userAgent)
          .expect(200);
        
        expect(response.headers['access-control-allow-origin']).toBe(testCase.origin);
      }
    });
  });
});