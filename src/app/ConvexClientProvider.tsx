'use client';

import { ReactNode } from 'react';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithAuthKit } from '@convex-dev/workos';
import { AuthKitProvider, useAuth } from '@workos-inc/authkit-react';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  console.log('🎯 CONVEX CLIENT PROVIDER - Official WorkOS AuthKit Integration:', {
    convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL,
    workosClientId: process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID,
    implementation: 'Client-side WorkOS AuthKit -> @convex-dev/workos -> Convex',
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/callback`,
    timestamp: new Date().toISOString()
  });

  return (
    <AuthKitProvider
      clientId={process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID!}
      redirectUri={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/callback`}
    >
      <ConvexProviderWithAuthKit client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithAuthKit>
    </AuthKitProvider>
  );
}