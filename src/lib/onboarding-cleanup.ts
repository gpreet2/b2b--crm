import { getOnboardingSessionManager } from './onboarding-session';
import { logger } from '@/utils/logger';

export interface CleanupResult {
  success: boolean;
  cleanedSessions: number;
  errors: string[];
  duration: number;
}

export interface CleanupOptions {
  maxAge?: number; // Hours
  batchSize?: number;
  dryRun?: boolean;
}

export interface CleanupStats {
  totalSessions: number;
  expiredSessions: number;
  orphanedSessions: number;
  stuckSessions: number;
  oldSessions: number;
}

export class OnboardingCleanupManager {
  private sessionManager = getOnboardingSessionManager();
  
  // Default cleanup configuration
  private readonly DEFAULT_CONFIG = {
    MAX_AGE_HOURS: 72, // 3 days
    BATCH_SIZE: 100,
    ORPHANED_THRESHOLD_HOURS: 24, // Sessions without updates for 24h
    STUCK_THRESHOLD_HOURS: 6, // Sessions stuck on same step for 6h
  };

  /**
   * Run comprehensive cleanup of onboarding sessions
   */
  async runCleanup(options: CleanupOptions = {}): Promise<CleanupResult> {
    const startTime = Date.now();
    const config = {
      maxAge: options.maxAge || this.DEFAULT_CONFIG.MAX_AGE_HOURS,
      batchSize: options.batchSize || this.DEFAULT_CONFIG.BATCH_SIZE,
      dryRun: options.dryRun || false,
    };

    const errors: string[] = [];
    let totalCleaned = 0;

    try {
      logger.info('Starting onboarding session cleanup', {
        config,
        timestamp: new Date().toISOString()
      });

      // 1. Clean up expired sessions (already handled by sessionManager)
      const expiredCleaned = await this.cleanExpiredSessions(config.dryRun);
      totalCleaned += expiredCleaned;

      // 2. Clean up orphaned sessions (no recent activity)
      const orphanedCleaned = await this.cleanOrphanedSessions(config.dryRun);
      totalCleaned += orphanedCleaned;

      // 3. Clean up stuck sessions (same step for too long)
      const stuckCleaned = await this.cleanStuckSessions(config.dryRun);
      totalCleaned += stuckCleaned;

      // 4. Clean up very old sessions (beyond max age)
      const oldCleaned = await this.cleanOldSessions(config.maxAge, config.dryRun);
      totalCleaned += oldCleaned;

      const duration = Date.now() - startTime;
      
      logger.info('Onboarding session cleanup completed', {
        totalCleaned,
        duration,
        dryRun: config.dryRun
      });

      return {
        success: true,
        cleanedSessions: totalCleaned,
        errors,
        duration
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Cleanup process failed', { error, duration });
      
      return {
        success: false,
        cleanedSessions: totalCleaned,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        duration
      };
    }
  }

  /**
   * Clean up expired sessions using built-in method
   */
  private async cleanExpiredSessions(dryRun: boolean = false): Promise<number> {
    try {
      if (dryRun) {
        // For dry run, just count expired sessions
        const stats = await this.sessionManager.getSessionStats();
        const expiredCount = stats.expired;
        logger.info('Dry run: Would clean expired sessions', { count: expiredCount });
        return 0;
      }

      const cleaned = await this.sessionManager.cleanupExpiredSessions();
      logger.info('Cleaned expired sessions', { count: cleaned });
      return cleaned;
    } catch (error) {
      logger.error('Failed to clean expired sessions', { error });
      return 0;
    }
  }

  /**
   * Clean up orphaned sessions (no activity for too long)
   */
  private async cleanOrphanedSessions(dryRun: boolean = false): Promise<number> {
    try {
      const cutoffTime = new Date(Date.now() - this.DEFAULT_CONFIG.ORPHANED_THRESHOLD_HOURS * 60 * 60 * 1000);
      
      // Get sessions that haven't been updated recently and aren't completed
      const { data: orphanedSessions, error } = await this.sessionManager['db'].getSupabaseClient()
        .from('onboarding_sessions')
        .select('id')
        .lt('updated_at', cutoffTime.toISOString())
        .eq('is_completed', false)
        .gt('expires_at', new Date().toISOString()); // Not expired yet

      if (error || !orphanedSessions) {
        logger.error('Failed to query orphaned sessions', { error });
        return 0;
      }

      if (dryRun) {
        logger.info('Dry run: Would clean orphaned sessions', { count: orphanedSessions.length });
        return 0;
      }

      // Delete orphaned sessions
      let cleaned = 0;
      for (const session of orphanedSessions) {
        const success = await this.sessionManager.deleteSession(session.id);
        if (success) cleaned++;
      }

      logger.info('Cleaned orphaned sessions', { count: cleaned });
      return cleaned;
    } catch (error) {
      logger.error('Failed to clean orphaned sessions', { error });
      return 0;
    }
  }

  /**
   * Clean up sessions stuck on the same step for too long
   */
  private async cleanStuckSessions(dryRun: boolean = false): Promise<number> {
    try {
      const cutoffTime = new Date(Date.now() - this.DEFAULT_CONFIG.STUCK_THRESHOLD_HOURS * 60 * 60 * 1000);
      
      // Get sessions that haven't progressed for too long
      const { data: stuckSessions, error } = await this.sessionManager['db'].getSupabaseClient()
        .from('onboarding_sessions')
        .select('id, current_step, created_at, updated_at')
        .lt('updated_at', cutoffTime.toISOString())
        .eq('is_completed', false)
        .gt('expires_at', new Date().toISOString())
        .eq('current_step', 1); // Focus on sessions stuck at step 1

      if (error || !stuckSessions) {
        logger.error('Failed to query stuck sessions', { error });
        return 0;
      }

      const reallyStuckSessions = stuckSessions.filter(session => {
        const sessionAge = Date.now() - new Date(session.created_at).getTime();
        const hoursSinceCreation = sessionAge / (60 * 60 * 1000);
        return hoursSinceCreation > this.DEFAULT_CONFIG.STUCK_THRESHOLD_HOURS;
      });

      if (dryRun) {
        logger.info('Dry run: Would clean stuck sessions', { count: reallyStuckSessions.length });
        return 0;
      }

      // Delete stuck sessions
      let cleaned = 0;
      for (const session of reallyStuckSessions) {
        const success = await this.sessionManager.deleteSession(session.id);
        if (success) cleaned++;
      }

      logger.info('Cleaned stuck sessions', { count: cleaned });
      return cleaned;
    } catch (error) {
      logger.error('Failed to clean stuck sessions', { error });
      return 0;
    }
  }

  /**
   * Clean up very old sessions beyond max age
   */
  private async cleanOldSessions(maxAgeHours: number, dryRun: boolean = false): Promise<number> {
    try {
      const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
      
      // Get sessions older than max age
      const { data: oldSessions, error } = await this.sessionManager['db'].getSupabaseClient()
        .from('onboarding_sessions')
        .select('id')
        .lt('created_at', cutoffTime.toISOString())
        .eq('is_completed', false);

      if (error || !oldSessions) {
        logger.error('Failed to query old sessions', { error });
        return 0;
      }

      if (dryRun) {
        logger.info('Dry run: Would clean old sessions', { 
          count: oldSessions.length,
          maxAgeHours 
        });
        return 0;
      }

      // Delete old sessions
      let cleaned = 0;
      for (const session of oldSessions) {
        const success = await this.sessionManager.deleteSession(session.id);
        if (success) cleaned++;
      }

      logger.info('Cleaned old sessions', { count: cleaned, maxAgeHours });
      return cleaned;
    } catch (error) {
      logger.error('Failed to clean old sessions', { error });
      return 0;
    }
  }

  /**
   * Get detailed cleanup statistics without performing cleanup
   */
  async getCleanupStats(): Promise<CleanupStats> {
    try {
      const now = new Date();
      const orphanedCutoff = new Date(now.getTime() - this.DEFAULT_CONFIG.ORPHANED_THRESHOLD_HOURS * 60 * 60 * 1000);
      const stuckCutoff = new Date(now.getTime() - this.DEFAULT_CONFIG.STUCK_THRESHOLD_HOURS * 60 * 60 * 1000);
      const oldCutoff = new Date(now.getTime() - this.DEFAULT_CONFIG.MAX_AGE_HOURS * 60 * 60 * 1000);

      const [basicStats, orphanedResult, stuckResult, oldResult] = await Promise.all([
        this.sessionManager.getSessionStats(),
        
        this.sessionManager['db'].getSupabaseClient()
          .from('onboarding_sessions')
          .select('id', { count: 'exact', head: true })
          .lt('updated_at', orphanedCutoff.toISOString())
          .eq('is_completed', false)
          .gt('expires_at', now.toISOString()),

        this.sessionManager['db'].getSupabaseClient()
          .from('onboarding_sessions')
          .select('id', { count: 'exact', head: true })
          .lt('updated_at', stuckCutoff.toISOString())
          .eq('is_completed', false)
          .eq('current_step', 1),

        this.sessionManager['db'].getSupabaseClient()
          .from('onboarding_sessions')
          .select('id', { count: 'exact', head: true })
          .lt('created_at', oldCutoff.toISOString())
          .eq('is_completed', false)
      ]);

      return {
        totalSessions: basicStats.total,
        expiredSessions: basicStats.expired,
        orphanedSessions: orphanedResult.count || 0,
        stuckSessions: stuckResult.count || 0,
        oldSessions: oldResult.count || 0,
      };
    } catch (error) {
      logger.error('Failed to get cleanup stats', { error });
      return {
        totalSessions: 0,
        expiredSessions: 0,
        orphanedSessions: 0,
        stuckSessions: 0,
        oldSessions: 0,
      };
    }
  }

  /**
   * Schedule automatic cleanup (would be called by cron job)
   */
  async scheduleCleanup(intervalHours: number = 6): Promise<void> {
    // In a real implementation, this would set up a cron job or scheduled task
    // For now, just log the intention
    logger.info('Cleanup scheduling requested', {
      intervalHours,
      message: 'In production, this would set up a cron job'
    });
  }

  /**
   * Emergency cleanup - more aggressive cleanup for system recovery
   */
  async emergencyCleanup(): Promise<CleanupResult> {
    logger.warn('Emergency cleanup initiated');
    
    return await this.runCleanup({
      maxAge: 24, // Only keep sessions from last 24 hours
      batchSize: 500,
      dryRun: false
    });
  }
}

// Singleton instance
let cleanupManager: OnboardingCleanupManager | null = null;

export function getOnboardingCleanupManager(): OnboardingCleanupManager {
  if (!cleanupManager) {
    cleanupManager = new OnboardingCleanupManager();
  }
  return cleanupManager;
}