'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@workos-inc/authkit-react';
import { useRouter } from 'next/navigation';

export default function CallbackPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState('processing');

  useEffect(() => {
    console.log('🔄 Callback Page: Authentication status check', {
      user: !!user,
      isLoading,
      userDetails: user ? { id: user.id, email: user.email } : null
    });

    if (!isLoading) {
      if (user) {
        // Successful authentication - redirect to dashboard
        console.log('✅ WorkOS AuthKit: User authenticated successfully', {
          userId: user.id,
          email: user.email,
          redirecting: 'to dashboard'
        });
        setAuthStatus('success');
        setTimeout(() => router.replace('/dashboard'), 1000);
      } else {
        // Authentication failed or still processing
        console.log('❌ WorkOS AuthKit: No user found, checking if still processing...');
        setAuthStatus('failed');
        setTimeout(() => router.replace('/auth'), 2000);
      }
    }
  }, [user, isLoading, router]);

  const statusMessages = {
    processing: 'Completing authentication...',
    success: 'Authentication successful! Redirecting to dashboard...',
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
            Processing JWT token with Convex...
          </p>
        )}
      </div>
    </div>
  );
}