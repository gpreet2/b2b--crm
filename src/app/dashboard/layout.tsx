'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthenticatedUser } from '@/hooks/use-authenticated-user';
import { AuthDebug } from '@/components/AuthDebug';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading, isAuthenticated } = useAuthenticatedUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('🔐 Dashboard Layout - User not authenticated, redirecting to auth');
      router.push('/auth');
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!isAuthenticated) {
    return null;
  }

  console.log('🔐 Dashboard Layout - User authenticated:', {
    userId: user?._id,
    email: user?.email,
    organization: user?.organizationId,
    timestamp: new Date().toISOString()
  });

  return (
    <div>
      {children}
      <AuthDebug />
    </div>
  );
}