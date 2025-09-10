'use client';

import { ReactNode } from 'react';
import { ConvexReactClient } from 'convex/react';
import { AuthKitProvider, useAuth } from '@workos-inc/authkit-react';
import { ConvexProviderWithAuthKit } from '@convex-dev/workos';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  console.log('🎯 CONVEX CLIENT PROVIDER - Initializing with official integration:', {
    convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL,
    workosClientId: process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID,
    redirectUri: process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI,
    packageVersion: '@convex-dev/workos official integration',
    timestamp: new Date().toISOString()
  });

  return (
    <AuthKitProvider
      clientId={process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID!}
      redirectUri={process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI!}
    >
      <ConvexProviderWithAuthKit client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithAuthKit>
    </AuthKitProvider>
  );
}