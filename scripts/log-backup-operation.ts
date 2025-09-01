#!/usr/bin/env tsx

/**
 * Log Backup Operation Script
 * 
 * Called by GitHub Actions to log backup operations to the Convex monitoring system.
 * This script provides integration between GitHub Actions and Convex backup monitoring.
 */

import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';

// Parse command line arguments
interface BackupLogArgs {
  type: 'manual' | 'scheduled' | 'emergency';
  tier: 'critical' | 'standard' | 'non-critical';
  tables: string;
  status: 'success' | 'failed' | 'partial';
  size?: string;
  checksum?: string;
  duration?: string;
  errorMessage?: string;
}

function parseArgs(): BackupLogArgs {
  const args = process.argv.slice(2);
  const parsedArgs: any = {};
  
  for (let i = 0; i < args.length; i += 2) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      const value = args[i + 1];
      parsedArgs[key] = value;
    }
  }
  
  // Validate required arguments
  const required = ['type', 'tier', 'tables', 'status'];
  for (const req of required) {
    if (!parsedArgs[req]) {
      console.error(`Missing required argument: --${req}`);
      process.exit(1);
    }
  }
  
  return parsedArgs as BackupLogArgs;
}

async function logBackupOperation() {
  try {
    const args = parseArgs();
    
    // Initialize Convex client
    const convexUrl = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error('CONVEX_URL environment variable not set');
    }
    
    const client = new ConvexHttpClient(convexUrl);
    
    // Parse tables array
    const tables = args.tables === 'all' 
      ? ['users', 'organizations', 'clients', 'employees', 'transactions', 'auditLogs', 'systemHealth']
      : args.tables.split(',').map(t => t.trim());
    
    // Prepare mutation arguments
    const mutationArgs = {
      type: args.type,
      tier: args.tier,
      tables,
      status: args.status,
      size: args.size ? parseInt(args.size) : undefined,
      checksum: args.checksum,
      duration: args.duration ? parseInt(args.duration) : undefined,
      errorMessage: args.errorMessage,
    };
    
    // Log the backup operation
    const logId = await client.mutation(api.backup.monitor.logBackupOperation, mutationArgs);
    
    console.log('✅ Backup operation logged successfully');
    console.log(`   Log ID: ${logId}`);
    console.log(`   Type: ${args.type}`);
    console.log(`   Tier: ${args.tier}`);
    console.log(`   Tables: ${tables.join(', ')}`);
    console.log(`   Status: ${args.status}`);
    
    if (args.size) {
      console.log(`   Size: ${formatBytes(parseInt(args.size))}`);
    }
    
    if (args.checksum) {
      console.log(`   Checksum: ${args.checksum.substring(0, 16)}...`);
    }
    
  } catch (error) {
    console.error('❌ Failed to log backup operation:', error);
    
    // Log detailed error information for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Don't fail the GitHub Action for logging errors
    // The backup itself may have succeeded even if logging failed
    console.warn('⚠️  Backup logging failed, but backup may have succeeded');
    process.exit(0);
  }
}

function formatBytes(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  
  return `${Math.round(size * 100) / 100} ${sizes[i]}`;
}

// Run the script
if (require.main === module) {
  logBackupOperation().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}