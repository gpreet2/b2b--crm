import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    return NextResponse.json({
      success: true,
      data: {
        id,
        email: 'employee@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'trainer',
        status: 'pending',
        createdAt: '2024-01-15T10:00:00Z',
        expiresAt: '2024-01-22T10:00:00Z'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to get invitation' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    return NextResponse.json({
      success: true,
      message: 'Invitation cancelled successfully',
      data: { id }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to cancel invitation' },
      { status: 500 }
    );
  }
}