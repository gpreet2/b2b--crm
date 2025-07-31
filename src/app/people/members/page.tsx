'use client'

import React, { useState, useMemo } from 'react'
import { 
  Search, 
  User, 
  Clock, 
  CreditCard, 
  CheckCircle, 
  Calendar, 
  X,
  Ticket,
  MoreVertical,
} from 'lucide-react'
import { mockClients } from '@/lib/mock-data'
import { Client } from '@/lib/types'
import MemberProfileModal from '@/components/people/MemberProfileModal'

interface Member extends Client {
  membershipExpiry: Date
  lastCheckIn?: Date
  totalCheckIns: number
  profileImage?: string
  classes: ClassEnrollment[]
}

interface ClassEnrollment {
  id: string
  classId: string
  className: string
  date: Date
  time: string
  checkedIn: boolean
  checkedInAt?: Date
}

interface DayPass {
  id: string
  name: string
  email: string
  phone: string
  purchasedAt: Date
  expiresAt: Date
  accessCode: string
  paymentStatus: 'pending' | 'completed' | 'failed'
  amount: number
}

export default function MembersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [showDayPassModal, setShowDayPassModal] = useState(false)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profileMember, setProfileMember] = useState<Member | null>(null)
  const [dayPassForm, setDayPassForm] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  // Convert mock clients to members with additional fields
  const members: Member[] = useMemo(() => mockClients.map(client => ({
    ...client,
    membershipExpiry: new Date('2025-03-15'), // Mock expiry date
    lastCheckIn: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined,
    totalCheckIns: Math.floor(Math.random() * 200) + 10,
    classes: [] // Mock empty classes for now
  })), [])

  const filteredMembers = useMemo(() => {
    if (!searchQuery) return members
    
    const query = searchQuery.toLowerCase()
    return members.filter(member =>
      `${member.firstName} ${member.lastName}`.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query) ||
      member.phone.includes(searchQuery)
    )
  }, [searchQuery, members])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'suspended':
        return 'bg-red-100 text-red-800'
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800'
      case 'employee':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getMemberTypeColor = (type: string) => {
    switch (type) {
      case 'home':
        return 'bg-blue-100 text-blue-800'
      case 'multi-location':
        return 'bg-purple-100 text-purple-800'
      case 'visiting':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getMemberTypeLabel = (type: string) => {
    switch (type) {
      case 'home':
        return 'Home Member'
      case 'multi-location':
        return 'Multi-Location'
      case 'visiting':
        return 'Visiting Member'
      default:
        return type
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return formatDate(date)
  }

  const handleManualCheckIn = (memberId: string) => {
    // In real app, this would make an API call
    alert(`Member ${memberId} checked in successfully!`)
    setActiveDropdownId(null)
  }

  const handleViewClasses = (member: Member) => {
    setSelectedMember(member)
    setActiveDropdownId(null)
  }

  const handleViewProfile = (member: Member) => {
    setProfileMember(member)
    setShowProfileModal(true)
    setActiveDropdownId(null)
  }

  const generateAccessCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const handleDayPassSubmit = async () => {
    setIsProcessingPayment(true)
    
    // Simulate payment processing
    setTimeout(() => {
      const newDayPass: DayPass = {
        id: Date.now().toString(),
        name: dayPassForm.name,
        email: dayPassForm.email,
        phone: dayPassForm.phone,
        purchasedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        accessCode: generateAccessCode(),
        paymentStatus: 'completed',
        amount: 25
      }
      
      setIsProcessingPayment(false)
      alert(`Day pass created! Access code: ${newDayPass.accessCode}`)
      setShowDayPassModal(false)
      setDayPassForm({ name: '', email: '', phone: '' })
    }, 2000)
  }



  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Members</h1>
            <p className="text-sm text-gray-500 mt-1">Manage members and day passes</p>
          </div>
          
          <button 
            onClick={() => setShowDayPassModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Ticket className="h-4 w-4" />
            <span>Sell Day Pass</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Members Table */}
      <div className="px-6 py-4">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Membership
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Check-in
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{member.firstName} {member.lastName}</div>
                        <div className="text-sm text-gray-500">Member since {formatDate(member.membershipStartDate)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{member.email}</div>
                    <div className="text-sm text-gray-500">{member.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getMemberTypeColor(member.memberType)}`}>
                      {getMemberTypeLabel(member.memberType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Premium Monthly</div>
                    <div className="text-sm text-gray-500">Expires {formatDate(member.membershipExpiry)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.lastCheckIn ? getTimeAgo(member.lastCheckIn) : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(member.membershipType)}`}>
                      {member.membershipType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative">
                      <button
                        onClick={() => setActiveDropdownId(activeDropdownId === member.id ? null : member.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      
                      {activeDropdownId === member.id && (
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                          <div className="py-1">
                            <button
                              onClick={() => handleManualCheckIn(member.id)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>Manual Check-in</span>
                            </button>
                            <button
                              onClick={() => handleViewClasses(member)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                            >
                              <Calendar className="h-4 w-4" />
                              <span>View Classes</span>
                            </button>
                            <button
                              onClick={() => handleViewProfile(member)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                            >
                              <User className="h-4 w-4" />
                              <span>View Profile</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Class Details Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  Classes for {selectedMember.firstName} {selectedMember.lastName}
                </h2>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
              {selectedMember.classes.length > 0 ? (
                <div className="space-y-3">
                  {selectedMember.classes.map((cls) => (
                    <div key={cls.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{cls.className}</h3>
                          <p className="text-sm text-gray-500">
                            {formatDate(cls.date)} at {cls.time}
                          </p>
                          {cls.checkedIn && cls.checkedInAt && (
                            <p className="text-sm text-green-600 mt-1">
                              Checked in at {new Date(cls.checkedInAt).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                        <div>
                          {cls.checkedIn ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Clock className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No classes scheduled</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Day Pass Modal */}
      {showDayPassModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Sell Day Pass</h2>
                  <p className="text-sm text-gray-500">24-hour gym access</p>
                </div>
                <button
                  onClick={() => setShowDayPassModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={dayPassForm.name}
                    onChange={(e) => setDayPassForm({...dayPassForm, name: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={dayPassForm.email}
                    onChange={(e) => setDayPassForm({...dayPassForm, email: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="john@example.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={dayPassForm.phone}
                    onChange={(e) => setDayPassForm({...dayPassForm, phone: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="(555) 555-5555"
                  />
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Day Pass (24 hours)</span>
                    <span className="text-lg font-semibold text-gray-900">$25.00</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Access expires 24 hours after purchase</p>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200">
              <button
                onClick={handleDayPassSubmit}
                disabled={!dayPassForm.name || !dayPassForm.email || isProcessingPayment}
                className="w-full bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isProcessingPayment ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    <span>Process with Square/Stripe</span>
                  </>
                )}
              </button>
              {!isProcessingPayment && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  Day pass active for 24 hours after purchase
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Member Profile Modal */}
      <MemberProfileModal
        member={profileMember}
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false)
          setProfileMember(null)
        }}
      />
    </div>
  )
}