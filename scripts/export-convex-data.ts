#!/usr/bin/env tsx

/**
 * Convex Data Export Script
 * 
 * Provides manual backup capabilities with compression, encryption, and validation.
 * Supports both selective table exports and full database exports.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

const execAsync = promisify(exec);

interface ExportOptions {
  outputDir?: string;
  tables?: string[];
  encrypt?: boolean;
  compress?: boolean;
  timestamp?: boolean;
  validate?: boolean;
}

interface ExportResult {
  success: boolean;
  filePath?: string;
  size?: number;
  checksum?: string;
  tables?: string[];
  duration?: number;
  error?: string;
}

class ConvexExporter {
  private options: Required<ExportOptions>;
  
  constructor(options: ExportOptions = {}) {
    this.options = {
      outputDir: options.outputDir || './backups',
      tables: options.tables || [],
      encrypt: options.encrypt ?? true,
      compress: options.compress ?? true,
      timestamp: options.timestamp ?? true,
      validate: options.validate ?? true,
    };
  }
  
  async export(): Promise<ExportResult> {
    const startTime = Date.now();
    
    try {
      // Ensure output directory exists
      await fs.mkdir(this.options.outputDir, { recursive: true });
      
      // Generate filename
      const timestamp = this.options.timestamp 
        ? new Date().toISOString().replace(/[:.]/g, '-')
        : '';
      
      const tablesSuffix = this.options.tables.length > 0 
        ? `_${this.options.tables.join('-')}`
        : '_full';
      
      const baseFilename = `convex_backup${tablesSuffix}${timestamp ? `_${timestamp}` : ''}`;
      const filePath = path.join(this.options.outputDir, `${baseFilename}.zip`);
      
      // Build Convex export command
      const exportCmd = this.buildExportCommand(filePath);
      
      console.log('🚀 Starting Convex export...');
      console.log(`   Command: ${exportCmd}`);
      console.log(`   Output: ${filePath}`);
      
      // Execute export
      const { stdout, stderr } = await execAsync(exportCmd);
      
      if (stderr && !stderr.includes('Warning')) {
        console.warn('Export warnings:', stderr);
      }
      
      // Validate export file
      if (this.options.validate) {
        await this.validateExport(filePath);
      }
      
      // Get file stats
      const stats = await fs.stat(filePath);
      const size = stats.size;
      
      // Calculate checksum
      const checksum = await this.calculateChecksum(filePath);
      
      // Encrypt if requested
      let finalPath = filePath;
      if (this.options.encrypt) {
        finalPath = await this.encryptFile(filePath);
        await fs.unlink(filePath); // Remove unencrypted file
      }
      
      const duration = Date.now() - startTime;
      
      console.log('✅ Export completed successfully');
      console.log(`   File: ${finalPath}`);
      console.log(`   Size: ${this.formatBytes(size)}`);
      console.log(`   Checksum: ${checksum.substring(0, 16)}...`);
      console.log(`   Duration: ${duration}ms`);
      
      return {
        success: true,
        filePath: finalPath,
        size,
        checksum,
        tables: this.options.tables,
        duration,
      };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error('❌ Export failed:', errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        duration,
      };
    }
  }
  
  private buildExportCommand(outputPath: string): string {
    let cmd = 'npx convex export';
    
    // Convex CLI uses --path instead of --output
    cmd += ` --path "${outputPath}"`;
    
    // Note: Convex CLI doesn't support selective table exports
    // We export everything and filter later if needed
    if (this.options.tables.length > 0) {
      console.warn('⚠️  Convex CLI does not support selective table exports');
      console.warn('   Exporting full database and will filter during restoration');
    }
    
    return cmd;
  }
  
  private async validateExport(filePath: string): Promise<void> {
    try {
      const stats = await fs.stat(filePath);
      
      if (stats.size === 0) {
        throw new Error('Export file is empty');
      }
      
      if (stats.size < 100) {
        throw new Error('Export file suspiciously small');
      }
      
      // Check if it's a valid ZIP file by reading the header
      const buffer = await fs.readFile(filePath);
      if (buffer.length < 4 || !buffer.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]))) {
        throw new Error('Export file is not a valid ZIP archive');
      }
      
      console.log('✅ Export validation passed');
      
    } catch (error) {
      throw new Error(`Export validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private async calculateChecksum(filePath: string): Promise<string> {
    const hash = crypto.createHash('sha256');
    const buffer = await fs.readFile(filePath);
    hash.update(buffer);
    return hash.digest('hex');
  }
  
  private async encryptFile(filePath: string): Promise<string> {
    const encryptedPath = `${filePath}.enc`;
    const encryptionKey = process.env.BACKUP_ENCRYPTION_KEY;
    
    if (!encryptionKey) {
      console.warn('⚠️  No encryption key provided, skipping encryption');
      return filePath;
    }
    
    const encryptCmd = [
      'openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000',
      `-in "${filePath}"`,
      `-out "${encryptedPath}"`,
      `-k "${encryptionKey}"`,
    ].join(' ');
    
    await execAsync(encryptCmd);
    
    console.log('🔐 File encrypted successfully');
    return encryptedPath;
  }
  
  private formatBytes(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);
    
    return `${Math.round(size * 100) / 100} ${sizes[i]}`;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options: ExportOptions = {};
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--output':
      case '-o':
        options.outputDir = args[++i];
        break;
      case '--tables':
      case '-t':
        options.tables = args[++i]?.split(',').map(t => t.trim());
        break;
      case '--no-encrypt':
        options.encrypt = false;
        break;
      case '--no-compress':
        options.compress = false;
        break;
      case '--no-timestamp':
        options.timestamp = false;
        break;
      case '--no-validate':
        options.validate = false;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;
      default:
        if (args[i].startsWith('-')) {
          console.error(`Unknown option: ${args[i]}`);
          process.exit(1);
        }
    }
  }
  
  console.log('📦 Convex Data Export Tool');
  console.log('==========================\n');
  
  const exporter = new ConvexExporter(options);
  const result = await exporter.export();
  
  if (result.success) {
    console.log('\n🎉 Export completed successfully!');
    
    // Output JSON for programmatic use
    if (process.env.CI) {
      console.log('\n--- Export Result JSON ---');
      console.log(JSON.stringify(result, null, 2));
    }
    
    process.exit(0);
  } else {
    console.log('\n💥 Export failed!');
    if (result.error) {
      console.error('Error:', result.error);
    }
    process.exit(1);
  }
}

function printHelp() {
  console.log(`
Convex Data Export Tool

Usage:
  npx tsx scripts/export-convex-data.ts [options]

Options:
  -o, --output <dir>     Output directory (default: ./backups)
  -t, --tables <list>    Comma-separated list of tables to export
  --no-encrypt           Skip encryption
  --no-compress          Skip compression
  --no-timestamp         Don't add timestamp to filename
  --no-validate          Skip file validation
  -h, --help             Show this help message

Examples:
  # Full database export
  npx tsx scripts/export-convex-data.ts

  # Export specific tables
  npx tsx scripts/export-convex-data.ts --tables users,organizations,transactions

  # Export to custom directory without encryption
  npx tsx scripts/export-convex-data.ts --output /backup/path --no-encrypt

Environment Variables:
  BACKUP_ENCRYPTION_KEY  Key for encrypting backup files
  CONVEX_DEPLOYMENT      Convex deployment to export from
`);
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}