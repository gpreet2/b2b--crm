import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const {
      organizationName,
      ownerInfo,
      businessInfo,
      sessionToken,
      csrfToken
    } = await request.json();

    console.log('🏢 API onboarding/complete - Received data:', {
      organizationName,
      ownerInfo,
      businessInfo,
      sessionToken,
      csrfToken,
      timestamp: Date.now()
    });

    // For now, we'll store the onboarding data and let the client handle
    // the actual completion through Convex once the user is authenticated
    // This is because we need WorkOS authentication context to call Convex mutations

    // Validate required fields
    if (!organizationName?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Organization name is required' },
        { status: 400 }
      );
    }

    if (!ownerInfo?.firstName?.trim() || !ownerInfo?.lastName?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Owner first name and last name are required' },
        { status: 400 }
      );
    }

    if (!businessInfo?.type || !businessInfo?.size || !businessInfo?.timezone) {
      return NextResponse.json(
        { success: false, error: 'Business information is incomplete' },
        { status: 400 }
      );
    }

    // Return the data for the client to complete via Convex
    return NextResponse.json({
      success: true,
      message: 'Onboarding data validated successfully',
      needsAuth: true, // Signal that authentication is needed via WorkOS SDK
      onboardingData: {
        organizationName: organizationName.trim(),
        ownerInfo: {
          firstName: ownerInfo.firstName.trim(),
          lastName: ownerInfo.lastName.trim(),
          phone: ownerInfo.phone?.trim(),
        },
        businessInfo: {
          type: businessInfo.type,
          size: businessInfo.size,
          timezone: businessInfo.timezone,
        },
      },
    });
  } catch (error) {
    console.error('🏢 API onboarding/complete - Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process onboarding data' },
      { status: 500 }
    );
  }
}