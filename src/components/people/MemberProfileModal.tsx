'use client'

import React from 'react'
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Shield, 
  Clock,
  Building2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { Client } from '@/lib/types'

interface MemberProfileModalProps {
  member: Client | null
  isOpen: boolean
  onClose: () => void
}

export default function MemberProfileModal({ member, isOpen, onClose }: MemberProfileModalProps) {
  if (!isOpen || !member) return null

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  const getAccessTypeColor = (accessType: string) => {
    switch (accessType) {
      case 'home':
        return 'bg-blue-100 text-blue-800'
      case 'full':
        return 'bg-green-100 text-green-800'
      case 'limited':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getAccessTypeLabel = (accessType: string) => {
    switch (accessType) {
      case 'home':
        return 'Home Access'
      case 'full':
        return 'Full Access'
      case 'limited':
        return 'Limited Access'
      default:
        return accessType
    }
  }

  const homeLocation = member.locationAccess.find(access => access.isHomeLocation)
  const otherLocations = member.locationAccess.filter(access => !access.isHomeLocation)

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {member.firstName} {member.lastName}
                </h2>
                <p className="text-sm text-gray-500">Member Profile</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-600">{member.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Phone</p>
                      <p className="text-sm text-gray-600">{member.phone}</p>
                    </div>
                  </div>

                  {member.dateOfBirth && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Date of Birth</p>
                        <p className="text-sm text-gray-600">{formatDate(member.dateOfBirth)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Emergency Contact */}
              {member.emergencyContact && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-medium text-gray-900">{member.emergencyContact.name}</p>
                    <p className="text-sm text-gray-600">{member.emergencyContact.phone}</p>
                    <p className="text-sm text-gray-500">{member.emergencyContact.relationship}</p>
                  </div>
                </div>
              )}

              {/* Membership Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Membership</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        member.membershipType === 'active' ? 'bg-green-100 text-green-800' :
                        member.membershipType === 'suspended' ? 'bg-red-100 text-red-800' :
                        member.membershipType === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {member.membershipType}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Member Since</p>
                      <p className="text-sm text-gray-600">{formatDate(member.membershipStartDate)}</p>
                    </div>
                  </div>

                  {member.membershipEndDate && (
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Membership Ends</p>
                        <p className="text-sm text-gray-600">{formatDate(member.membershipEndDate)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Location Access */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Location Access</span>
                </h3>

                {/* Home Location */}
                {homeLocation && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
                      <Building2 className="h-4 w-4" />
                      <span>Home Gym</span>
                    </h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-blue-600" />
                            <p className="font-medium text-blue-900">{homeLocation.location.name}</p>
                          </div>
                          <p className="text-sm text-blue-700 mb-1">
                            {homeLocation.location.address}
                          </p>
                          <p className="text-sm text-blue-700">
                            {homeLocation.location.city}, {homeLocation.location.state} {homeLocation.location.zipCode}
                          </p>
                          <p className="text-xs text-blue-600 mt-2">
                            Access since {formatDate(homeLocation.accessStartDate!)}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getAccessTypeColor(homeLocation.accessType)}`}>
                          {getAccessTypeLabel(homeLocation.accessType)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Other Locations */}
                {otherLocations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
                      <Building2 className="h-4 w-4" />
                      <span>Additional Access ({otherLocations.length})</span>
                    </h4>
                    <div className="space-y-3">
                      {otherLocations.map((access) => (
                        <div key={access.locationId} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <p className="font-medium text-gray-900">{access.location.name}</p>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">
                                {access.location.address}
                              </p>
                              <p className="text-sm text-gray-600">
                                {access.location.city}, {access.location.state} {access.location.zipCode}
                              </p>
                              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                <span>Access since {formatDate(access.accessStartDate!)}</span>
                                {access.accessEndDate && (
                                  <span>• Expires {formatDate(access.accessEndDate)}</span>
                                )}
                              </div>
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getAccessTypeColor(access.accessType)}`}>
                              {getAccessTypeLabel(access.accessType)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Additional Access */}
                {otherLocations.length === 0 && homeLocation && (
                  <div className="text-center py-6">
                    <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No additional location access</p>
                    <p className="text-xs text-gray-400 mt-1">Member has access to home gym only</p>
                  </div>
                )}
              </div>

              {/* Notes */}
              {member.notes && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">{member.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}