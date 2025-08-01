import { Request, Response, Router } from 'express';
import { getDatabase } from '../config/database';

export const dashboardRouter = Router();

// Serve the metrics dashboard HTML
dashboardRouter.get('/', (req: Request, res: Response) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Database Connection Pool Metrics</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    h1 {
      color: #333;
      margin-bottom: 30px;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .metric-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .metric-title {
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .metric-value {
      font-size: 32px;
      font-weight: bold;
      color: #333;
      margin-bottom: 8px;
    }
    .metric-status {
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 4px;
      display: inline-block;
    }
    .status-healthy {
      background: #d4edda;
      color: #155724;
    }
    .status-unhealthy {
      background: #f8d7da;
      color: #721c24;
    }
    .status-degraded {
      background: #fff3cd;
      color: #856404;
    }
    .chart-container {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    .chart {
      height: 200px;
      position: relative;
    }
    .error {
      background: #f8d7da;
      color: #721c24;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 20px;
    }
    .refresh-info {
      text-align: center;
      color: #666;
      font-size: 14px;
      margin-top: 20px;
    }
    .progress-bar {
      width: 100%;
      height: 4px;
      background: #e0e0e0;
      border-radius: 2px;
      overflow: hidden;
      margin-top: 8px;
    }
    .progress-fill {
      height: 100%;
      background: #4caf50;
      transition: width 0.3s ease;
    }
    .progress-fill.warning {
      background: #ff9800;
    }
    .progress-fill.danger {
      background: #f44336;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Database Connection Pool Metrics</h1>
    
    <div id="error-container"></div>
    
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-title">Pool Status</div>
        <div id="pool-status" class="metric-value">-</div>
        <div id="pool-status-badge" class="metric-status">Loading...</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-title">Total Connections</div>
        <div id="total-connections" class="metric-value">-</div>
        <div class="progress-bar">
          <div id="connections-progress" class="progress-fill" style="width: 0%"></div>
        </div>
      </div>
      
      <div class="metric-card">
        <div class="metric-title">Idle Connections</div>
        <div id="idle-connections" class="metric-value">-</div>
        <div id="idle-percentage" style="font-size: 14px; color: #666;">-</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-title">Waiting Clients</div>
        <div id="waiting-clients" class="metric-value">-</div>
        <div id="waiting-status" style="font-size: 14px; color: #666;">-</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-title">Total Queries</div>
        <div id="total-queries" class="metric-value">-</div>
        <div id="query-rate" style="font-size: 14px; color: #666;">-</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-title">Failed Queries</div>
        <div id="failed-queries" class="metric-value">-</div>
        <div id="failure-rate" style="font-size: 14px; color: #666;">-</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-title">Avg Query Time</div>
        <div id="avg-query-time" class="metric-value">-</div>
        <div style="font-size: 14px; color: #666;">milliseconds</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-title">Circuit Breaker</div>
        <div id="circuit-state" class="metric-value">-</div>
        <div id="circuit-failures" style="font-size: 14px; color: #666;">-</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-title">Memory Usage</div>
        <div id="memory-usage" class="metric-value">-</div>
        <div class="progress-bar">
          <div id="memory-progress" class="progress-fill" style="width: 0%"></div>
        </div>
      </div>
      
      <div class="metric-card">
        <div class="metric-title">Uptime</div>
        <div id="uptime" class="metric-value">-</div>
        <div id="last-check" style="font-size: 14px; color: #666;">-</div>
      </div>
    </div>
    
    <div class="chart-container">
      <h3>Connection History (Last 60 seconds)</h3>
      <canvas id="connections-chart" width="100%" height="200"></canvas>
    </div>
    
    <div class="refresh-info">
      Auto-refreshing every 5 seconds. Last update: <span id="last-update">-</span>
    </div>
  </div>

  <script>
    const history = {
      timestamps: [],
      totalConnections: [],
      idleConnections: [],
      waitingClients: [],
      maxDataPoints: 60
    };
    
    let queryCount = 0;
    let lastUpdateTime = Date.now();

    async function fetchMetrics() {
      try {
        const [healthRes, metricsRes] = await Promise.all([
          fetch('/monitoring/health'),
          fetch('/monitoring/metrics')
        ]);
        
        const health = await healthRes.json();
        const metrics = await metricsRes.json();
        
        updateUI(health, metrics);
        updateHistory(metrics);
        drawChart();
        
        document.getElementById('error-container').innerHTML = '';
      } catch (error) {
        document.getElementById('error-container').innerHTML = 
          '<div class="error">Failed to fetch metrics: ' + error.message + '</div>';
      }
    }

    function updateUI(health, metrics) {
      // Pool status
      document.getElementById('pool-status').textContent = health.status.toUpperCase();
      const statusBadge = document.getElementById('pool-status-badge');
      statusBadge.textContent = health.checks.database.status === 'pass' ? 'Connected' : 'Disconnected';
      statusBadge.className = 'metric-status status-' + health.status;
      
      // Database metrics
      const db = metrics.database || {};
      document.getElementById('total-connections').textContent = db.totalConnections || 0;
      document.getElementById('idle-connections').textContent = db.idleConnections || 0;
      document.getElementById('waiting-clients').textContent = db.waitingClients || 0;
      
      // Connection progress
      const maxConnections = 20; // Default pool max
      const connPercent = ((db.totalConnections || 0) / maxConnections) * 100;
      const connProgress = document.getElementById('connections-progress');
      connProgress.style.width = Math.min(connPercent, 100) + '%';
      connProgress.className = 'progress-fill' + 
        (connPercent > 80 ? ' danger' : connPercent > 60 ? ' warning' : '');
      
      // Idle percentage
      const idlePercent = db.totalConnections > 0 
        ? Math.round((db.idleConnections / db.totalConnections) * 100)
        : 0;
      document.getElementById('idle-percentage').textContent = idlePercent + '% idle';
      
      // Waiting status
      const waitingStatus = db.waitingClients > 0 
        ? db.waitingClients + ' clients waiting'
        : 'No clients waiting';
      document.getElementById('waiting-status').textContent = waitingStatus;
      
      // Query metrics
      document.getElementById('total-queries').textContent = db.totalQueries || 0;
      document.getElementById('failed-queries').textContent = db.failedQueries || 0;
      document.getElementById('avg-query-time').textContent = 
        db.avgQueryTime ? db.avgQueryTime.toFixed(2) : '0';
      
      // Query rate
      const currentTime = Date.now();
      const timeDiff = (currentTime - lastUpdateTime) / 1000;
      const queryRate = timeDiff > 0 ? ((db.totalQueries - queryCount) / timeDiff).toFixed(1) : 0;
      document.getElementById('query-rate').textContent = queryRate + ' queries/sec';
      queryCount = db.totalQueries || 0;
      lastUpdateTime = currentTime;
      
      // Failure rate
      const failureRate = db.totalQueries > 0 
        ? ((db.failedQueries / db.totalQueries) * 100).toFixed(2)
        : 0;
      document.getElementById('failure-rate').textContent = failureRate + '% failure rate';
      
      // Circuit breaker
      if (db.circuitBreaker) {
        document.getElementById('circuit-state').textContent = 
          db.circuitBreaker.state.toUpperCase();
        document.getElementById('circuit-failures').textContent = 
          db.circuitBreaker.failures + ' failures';
      }
      
      // Memory usage
      const memUsage = metrics.memory;
      const memMB = (memUsage.heapUsed / 1024 / 1024).toFixed(0);
      const memTotal = (memUsage.heapTotal / 1024 / 1024).toFixed(0);
      document.getElementById('memory-usage').textContent = memMB + ' MB';
      
      const memPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
      const memProgress = document.getElementById('memory-progress');
      memProgress.style.width = memPercent + '%';
      memProgress.className = 'progress-fill' + 
        (memPercent > 90 ? ' danger' : memPercent > 70 ? ' warning' : '');
      
      // Uptime
      const uptime = metrics.uptime;
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      document.getElementById('uptime').textContent = 
        hours + 'h ' + minutes + 'm ' + seconds + 's';
      
      // Last check
      const lastCheck = new Date(db.lastHealthCheck);
      document.getElementById('last-check').textContent = 
        'Last check: ' + lastCheck.toLocaleTimeString();
      
      // Last update
      document.getElementById('last-update').textContent = 
        new Date().toLocaleTimeString();
    }

    function updateHistory(metrics) {
      const db = metrics.database || {};
      const now = new Date();
      
      history.timestamps.push(now);
      history.totalConnections.push(db.totalConnections || 0);
      history.idleConnections.push(db.idleConnections || 0);
      history.waitingClients.push(db.waitingClients || 0);
      
      // Keep only last N data points
      if (history.timestamps.length > history.maxDataPoints) {
        history.timestamps.shift();
        history.totalConnections.shift();
        history.idleConnections.shift();
        history.waitingClients.shift();
      }
    }

    function drawChart() {
      const canvas = document.getElementById('connections-chart');
      const ctx = canvas.getContext('2d');
      const width = canvas.width = canvas.offsetWidth;
      const height = canvas.height = 200;
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      if (history.timestamps.length < 2) return;
      
      // Draw grid
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = (height / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      
      // Calculate scales
      const maxValue = Math.max(
        ...history.totalConnections,
        ...history.waitingClients,
        20
      );
      const xScale = width / (history.maxDataPoints - 1);
      const yScale = height / maxValue;
      
      // Draw lines
      const datasets = [
        { data: history.totalConnections, color: '#4caf50', label: 'Total' },
        { data: history.idleConnections, color: '#2196f3', label: 'Idle' },
        { data: history.waitingClients, color: '#ff9800', label: 'Waiting' }
      ];
      
      datasets.forEach(dataset => {
        ctx.strokeStyle = dataset.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        dataset.data.forEach((value, i) => {
          const x = i * xScale;
          const y = height - (value * yScale);
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        
        ctx.stroke();
      });
      
      // Draw legend
      ctx.font = '12px sans-serif';
      let legendX = 10;
      datasets.forEach(dataset => {
        ctx.fillStyle = dataset.color;
        ctx.fillRect(legendX, 10, 15, 10);
        ctx.fillStyle = '#333';
        ctx.fillText(dataset.label, legendX + 20, 19);
        legendX += 80;
      });
    }

    // Initial fetch
    fetchMetrics();
    
    // Auto-refresh every 5 seconds
    setInterval(fetchMetrics, 5000);
  </script>
</body>
</html>
  `;
  
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});