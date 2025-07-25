'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [magicLink, setMagicLink] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn } = useAuth()
  
  const redirect = searchParams.get('redirect') || '/'
  const error = searchParams.get('error')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setMagicLink(null)
    
    const result = await signIn(email)
    
    if (result.error) {
      setMessage({ type: 'error', text: result.error })
      setLoading(false)
    } else if (result.authMethod === 'magic_link') {
      if (result.magicLink) {
        // Development mode with test keys - show the link
        setMagicLink(result.magicLink)
        setMessage({ 
          type: 'success', 
          text: 'Test mode: Click the link below to sign in' 
        })
      } else {
        // Production mode - email will be sent
        setMessage({ 
          type: 'success', 
          text: 'Check your email for a sign-in link. You can close this window.' 
        })
      }
      setLoading(false)
    }
    // If SSO, the user will be redirected automatically
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mb-6 shadow-xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-primary-text mb-2">Back2Back OS</h1>
          <p className="text-secondary-text">Sign in to your account</p>
        </div>

        {/* Sign In Form */}
        <div className="bg-surface border border-[var(--color-border)] rounded-lg shadow-2xl p-8">
          <h2 className="text-2xl font-semibold text-primary-text mb-6 text-center">Sign In</h2>

          {/* Error from URL params */}
          {error && (
            <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-lg">
              <p className="text-sm text-danger">
                {error === 'auth_failed' && 'Authentication failed. Please try again.'}
                {error === 'missing_code' && 'Invalid authentication request.'}
                {error !== 'auth_failed' && error !== 'missing_code' && error}
              </p>
            </div>
          )}

          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-success/10 border-success/20 text-success' 
                : 'bg-danger/10 border-danger/20 text-danger'
            }`}>
              <p className="text-sm">{message.text}</p>
              
              {/* Show magic link in development mode */}
              {magicLink && (
                <div className="mt-4">
                  <a 
                    href={magicLink}
                    className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open Magic Link
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </a>
                  <p className="mt-2 text-xs text-muted">
                    This link is only shown in development mode with test keys.
                  </p>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary-text mb-2">
                Work Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-surface-light border border-[var(--color-border)] rounded-lg 
                         focus:ring-2 focus:ring-primary focus:border-primary text-primary-text
                         placeholder-muted transition-all duration-200"
                placeholder="you@company.com"
                required
                autoComplete="email"
                autoFocus
              />
              <p className="mt-2 text-xs text-muted">
                We'll email you a secure sign-in link
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-gradient-primary text-white py-3 px-6 rounded-lg font-semibold
                       hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                       focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 
                       focus:ring-offset-surface flex items-center justify-center"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </div>
              ) : (
                <>
                  Sign In
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-muted text-xs">
            © 2024 Back2Back OS. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}