import { getOnboardingSessionManager, OnboardingSession, OnboardingState } from './onboarding-session';
import { OnboardingStateSchema } from './onboarding-validation';
import { logger } from '@/utils/logger';

export interface RecoveryResult {
  success: boolean;
  session?: OnboardingSession;
  nextStep?: number;
  missingData?: string[];
  canContinue: boolean;
  reason?: string;
}

export interface RecoveryOptions {
  validateSteps?: boolean;
  repairMissingData?: boolean;
  maxStepBack?: number;
}

export class OnboardingRecoveryManager {
  private sessionManager = getOnboardingSessionManager();

  /**
   * Attempt to recover an interrupted onboarding session
   */
  async recoverSession(
    sessionId: string,
    sessionToken: string,
    options: RecoveryOptions = {}
  ): Promise<RecoveryResult> {
    try {
      const session = await this.sessionManager.getSession(sessionId, sessionToken);
      
      if (!session) {
        return {
          success: false,
          canContinue: false,
          reason: 'Session not found or expired'
        };
      }

      // Check if session is already completed
      if (session.isCompleted) {
        return {
          success: true,
          session,
          canContinue: false,
          reason: 'Session already completed'
        };
      }

      // Validate session state integrity
      const validation = await this.validateSessionState(session);
      if (!validation.isValid) {
        logger.warn('Session state validation failed during recovery', {
          sessionId,
          issues: validation.issues
        });
        
        if (options.repairMissingData) {
          const repaired = await this.repairSessionData(session, validation.issues);
          if (repaired) {
            return await this.recoverSession(sessionId, sessionToken, options);
          }
        }
        
        return {
          success: false,
          canContinue: false,
          reason: 'Session data is corrupted',
          missingData: validation.issues
        };
      }

      // Determine next step based on current progress
      const nextStep = this.determineNextStep(session, options);
      
      logger.info('Session recovery successful', {
        sessionId,
        currentStep: session.currentStep,
        nextStep,
        completedSteps: session.state.metadata.completedSteps
      });

      return {
        success: true,
        session,
        nextStep,
        canContinue: true
      };

    } catch (error) {
      logger.error('Session recovery failed', { error, sessionId });
      return {
        success: false,
        canContinue: false,
        reason: 'Recovery process failed'
      };
    }
  }

