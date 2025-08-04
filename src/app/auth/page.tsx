'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

export default function AuthPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Use AuthKit's user management authentication (not SSO)
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      console.log('Sign in response:', data);

      if (response.ok && data.url) {
        console.log('Redirecting to WorkOS:', data.url);
        window.location.href = data.url;
      } else {
        setIsLoading(false);
        setErrors({ email: data.error || 'Authentication failed. Please try again.' });
      }
    } catch (error) {
      console.error('Auth error:', error);
      setIsLoading(false);
      setErrors({ email: 'Authentication failed. Please try again.' });
    }
  };

  return (
    <div className='min-h-screen max-h-screen overflow-hidden bg-gradient-to-br from-surface via-surface-light to-accent'>
      <div className='flex h-screen'>
        {/* Left Side - Artwork with Text Overlay */}
        <div className='hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary-dark to-accent relative overflow-hidden'>
          {/* Background Image */}
          <div className='absolute inset-0 flex items-center justify-center'>
            <Image
              src='/images/AuthImage.png'
              alt='Fitness Artwork'
              fill
              className='object-contain opacity-30'
            />
          </div>

          {/* Content Overlay */}
          <div className='relative z-10 flex flex-col justify-center h-full p-12 text-white'>
            <div className='max-w-md'>
              <div className='mb-8'>
                <h1 className='text-display-2 font-display mb-4'>
                  Transform Your Fitness Business
                </h1>
                <p className='text-body-lg opacity-90 leading-relaxed'>
                  Streamline operations, boost member engagement, and scale your fitness business
                  with our comprehensive management platform.
                </p>
              </div>

              <div className='space-y-4'>
                <div className='flex items-center space-x-3'>
                  <div className='flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center'>
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className='text-body font-heading mb-1'>Member Management</h3>
                    <p className='text-body-sm opacity-80'>
                      Efficiently manage memberships and billing
                    </p>
                  </div>
                </div>

                <div className='flex items-center space-x-3'>
                  <div className='flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center'>
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className='text-body font-heading mb-1'>Class Scheduling</h3>
                    <p className='text-body-sm opacity-80'>Optimize facility usage and bookings</p>
                  </div>
                </div>

                <div className='flex items-center space-x-3'>
                  <div className='flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center'>
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className='text-body font-heading mb-1'>Analytics & Insights</h3>
                    <p className='text-body-sm opacity-80'>Make data-driven business decisions</p>
                  </div>
                </div>
              </div>

              <div className='mt-8 pt-6 border-t border-white/20'>
                <p className='text-body-sm opacity-80'>
                  Trusted by fitness professionals worldwide
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Forms */}
        <div className='flex-1 flex items-center justify-center p-6 overflow-y-auto'>
          <div className='w-full max-w-md h-full flex flex-col justify-center'>
            <div className='text-center mb-6'>
              <div className='mb-4'>
                <div className='w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg'>
                  <svg
                    className='w-6 h-6 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M13 10V3L4 14h7v7l9-11h-7z'
                    />
                  </svg>
                </div>
                <h1 className='text-h3 font-display text-primary-text mb-1'>Welcome Back</h1>
                <p className='text-body-sm text-secondary-text'>
                  Sign in to your account to continue
                </p>
              </div>
            </div>

            <Card className='p-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm'>
              <form onSubmit={handleSubmit} className='space-y-4'>
                <Input
                  label='Email Address'
                  type='email'
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  error={errors.email}
                  placeholder='john@example.com'
                  leftIcon={
                    <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207'
                      />
                    </svg>
                  }
                />

                <Input
                  label='Password'
                  type='password'
                  value={formData.password}
                  onChange={e => handleInputChange('password', e.target.value)}
                  error={errors.password}
                  placeholder='••••••••'
                  leftIcon={
                    <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                      />
                    </svg>
                  }
                />

                <div className='flex items-center justify-between'>
                  <label className='flex items-center'>
                    <input
                      type='checkbox'
                      className='w-4 h-4 text-primary border-border rounded focus:ring-primary/20'
                    />
                    <span className='ml-2 text-sm text-secondary-text'>Remember me</span>
                  </label>
                  <button
                    type='button'
                    className='text-sm text-primary hover:text-primary-dark font-medium'
                  >
                    Forgot password?
                  </button>
                </div>

                <Button type='submit' className='w-full' loading={isLoading} size='lg'>
                  Sign In
                </Button>

                <div className='relative my-4'>
                  <div className='absolute inset-0 flex items-center'>
                    <div className='w-full border-t border-border' />
                  </div>
                  <div className='relative flex justify-center text-sm'>
                    <span className='px-2 bg-surface text-secondary-text'>Or continue with</span>
                  </div>
                </div>

                <Button type='button' variant='outline' className='w-full' size='md'>
                  <svg className='w-4 h-4 mr-2' viewBox='0 0 24 24'>
                    <path
                      fill='currentColor'
                      d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                    />
                    <path
                      fill='currentColor'
                      d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                    />
                    <path
                      fill='currentColor'
                      d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                    />
                    <path
                      fill='currentColor'
                      d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                    />
                  </svg>
                  Continue with Google
                </Button>
              </form>

              <div className='mt-4 text-center'>
                <p className='text-body-sm text-secondary-text'>
                  Don&apos;t have an account?{' '}
                  <button
                    type='button'
                    onClick={() => router.push('/create-account')}
                    className='text-primary hover:text-primary-dark font-medium'
                  >
                    Create account
                  </button>
                </p>
              </div>
            </Card>

            <div className='mt-4 text-center'>
              <p className='text-caption text-muted'>
                By continuing, you agree to our{' '}
                <a href='#' className='text-primary hover:text-primary-dark'>
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href='#' className='text-primary hover:text-primary-dark'>
                  Privacy Policy
                </a>
              </p>
            </div>

            <div className='mt-3 text-center'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => router.push('/dashboard')}
                className='text-xs'
              >
                Skip to Dashboard (Temporary)
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
