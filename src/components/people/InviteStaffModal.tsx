'use client'

import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { createClient } from '@/utils/supabase/client'
import { useAuth } from '@/lib/auth-context'

interface InviteStaffModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function InviteStaffModal({ isOpen, onClose, onSuccess }: InviteStaffModalProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'owner' | 'manager' | 'trainer'>('trainer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { user } = useAuth()
  const supabase = createClient()
  
  // Determine available roles based on user's role
  const availableRoles = user?.role === 'owner' 
    ? ['owner', 'manager', 'trainer'] 
    : ['manager', 'trainer']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/staff/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation')
      }

      setEmail('')
      setRole('trainer')
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-surface border border-[var(--color-border)] rounded-lg shadow-2xl p-6 w-full max-w-md">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-primary-text">Invite Staff Member</h2>
            <button
              onClick={onClose}
              className="text-secondary-text hover:text-primary-text transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg">
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="staff-email" className="block text-sm font-medium text-primary-text mb-2">
                Staff Email
              </label>
              <input
                id="staff-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-surface-light border border-[var(--color-border)] rounded-lg 
                         focus:ring-2 focus:ring-primary focus:border-primary text-primary-text
                         placeholder-muted transition-all duration-200"
                placeholder="staff@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-text mb-3">Role</label>
              <div className={`grid ${availableRoles.length === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>
                {availableRoles.map((availableRole) => (
                  <button
                    key={availableRole}
                    type="button"
                    onClick={() => setRole(availableRole as 'owner' | 'manager' | 'trainer')}
                    className={`py-3 px-4 rounded-lg font-medium capitalize transition-all duration-200 ${
                      role === availableRole
                        ? 'bg-gradient-primary text-white shadow-lg'
                        : 'bg-surface-light text-secondary-text hover:bg-surface-light/80 border border-[var(--color-border)]'
                    }`}
                  >
                    {availableRole}
                  </button>
                ))}
              </div>
              {user?.role === 'owner' && role === 'owner' && (
                <p className="mt-2 text-xs text-warning">
                  Warning: Owners have full access to all gym features
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-surface-light border border-[var(--color-border)] rounded-lg
                         text-secondary-text font-medium hover:bg-surface-light/80 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-primary text-white py-3 px-6 rounded-lg font-semibold
                         hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                ) : (
                  'Send Invitation'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}