import { createHash, randomBytes } from 'crypto';
import { getDatabase } from '@/config/database';
import { logger } from '@/utils/logger';
import { encryptState, decryptState, sanitizeOnboardingState, generateCSRFToken, validateCSRFToken } from './onboarding-encryption';
import { OnboardingStateSchema, SessionUpdateSchema, SessionCreateSchema } from './onboarding-validation';
import { ensureDatabaseInitialized, getDatabaseInstance } from './database-init';
import { z } from 'zod';

// Onboarding session structure
export interface OnboardingSession {
  id: string;
  sessionToken: string;
  currentStep: number;
  state: OnboardingState;
  createdAt: Date;
  expiresAt: Date;
  updatedAt: Date;
  isCompleted: boolean;
  userAgent?: string;
  ipAddress?: string;
}

// Onboarding state data
export interface OnboardingState {
  organizationName?: string;
  firstName?: string; // Will be removed after WorkOS integration
  lastName?: string;  // Will be removed after WorkOS integration
  locations: Array<{
    id: string;
    name: string;
    address: string;
  }>;
  metadata: {
    startedAt: string;
    completedSteps: number[];
    lastActiveStep: number;
  };
}

// Session configuration
const SESSION_CONFIG = {
  EXPIRY_HOURS: 24,
  TOKEN_BYTES: 32,
  MAX_SESSIONS_PER_IP: 10,
  CLEANUP_INTERVAL_MINUTES: 60,
} as const;

export class OnboardingSessionManager {
  private db: ReturnType<typeof getDatabase> | null = null;

  constructor() {
    // Don't initialize database in constructor to avoid sync operations
    // Database will be initialized on first use
  }

  /**
   * Get database instance, initializing if necessary
   */
  private async getDb() {
    if (!this.db) {
      await ensureDatabaseInitialized();
      this.db = getDatabase();
    }
    return this.db;
  }

  /**
   * Create a new onboarding session with validation
   */
  async createSession(options: {
    userAgent?: string;
    ipAddress?: string;
  } = {}): Promise<{ sessionId: string; sessionToken: string; csrfToken: string }> {
    try {
      const sessionId = this.generateSessionId();
      const sessionToken = this.generateSessionToken();
      const expiresAt = new Date(Date.now() + SESSION_CONFIG.EXPIRY_HOURS * 60 * 60 * 1000);

      // Validate input
      const validatedOptions = SessionCreateSchema.parse(options);
      
      const initialState: OnboardingState = {
        locations: [{ id: '1', name: '', address: '' }],
        metadata: {
          startedAt: new Date().toISOString(),
          completedSteps: [],
          lastActiveStep: 1,
        },
      };
      
      // Validate initial state
      OnboardingStateSchema.parse(initialState);
      
      // Encrypt state for storage
      const encryptedState = await encryptState(initialState);

      // Check for too many sessions from same IP (basic rate limiting)
      if (validatedOptions.ipAddress && validatedOptions.ipAddress !== 'unknown') {
        await this.cleanupExcessiveSessions(validatedOptions.ipAddress);
      }
      
      // Generate CSRF token
      const csrfTokenData = generateCSRFToken();
      const csrfToken = `${csrfTokenData.token}:${csrfTokenData.timestamp}`;

      const session: Omit<OnboardingSession, 'id'> = {
        sessionToken: this.hashToken(sessionToken),
        currentStep: 1,
        state: initialState,
        createdAt: new Date(),
        expiresAt,
        updatedAt: new Date(),
        isCompleted: false,
        userAgent: validatedOptions.userAgent,
        ipAddress: validatedOptions.ipAddress,
      };

      const db = await this.getDb();
      const { error } = await db.getSupabaseClient()
        .from('onboarding_sessions')
        .insert({
          id: sessionId,
          session_token: session.sessionToken,
          current_step: session.currentStep,
          state: encryptedState,
          created_at: session.createdAt.toISOString(),
          expires_at: session.expiresAt.toISOString(),
          updated_at: session.updatedAt.toISOString(),
          is_completed: session.isCompleted,
          user_agent: session.userAgent,
          ip_address: session.ipAddress && session.ipAddress !== 'unknown' ? session.ipAddress : null,
          csrf_token: csrfToken,
        });

      if (error) {
        logger.error('Failed to create onboarding session', { error, sessionId });
        throw new Error('Failed to create onboarding session');
      }

      logger.info('Onboarding session created', {
        sessionId,
        expiresAt,
        ipAddress: validatedOptions.ipAddress,
      });

      return { sessionId, sessionToken, csrfToken };
    } catch (error) {
      logger.error('Error creating onboarding session', { error });
      throw error;
    }
  }

