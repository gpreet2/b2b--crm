import { NextRequest, NextResponse } from 'next/server';

interface Params {
  token: string;
  stepNumber: string;
}

export async function POST(request: NextRequest, { params }: { params: Promise<Params> }) {
  try {
    const { token, stepNumber } = await params;
    const { stepData, csrfToken } = await request.json();
    
    // Mock session step update - just return success
    return NextResponse.json({
      success: true,
      message: 'Step saved successfully',
      data: {
        token,
        stepNumber,
        stepData
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to save step progress' },
      { status: 500 }
    );
  }
}