  /**
   * Validate session state for consistency and completeness
   */
  async validateSessionState(session: OnboardingSession): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];
    
    try {
      // Validate against schema
      OnboardingStateSchema.parse(session.state);
    } catch (error) {
      issues.push('Schema validation failed');
    }

    // Check step progression logic
    if (session.currentStep < 1 || session.currentStep > 4) {
      issues.push('Invalid current step');
    }

    // Validate completed steps consistency
    const { completedSteps, lastActiveStep } = session.state.metadata;
    if (lastActiveStep < Math.max(...completedSteps, 0)) {
      issues.push('Inconsistent step progression');
    }

    // Check required data for current step
    switch (session.currentStep) {
      case 2:
        if (!session.state.organizationName) {
          issues.push('Missing organization name for step 2');
        }
        break;
      case 3:
        if (!session.state.locations || session.state.locations.length === 0) {
          issues.push('Missing locations for step 3');
        } else if (session.state.locations?.some(loc => !loc.name || !loc.address)) {
          issues.push('Incomplete location data');
        }
        break;
      case 4:
        // Final step validation
        if (!session.state.organizationName || !session.state.locations?.length) {
          issues.push('Missing required data for completion');
        }
        break;
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Attempt to repair session data issues
   */
  async repairSessionData(
    session: OnboardingSession,
    issues: string[]
  ): Promise<boolean> {
    try {
      let needsUpdate = false;
      const repairedState: OnboardingState = { ...session.state };

      // Repair missing locations array
      if (issues.includes('Missing locations for step 3') || !repairedState.locations) {
        repairedState.locations = [{ id: '1', name: '', address: '' }];
        needsUpdate = true;
      }
      
      // Also handle the "locations" property missing entirely
      if (!repairedState.locations) {
        repairedState.locations = [{ id: '1', name: '', address: '' }];
        needsUpdate = true;
      }

      // Repair metadata inconsistencies
      if (issues.includes('Inconsistent step progression')) {
        repairedState.metadata = {
          ...repairedState.metadata,
          lastActiveStep: Math.max(session.currentStep, repairedState.metadata.lastActiveStep),
          completedSteps: repairedState.metadata.completedSteps.filter(step => step < session.currentStep)
        };
        needsUpdate = true;
      }

      // Reset invalid current step
      if (issues.includes('Invalid current step')) {
        // Reset to step 1 if completely invalid
        const validStep = Math.max(1, Math.min(4, session.currentStep));
        needsUpdate = true;
        
        const success = await this.sessionManager.updateSession(
          session.id,
          session.sessionToken,
          {
            currentStep: validStep,
            state: repairedState
          }
        );
        
        return success;
      }

      if (needsUpdate) {
        const success = await this.sessionManager.updateSession(
          session.id,
          session.sessionToken,
          { state: repairedState }
        );
        
        if (success) {
          logger.info('Session data repaired successfully', {
            sessionId: session.id,
            repairedIssues: issues
          });
        }
        
        return success;
      }

      return true;
    } catch (error) {
      logger.error('Failed to repair session data', { error, sessionId: session.id });
      return false;
    }
  }

  /**
   * Determine the next logical step for the user
   */
  private determineNextStep(session: OnboardingSession, options: RecoveryOptions): number {
    const { currentStep } = session;
    const { completedSteps } = session.state.metadata;
    
    // If current step is not completed, stay on current step
    if (!completedSteps.includes(currentStep)) {
      return currentStep;
    }
    
    // Move to next step if current is completed
    const nextStep = currentStep + 1;
    
    // Don't go beyond step 4
    if (nextStep > 4) {
      return 4;
    }
    
    // Validate step requirements
    switch (nextStep) {
      case 2:
        // Can proceed to organization name entry
        return 2;
      case 3:
        // Need org name to proceed to locations
        if (!session.state.organizationName) {
          return 2;
        }
        return 3;
      case 4:
        // Need org name and at least one location
        if (!session.state.organizationName || 
            !session.state.locations?.length ||
            !session.state.locations.some(loc => loc.name && loc.address)) {
          return Math.max(2, currentStep);
        }
        return 4;
      default:
        return nextStep;
    }
  }

  /**
   * Check if a session can be resumed from a specific step
   */
  async canResumeFromStep(
    sessionId: string,
    sessionToken: string,
    targetStep: number
  ): Promise<{ canResume: boolean; reason?: string }> {
    const recovery = await this.recoverSession(sessionId, sessionToken);
    
    if (!recovery.success || !recovery.session) {
      return {
        canResume: false,
        reason: recovery.reason
      };
    }

    if (targetStep < 1 || targetStep > 4) {
      return {
        canResume: false,
        reason: 'Invalid target step'
      };
    }

    // Check if target step has required data
    const state = recovery.session.state;
    
    switch (targetStep) {
      case 1:
        return { canResume: true };
      case 2:
        return { canResume: true };
      case 3:
        if (!state.organizationName) {
          return {
            canResume: false,
            reason: 'Organization name required for step 3'
          };
        }
        return { canResume: true };
      case 4:
        if (!state.organizationName) {
          return {
            canResume: false,
            reason: 'Organization name required for step 4'
          };
        }
        if (!state.locations?.length || !state.locations.some(loc => loc.name && loc.address)) {
          return {
            canResume: false,
            reason: 'Valid location required for step 4'
          };
        }
        return { canResume: true };
      default:
        return { canResume: false, reason: 'Unknown step' };
    }
  }

  /**
   * Force resume from a specific step (with data validation)
   */
  async forceResumeFromStep(
    sessionId: string,
    sessionToken: string,
    targetStep: number
  ): Promise<{ success: boolean; reason?: string }> {
    try {
      const canResume = await this.canResumeFromStep(sessionId, sessionToken, targetStep);
      
      if (!canResume.canResume) {
        return {
          success: false,
          reason: canResume.reason
        };
      }

      const success = await this.sessionManager.updateSession(
        sessionId,
        sessionToken,
        { currentStep: targetStep }
      );

      if (success) {
        logger.info('Forced session resume successful', {
          sessionId,
          targetStep
        });
      }

      return { success };
    } catch (error) {
      logger.error('Force resume failed', { error, sessionId, targetStep });
      return {
        success: false,
        reason: 'Force resume failed'
      };
    }
  }

  /**
   * Get session recovery statistics
   */
  async getRecoveryStats(): Promise<{
    totalSessions: number;
    recoverableSessions: number;
    corruptedSessions: number;
    completedSessions: number;
  }> {
    try {
      const stats = await this.sessionManager.getSessionStats();
      
      // For now, assume most active sessions are recoverable
      // In a real implementation, you'd scan all sessions
      const recoverableSessions = Math.floor(stats.active * 0.9);
      const corruptedSessions = stats.active - recoverableSessions;
      
      return {
        totalSessions: stats.total,
        recoverableSessions,
        corruptedSessions,
        completedSessions: stats.completed
      };
    } catch (error) {
      logger.error('Failed to get recovery stats', { error });
      return {
        totalSessions: 0,
        recoverableSessions: 0,
        corruptedSessions: 0,
        completedSessions: 0
      };
    }
  }
}

// Singleton instance
let recoveryManager: OnboardingRecoveryManager | null = null;

export function getOnboardingRecoveryManager(): OnboardingRecoveryManager {
  if (!recoveryManager) {
    recoveryManager = new OnboardingRecoveryManager();
  }
  return recoveryManager;
}