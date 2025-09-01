'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@workos-inc/authkit-nextjs/components';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user: workosUser } = useAuth();
  const currentUser = useQuery(api.auth.getCurrentUserQuery);
  const router = useRouter();

  const loading = workosUser === undefined;
  const user = workosUser && currentUser ? {
    id: (currentUser as any)?._id || currentUser?.id || 'temp-id',
    email: workosUser.email || '',
    firstName: workosUser.firstName || '',
    lastName: workosUser.lastName || '',
  } : null;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-secondary-text">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  console.log('🔐 Dashboard Layout - Client Auth SUCCESS:', {
    userId: user?.id,
    userEmail: user?.email,
    timestamp: new Date().toISOString()
  });

  return <div>{children}</div>;
}