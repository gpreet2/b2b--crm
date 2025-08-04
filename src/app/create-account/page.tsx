'use client';

import { useEffect } from 'react';

export default function CreateAccountPage() {
  useEffect(() => {
    // Clear all local storage
    localStorage.clear();
    sessionStorage.clear();

    // Set a flag to indicate we want to create a new account
    sessionStorage.setItem('creating_new_account', 'true');

    // Use a form POST to clear cookies and redirect
    // This ensures all cookies are cleared including httpOnly ones
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/api/auth/signout';

    // Add a hidden field to indicate where to redirect after signout
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'returnTo';
    input.value = '/onboarding';
    form.appendChild(input);

    document.body.appendChild(form);
    form.submit();
  }, []);

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-surface via-surface-light to-accent'>
      <div className='text-center'>
        <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse'>
          <svg className='w-8 h-8 text-primary animate-spin' fill='none' viewBox='0 0 24 24'>
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
             />
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
             />
          </svg>
        </div>
        <h2 className='text-xl font-semibold text-primary-text mb-2'>
          Preparing your account setup...
        </h2>
        <p className='text-sm text-secondary-text'>
          Please wait while we prepare the onboarding process
        </p>
      </div>
    </div>
  );
}
