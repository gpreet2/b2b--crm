import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Mock organizations data
    const mockOrganizations = [
      {
        id: '1',
        name: 'Mock Fitness Studio',
        description: 'A mock fitness studio for development',
        type: 'fitness_studio',
        isActive: true,
        address: '123 Main St, City, State 12345',
        phone: '(555) 123-4567',
        email: 'info@mockfitness.com',
        createdAt: '2024-01-01T00:00:00Z'
      }
    ];

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrgs = mockOrganizations.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: {
        organizations: paginatedOrgs,
        pagination: {
          page,
          limit,
          total: mockOrganizations.length,
          totalPages: Math.ceil(mockOrganizations.length / limit),
          hasNextPage: endIndex < mockOrganizations.length,
          hasPreviousPage: page > 1
        }
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Mock creating organization
    const newOrganization = {
      id: Math.random().toString(36).substr(2, 9),
      name: body.name || 'New Organization',
      description: body.description || '',
      type: body.type || 'fitness_studio',
      isActive: body.isActive !== undefined ? body.isActive : true,
      address: body.address || '',
      phone: body.phone || '',
      email: body.email || '',
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: newOrganization
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create organization' },
      { status: 500 }
    );
  }
}