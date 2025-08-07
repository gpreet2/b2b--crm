import { initializeDatabase, getDatabase } from '@/config/database';
import { logger } from '@/utils/logger';

// Singleton flag to track initialization
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

/**
 * Ensure database is initialized before use
 * Can be called multiple times safely - will only initialize once
 */
export async function ensureDatabaseInitialized(): Promise<void> {
  // If already initialized, return immediately
  if (isInitialized) {
    return;
  }

  // If initialization is already in progress, wait for it
  if (initializationPromise) {
    return initializationPromise;
  }

  // Start initialization
  initializationPromise = (async () => {
    try {
      // Try to get existing database instance first
      try {
        const existingDb = getDatabase();
        // If we get here, database is already initialized
        isInitialized = true;
        return;
      } catch (error) {
        // Database not initialized, need to initialize it
      }

      logger.debug('Initializing database for Next.js API routes');

      // Initialize database with environment variables
      const db = initializeDatabase({
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        healthCheck: {
          enabled: true,
          intervalMs: 60000, // Less frequent health checks for Next.js
        },
      });

      await db.initialize();
      isInitialized = true;
      
      logger.info('Database initialized successfully for Next.js API routes');
    } catch (error) {
      logger.error('Failed to initialize database for Next.js API routes', { error });
      // Reset the promise so we can try again later
      initializationPromise = null;
      throw error;
    }
  })();

  return initializationPromise;
}

/**
 * Get database instance, initializing if necessary
 */
export async function getDatabaseInstance() {
  await ensureDatabaseInitialized();
  return getDatabase();
}