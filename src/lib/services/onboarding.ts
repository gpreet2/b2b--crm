/**
 * Onboarding Service
 * 
 * Handles stateful multi-step onboarding for new business owners
 */

import { getDatabase } from '@/config/database';
import { logger } from '@/utils/logger';
import { AppError, ValidationError } from '@/errors';
import crypto from 'crypto';
import { 
  OnboardingSession, 
  OnboardingStep, 
  OnboardingStepData,
  OnboardingRecoveryAction 
} from '@/types/generated/onboarding.types';

export class OnboardingService {
  private db = getDatabase();

  /**
   * Start a new onboarding session
   */
  async startSession(
    userId: string, 
    userAgent?: string, 
    ipAddress?: string
  ): Promise<{ sessionToken: string; csrfToken: string; expiresAt: string }> {
    try {
      // Check if user already has an incomplete session
      const { data: existingSession } = await this.db
        .getSupabaseClient()
        .from('onboarding_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_completed', false)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (existingSession) {
        // Return existing session
        return {
          sessionToken: existingSession.session_token,
          csrfToken: existingSession.csrf_token,
          expiresAt: existingSession.expires_at
        };
      }

      // Create new session
      const sessionToken = crypto.randomUUID();
      const csrfToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const { data: session, error } = await this.db
        .getSupabaseClient()
        .from('onboarding_sessions')
        .insert({
          session_token: sessionToken,
          user_id: userId,
          current_step: 1, // welcome step
          state: {},
          expires_at: expiresAt.toISOString(),
          user_agent: userAgent,
          ip_address: ipAddress,
          csrf_token: csrfToken
        })
        .select()
        .single();

      if (error) {
        logger.error('Failed to create onboarding session', { error, userId });
        throw new AppError('Failed to start onboarding session');
      }

      logger.info('Created new onboarding session', { 
        sessionToken, 
        userId,
        expiresAt: expiresAt.toISOString()
      });

      return {
        sessionToken,
        csrfToken,
        expiresAt: expiresAt.toISOString()
      };

    } catch (error) {
      logger.error('Error starting onboarding session', { error, userId });
      throw error instanceof AppError ? error : new AppError('Failed to start onboarding');
    }
  }

  /**
   * Get session by token
   */
  async getSession(sessionToken: string): Promise<OnboardingSession | null> {
    try {
      const { data: session, error } = await this.db
        .getSupabaseClient()
        .from('onboarding_sessions')
        .select('*')
        .eq('session_token', sessionToken)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (error || !session) {
        return null;
      }

      return {
        id: session.id,
        sessionToken: session.session_token,
        userId: session.user_id,
        currentStep: this.numberToStep(session.current_step),
        stepData: session.state || {},
        expiresAt: session.expires_at,
        createdAt: session.created_at,
        updatedAt: session.updated_at,
        isCompleted: session.is_completed,
        userAgent: session.user_agent,
        ipAddress: session.ip_address,
        csrfToken: session.csrf_token
      };

    } catch (error) {
      logger.error('Error getting onboarding session', { error, sessionToken });
      return null;
    }
  }

  /**
   * Update session step and data
   */
  async updateSession(
    sessionToken: string,
    nextStep: OnboardingStep,
    stepData: any,
    csrfToken: string
  ): Promise<void> {
    try {
      // First verify CSRF token
      const session = await this.getSession(sessionToken);
      if (!session || session.csrfToken !== csrfToken) {
        throw new ValidationError('Invalid session or CSRF token');
      }

      // Merge new step data with existing data
      const updatedStepData = {
        ...session.stepData,
        [session.currentStep]: stepData
      };

      const { error } = await this.db
        .getSupabaseClient()
        .from('onboarding_sessions')
        .update({
          current_step: this.stepToNumber(nextStep),
          state: updatedStepData,
          updated_at: new Date().toISOString()
        })
        .eq('session_token', sessionToken);

      if (error) {
        logger.error('Failed to update onboarding session', { error, sessionToken });
        throw new AppError('Failed to update session');
      }

      logger.info('Updated onboarding session', { 
        sessionToken, 
        nextStep,
        stepDataKeys: Object.keys(stepData)
      });

    } catch (error) {
      logger.error('Error updating onboarding session', { error, sessionToken });
      throw error instanceof AppError ? error : new AppError('Failed to update session');
    }
  }

