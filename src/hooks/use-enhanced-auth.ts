'use client';

import { useAuth } from '@/contexts/AuthContext';

export function useEnhancedAuth() {
  // Our new AuthContext already has all the enhanced functionality built in
  return useAuth();
}