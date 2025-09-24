'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@workos-inc/authkit-react';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export default function CallbackPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState('processing');
  const [syncStatus, setSyncStatus] = useState('pending');
  const syncUser = useMutation(api.auth.syncUser);

  useEffect(() => {
    console.log('🔄 Callback Page: Authentication status check', {
      user: !!user,
      isLoading,
      syncStatus,
      userDetails: user ? { id: user.id, email: user.email } : null
    });

    if (!isLoading && user && syncStatus === 'pending') {
      // User is authenticated, now sync to Convex
      console.log('✅ WorkOS AuthKit: User authenticated successfully, syncing to Convex...', {
        userId: user.id,
        email: user.email,
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.lastName
      });

      setSyncStatus('syncing');

      syncUser({
        workosId: user.id,
        email: user.email,
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.lastName || undefined
      })
      .then((result) => {
        console.log('🔗 Callback Page: User sync successful', result);
        setSyncStatus('completed');
        setAuthStatus('success');

        // Check if onboarding data exists in session storage
        const onboardingData = sessionStorage.getItem('onboarding_data');
        if (onboardingData) {
          console.log('📋 Callback Page: Found onboarding data, redirecting to dashboard with setup');
          // TODO: Associate onboarding data with the synced user
          sessionStorage.removeItem('onboarding_data');
        }

        setTimeout(() => router.replace('/dashboard'), 1500);
      })
      .catch((error) => {
        console.error('❌ Callback Page: User sync failed', error);
        setSyncStatus('failed');
        setAuthStatus('failed');
        setTimeout(() => router.replace('/auth'), 2000);
      });
    } else if (!isLoading && !user) {
      // Authentication failed or still processing
      console.log('❌ WorkOS AuthKit: No user found');
      setAuthStatus('failed');
      setTimeout(() => router.replace('/auth'), 2000);
    }
  }, [user, isLoading, router, syncStatus, syncUser]);

  const statusMessages = {
    processing: syncStatus === 'syncing' ? 'Syncing user to Convex...' : 'Completing authentication...',
    success: 'Authentication and sync successful! Redirecting to dashboard...',
    failed: 'Authentication failed. Redirecting to login...'
  };

  const statusColors = {
    processing: 'text-blue-600',
    success: 'text-green-600',
    failed: 'text-red-600'
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className={`animate-spin rounded-full h-32 w-32 border-b-2 mx-auto ${
          authStatus === 'success' ? 'border-green-600' :
          authStatus === 'failed' ? 'border-red-600' : 'border-blue-600'
        }`}></div>
        <p className={`mt-4 ${statusColors[authStatus]}`}>
          {statusMessages[authStatus]}
        </p>
        {authStatus === 'processing' && (
          <p className="mt-2 text-gray-500 text-sm">
            {syncStatus === 'syncing'
              ? 'Creating user record in Convex database...'
              : 'Processing JWT token with Convex...'
            }
          </p>
        )}
      </div>
    </div>
  );
}