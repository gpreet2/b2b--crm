/**
 * Database Backup Strategy Configuration
 * 
 * Defines RTO (Recovery Time Objective) and RPO (Recovery Point Objective)
 * targets along with backup schedules for the TryZore fitness management system.
 */

export const BackupConfig = {
  // Recovery targets (production requirements)
  rto: 4 * 60 * 60 * 1000, // 4 hours maximum downtime (ms)
  rpo: 15 * 60 * 1000,     // 15 minutes maximum data loss (ms)
  
  // Backup retention policies
  retention: {
    manual: 7,    // 7 days for manual backups
    daily: 30,    // 30 days for daily backups  
    weekly: 12,   // 12 weeks for weekly backups
    monthly: 12,  // 12 months for monthly backups
  },

  // Critical tables requiring frequent backups (every 15 minutes)
  criticalTables: [
    'users',           // User accounts and authentication
    'organizations',   // Organization data and settings
    'transactions',    // Financial transactions and payments
    'auditLogs',       // Security and compliance logs
    'systemHealth',    // System monitoring and alerts
    'employees',       // Employee access and permissions
  ],

  // Standard tables (backup every 4 hours)
  standardTables: [
    'clients',         // Client profiles and data
    'metrics',         // Analytics and reporting data
    'notifications',   // System notifications
    'settings',        // Application configuration
    'invitations',     // Pending invitations
    'roles',          // Permission roles
  ],

  // Non-critical tables (daily backup sufficient)
  nonCriticalTables: [
    'loginHistory',    // Login tracking
    'sessions',        // User sessions
    'analytics',       // Usage analytics
    'cache',          // Temporary cache data
  ],

  // Backup schedules (cron format)
  schedules: {
    critical: '*/15 * * * *',    // Every 15 minutes (meets RPO)
    standard: '0 */4 * * *',     // Every 4 hours
    full: '0 2 * * *',           // Daily at 2 AM UTC
    weekly: '0 2 * * 0',         // Sunday at 2 AM UTC
    monthly: '0 2 1 * *',        // First day of month at 2 AM UTC
  },

  // Storage configuration
  storage: {
    primary: 'convex',           // Primary: Convex managed backups
    secondary: 'github',         // Secondary: GitHub releases
    encryption: 'AES-256',       // Encryption standard
    compression: 'gzip',         // Compression format
  },

  // Backup validation settings
  validation: {
    checksumAlgorithm: 'SHA-256',
    integrityCheck: true,
    encryptionVerification: true,
    maxBackupSize: '500MB',      // Alert threshold
  },

  // Restoration settings
  restoration: {
    maxParallelRestores: 5,      // Concurrent table restores
    validationTimeout: 30000,    // 30 seconds per table
    rollbackTimeout: 300000,     // 5 minutes for rollback
  },

  // Monitoring and alerting
  monitoring: {
    backupFailureAlert: true,
    restorationTestAlert: true,
    diskSpaceAlert: 0.8,         // Alert at 80% capacity
    backupAgeAlert: 24,          // Alert if backup older than 24h
  }
} as const;

// Type definitions for backup operations
export type BackupTier = 'critical' | 'standard' | 'non-critical';
export type BackupType = 'manual' | 'scheduled' | 'emergency';
export type RestorationType = 'full' | 'partial' | 'point-in-time';

export interface BackupMetadata {
  id: string;
  timestamp: number;
  tier: BackupTier;
  type: BackupType;
  tables: string[];
  size: number;
  checksum: string;
  encrypted: boolean;
  retentionExpiry: number;
}

export interface RestoreOperation {
  id: string;
  backupId: string;
  type: RestorationType;
  targetTables: string[];
  startTime: number;
  estimatedCompletion: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
}