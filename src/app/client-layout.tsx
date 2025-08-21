'use client';
import { usePathname } from 'next/navigation';
import { useEnhancedAuth } from '@/hooks/use-enhanced-auth';

import { Layout } from '@/components/layout/Layout';
import { LocationProvider } from '@/contexts/LocationContext';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const authData = useEnhancedAuth();
  const { 
    user, 
    role, 
    organizationId, 
    permissions, 
    isImpersonating, 
    getDisplayName,
    getInitials 
  } = authData;
  
  // Enhanced debug logging
  console.log('ClientLayout Enhanced Debug:', {
    pathname,
    user: user ? {
      id: user.id,
      email: user.email,
      displayName: getDisplayName(),
      initials: getInitials(),
    } : null,
    role,
    organizationId,
    permissionsCount: permissions?.length || 0,
    isImpersonating: isImpersonating(),
    timestamp: new Date().toISOString()
  });
  
  const isAuthPage = pathname?.startsWith('/auth');
  const isOnboardingPage = pathname?.startsWith('/onboarding');
  const isTestPage = pathname?.startsWith('/test-auth');
  const isHomePage = pathname === '/';

  // Don't load Layout for pages that don't need it (major performance boost)
  if (isAuthPage || isOnboardingPage || isTestPage || isHomePage) {
    return children;
  }

  // Enhanced user data for layout
  const layoutUser = user ? {
    name: getDisplayName(),
    email: user.email || '',
    avatar: user.profilePictureUrl || undefined,
    initials: getInitials(),
    role: role || undefined,
    organizationId: organizationId || undefined,
    isImpersonating: isImpersonating(),
  } : undefined;

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
