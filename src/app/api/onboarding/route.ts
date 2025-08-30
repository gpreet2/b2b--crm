import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock onboarding status
    return NextResponse.json({
      success: true,
      data: {
        currentStep: 1,
        totalSteps: 3,
        isComplete: false,
        organizationId: null,
        userId: 'dev_user_1'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to get onboarding status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Mock onboarding update
    const mockResponse = {
      success: true,
      data: {
        currentStep: body.currentStep || 1,
        organizationName: body.organizationName || 'Mock Organization',
        locations: body.locations || [],
        nextStep: (body.currentStep || 1) + 1
      }
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update onboarding' },
      { status: 500 }
    );
  }
}