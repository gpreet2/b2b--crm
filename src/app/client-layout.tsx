'use client';
import { usePathname } from 'next/navigation';

import { Layout } from '@/components/layout/Layout';
import { LocationProvider } from '@/contexts/LocationContext';

interface ClientLayoutProps {
  children: React.ReactNode;
  user?: {
    name: string;
    email: string;
  };
}

export default function ClientLayout({ children, user }: ClientLayoutProps) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');
  const isOnboardingPage = pathname?.startsWith('/onboarding');
  const isTestPage = pathname?.startsWith('/test-auth');
  const isHomePage = pathname === '/';

  // Don't load Layout for pages that don't need it (major performance boost)
  if (isAuthPage || isOnboardingPage || isTestPage || isHomePage) {
    return children;
  }

  // Use provided user data or fallback
  const layoutUser = user || {
    name: 'Anonymous User',
    email: 'unknown@example.com',
  };

  return (
    <LocationProvider>
      <Layout
        headerProps={{
          user: layoutUser,
          notifications: 5,
        }}
      >
        {children}
      </Layout>
    </LocationProvider>
  );
}
