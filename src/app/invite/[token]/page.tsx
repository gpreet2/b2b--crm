'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle, 
  AlertCircle, 
  Loader, 
  Mail, 
  Building2, 
  MapPin,
  User,
  Clock,
  ExternalLink
} from 'lucide-react';

// Interface for invitation data
interface InvitationData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  organization_id: string;
  location_ids: string[];
  invited_by_user_id: string;
  expires_at: string;
  is_accepted: boolean;
  created_at: string;
}

interface InviteAcceptancePageProps {
  params: Promise<{
    token: string;
  }>;
}

export default function InviteAcceptancePage({ params }: InviteAcceptancePageProps) {
  const router = useRouter();
  const [token, setToken] = useState<string>('');
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [acceptanceError, setAcceptanceError] = useState<string | null>(null);

  // Get token from params
  useEffect(() => {
    const getToken = async () => {
      const resolvedParams = await params;
      setToken(resolvedParams.token);
    };
    getToken();
  }, [params]);

  // Fetch invitation details
  const fetchInvitation = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/employees/invite/token/${token}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch invitation details');
      }

      const result = await response.json();
      setInvitation(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invitation');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchInvitation();
    }
  }, [token, fetchInvitation]);

  // Handle invitation acceptance
  const handleAcceptInvitation = async () => {
    if (!invitation) return;

    // For demo purposes, we'll simulate the authentication step
    // In a real implementation, this would redirect to auth provider first
    const mockUserId = `user_demo_${Date.now()}`;

    setAccepting(true);
    setAcceptanceError(null);

    try {
      const response = await fetch('/api/auth/signup-with-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          user_id: mockUserId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to accept invitation');
      }

      // Success! Redirect to dashboard or show success message
      router.push('/dashboard?welcome=true');
    } catch (err) {
      setAcceptanceError(err instanceof Error ? err.message : 'Failed to accept invitation');
    } finally {
      setAccepting(false);
    }
  };

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) <= new Date();
  };

  const formatRole = (role: string) => {
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Invitation</h2>
          <p className="text-gray-600">Please wait while we verify your invitation...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Invitation</h2>
          <p className="text-gray-600 mb-6">
            {error || "This invitation link is invalid or has expired."}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Already accepted state
  if (invitation.is_accepted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invitation Already Accepted</h2>
          <p className="text-gray-600 mb-6">
            This invitation has already been accepted. If you have an account, please sign in.
          </p>
          <button
            onClick={() => router.push('/sign-in')}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Expired state
  if (isExpired(invitation.expires_at)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invitation Expired</h2>
          <p className="text-gray-600 mb-2">
            This invitation expired on {formatDate(invitation.expires_at)}.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Please contact your administrator to request a new invitation.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Valid invitation - show acceptance form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white text-center">
          <Mail className="h-12 w-12 mx-auto mb-4 opacity-90" />
          <h1 className="text-2xl font-bold mb-2">You're Invited!</h1>
          <p className="text-blue-100">
            Join the team as a {formatRole(invitation.role)}
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          {acceptanceError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error Accepting Invitation</h3>
                  <p className="text-sm text-red-600 mt-1">{acceptanceError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Invitation Details */}
          <div className="space-y-6 mb-8">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Welcome, {invitation.first_name} {invitation.last_name}!
              </h2>
              <p className="text-gray-600">
                You've been invited to join our team with the following details:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <User className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="font-medium text-gray-900">Role</span>
                </div>
                <p className="text-gray-700">{formatRole(invitation.role)}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Mail className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="font-medium text-gray-900">Email</span>
                </div>
                <p className="text-gray-700">{invitation.email}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Building2 className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="font-medium text-gray-900">Organization</span>
                </div>
                <p className="text-gray-700">TryZore Fitness</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Clock className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="font-medium text-gray-900">Expires</span>
                </div>
                <p className="text-gray-700">{formatDate(invitation.expires_at)}</p>
              </div>
            </div>

            {invitation.location_ids && invitation.location_ids.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-medium text-gray-900">Location Access</span>
                </div>
                <p className="text-gray-700">
                  You'll have access to {invitation.location_ids.length} specific location(s)
                </p>
              </div>
            )}
          </div>

          {/* Role Description */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-3">Your Role: {formatRole(invitation.role)}</h3>
            <div className="text-sm text-gray-700">
              {invitation.role === 'trainer' && (
                <div>
                  <p className="mb-2">As a Trainer, you'll be able to:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Manage fitness classes and training sessions</li>
                    <li>View and interact with clients</li>
                    <li>Create and manage workout plans</li>
                    <li>Track client progress and achievements</li>
                  </ul>
                </div>
              )}
              {invitation.role === 'coach' && (
                <div>
                  <p className="mb-2">As a Coach, you'll be able to:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Manage fitness classes and coaching sessions</li>
                    <li>View and interact with clients</li>
                    <li>Create and manage workout plans</li>
                    <li>Access performance reports and analytics</li>
                  </ul>
                </div>
              )}
              {invitation.role === 'front_desk' && (
                <div>
                  <p className="mb-2">As Front Desk staff, you'll be able to:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Manage client check-ins and bookings</li>
                    <li>View client information</li>
                    <li>Handle class schedules and reservations</li>
                    <li>Assist with member inquiries</li>
                  </ul>
                </div>
              )}
              {invitation.role === 'manager' && (
                <div>
                  <p className="mb-2">As a Manager, you'll be able to:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Manage all fitness classes and staff</li>
                    <li>Access comprehensive client data</li>
                    <li>View performance reports and analytics</li>
                    <li>Manage users and basic settings</li>
                  </ul>
                </div>
              )}
              {invitation.role === 'admin' && (
                <div>
                  <p className="mb-2">As an Administrator, you'll have:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Full access to all system features</li>
                    <li>User management capabilities</li>
                    <li>System configuration and settings</li>
                    <li>Billing and subscription management</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Accept Button */}
          <div className="text-center">
            <button
              onClick={handleAcceptInvitation}
              disabled={accepting}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 mx-auto"
            >
              {accepting ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <span>Accept Invitation & Join Team</span>
                </>
              )}
            </button>
            
            <p className="text-xs text-gray-500 mt-4">
              By accepting this invitation, you agree to our terms of service and privacy policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}