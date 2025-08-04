'use client';
import { usePathname } from 'next/navigation';

import { Layout } from '@/components/layout/Layout';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');
  const isOnboardingPage = pathname?.startsWith('/onboarding');
  const isTestPage = pathname?.startsWith('/test-auth');

  // For now, using mock data. In production, this would come from WorkOS
  // through a context provider or similar pattern
  const user = {
    name: 'Admin User',
    email: 'admin@fitnesspro.com',
  };

  if (isAuthPage || isOnboardingPage || isTestPage) {
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
