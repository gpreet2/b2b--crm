'use client';

import { useState, useEffect } from 'react';

interface WorkOSUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
}

export function useWorkOSUser() {
  const [user, setUser] = useState<WorkOSUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/auth/user');
        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        console.error('Error fetching WorkOS user:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return { user, loading, error };
}