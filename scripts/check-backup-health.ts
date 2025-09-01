#!/usr/bin/env tsx

/**
 * Backup Health Check Script
 * 
 * Called by GitHub Actions to monitor backup system health and detect issues.
 * Returns JSON status that can be parsed by the workflow.
 */

import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';

interface HealthCheckResult {
  status: 'healthy' | 'warning' | 'critical';
  rpoCompliant: boolean;
  successRate24h: number;
  timeSinceLastCritical: number;
  alerts: Array<{
    level: string;
    type: string;
    message: string;
  }>;
  timestamp: number;
}

async function checkBackupHealth(): Promise<HealthCheckResult> {
  try {
    // Initialize Convex client
    const convexUrl = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error('CONVEX_URL environment variable not set');
    }
    
    const client = new ConvexHttpClient(convexUrl);
    
    // Query backup health status
    const healthData = await client.query(api.backup.monitor.getBackupHealth, {});
    
    // Extract key metrics
    const result: HealthCheckResult = {
      status: healthData.status,
      rpoCompliant: healthData.rpo.compliant,
      successRate24h: healthData.successRate.last24Hours,
      timeSinceLastCritical: healthData.rpo.timeSinceLastCritical,
      alerts: healthData.alerts,
      timestamp: Date.now(),
    };
    
    return result;
    
  } catch (error) {
    // Return critical status if we can't check health
    return {
      status: 'critical',
      rpoCompliant: false,
      successRate24h: 0,
      timeSinceLastCritical: 0,
      alerts: [{
        level: 'critical',
        type: 'health_check_failed',
        message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }],
      timestamp: Date.now(),
    };
  }
}

async function main() {
  try {
    const healthResult = await checkBackupHealth();
    
    // Output JSON for GitHub Actions to parse
    console.log(JSON.stringify(healthResult, null, 2));
    
    // Log human-readable summary
    console.error(`\n📊 Backup Health Summary:`);
    console.error(`   Status: ${healthResult.status.toUpperCase()}`);
    console.error(`   RPO Compliant: ${healthResult.rpoCompliant ? '✅' : '❌'}`);
    console.error(`   Success Rate (24h): ${healthResult.successRate24h.toFixed(1)}%`);
    
    if (healthResult.timeSinceLastCritical > 0) {
      const minutes = Math.round(healthResult.timeSinceLastCritical / 60000);
      console.error(`   Last Critical Backup: ${minutes} minutes ago`);
    }
    
    if (healthResult.alerts.length > 0) {
      console.error(`\n🚨 Active Alerts:`);
      healthResult.alerts.forEach(alert => {
        const emoji = alert.level === 'critical' ? '🔴' : 
                     alert.level === 'warning' ? '🟡' : '🔵';
        console.error(`   ${emoji} [${alert.level.toUpperCase()}] ${alert.message}`);
      });
    }
    
    // Exit with appropriate code based on health status
    if (healthResult.status === 'critical' || !healthResult.rpoCompliant) {
      console.error('\n❌ Critical backup system issues detected');
      process.exit(1);
    } else if (healthResult.status === 'warning') {
      console.error('\n⚠️  Backup system warnings detected');
      process.exit(0); // Don't fail GitHub Action for warnings
    } else {
      console.error('\n✅ Backup system is healthy');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('❌ Health check script failed:', error);
    
    // Output minimal error JSON for GitHub Actions
    const errorResult = {
      status: 'critical',
      rpoCompliant: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now(),
    };
    
    console.log(JSON.stringify(errorResult));
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}