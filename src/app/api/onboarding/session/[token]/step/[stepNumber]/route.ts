/**
 * Onboarding Session Step API Endpoint
 * 
 * POST /api/onboarding/session/[token]/step/[stepNumber]
 * 
 * Updates a specific step in the onboarding process
 */

import { NextRequest, NextResponse } from 'next/server';
import { OnboardingService } from '@/lib/services/onboarding';
import { logger } from '@/utils/logger';
import { AppError, ValidationError } from '@/errors';
import type { OnboardingStepRequest, OnboardingStepResponse, OnboardingStep } from '@/types/generated/onboarding.types';

interface RouteParams {
  params: Promise<{
    token: string;
    stepNumber: string;
  }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const startTime = Date.now();
  const requestId = req.headers.get('x-request-id') || 'unknown';
  const { token, stepNumber } = await params;

  try {
    logger.info('Onboarding step update request', { 
      requestId,
      token: token.substring(0, 8) + '...',
      stepNumber
    });

    // Parse request body
    const body: OnboardingStepRequest = await req.json();
    const { stepData, csrfToken } = body;

    if (!csrfToken) {
      return NextResponse.json(
        { error: 'CSRF token is required' },
        { status: 400 }
      );
    }

    // Validate step number
    const validSteps = ['1', '2', '3', '4', '5'];
    if (!validSteps.includes(stepNumber)) {
      return NextResponse.json(
        { error: 'Invalid step number' },
        { status: 400 }
      );
    }

    // Map step number to step name
    const stepMap: Record<string, OnboardingStep> = {
      '1': 'welcome',
      '2': 'organization', 
      '3': 'location',
      '4': 'payment',
      '5': 'complete'
    };
    
    const currentStep = stepMap[stepNumber];
    const nextStepNumber = parseInt(stepNumber) + 1;
    const nextStep = stepMap[nextStepNumber.toString()] as OnboardingStep | undefined;

    // Update session with step data
    const onboardingService = new OnboardingService();
    await onboardingService.updateSession(
      token,
      nextStep || 'complete',
      stepData,
      csrfToken
    );

    logger.info('Onboarding step updated successfully', {
      requestId,
      token: token.substring(0, 8) + '...',
      currentStep,
      nextStep,
      duration: Date.now() - startTime
    });

    const response: OnboardingStepResponse = {
      success: true,
      nextStep: nextStep || 'complete',
      sessionToken: token,
      canGoBack: parseInt(stepNumber) > 1,
      canSkip: currentStep === 'payment' // Payment can be skipped
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    logger.error('Onboarding step update failed', {
      requestId,
      token: token.substring(0, 8) + '...',
      stepNumber,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      duration: Date.now() - startTime
    });

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error occurred while updating onboarding step' },
      { status: 500 }
    );
  }
}

// Other methods not allowed
export function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to update step.' },
    { status: 405 }
  );
}

export function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to update step.' },
    { status: 405 }
  );
}

export function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to update step.' },
    { status: 405 }
  );
}