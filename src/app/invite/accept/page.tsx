'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/utils/supabase/client'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

interface Invitation {
  id: string
  email: string
  role: string
  gym_id: string
  gym: {
    name: string
  }
}

export default function AcceptInvitationPage() {
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accepting, setAccepting] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn } = useAuth()
  const token = searchParams.get('token')
  
  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link')
      setLoading(false)
      return
    }
    
    validateInvitation()
  }, [token])
  
  const validateInvitation = async () => {
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select(`
          id,
          email,
          role,
          gym_id,
          gyms (
            name
          )
        `)
        .eq('token', token)
        .eq('status', 'pending')
        .single()
      
      if (error || !data) {
        setError('Invalid or expired invitation')
        return
      }
      
      // Check if invitation is expired (7 days)
      const createdAt = new Date(data.created_at)
      const expiresAt = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000)
      
      if (new Date() > expiresAt) {
        setError('This invitation has expired')
        return
      }
      
      setInvitation(data as any)
    } catch (err) {
      setError('Failed to validate invitation')
    } finally {
      setLoading(false)
    }
  }
  
  const handleAccept = async () => {
    if (!invitation) return
    
    setAccepting(true)
    
    try {
      // Send magic link to the invitation email
      const result = await signIn(invitation.email)
      
      if (result.error) {
        setError(result.error)
      } else {
        // Store invitation token in session storage for after auth
        sessionStorage.setItem('pending_invitation_token', token!)
        
        // Show success message
        setAccepting(false)
        // The invitation will be accepted after the user completes authentication
      }
    } catch (err) {
      setError('Failed to send sign-in link')
      setAccepting(false)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <XCircleIcon className="mx-auto h-12 w-12 text-danger mb-4" />
          <h1 className="text-2xl font-bold text-primary-text mb-2">Invalid Invitation</h1>
          <p className="text-secondary-text mb-6">{error}</p>
          <button
            onClick={() => router.push('/signin')}
            className="bg-gradient-primary text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    )
  }
  
  if (!invitation) {
    return null
  }
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-surface border border-border rounded-lg shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
              <CheckCircleIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-primary-text mb-2">
              You've been invited!
            </h1>
            <p className="text-secondary-text">
              Join {invitation.gym.name} as a {invitation.role}
            </p>
          </div>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-muted mb-1">
                Email
              </label>
              <div className="px-4 py-3 bg-surface-light rounded-lg text-primary-text">
                {invitation.email}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-muted mb-1">
                Role
              </label>
              <div className="px-4 py-3 bg-surface-light rounded-lg">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                  bg-primary/10 text-primary capitalize">
                  {invitation.role}
                </span>
              </div>
            </div>
          </div>
          
          {accepting ? (
            <div className="text-center py-8">
              <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-primary-text font-medium">
                Check your email for a sign-in link
              </p>
              <p className="text-sm text-muted mt-2">
                We've sent a secure link to {invitation.email}
              </p>
            </div>
          ) : (
            <button
              onClick={handleAccept}
              className="w-full bg-gradient-primary text-white py-3 px-6 rounded-lg font-semibold
                       hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Accept Invitation
            </button>
          )}
          
          <p className="text-center text-sm text-muted mt-6">
            By accepting, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  )
}