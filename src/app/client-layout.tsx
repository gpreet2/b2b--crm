'use client';
import { usePathname } from 'next/navigation';

import { Layout } from '@/components/layout/Layout';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');
  const isOnboardingPage = pathname?.startsWith('/onboarding');
  const isTestPage = pathname?.startsWith('/test-auth');
  const isHomePage = pathname === '/';

  // For now, using mock data. In production, this would come from WorkOS
  // through a context provider or similar pattern
  const user = {
    name: 'Admin User',
    email: 'admin@fitnesspro.com',
  };

  // Don't load Layout for pages that don't need it (major performance boost)
  if (isAuthPage || isOnboardingPage || isTestPage || isHomePage) {
    return children;
  }

  return (
    <Layout
      headerProps={{
        user,
        notifications: 5,
      }}
    >
      {children}
    </Layout>
  );
}
