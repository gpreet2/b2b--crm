'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { usePermission, ProtectedComponent } from '@/lib/auth-permissions'
import { PERMISSIONS } from '@/lib/permissions'
import { 
  UserPlusIcon, 
  UserGroupIcon, 
  EnvelopeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface Invitation {
  id: string
  email: string
  role: 'owner' | 'manager' | 'trainer'
  status: 'pending' | 'accepted' | 'expired' | 'revoked'
  created_at: string
  expires_at: string
  gym_id: string
}

interface StaffMember {
  id: string
  email: string
  full_name: string
  role: 'owner' | 'manager' | 'trainer' | 'member'
  created_at: string
  is_active: boolean
}

export default function StaffPage() {
  const { user } = useAuth()
  const canInviteStaff = usePermission(PERMISSIONS.INVITE_STAFF)
  const canManageStaff = usePermission(PERMISSIONS.MANAGE_STAFF)
  const canViewStaff = usePermission(PERMISSIONS.VIEW_STAFF)

  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'trainer' })
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Load staff and invitations
  useEffect(() => {
    if (canViewStaff) {
      loadData()
    }
  }, [canViewStaff])

  const loadData = async () => {
    try {
      // Load invitations
      const invitesRes = await fetch('/api/staff/invite')
      if (invitesRes.ok) {
        const data = await invitesRes.json()
        setInvitations(data.invitations || [])
      }

      // Load staff members
      const staffRes = await fetch('/api/staff')
      if (staffRes.ok) {
        const data = await staffRes.json()
        setStaff(data.staff || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviting(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/staff/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteForm)
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(`Invitation sent to ${inviteForm.email}`)
        setShowInviteModal(false)
        setInviteForm({ email: '', role: 'trainer' })
        loadData() // Reload invitations
      } else {
        setError(data.error || 'Failed to send invitation')
      }
    } catch (error) {
      setError('An error occurred while sending the invitation')
    } finally {
      setInviting(false)
    }
  }

  const revokeInvitation = async (invitationId: string) => {
    try {
      const res = await fetch('/api/staff/invite', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId })
      })

      if (res.ok) {
        setSuccess('Invitation revoked')
        loadData()
      }
    } catch (error) {
      setError('Failed to revoke invitation')
    }
  }

  if (!canViewStaff) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <ExclamationTriangleIcon className="h-12 w-12 text-warning mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted">You don't have permission to view staff members.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary-text mb-2">Staff Management</h1>
          <p className="text-secondary-text">Manage your gym staff and permissions</p>
        </div>
        
        <ProtectedComponent permission={PERMISSIONS.INVITE_STAFF}>
          <Button
            onClick={() => setShowInviteModal(true)}
            className="mt-4 md:mt-0"
          >
            <UserPlusIcon className="h-5 w-5 mr-2" />
            Invite Staff Member
          </Button>
        </ProtectedComponent>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-lg flex items-center">
          <XCircleIcon className="h-5 w-5 text-danger mr-2" />
          <p className="text-danger">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg flex items-center">
          <CheckCircleIcon className="h-5 w-5 text-success mr-2" />
          <p className="text-success">{success}</p>
        </div>
      )}

      {/* Current Staff */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserGroupIcon className="h-6 w-6 mr-2" />
            Current Staff ({staff.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <ArrowPathIcon className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : staff.length === 0 ? (
            <p className="text-muted text-center py-8">No staff members yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Role</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((member) => (
                    <tr key={member.id} className="border-b border-border/50 hover:bg-surface-light/50">
                      <td className="py-3 px-4 font-medium">
                        {member.full_name || 'No name'}
                      </td>
                      <td className="py-3 px-4 text-muted">{member.email}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          member.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                          member.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                          member.role === 'trainer' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center ${
                          member.is_active ? 'text-success' : 'text-danger'
                        }`}>
                          {member.is_active ? (
                            <>
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircleIcon className="h-4 w-4 mr-1" />
                              Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted">
                        {new Date(member.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <EnvelopeIcon className="h-6 w-6 mr-2" />
            Pending Invitations ({invitations.filter(i => i.status === 'pending').length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invitations.filter(i => i.status === 'pending').length === 0 ? (
            <p className="text-muted text-center py-8">No pending invitations</p>
          ) : (
            <div className="space-y-4">
              {invitations.filter(i => i.status === 'pending').map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-4 bg-surface-light rounded-lg">
                  <div className="flex items-center space-x-4">
                    <EnvelopeIcon className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">{invitation.email}</p>
                      <p className="text-sm text-muted">
                        Role: <span className="font-medium capitalize">{invitation.role}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-muted">Expires</p>
                      <p className="text-sm font-medium">
                        {new Date(invitation.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                    <ProtectedComponent permission={PERMISSIONS.INVITE_STAFF}>
                      <button
                        onClick={() => revokeInvitation(invitation.id)}
                        className="text-danger hover:text-danger/80 transition-colors"
                        title="Revoke invitation"
                      >
                        <XCircleIcon className="h-6 w-6" />
                      </button>
                    </ProtectedComponent>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Invite Staff Member</h2>
            
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full px-4 py-2 bg-surface-light border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="staff@example.com"
                />
              </div>
              
              <div>
                <label htmlFor="role" className="block text-sm font-medium mb-2">
                  Role
                </label>
                <select
                  id="role"
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="w-full px-4 py-2 bg-surface-light border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  {user?.role === 'owner' && (
                    <>
                      <option value="owner">Owner</option>
                      <option value="manager">Manager</option>
                    </>
                  )}
                  <option value="trainer">Trainer</option>
                </select>
                
                <div className="mt-2 text-sm text-muted">
                  {inviteForm.role === 'owner' && 'Full access to all features and settings'}
                  {inviteForm.role === 'manager' && 'Can manage classes, clients, and view reports'}
                  {inviteForm.role === 'trainer' && 'Can manage assigned classes and clients'}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowInviteModal(false)
                    setError(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={inviting}
                >
                  {inviting ? 'Sending...' : 'Send Invitation'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}