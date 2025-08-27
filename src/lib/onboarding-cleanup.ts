import { getOnboardingSessionManager } from './onboarding-session';
import { logger } from '@/utils/logger';

export interface CleanupConfig {
  intervalMinutes: number;
  maxAgeHours: number;
  batchSize: number;
}

export class OnboardingCleanupService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  
  constructor(
    private config: CleanupConfig = {
      intervalMinutes: 60, // Run every hour
      maxAgeHours: 24,     // Clean sessions older than 24 hours
      batchSize: 100       // Process 100 sessions per batch
    }
  ) {}

  start(): void {
    if (this.intervalId) {
      logger.warn('Onboarding cleanup service is already running');
      return;
    }

    logger.info('Starting onboarding cleanup service', {
      intervalMinutes: this.config.intervalMinutes,
      maxAgeHours: this.config.maxAgeHours,
      batchSize: this.config.batchSize,
    });

    // Run immediately on start
    void this.runCleanup();

    // Schedule recurring cleanup
    this.intervalId = setInterval(() => {
      void this.runCleanup();
    }, this.config.intervalMinutes * 60 * 1000);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('Onboarding cleanup service stopped');
    }
  }

  async runCleanup(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Cleanup already in progress, skipping this run');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      const sessionManager = getOnboardingSessionManager();
      const cutoffTime = Date.now() - (this.config.maxAgeHours * 60 * 60 * 1000);
      
      logger.info('Starting onboarding session cleanup', {
        cutoffTime: new Date(cutoffTime).toISOString(),
        maxAgeHours: this.config.maxAgeHours,
      });

      // Get all session IDs for cleanup (this would need to be implemented in the session manager)
      const expiredSessionIds = await this.getExpiredSessionIds(cutoffTime);
      
      if (expiredSessionIds.length === 0) {
        logger.info('No expired onboarding sessions found');
        return;
      }

      logger.info(`Found ${expiredSessionIds.length} expired onboarding sessions to clean up`);

      // Clean up in batches
      let totalCleaned = 0;
      for (let i = 0; i < expiredSessionIds.length; i += this.config.batchSize) {
        const batch = expiredSessionIds.slice(i, i + this.config.batchSize);
        const cleaned = await this.cleanupBatch(batch);
        totalCleaned += cleaned;
        
        // Small delay between batches to avoid overwhelming the system
        if (i + this.config.batchSize < expiredSessionIds.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      const duration = Date.now() - startTime;
      logger.info('Onboarding session cleanup completed', {
        totalProcessed: expiredSessionIds.length,
        totalCleaned,
        durationMs: duration,
      });

    } catch (error) {
      logger.error('Error during onboarding session cleanup', { error });
    } finally {
      this.isRunning = false;
    }
  }

  private getExpiredSessionIds(_cutoffTime: number): Promise<string[]> {
    // This would need to be implemented in the session manager
    // For now, we'll return an empty array since we don't have a way to list all sessions
    // In a production system, this would query the Redis/database for expired sessions
    
    logger.warn('getExpiredSessionIds not fully implemented - would need session manager enhancement');
    return Promise.resolve([]);
  }

  private async cleanupBatch(sessionIds: string[]): Promise<number> {
    const sessionManager = getOnboardingSessionManager();
    let cleanedCount = 0;

    for (const sessionId of sessionIds) {
      try {
        await sessionManager.deleteSession(sessionId);
        cleanedCount++;
      } catch (error) {
        logger.warn('Failed to delete expired session', {
          sessionId,
          error,
        });
      }
    }

    logger.debug(`Cleaned up batch of ${cleanedCount}/${sessionIds.length} sessions`);
    return cleanedCount;
  }

  // Manual cleanup method for testing/admin use
  async cleanupExpiredSessions(maxAgeHours?: number): Promise<number> {
    const cutoffTime = Date.now() - ((maxAgeHours || this.config.maxAgeHours) * 60 * 60 * 1000);
    const expiredSessionIds = await this.getExpiredSessionIds(cutoffTime);
    
    let totalCleaned = 0;
    for (let i = 0; i < expiredSessionIds.length; i += this.config.batchSize) {
      const batch = expiredSessionIds.slice(i, i + this.config.batchSize);
      const cleaned = await this.cleanupBatch(batch);
      totalCleaned += cleaned;
    }

    return totalCleaned;
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      hasScheduledCleanup: this.intervalId !== null,
      config: this.config,
    };
  }
}

// Global instance
let cleanupService: OnboardingCleanupService | null = null;

export function getOnboardingCleanupService(config?: CleanupConfig): OnboardingCleanupService {
  if (!cleanupService) {
    cleanupService = new OnboardingCleanupService(config);
  }
  return cleanupService;
}

// Auto-start in production
if (process.env.NODE_ENV === 'production') {
  const service = getOnboardingCleanupService();
  service.start();
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    service.stop();
  });
  process.on('SIGTERM', () => {
    service.stop();
  });
}