"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TestSignOutPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        redirect: 'manual', // Don't automatically follow redirects
      });
      
      console.log('Sign out response status:', response.status);
      console.log('Sign out response headers:', response.headers);
      
      // WorkOS signOut returns a redirect
      if (response.status === 302 || response.status === 307) {
        // Clear any local storage
        localStorage.clear();
        sessionStorage.clear();
        
        alert('Signed out successfully! Redirecting to auth page...');
        
        // Manually redirect to auth page after clearing session
        window.location.href = '/auth';
      } else if (response.ok) {
        alert('Signed out successfully! You can now test sign up with a fresh session.');
        router.push('/auth');
      } else {
        alert('Failed to sign out');
      }
    } catch (error) {
      console.error('Sign out error:', error);
      alert('Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Test Sign Out</h2>
          <p className="text-gray-600 mb-6">
            Click the button below to sign out from WorkOS completely.
          </p>
          <button
            onClick={handleSignOut}
            disabled={isLoading}
            className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </div>
    </div>
  );
}