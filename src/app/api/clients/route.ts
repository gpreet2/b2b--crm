import { NextRequest, NextResponse } from 'next/server';
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const membershipStatus = searchParams.get('membershipStatus') || undefined;
    
    // For now, use the seeded dev organization ID since we don't have session management yet
    const organizationId = "kn7402gvbsk402je80jq3rtk7x7pscq3";
    
    const offset = (page - 1) * limit;

    const clients = await fetchQuery(api.clients.getClients, {
      organizationId: organizationId as any,
      search: search || undefined,
      membershipStatus,
      limit,
      offset,
    });

    // For pagination, we'd need a separate count query in production
    // For now, return the data with basic pagination info
    return NextResponse.json({
      success: true,
      data: clients, // Return clients array directly
      pagination: {
        page,
        limit,
        total: clients.length, // This is simplified - in production we'd have a separate count
        totalPages: Math.ceil(clients.length / limit),
        hasNextPage: clients.length === limit,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // For now, use the seeded dev organization ID since we don't have session management yet
    const organizationId = "kn7402gvbsk402je80jq3rtk7x7pscq3";
    
    const newClientId = await fetchMutation(api.clients.createClient, {
      firstName: body.firstName || '',
      lastName: body.lastName || '',
      email: body.email || '',
      phone: body.phone || undefined,
      organizationId: organizationId as any,
      membershipType: body.membershipType || 'monthly',
      membershipStartDate: body.membershipStartDate ? new Date(body.membershipStartDate).getTime() : undefined,
    });

    // Get the created client to return it
    const newClient = await fetchQuery(api.clients.getClient, { id: newClientId });

    return NextResponse.json({
      success: true,
      data: newClient
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create client:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create client' },
      { status: 500 }
    );
  }
}