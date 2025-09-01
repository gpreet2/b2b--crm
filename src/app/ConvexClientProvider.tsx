'use client';

import { ReactNode } from 'react';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithAuth } from 'convex/react';
import { AuthKitProvider, useAuth, useAccessToken } from '@workos-inc/authkit-nextjs/components';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <AuthKitProvider>
      <ConvexProviderWithAuth client={convex} useAuth={useAuthFromAuthKit}>
        {children}
      </ConvexProviderWithAuth>
    </AuthKitProvider>
  );
}

function useAuthFromAuthKit() {
  const { user } = useAuth();
  const { accessToken, error: tokenError } = useAccessToken();
  
  const loading = user === undefined;
  
  return {
    isLoading: loading,
    isAuthenticated: !!user && !loading,
    fetchAccessToken: async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      if (loading) {
        return null;
      }
      
      if (!user) {
        return null;
      }
      
      if (tokenError) {
        console.error('Error fetching access token:', tokenError);
        return null;
      }
      
      // Return the access token for Convex to use
      return accessToken || null;
    }
  };
}