/**
 * Backup Monitoring System
 * 
 * Monitors backup health, tracks success rates, and provides alerting
 * for the TryZore database backup strategy.
 */

import { query, mutation } from '../_generated/server';
import { v } from 'convex/values';
import { BackupConfig, BackupMetadata } from './config';

/**
 * Query to get backup health status
 */
export const getBackupHealth = query({
  args: {},
  handler: async (ctx) => {
    // Get recent backup records
    const recentBackups = await ctx.db
      .query('backupLogs')
      .withIndex('by_timestamp')
      .order('desc')
      .take(100);

    const now = Date.now();
    const last24Hours = now - (24 * 60 * 60 * 1000);
    const last7Days = now - (7 * 24 * 60 * 60 * 1000);

    // Calculate success rates
    const recent24h = recentBackups.filter(b => b.timestamp > last24Hours);
    const recent7d = recentBackups.filter(b => b.timestamp > last7Days);

    const successRate24h = recent24h.length > 0 
      ? (recent24h.filter(b => b.status === 'success').length / recent24h.length) * 100
      : 0;

    const successRate7d = recent7d.length > 0
      ? (recent7d.filter(b => b.status === 'success').length / recent7d.length) * 100
      : 0;

    // Check for RPO compliance
    const criticalBackups = recent24h.filter(b => 
      BackupConfig.criticalTables.some(table => b.tables.includes(table))
    );

    const lastCriticalBackup = criticalBackups[0];
    const timeSinceLastCritical = lastCriticalBackup 
      ? now - lastCriticalBackup.timestamp
      : now;

    const rpoCompliant = timeSinceLastCritical <= BackupConfig.rpo;

    // Storage utilization (simulated - would integrate with actual storage API)
    const totalBackupSize = recentBackups.reduce((sum, backup) => sum + (backup.size || 0), 0);

    return {
      status: rpoCompliant && successRate24h >= 99.9 ? 'healthy' : 'warning',
      successRate: {
        last24Hours: successRate24h,
        last7Days: successRate7d,
      },
      rpo: {
        compliant: rpoCompliant,
        timeSinceLastCritical,
        threshold: BackupConfig.rpo,
      },
      storage: {
        totalSize: totalBackupSize,
        utilizationPercent: Math.min((totalBackupSize / (500 * 1024 * 1024)) * 100, 100), // 500MB threshold
      },
      recentBackups: recent24h.slice(0, 10),
      alerts: await generateAlerts(ctx, {
        rpoCompliant,
        successRate24h,
        timeSinceLastCritical,
        totalBackupSize,
      }),
    };
  },
});

/**
 * Log a backup operation
 */
export const logBackupOperation = mutation({
  args: {
    type: v.union(v.literal('manual'), v.literal('scheduled'), v.literal('emergency')),
    tier: v.union(v.literal('critical'), v.literal('standard'), v.literal('non-critical')),
    tables: v.array(v.string()),
    status: v.union(v.literal('success'), v.literal('failed'), v.literal('partial')),
    size: v.optional(v.number()),
    checksum: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();
    
    // Calculate retention expiry based on backup type
    let retentionDays: number = BackupConfig.retention.manual;
    if (args.type === 'scheduled') {
      if (args.tier === 'critical') {
        retentionDays = BackupConfig.retention.daily;
      } else {
        retentionDays = BackupConfig.retention.weekly;
      }
    }

    const retentionExpiry = timestamp + (retentionDays * 24 * 60 * 60 * 1000);

    // Store backup log
    const logId = await ctx.db.insert('backupLogs', {
      timestamp,
      type: args.type,
      tier: args.tier,
      tables: args.tables,
      status: args.status,
      size: args.size || 0,
      checksum: args.checksum || '',
      encrypted: true, // Convex provides encryption by default
      retentionExpiry,
      errorMessage: args.errorMessage,
      duration: args.duration,
    });

    // Update backup statistics
    await updateBackupStats(ctx, {
      timestamp,
      status: args.status,
      tier: args.tier,
      size: args.size || 0,
    });

    // Trigger alerts if necessary
    if (args.status === 'failed') {
      await triggerBackupFailureAlert(ctx, {
        logId,
        tables: args.tables,
        errorMessage: args.errorMessage || 'Unknown error',
        timestamp,
      });
    }

    return logId;
  },
});

/**
 * Generate health alerts based on current status
 */
async function generateAlerts(
  ctx: any,
  metrics: {
    rpoCompliant: boolean;
    successRate24h: number;
    timeSinceLastCritical: number;
    totalBackupSize: number;
  }
) {
  const alerts = [];

  // RPO compliance alert
  if (!metrics.rpoCompliant) {
    alerts.push({
      level: 'critical',
      type: 'rpo_violation',
      message: `RPO violation: ${Math.round(metrics.timeSinceLastCritical / 60000)} minutes since last critical backup (max: ${BackupConfig.rpo / 60000} minutes)`,
      timestamp: Date.now(),
    });
  }

  // Success rate alert
  if (metrics.successRate24h < 99.9) {
    alerts.push({
      level: 'warning',
      type: 'low_success_rate',
      message: `Low backup success rate: ${metrics.successRate24h.toFixed(1)}% (target: 99.9%)`,
      timestamp: Date.now(),
    });
  }

  // Storage utilization alert
  const utilizationPercent = (metrics.totalBackupSize / (500 * 1024 * 1024)) * 100;
  if (utilizationPercent > BackupConfig.monitoring.diskSpaceAlert * 100) {
    alerts.push({
      level: 'warning',
      type: 'storage_utilization',
      message: `High storage utilization: ${utilizationPercent.toFixed(1)}% (threshold: ${BackupConfig.monitoring.diskSpaceAlert * 100}%)`,
      timestamp: Date.now(),
    });
  }

  return alerts;
}

