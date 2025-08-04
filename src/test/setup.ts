// Enhanced test setup file with real data integration
import path from 'path';

import dotenv from 'dotenv';

import { verifyTestDatabase } from './database-setup';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Also add SUPABASE_URL mapping for consistency
if (!process.env.SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL) {
  process.env.SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
}

// Map the service role key to the expected name for backward compatibility
if (!process.env.SUPABASE_SERVICE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  process.env.SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
}

// Validate required environment variables for real data testing
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_KEY',
  'WORKOS_API_KEY',
  'WORKOS_CLIENT_ID'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables for real data testing:');
  missingVars.forEach(varName => console.error(`  - ${varName}`));
  console.error('\n💡 Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

// Use Object.defineProperty to set NODE_ENV for tests
Object.defineProperty(process.env, 'NODE_ENV', {
  value: 'test',
  writable: true,
  enumerable: true,
  configurable: true,
});

// Increase test timeout for real data integration tests
jest.setTimeout(60000);

// Global test setup - verify database connection before running tests
beforeAll(async () => {
  console.log('🔍 Verifying test database connection and schema...');
  
  try {
    await verifyTestDatabase();
    console.log('✅ Test database verification successful');
  } catch (error) {
    console.error('❌ Test database verification failed:', error);
    console.error('\n💡 Ensure your Supabase instance is running and migrations are applied.');
    throw error;
  }
});

// Mock console methods to reduce noise in tests (but keep error/warn for debugging)
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  // Keep warn and error for debugging test issues
  warn: console.warn,
  error: console.error,
};

// Global error handler for unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Global cleanup tracking for test data
global.testCleanupData = {
  users: [],
  organizations: [],
  roles: [],
};
