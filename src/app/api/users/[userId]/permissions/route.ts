import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    
    return NextResponse.json({
      success: true,
      data: {
        userId,
        permissions: ['read:clients', 'read:classes', 'write:profile']
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to get user permissions' },
      { status: 500 }
    );
  }
}