  /**
   * Complete onboarding and create organization/location
   */
  async completeOnboarding(sessionToken: string, csrfToken: string): Promise<string> {
    try {
      const session = await this.getSession(sessionToken);
      if (!session || session.csrfToken !== csrfToken) {
        throw new ValidationError('Invalid session or CSRF token');
      }

      if (session.isCompleted) {
        throw new ValidationError('Onboarding already completed');
      }

      // Extract step data
      const orgData = session.stepData.organization;
      const locationData = session.stepData.location;

      if (!orgData || !locationData) {
        throw new ValidationError('Missing required onboarding data');
      }

      // Start transaction to create organization and location
      const { data: org, error: orgError } = await this.db
        .getSupabaseClient()
        .from('organizations')
        .insert({
          name: orgData.name,
          description: orgData.description,
          website: orgData.website,
          timezone: orgData.timezone,
          currency: orgData.currency,
          owner_id: session.userId, // Set the user as the owner
          plan_tier: 'free', // Default to free tier
          metadata: {
            onboarding_completed_at: new Date().toISOString(),
            created_via: 'onboarding_wizard'
          }
        })
        .select()
        .single();

      if (orgError || !org) {
        logger.error('Failed to create organization', { orgError, sessionToken });
        throw new AppError('Failed to create organization');
      }

      // Create location
      const { error: locationError } = await this.db
        .getSupabaseClient()
        .from('locations')
        .insert({
          name: locationData.name,
          address: locationData.address,
          city: locationData.city,
          state: locationData.state,
          postal_code: locationData.postalCode,
          country: locationData.country,
          phone: locationData.phone,
          email: locationData.email,
          organization_id: org.id,
          settings: {
            hours: locationData.hours || {},
            timezone: orgData.timezone
          }
        });

      if (locationError) {
        logger.error('Failed to create location', { locationError, sessionToken });
        // Don't fail completely - organization was created
      }

      // Create user-organization relationship (owner)
      const { error: userOrgError } = await this.db
        .getSupabaseClient()
        .from('user_organizations')
        .insert({
          user_id: session.userId,
          organization_id: org.id,
          role: 'owner',
          is_active: true,
          is_primary: true,
          joined_at: new Date().toISOString(),
          permissions: {
            all_permissions: true,
            manage_users: true,
            manage_settings: true,
            view_reports: true,
            manage_billing: true
          }
        });

      if (userOrgError) {
        logger.error('Failed to create user-organization relationship', { 
          userOrgError, 
          sessionToken,
          userId: session.userId,
          organizationId: org.id 
        });
      }

      // Mark session as completed
      await this.db
        .getSupabaseClient()
        .from('onboarding_sessions')
        .update({
          is_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('session_token', sessionToken);

      logger.info('Onboarding completed successfully', { 
        sessionToken,
        organizationId: org.id,
        userId: session.userId
      });

      return org.id;

    } catch (error) {
      logger.error('Error completing onboarding', { error, sessionToken });
      throw error instanceof AppError ? error : new AppError('Failed to complete onboarding');
    }
  }

  /**
   * Check recovery options for a user
   */
  async getRecoveryOptions(userId: string): Promise<OnboardingRecoveryAction> {
    try {
      // Check for existing organizations
      const { data: userOrgs } = await this.db
        .getSupabaseClient()
        .from('user_organizations')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (userOrgs && userOrgs.length > 0) {
        // User already has organizations - redirect to dashboard
        return OnboardingRecoveryAction.START_FRESH;
      }

      // Check for incomplete sessions
      const { data: activeSession } = await this.db
        .getSupabaseClient()
        .from('onboarding_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_completed', false)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (activeSession) {
        return OnboardingRecoveryAction.RESUME_FROM_STEP;
      }

      return OnboardingRecoveryAction.START_FRESH;

    } catch (error) {
      logger.error('Error checking recovery options', { error, userId });
      return OnboardingRecoveryAction.START_FRESH;
    }
  }

  /**
   * Cleanup expired sessions (called by cron job)
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const { data: expiredSessions, error } = await this.db
        .getSupabaseClient()
        .from('onboarding_sessions')
        .delete()
        .lt('expires_at', new Date().toISOString())
        .eq('is_completed', false)
        .select('id');

      if (error) {
        logger.error('Failed to cleanup expired sessions', { error });
        return 0;
      }

      const cleanedCount = expiredSessions?.length || 0;
      logger.info('Cleaned up expired onboarding sessions', { cleanedCount });

      return cleanedCount;

    } catch (error) {
      logger.error('Error cleaning up expired sessions', { error });
      return 0;
    }
  }

  // Helper methods
  private stepToNumber(step: OnboardingStep): number {
    const stepMap: Record<OnboardingStep, number> = {
      welcome: 1,
      organization: 2,
      location: 3,
      payment: 4,
      complete: 5
    };
    return stepMap[step];
  }

  private numberToStep(num: number): OnboardingStep {
    const numberMap: Record<number, OnboardingStep> = {
      1: 'welcome',
      2: 'organization',
      3: 'location',
      4: 'payment',
      5: 'complete'
    };
    return numberMap[num] || 'welcome';
  }
}