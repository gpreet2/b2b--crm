import request from 'supertest';
import express from 'express';
import { dashboardRouter } from '../api/dashboard';

describe('Dashboard API', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use('/dashboard', dashboardRouter);
  });

  describe('GET /dashboard', () => {
    it('should return HTML dashboard', async () => {
      const response = await request(app)
        .get('/dashboard')
        .expect(200)
        .expect('Content-Type', /text\/html/);

      expect(response.text).toContain('Database Connection Pool Metrics');
      expect(response.text).toContain('<canvas id="connections-chart"');
      expect(response.text).toContain('fetchMetrics()');
    });

    it('should include all metric cards', async () => {
      const response = await request(app)
        .get('/dashboard')
        .expect(200);

      const metricCards = [
        'Pool Status',
        'Total Connections',
        'Idle Connections',
        'Waiting Clients',
        'Total Queries',
        'Failed Queries',
        'Avg Query Time',
        'Circuit Breaker',
        'Memory Usage',
        'Uptime',
      ];

      metricCards.forEach(card => {
        expect(response.text).toContain(card);
      });
    });

    it('should include auto-refresh functionality', async () => {
      const response = await request(app)
        .get('/dashboard')
        .expect(200);

      expect(response.text).toContain('setInterval(fetchMetrics, 5000)');
      expect(response.text).toContain('Auto-refreshing every 5 seconds');
    });

    it('should include chart functionality', async () => {
      const response = await request(app)
        .get('/dashboard')
        .expect(200);

      expect(response.text).toContain('drawChart()');
      expect(response.text).toContain('Connection History (Last 60 seconds)');
    });

    it('should fetch from monitoring endpoints', async () => {
      const response = await request(app)
        .get('/dashboard')
        .expect(200);

      expect(response.text).toContain("fetch('/monitoring/health')");
      expect(response.text).toContain("fetch('/monitoring/metrics')");
    });
  });
});