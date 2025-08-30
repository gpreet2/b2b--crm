import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Mock onboarding session start
    const mockSession = {
      success: true,
      sessionToken: 'mock_session_' + Math.random().toString(36).substr(2, 9),
      csrfToken: 'mock_csrf_' + Math.random().toString(36).substr(2, 9),
      currentStep: 1,
      totalSteps: 3,
      organizationId: null,
      userId: 'dev_user_1'
    };

    return NextResponse.json(mockSession, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to start onboarding session' },
      { status: 500 }
    );
  }
}