'use client';

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from '@workos-inc/authkit-react';

export function useAuthenticatedUser() {
  const workosAuth = useAuth();
  const convexUser = useQuery(api.auth.getCurrentUserQuery);

  console.log('🔍 useAuthenticatedUser - State check:', {
    workosUser: !!workosAuth.user,
    workosLoading: workosAuth.isLoading,
    convexUser: !!convexUser,
    convexLoading: convexUser === undefined,
    timestamp: Date.now()
  });

  const signOut = async () => {
    try {
      await workosAuth.signOut();
      // Redirect handled by WorkOS AuthKit
    } catch (error) {
      console.error('Sign out error:', error);
      // Fallback redirect to auth page
      window.location.href = '/auth';
    }
  };

  // Determine loading state more precisely
  const isWorkosLoading = workosAuth.isLoading;
  const isConvexLoading = convexUser === undefined && !!workosAuth.user;
  const isLoading = isWorkosLoading || isConvexLoading;

  // Authentication logic:
  // 1. If WorkOS is still loading, wait
  // 2. If no WorkOS user, not authenticated
  // 3. If WorkOS user exists but Convex user is still loading, still loading
  // 4. If WorkOS user exists and Convex query resolved (even if null), allow Convex to handle user creation
  const isAuthenticated = !!workosAuth.user && convexUser !== undefined;

  console.log('🔍 useAuthenticatedUser - Final state:', {
    isWorkosLoading,
    isConvexLoading,
    isLoading,
    isAuthenticated,
    hasWorkosUser: !!workosAuth.user,
    hasConvexUser: !!convexUser,
    timestamp: Date.now()
  });

  return {
    user: convexUser,
    workosUser: workosAuth.user, // For backwards compatibility
    isLoading,
    isAuthenticated,
    signOut,
  };
}