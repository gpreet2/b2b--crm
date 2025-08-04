import express, { Request, Response } from 'express';
import request from 'supertest';

import { getHelmetConfig, getSecurityHeaders, getCorsOrigins } from '@/config/security';
import {
  applySecurityMiddleware,
  applySensitiveSecurityMiddleware,
} from '@/middleware/security.middleware';

describe('Security Headers', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();

    // Apply security middleware
    app.use(applySecurityMiddleware());

    // Test routes
    app.get('/test', (req: Request, res: Response) => {
      res.json({ message: 'Test endpoint' });
    });

    app.get('/sensitive', applySensitiveSecurityMiddleware(), (req: Request, res: Response) => {
      res.json({ message: 'Sensitive endpoint' });
    });
  });

  describe('Helmet.js Security Headers', () => {
    it('should apply Content Security Policy headers', async () => {
      const response = await request(app).get('/test').expect(200);

      expect(response.headers['content-security-policy']).toBeDefined();

      // Check for key CSP directives
      const csp = response.headers['content-security-policy'];
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("object-src 'none'");
      expect(csp).toContain("base-uri 'self'");
    });

    it('should apply X-Frame-Options header', async () => {
      const response = await request(app).get('/test').expect(200);

      expect(response.headers['x-frame-options']).toBe('DENY');
    });

    it('should apply X-Content-Type-Options header', async () => {
      const response = await request(app).get('/test').expect(200);

      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should apply X-XSS-Protection header', async () => {
      const response = await request(app).get('/test').expect(200);

      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    });

    it('should apply Referrer-Policy header', async () => {
      const response = await request(app).get('/test').expect(200);

      expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    });

    it('should hide X-Powered-By header', async () => {
      const response = await request(app).get('/test').expect(200);

      expect(response.headers['x-powered-by']).toBeUndefined();
    });

    it('should include Strict-Transport-Security in production', async () => {
      // Mock production environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      // Recreate app with production config
      const prodApp = express();
      prodApp.use(applySecurityMiddleware());
      prodApp.get('/test', (req: Request, res: Response) => {
        res.json({ message: 'Test' });
      });

      const response = await request(prodApp).get('/test').expect(200);

      expect(response.headers['strict-transport-security']).toBeDefined();
      expect(response.headers['strict-transport-security']).toContain('max-age=31536000');

      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Additional Security Headers', () => {
    it('should apply custom security headers', async () => {
      const response = await request(app).get('/test').expect(200);

      expect(response.headers['server']).toBe('TryZore-API');
      expect(response.headers['x-api-version']).toBe('1.0');
      expect(response.headers['x-rate-limit-policy']).toBe('strict');
      expect(response.headers['x-permitted-cross-domain-policies']).toBe('none');
      expect(response.headers['x-download-options']).toBe('noopen');
    });

    it('should apply cache control headers', async () => {
      const response = await request(app).get('/test').expect(200);

      expect(response.headers['cache-control']).toContain('no-store');
      expect(response.headers['cache-control']).toContain('no-cache');
      expect(response.headers['pragma']).toBe('no-cache');
      expect(response.headers['expires']).toBe('0');
    });
  });

  describe('Sensitive Endpoint Headers', () => {
    it('should apply stricter headers for sensitive endpoints', async () => {
      const response = await request(app).get('/sensitive').expect(200);

      expect(response.headers['cache-control']).toContain('private');
      expect(response.headers['cache-control']).toContain('max-age=0');
      expect(response.headers['x-frame-options']).toBe('DENY');
    });
  });

  describe('Request Validation', () => {
    it('should block requests with suspicious URL patterns', async () => {
      const suspiciousUrls = [
        '/test/../etc/passwd',
        '/test?param=<script>alert(1)</script>',
        '/test?union=select * from users',
        '/test?param=javascript:alert(1)',
      ];

      for (const url of suspiciousUrls) {
        await request(app).get(url).expect(400);
      }
    });

    it('should block requests with excessive query parameters', async () => {
      let url = '/test?';
      // Add more than the limit (100) parameters
      for (let i = 0; i <= 105; i++) {
        url += `param${i}=value${i}&`;
      }

      await request(app).get(url).expect(400);
    });

    it('should block requests with suspicious headers', async () => {
      await request(app)
        .get('/test')
        .set('X-Custom-Header', '<script>alert(1)</script>')
        .expect(400);
    });

    it('should require Content-Type for POST requests', async () => {
      app.post('/test-post', (req: Request, res: Response) => {
        res.json({ message: 'Success' });
      });

      await request(app).post('/test-post').send({ data: 'test' }).expect(400);
    });

    it('should accept valid POST requests with Content-Type', async () => {
      app.post('/test-post', (req: Request, res: Response) => {
        res.json({ message: 'Success' });
      });

      await request(app)
        .post('/test-post')
        .set('Content-Type', 'application/json')
        .send({ data: 'test' })
        .expect(200);
    });
  });

  describe('Security Context', () => {
    it('should add security context to requests', async () => {
      let capturedContext: any = null;

      app.get('/context-test', (req: Request, res: Response) => {
        capturedContext = (req as any).securityContext;
        res.json({ message: 'Context test' });
      });

      await request(app).get('/context-test').set('User-Agent', 'Test Agent').expect(200);

      expect(capturedContext).toBeDefined();
      expect(capturedContext.timestamp).toBeDefined();
      expect(capturedContext.method).toBe('GET');
      expect(capturedContext.url).toBe('/context-test');
      expect(capturedContext.userAgent).toBe('Test Agent');
    });
  });

  describe('Configuration Validation', () => {
    it('should generate valid helmet configuration', () => {
      const config = getHelmetConfig();

      expect(config).toBeDefined();
      expect(config.contentSecurityPolicy).toBeDefined();
      expect(config.frameguard).toBeDefined();
      expect(config.noSniff).toBe(true);
      expect(config.xssFilter).toBe(true);
      expect(config.hidePoweredBy).toBe(true);
    });

    it('should provide valid security headers', () => {
      const headers = getSecurityHeaders();

      expect(headers).toBeDefined();
      expect(headers['Server']).toBe('TryZore-API');
      expect(headers['X-API-Version']).toBe('1.0');
      expect(headers['Cache-Control']).toContain('no-store');
    });

    it('should provide valid CORS origins', () => {
      const origins = getCorsOrigins();

      expect(Array.isArray(origins)).toBe(true);
      expect(origins.length).toBeGreaterThan(0);

      // In development, should include localhost
      if (process.env.NODE_ENV === 'development') {
        expect(origins.some(origin => origin.includes('localhost'))).toBe(true);
      }
    });
  });

  describe('Environment-Specific Configuration', () => {
    it('should have different configurations for development vs production', () => {
      const originalEnv = process.env.NODE_ENV;

      // Test development config
      process.env.NODE_ENV = 'development';
      const devConfig = getHelmetConfig();

      // Test production config
      process.env.NODE_ENV = 'production';
      const prodConfig = getHelmetConfig();

      // CSP should be report-only in development
      expect(devConfig.contentSecurityPolicy?.reportOnly).toBe(true);
      expect(prodConfig.contentSecurityPolicy?.reportOnly).toBe(false);

      // HSTS should be disabled in development
      expect(devConfig.hsts?.maxAge).toBe(0);
      expect(prodConfig.hsts?.maxAge).toBe(31536000);

      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });
  });
});
