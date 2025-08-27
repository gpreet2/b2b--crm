/**
 * Onboarding Types
 * Generated types for the onboarding system
 */

export type OnboardingStep = 'welcome' | 'organization' | 'location' | 'payment' | 'complete';

export interface OnboardingSession {
  id: string;
  sessionToken: string;
  userId: string;
  currentStep: OnboardingStep;
  stepData: Record<string, any>;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  isCompleted: boolean;
  userAgent?: string;
  ipAddress?: string;
  csrfToken?: string;
}

export interface OnboardingStepData {
  welcome?: {
    accountType: 'owner' | 'franchise' | 'manager';
    businessType: 'gym' | 'studio' | 'crossfit' | 'yoga' | 'other';
  };
  organization?: {
    name: string;
    description?: string;
    website?: string;
    timezone: string;
    currency: string;
  };
  location?: {
    name: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
    email?: string;
    hours?: Record<string, string>;
  };
  payment?: {
    stripeAccountId?: string;
    planTier: 'free' | 'pro' | 'enterprise';
    skipForNow?: boolean;
  };
}

export interface OnboardingStartRequest {
  userAgent?: string;
  ipAddress?: string;
}

export interface OnboardingStartResponse {
  success: boolean;
  sessionToken: string;
  currentStep: OnboardingStep;
  expiresAt: string;
  csrfToken: string;
}

export interface OnboardingStepRequest {
  stepData: any;
  csrfToken: string;
}

export interface OnboardingStepResponse {
  success: boolean;
  nextStep?: OnboardingStep;
  errors?: ValidationError[];
  sessionToken: string;
  canGoBack: boolean;
  canSkip: boolean;
}

export interface OnboardingCompleteRequest {
  csrfToken: string;
}

export interface OnboardingCompleteResponse {
  success: boolean;
  organizationId: string;
  redirectUrl: string;
}

export interface OnboardingRecoveryOptions {
  canResume: boolean;
  sessionToken?: string;
  currentStep?: OnboardingStep;
  lastUpdated?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export enum OnboardingRecoveryAction {
  START_FRESH = 'start_fresh',
  RESUME_FROM_STEP = 'resume_from_step',
  CLEANUP_AND_RETRY = 'cleanup_and_retry',
  MANUAL_INTERVENTION = 'manual_intervention'
}