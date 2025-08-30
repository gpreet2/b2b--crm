import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { sessionToken, csrfToken } = await request.json();
    
    // Mock completion - redirect to dashboard
    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
      url: '/dashboard'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}