/**
 * Update backup statistics
 */
async function updateBackupStats(
  ctx: any,
  data: {
    timestamp: number;
    status: string;
    tier: string;
    size: number;
  }
) {
  const today = new Date(data.timestamp).toISOString().split('T')[0];
  
  // Get or create daily stats record
  let stats = await ctx.db
    .query('backupStats')
    .withIndex('by_date', (q: any) => q.eq('date', today))
    .first();

  if (!stats) {
    stats = await ctx.db.insert('backupStats', {
      date: today,
      totalBackups: 0,
      successfulBackups: 0,
      failedBackups: 0,
      totalSize: 0,
      avgDuration: 0,
      criticalBackups: 0,
      standardBackups: 0,
      nonCriticalBackups: 0,
    });
    stats = await ctx.db.get(stats);
  }

  // Update statistics
  const updates: any = {
    totalBackups: (stats?.totalBackups || 0) + 1,
    totalSize: (stats?.totalSize || 0) + data.size,
  };

  if (data.status === 'success') {
    updates.successfulBackups = (stats?.successfulBackups || 0) + 1;
  } else {
    updates.failedBackups = (stats?.failedBackups || 0) + 1;
  }

  // Update tier-specific counters
  if (data.tier === 'critical') {
    updates.criticalBackups = (stats?.criticalBackups || 0) + 1;
  } else if (data.tier === 'standard') {
    updates.standardBackups = (stats?.standardBackups || 0) + 1;
  } else {
    updates.nonCriticalBackups = (stats?.nonCriticalBackups || 0) + 1;
  }

  await ctx.db.patch(stats._id, updates);
}

/**
 * Trigger backup failure alert
 */
async function triggerBackupFailureAlert(
  ctx: any,
  data: {
    logId: any;
    tables: string[];
    errorMessage: string;
    timestamp: number;
  }
) {
  // Create alert record
  await ctx.db.insert('alerts', {
    type: 'backup_failure',
    level: 'critical',
    message: `Backup failed for tables: ${data.tables.join(', ')}`,
    details: {
      logId: data.logId,
      errorMessage: data.errorMessage,
      affectedTables: data.tables,
    },
    timestamp: data.timestamp,
    acknowledged: false,
    resolved: false,
  });

  // In a real implementation, this would trigger external notifications
  // (email, Slack, PagerDuty, etc.)
  console.error('BACKUP FAILURE ALERT:', {
    tables: data.tables,
    error: data.errorMessage,
    timestamp: new Date(data.timestamp).toISOString(),
  });
}

/**
 * Query backup statistics for reporting
 */
export const getBackupStats = query({
  args: {
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const endDate = args.endDate || new Date().toISOString().split('T')[0];
    const startDate = args.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const stats = await ctx.db
      .query('backupStats')
      .withIndex('by_date')
      .filter(q => q.gte(q.field('date'), startDate) && q.lte(q.field('date'), endDate))
      .collect();

    // Calculate aggregate statistics
    const totals = stats.reduce(
      (acc, stat) => ({
        totalBackups: acc.totalBackups + (stat.totalBackups || 0),
        successfulBackups: acc.successfulBackups + (stat.successfulBackups || 0),
        failedBackups: acc.failedBackups + (stat.failedBackups || 0),
        totalSize: acc.totalSize + (stat.totalSize || 0),
        criticalBackups: acc.criticalBackups + (stat.criticalBackups || 0),
        standardBackups: acc.standardBackups + (stat.standardBackups || 0),
        nonCriticalBackups: acc.nonCriticalBackups + (stat.nonCriticalBackups || 0),
      }),
      {
        totalBackups: 0,
        successfulBackups: 0,
        failedBackups: 0,
        totalSize: 0,
        criticalBackups: 0,
        standardBackups: 0,
        nonCriticalBackups: 0,
      }
    );

    const successRate = totals.totalBackups > 0 
      ? (totals.successfulBackups / totals.totalBackups) * 100 
      : 0;

    return {
      period: { startDate, endDate },
      dailyStats: stats,
      totals,
      successRate,
      averageBackupSize: totals.totalBackups > 0 ? totals.totalSize / totals.totalBackups : 0,
    };
  },
});

/**
 * Cleanup expired backup logs
 */
export const cleanupExpiredLogs = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    // Find expired backup logs
    const expiredLogs = await ctx.db
      .query('backupLogs')
      .withIndex('by_retention_expiry')
      .filter(q => q.lt(q.field('retentionExpiry'), now))
      .collect();

    // Delete expired logs
    let deletedCount = 0;
    for (const log of expiredLogs) {
      await ctx.db.delete(log._id);
      deletedCount++;
    }

    return {
      deletedCount,
      message: `Cleaned up ${deletedCount} expired backup logs`,
    };
  },
});