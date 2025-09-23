'use client';

import { useAuthenticatedUser } from '@/hooks/use-authenticated-user';

export function LogoutButton() {
  const { signOut } = useAuthenticatedUser();

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