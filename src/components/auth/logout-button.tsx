'use client';

import { useAuth } from '@/contexts/AuthContext';

export function LogoutButton() {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <button 
      onClick={handleLogout}
      className="text-sm text-secondary-text hover:text-primary-text transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-accent"
    >
      Sign Out
    </button>
  );
}