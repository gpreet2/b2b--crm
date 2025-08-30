import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Mock organization data
    const mockOrganization = {
      id: params.id,
      name: 'Mock Fitness Studio',
      description: 'A mock fitness studio for development',
      address: '123 Main St, City, State 12345',
      phone: '(555) 123-4567',
      email: 'info@mockfitness.com',
      website: 'https://mockfitness.com',
      type: 'fitness_studio',
      isActive: true,
      settings: {
        timezone: 'America/New_York',
        currency: 'USD',
        language: 'en'
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: mockOrganization
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch organization' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Mock organization update
    const updatedOrganization = {
      id: params.id,
      name: body.name || 'Mock Fitness Studio',
      description: body.description || 'A mock fitness studio for development',
      address: body.address || '123 Main St, City, State 12345',
      phone: body.phone || '(555) 123-4567',
      email: body.email || 'info@mockfitness.com',
      website: body.website || 'https://mockfitness.com',
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: updatedOrganization
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update organization' },
      { status: 500 }
    );
  }
}