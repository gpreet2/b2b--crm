'use client';

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@workos-inc/authkit-react";

export function useAuthenticatedUser() {
  const { user: workosUser, isLoading: authLoading, signOut } = useAuth();
  const convexUser = useQuery(api.auth.getCurrentUserQuery);
  
  return {
    user: convexUser,
    workosUser,
    isLoading: authLoading || convexUser === undefined,
    isAuthenticated: !!workosUser && !!convexUser,
    signOut,
  };
}