  /**
   * Validate and retrieve a session with decryption
   */
  async getSession(sessionId: string, sessionToken: string): Promise<OnboardingSession | null> {
    try {
      const hashedToken = this.hashToken(sessionToken);
      const db = await this.getDb();

      const { data, error } = await db.getSupabaseClient()
        .from('onboarding_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('session_token', hashedToken)
        .single();

      if (error || !data) {
        logger.debug('Session not found or token mismatch', { sessionId, error });
        return null;
      }

      // Check if session is expired
      const expiresAt = new Date(data.expires_at);
      if (expiresAt < new Date()) {
        logger.info('Session expired', { sessionId, expiresAt });
        await this.deleteSession(sessionId);
        return null;
      }

      // Decrypt and validate state
      let state: OnboardingState;
      try {
        state = await decryptState<OnboardingState>(data.state);
        OnboardingStateSchema.parse(state); // Validate decrypted state
      } catch (parseError) {
        logger.error('Failed to decrypt/parse session state', { sessionId, parseError });
        return null;
      }

      return {
        id: data.id,
        sessionToken: data.session_token,
        currentStep: data.current_step,
        state,
        createdAt: new Date(data.created_at),
        expiresAt,
        updatedAt: new Date(data.updated_at),
        isCompleted: data.is_completed,
        userAgent: data.user_agent,
        ipAddress: data.ip_address,
      };
    } catch (error) {
      logger.error('Error retrieving onboarding session', { error, sessionId });
      return null;
    }
  }

  /**
   * Update session state and step with validation and encryption
   */
  async updateSession(
    sessionId: string, 
    sessionToken: string,
    updates: {
      currentStep?: number;
      state?: Partial<OnboardingState>;
      isCompleted?: boolean;
      csrfToken?: string;
    }
  ): Promise<boolean> {
    try {
      // Validate update request
      const validatedUpdates = SessionUpdateSchema.omit({ sessionId: true, sessionToken: true }).parse(updates);
      
      const session = await this.getSession(sessionId, sessionToken);
      if (!session) {
        return false;
      }

      // Sanitize and merge state updates
      let updatedState = session.state;
      if (validatedUpdates.state) {
        const sanitizedState = sanitizeOnboardingState(validatedUpdates.state);
        updatedState = { ...session.state, ...sanitizedState };
        
        // Validate merged state
        OnboardingStateSchema.parse(updatedState);
      }
      
      // Update metadata
      if (validatedUpdates.currentStep) {
        updatedState.metadata = {
          ...updatedState.metadata,
          lastActiveStep: validatedUpdates.currentStep,
          completedSteps: Array.from(new Set([
            ...updatedState.metadata.completedSteps,
            ...(validatedUpdates.currentStep > session.currentStep ? [session.currentStep] : [])
          ])),
        };
      }
      
      // Encrypt updated state
      const encryptedState = await encryptState(updatedState);
      const db = await this.getDb();

      const { error } = await db.getSupabaseClient()
        .from('onboarding_sessions')
        .update({
          current_step: validatedUpdates.currentStep ?? session.currentStep,
          state: encryptedState,
          is_completed: validatedUpdates.isCompleted ?? session.isCompleted,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .eq('session_token', this.hashToken(sessionToken));

      if (error) {
        logger.error('Failed to update onboarding session', { error, sessionId });
        return false;
      }

      logger.debug('Session updated successfully', {
        sessionId,
        step: validatedUpdates.currentStep,
        completed: validatedUpdates.isCompleted,
      });

      return true;
    } catch (error) {
      logger.error('Error updating onboarding session', { error, sessionId });
      return false;
    }
  }

  /**
   * Mark session as completed
   */
  async completeSession(sessionId: string, sessionToken: string): Promise<boolean> {
    return this.updateSession(sessionId, sessionToken, { isCompleted: true });
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const db = await this.getDb();
      const { error } = await db.getSupabaseClient()
        .from('onboarding_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) {
        logger.error('Failed to delete onboarding session', { error, sessionId });
        return false;
      }

      logger.info('Onboarding session deleted', { sessionId });
      return true;
    } catch (error) {
      logger.error('Error deleting onboarding session', { error, sessionId });
      return false;
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const db = await this.getDb();
      const { data, error } = await db.getSupabaseClient()
        .from('onboarding_sessions')
        .delete()
        .lt('expires_at', new Date().toISOString())
        .select('id');

      if (error) {
        logger.error('Failed to cleanup expired sessions', { error });
        return 0;
      }

      const cleanedCount = data?.length ?? 0;
      logger.info('Cleaned up expired onboarding sessions', { count: cleanedCount });
      return cleanedCount;
    } catch (error) {
      logger.error('Error cleaning up expired sessions', { error });
      return 0;
    }
  }

  /**
   * Clean up excessive sessions from same IP (rate limiting)
   */
  private async cleanupExcessiveSessions(ipAddress: string): Promise<void> {
    try {
      // Skip cleanup if IP is unknown/null
      if (!ipAddress || ipAddress === 'unknown') {
        return;
      }

      const db = await this.getDb();
      const { data, error } = await db.getSupabaseClient()
        .from('onboarding_sessions')
        .select('id, created_at')
        .eq('ip_address', ipAddress)
        .order('created_at', { ascending: false });

      if (error || !data) {
        return;
      }

      // If more than max sessions, delete the oldest ones
      if (data.length >= SESSION_CONFIG.MAX_SESSIONS_PER_IP) {
        const sessionsToDelete = data.slice(SESSION_CONFIG.MAX_SESSIONS_PER_IP - 1);
        const sessionIds = sessionsToDelete.map(s => s.id);

        const db = await this.getDb();
        await db.getSupabaseClient()
          .from('onboarding_sessions')
          .delete()
          .in('id', sessionIds);

        logger.info('Cleaned up excessive sessions', {
          ipAddress,
          deletedCount: sessionIds.length,
        });
      }
    } catch (error) {
      logger.error('Error cleaning up excessive sessions', { error, ipAddress });
    }
  }

  /**
   * Generate cryptographically secure session ID
   */
  private generateSessionId(): string {
    return `onboard_${randomBytes(16).toString('hex')}_${Date.now()}`;
  }

  /**
   * Generate cryptographically secure session token
   */
  private generateSessionToken(): string {
    return randomBytes(SESSION_CONFIG.TOKEN_BYTES).toString('hex');
  }

  /**
   * Hash session token for secure storage
   */
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * Get session statistics (for monitoring)
   */
  async getSessionStats(): Promise<{
    total: number;
    active: number;
    expired: number;
    completed: number;
  }> {
    try {
      const now = new Date().toISOString();

      const db = await this.getDb();
      const [totalResult, activeResult, completedResult] = await Promise.all([
        db.getSupabaseClient()
          .from('onboarding_sessions')
          .select('id', { count: 'exact', head: true }),

        db.getSupabaseClient()
          .from('onboarding_sessions')
          .select('id', { count: 'exact', head: true })
          .gt('expires_at', now)
          .eq('is_completed', false),

        db.getSupabaseClient()
          .from('onboarding_sessions')
          .select('id', { count: 'exact', head: true })
          .eq('is_completed', true),
      ]);

      const total = totalResult.count ?? 0;
      const active = activeResult.count ?? 0;
      const completed = completedResult.count ?? 0;
      const expired = total - active - completed;

      return { total, active, expired, completed };
    } catch (error) {
      logger.error('Error getting session stats', { error });
      return { total: 0, active: 0, expired: 0, completed: 0 };
    }
  }
}

// Singleton instance
let sessionManager: OnboardingSessionManager | null = null;

export function getOnboardingSessionManager(): OnboardingSessionManager {
  if (!sessionManager) {
    sessionManager = new OnboardingSessionManager();
  }
  return sessionManager;
}