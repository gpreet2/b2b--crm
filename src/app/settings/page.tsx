'use client';

import {
  Key,
  Settings,
  Users,
  Shield,
  Clock,
  DollarSign,
  Globe,
  CheckCircle,
  Building,
  AlertTriangle,
  Plus,
  Download,
  Save,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  Mail,
  Phone,
  UserPlus,
  Activity,
  MapPin,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthenticatedUser } from '@/hooks/use-authenticated-user';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Separator } from '@/components/ui/Separator';
import { Switch } from '@/components/ui/Switch';

// Role Management Components
import RolesList from '@/components/admin/RolesList';
import RoleEditor from '@/components/admin/RoleEditor';
import PermissionsMatrix from '@/components/admin/PermissionsMatrix';
import UserRoleAssignment from '@/components/admin/UserRoleAssignment';
import type { Role } from '@/lib/api/roles';
import { 
  fetchOrganizations,
  fetchOrganization, 
  updateOrganization, 
  updateOrganizationSettings,
  fetchOrganizationLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  type Organization,
  type Location,
  type UpdateOrganizationRequest,
  type CreateLocationRequest,
  type UpdateLocationRequest,
} from '@/lib/api/organizations';

type TabType = 'door-access' | 'business-rules' | 'people' | 'location';

const tabs = [
  {
    id: 'location' as TabType,
    name: 'Location',
    icon: Building,
    description: 'Manage organization and location settings',
  },
  {
    id: 'door-access' as TabType,
    name: 'Door Access',
    icon: Key,
    description: 'Manage door controls and access permissions',
  },
  {
    id: 'business-rules' as TabType,
    name: 'Business Rules',
    icon: Settings,
    description: 'Configure policies and operating hours',
  },
  {
    id: 'people' as TabType,
    name: 'People',
    icon: Users,
    description: 'Manage staff and team permissions',
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('location');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'location':
        return <LocationSettings />;
      case 'door-access':
        return <DoorAccessSettings />;
      case 'business-rules':
        return <BusinessRulesSettings />;
      case 'people':
        return <PeopleSettings />;
      default:
        return <LocationSettings />;
    }
  };

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-7xl mx-auto p-6 space-y-8'>
        {/* Header */}
        <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6'>
          <div className='space-y-2'>
            <h1 className='text-4xl font-bold text-slate-900 tracking-tight'>Settings</h1>
            <p className='text-lg text-slate-600'>
              Manage your gym&apos;s configuration and access controls
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <Button variant='outline' className='gap-2 bg-white hover:bg-slate-50'>
              <Download className='h-4 w-4' />
              Export Config
            </Button>
            <Button className='gap-2 bg-red-600 hover:bg-red-700 text-white shadow-lg'>
              <Save className='h-4 w-4' />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className='bg-white rounded-2xl shadow-sm border border-slate-200 p-2'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-2'>
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative p-6 rounded-xl text-left transition-all duration-200
                    ${
                      isActive
                        ? 'bg-red-50 border-2 border-red-200 shadow-sm'
                        : 'hover:bg-slate-50 border-2 border-transparent'
                    }
                  `}
                >
                  <div className='flex items-start gap-4'>
                    <div
                      className={`
                        p-3 rounded-xl transition-colors
                        ${isActive ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}
                      `}
                    >
                      <Icon className='h-6 w-6' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <h3
                        className={`
                          font-semibold text-lg mb-1
                          ${isActive ? 'text-red-900' : 'text-slate-900'}
                        `}
                      >
                        {tab.name}
                      </h3>
                      <p
                        className={`
                          text-sm leading-relaxed
                          ${isActive ? 'text-red-700' : 'text-slate-600'}
                        `}
                      >
                        {tab.description}
                      </p>
                    </div>
                  </div>
                  {isActive ? <div className='absolute inset-x-0 bottom-0 h-1 bg-red-500 rounded-b-xl' /> : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className='space-y-8'>{renderTabContent()}</div>
      </div>
    </div>
  );
}

function DoorAccessSettings() {
  const [doorApiKeys, setDoorApiKeys] = useState<Record<string, string>>({});
  const [showApiKey, setShowApiKey] = useState(false);
  const [selectedDoors, setSelectedDoors] = useState<string[]>([]);
  const [membershipMapping, setMembershipMapping] = useState<Record<string, string[]>>({});
  const [testDoor, setTestDoor] = useState('');

  const mockDoors = [{ id: '1', name: 'Front Door', location: 'Main Entrance', status: 'online' }];

  const mockMembershipTypes = [
    { name: 'Basic', color: 'bg-blue-100 text-blue-800' },
    { name: 'Premium', color: 'bg-purple-100 text-purple-800' },
    { name: 'VIP', color: 'bg-amber-100 text-amber-800' },
    { name: 'Staff', color: 'bg-green-100 text-green-800' },
    { name: 'Trial', color: 'bg-gray-100 text-gray-800' },
  ];

  return (
    <div className='space-y-8'>
      {/* API Configuration */}
      <Card className='bg-white shadow-sm border-slate-200'>
        <CardHeader className='pb-4'>
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-red-100 rounded-xl'>
              <Key className='h-6 w-6 text-red-600' />
            </div>
            <div>
              <CardTitle className='text-2xl text-slate-900'>Kisi API Configuration</CardTitle>
              <p className='text-slate-600 mt-1'>Connect your Kisi account for door control</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          {mockDoors.map(door => (
            <div key={door.id} className='space-y-3'>
              <label className='text-sm font-medium text-slate-700'>
                {door.name} - Kisi API Key
              </label>
              <div className='relative'>
                <Input
                  type={showApiKey ? 'text' : 'password'}
                  value={doorApiKeys[door.id] || ''}
                  onChange={e =>
                    setDoorApiKeys({
                      ...doorApiKeys,
                      [door.id]: e.target.value,
                    })
                  }
                  placeholder={`Enter API key for ${door.name}`}
                  className='pr-12 bg-slate-50 border-slate-200 focus:border-red-300 focus:ring-red-200'
                />
                <button
                  type='button'
                  onClick={() => setShowApiKey(!showApiKey)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600'
                >
                  {showApiKey ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                </button>
              </div>
              <p className='text-sm text-slate-500'>API key for controlling {door.name}</p>
            </div>
          ))}

          <div className='p-6 bg-slate-50 rounded-xl border border-slate-200'>
            <div className='flex items-center gap-3 mb-3'>
              <div
                className={`p-2 rounded-lg ${Object.values(doorApiKeys).some(key => key) ? 'bg-green-100' : 'bg-amber-100'}`}
              >
                {Object.values(doorApiKeys).some(key => key) ? (
                  <CheckCircle className='h-5 w-5 text-green-600' />
                ) : (
                  <AlertTriangle className='h-5 w-5 text-amber-600' />
                )}
              </div>
              <div>
                <h4 className='font-semibold text-slate-900'>Connection Status</h4>
                <p
                  className={`text-sm ${Object.values(doorApiKeys).some(key => key) ? 'text-green-600' : 'text-amber-600'}`}
                >
                  {Object.values(doorApiKeys).some(key => key)
                    ? 'API keys configured'
                    : 'API keys required'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Door Selection */}
      <Card className='bg-white shadow-sm border-slate-200'>
        <CardHeader className='pb-4'>
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-blue-100 rounded-xl'>
              <Building className='h-6 w-6 text-blue-600' />
            </div>
            <div>
              <CardTitle className='text-2xl text-slate-900'>Door Selection</CardTitle>
              <p className='text-slate-600 mt-1'>Choose which doors to control</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {mockDoors.map(door => (
              <div
                key={door.id}
                className='p-6 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors'
              >
                <div className='flex items-start justify-between mb-4'>
                  <div className='flex-1'>
                    <h4 className='font-semibold text-slate-900 mb-1'>{door.name}</h4>
                    <p className='text-sm text-slate-600 mb-2'>{door.location}</p>
                    <Badge
                      variant={door.status === 'online' ? 'default' : 'secondary'}
                      className={
                        door.status === 'online'
                          ? 'bg-green-100 text-green-800 hover:bg-green-100'
                          : 'bg-red-100 text-red-800 hover:bg-red-100'
                      }
                    >
                      <Activity className='h-3 w-3 mr-1' />
                      {door.status}
                    </Badge>
                  </div>
                  <Switch
                    checked={selectedDoors.includes(door.id)}
                    onCheckedChange={checked => {
                      if (checked) {
                        setSelectedDoors([...selectedDoors, door.id]);
                      } else {
                        setSelectedDoors(selectedDoors.filter(id => id !== door.id));
                      }
                    }}
                    className='data-[state=checked]:bg-red-600 data-[state=unchecked]:bg-slate-300'
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Membership Mapping */}
      <Card className='bg-white shadow-sm border-slate-200'>
        <CardHeader className='pb-4'>
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-green-100 rounded-xl'>
              <Users className='h-6 w-6 text-green-600' />
            </div>
            <div>
              <CardTitle className='text-2xl text-slate-900'>Membership Access Control</CardTitle>
              <p className='text-slate-600 mt-1'>Map doors to membership types</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          {mockMembershipTypes.map(membership => (
            <div key={membership.name} className='space-y-4'>
              <div className='flex items-center gap-3'>
                <Badge className={membership.color}>{membership.name} Members</Badge>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pl-4'>
                {mockDoors.map(door => (
                  <label
                    key={door.id}
                    className='flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer'
                  >
                    <Switch
                      checked={membershipMapping[membership.name]?.includes(door.id) || false}
                      onCheckedChange={checked => {
                        const current = membershipMapping[membership.name] || [];
                        if (checked) {
                          setMembershipMapping({
                            ...membershipMapping,
                            [membership.name]: [...current, door.id],
                          });
                        } else {
                          setMembershipMapping({
                            ...membershipMapping,
                            [membership.name]: current.filter(id => id !== door.id),
                          });
                        }
                      }}
                      className='data-[state=checked]:bg-red-600 data-[state=unchecked]:bg-slate-300'
                    />
                    <span className='text-sm font-medium text-slate-700'>{door.name}</span>
                  </label>
                ))}
              </div>
              <Separator />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Test Unlock */}
      <Card className='bg-white shadow-sm border-slate-200'>
        <CardHeader className='pb-4'>
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-amber-100 rounded-xl'>
              <AlertTriangle className='h-6 w-6 text-amber-600' />
            </div>
            <div>
              <CardTitle className='text-2xl text-slate-900'>Test Unlock</CardTitle>
              <p className='text-slate-600 mt-1'>Test door unlock functionality</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col sm:flex-row gap-4'>
            <select
              value={testDoor}
              onChange={e => setTestDoor(e.target.value)}
              className='flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-300 focus:ring-red-200 text-slate-900'
            >
              <option value=''>Select door to test</option>
              {mockDoors.map(door => (
                <option key={door.id} value={door.id}>
                  {door.name} - {door.location}
                </option>
              ))}
            </select>
            <Button disabled={!testDoor} className='bg-red-600 hover:bg-red-700 text-white px-8'>
              Test Unlock
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BusinessRulesSettings() {
  const [cancellationWindow, setCancellationWindow] = useState(24);
  const [lateFee, setLateFee] = useState(10);
  const [noShowFee, setNoShowFee] = useState(15);
  const [jurisdiction, setJurisdiction] = useState('US');
  const [operatingHours, setOperatingHours] = useState({
    monday: { open: '06:00', close: '22:00', closed: false },
    tuesday: { open: '06:00', close: '22:00', closed: false },
    wednesday: { open: '06:00', close: '22:00', closed: false },
    thursday: { open: '06:00', close: '22:00', closed: false },
    friday: { open: '06:00', close: '22:00', closed: false },
    saturday: { open: '08:00', close: '20:00', closed: false },
    sunday: { open: '08:00', close: '18:00', closed: false },
  });

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  return (
    <div className='space-y-8'>
      {/* Cancellation Policy */}
      <Card className='bg-white shadow-sm border-slate-200'>
        <CardHeader className='pb-4'>
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-amber-100 rounded-xl'>
              <Clock className='h-6 w-6 text-amber-600' />
            </div>
            <div>
              <CardTitle className='text-2xl text-slate-900'>Cancellation Policy</CardTitle>
              <p className='text-slate-600 mt-1'>Set cancellation rules and timing</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='space-y-3'>
            <label className='text-sm font-medium text-slate-700'>
              Cancellation Window (Hours)
            </label>
            <Input
              type='number'
              value={cancellationWindow}
              onChange={e => setCancellationWindow(Number.parseFloat(e.target.value) || 0)}
              className='bg-slate-50 border-slate-200 focus:border-red-300 focus:ring-red-200'
            />
            <p className='text-sm text-slate-500'>
              Classes must be cancelled at least {cancellationWindow} hours in advance
            </p>
          </div>

          <div className='p-6 bg-slate-50 rounded-xl border border-slate-200'>
            <div className='flex items-center gap-3 mb-3'>
              <Clock className='h-5 w-5 text-slate-600' />
              <h4 className='font-semibold text-slate-900'>Policy Summary</h4>
            </div>
            <p className='text-slate-600'>
              Members must cancel at least{' '}
              <span className='font-semibold text-slate-900'>{cancellationWindow} hours</span>{' '}
              before class starts to avoid fees
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Fee Configuration */}
      <Card className='bg-white shadow-sm border-slate-200'>
        <CardHeader className='pb-4'>
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-green-100 rounded-xl'>
              <DollarSign className='h-6 w-6 text-green-600' />
            </div>
            <div>
              <CardTitle className='text-2xl text-slate-900'>Fee Configuration</CardTitle>
              <p className='text-slate-600 mt-1'>Set pricing for cancellations and no-shows</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-3'>
              <label className='text-sm font-medium text-slate-700'>
                Late Cancellation Fee ($)
              </label>
              <Input
                type='number'
                value={lateFee}
                onChange={e => setLateFee(Number.parseFloat(e.target.value) || 0)}
                className='bg-slate-50 border-slate-200 focus:border-red-300 focus:ring-red-200'
              />
              <p className='text-sm text-slate-500'>Fee charged for late cancellations</p>
            </div>
            <div className='space-y-3'>
              <label className='text-sm font-medium text-slate-700'>No-Show Fee ($)</label>
              <Input
                type='number'
                value={noShowFee}
                onChange={e => setNoShowFee(Number.parseFloat(e.target.value) || 0)}
                className='bg-slate-50 border-slate-200 focus:border-red-300 focus:ring-red-200'
              />
              <p className='text-sm text-slate-500'>Fee charged for no-shows</p>
            </div>
          </div>

          <div className='p-6 bg-slate-50 rounded-xl border border-slate-200'>
            <h4 className='font-semibold text-slate-900 mb-4'>Fee Summary</h4>
            <div className='space-y-3'>
              <div className='flex justify-between items-center'>
                <span className='text-slate-600'>Late Cancellation:</span>
                <span className='font-semibold text-slate-900'>${lateFee.toFixed(2)}</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-slate-600'>No-Show Fee:</span>
                <span className='font-semibold text-slate-900'>${noShowFee.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operating Hours */}
      <Card className='bg-white shadow-sm border-slate-200'>
        <CardHeader className='pb-4'>
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-blue-100 rounded-xl'>
              <Clock className='h-6 w-6 text-blue-600' />
            </div>
            <div>
              <CardTitle className='text-2xl text-slate-900'>Operating Hours</CardTitle>
              <p className='text-slate-600 mt-1'>Define your gym&apos;s daily operating schedule</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          {days.map(day => (
            <div
              key={day.key}
              className='flex items-center gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200'
            >
              <div className='w-24'>
                <span className='font-medium text-slate-900'>{day.label}</span>
              </div>
              <div className='flex items-center gap-4'>
                <label className='flex items-center gap-2'>
                  <Switch
                    checked={operatingHours[day.key as keyof typeof operatingHours].closed}
                    onCheckedChange={checked =>
                      setOperatingHours({
                        ...operatingHours,
                        [day.key]: {
                          ...operatingHours[day.key as keyof typeof operatingHours],
                          closed: checked,
                        },
                      })
                    }
                    className='data-[state=checked]:bg-red-600 data-[state=unchecked]:bg-slate-300'
                  />
                  <span className='text-sm text-slate-600'>Closed</span>
                </label>
                {!operatingHours[day.key as keyof typeof operatingHours].closed && (
                  <>
                    <input
                      type='time'
                      value={operatingHours[day.key as keyof typeof operatingHours].open}
                      onChange={e =>
                        setOperatingHours({
                          ...operatingHours,
                          [day.key]: {
                            ...operatingHours[day.key as keyof typeof operatingHours],
                            open: e.target.value,
                          },
                        })
                      }
                      className='px-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-red-300 focus:ring-red-200 text-slate-900'
                    />
                    <span className='text-slate-600'>to</span>
                    <input
                      type='time'
                      value={operatingHours[day.key as keyof typeof operatingHours].close}
                      onChange={e =>
                        setOperatingHours({
                          ...operatingHours,
                          [day.key]: {
                            ...operatingHours[day.key as keyof typeof operatingHours],
                            close: e.target.value,
                          },
                        })
                      }
                      className='px-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-red-300 focus:ring-red-200 text-slate-900'
                    />
                  </>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Compliance Jurisdiction */}
      <Card className='bg-white shadow-sm border-slate-200'>
        <CardHeader className='pb-4'>
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-purple-100 rounded-xl'>
              <Globe className='h-6 w-6 text-purple-600' />
            </div>
            <div>
              <CardTitle className='text-2xl text-slate-900'>Compliance Jurisdiction</CardTitle>
              <p className='text-slate-600 mt-1'>Select your jurisdiction for compliance rules</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='space-y-3'>
            <label className='text-sm font-medium text-slate-700'>Jurisdiction</label>
            <select
              value={jurisdiction}
              onChange={e => setJurisdiction(e.target.value)}
              className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-300 focus:ring-red-200 text-slate-900'
            >
              <option value='US'>United States</option>
              <option value='CA'>Canada</option>
              <option value='UK'>United Kingdom</option>
              <option value='AU'>Australia</option>
              <option value='EU'>European Union</option>
            </select>
          </div>

          <div className='p-6 bg-slate-50 rounded-xl border border-slate-200'>
            <div className='flex items-center gap-3 mb-3'>
              <Shield className='h-5 w-5 text-slate-600' />
              <h4 className='font-semibold text-slate-900'>Compliance Impact</h4>
            </div>
            <p className='text-slate-600'>
              This affects cancellation policies, data handling, and fee structures
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PeopleSettings() {
  const [activeSection, setActiveSection] = useState<'users' | 'roles'>('users');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [showRoleEditor, setShowRoleEditor] = useState(false);
  const [showPermissionsMatrix, setShowPermissionsMatrix] = useState(false);
  const [staff, setStaff] = useState([
    {
      id: '1',
      name: 'John Smith',
      email: 'john@gym.com',
      phone: '+1 (555) 123-4567',
      role: 'Admin',
      status: 'accepted',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@gym.com',
      phone: '+1 (555) 234-5678',
      role: 'Trainer',
      status: 'pending',
    },
  ]);

  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Trainer',
  });

  const roles = ['Admin', 'Trainer', 'Desk (Employee)'];

  const addStaff = () => {
    if (newStaff.name && newStaff.email) {
      setStaff([
        ...staff,
        {
          ...newStaff,
          id: Date.now().toString(),
          status: 'pending',
        },
      ]);
      setNewStaff({
        name: '',
        email: '',
        phone: '',
        role: 'Trainer',
      });
    }
  };

  const handleAssignRole = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleEditRole = (role: any) => {
    setSelectedRole(role);
    setShowRoleEditor(true);
  };

  const handleManagePermissions = (role: any) => {
    setSelectedRole(role);
    setShowPermissionsMatrix(true);
  };

  const sections = [
    {
      id: 'users' as const,
      name: 'Team Members',
      icon: Users,
      description: 'Manage staff and user assignments',
    },
    {
      id: 'roles' as const,
      name: 'Roles & Permissions',
      icon: Shield,
      description: 'Configure roles and permission matrix',
    },
  ];

  return (
    <div className='space-y-8'>
      {/* Section Navigation */}
      <Card className='bg-white shadow-sm border-slate-200'>
        <CardContent className='p-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {sections.map(section => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`
                    relative p-4 rounded-xl text-left transition-all duration-200
                    ${
                      isActive
                        ? 'bg-red-50 border-2 border-red-200 shadow-sm'
                        : 'hover:bg-slate-50 border-2 border-transparent'
                    }
                  `}
                >
                  <div className='flex items-center gap-3'>
                    <div
                      className={`
                        p-2 rounded-lg transition-colors
                        ${isActive ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}
                      `}
                    >
                      <Icon className='h-5 w-5' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <h3
                        className={`
                          font-medium mb-1
                          ${isActive ? 'text-red-900' : 'text-slate-900'}
                        `}
                      >
                        {section.name}
                      </h3>
                      <p
                        className={`
                          text-sm
                          ${isActive ? 'text-red-700' : 'text-slate-600'}
                        `}
                      >
                        {section.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Section Content */}
      {activeSection === 'users' && (
        <div className='space-y-8'>
          {/* Add New Staff */}
          <Card className='bg-white shadow-sm border-slate-200'>
            <CardHeader className='pb-4'>
              <div className='flex items-center gap-4'>
                <div className='p-3 bg-red-100 rounded-xl'>
                  <UserPlus className='h-6 w-6 text-red-600' />
                </div>
                <div>
                  <CardTitle className='text-2xl text-slate-900'>Add Staff Member</CardTitle>
                  <p className='text-slate-600 mt-1'>Invite new team members to your gym</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-3'>
                  <label className='text-sm font-medium text-slate-700'>Full Name *</label>
                  <Input
                    value={newStaff.name}
                    onChange={e => setNewStaff({ ...newStaff, name: e.target.value })}
                    placeholder='Enter full name'
                    className='bg-slate-50 border-slate-200 focus:border-red-300 focus:ring-red-200'
                  />
                </div>
                <div className='space-y-3'>
                  <label className='text-sm font-medium text-slate-700'>Email Address *</label>
                  <Input
                    type='email'
                    value={newStaff.email}
                    onChange={e => setNewStaff({ ...newStaff, email: e.target.value })}
                    placeholder='Enter email address'
                    className='bg-slate-50 border-slate-200 focus:border-red-300 focus:ring-red-200'
                  />
                </div>
                <div className='space-y-3'>
                  <label className='text-sm font-medium text-slate-700'>Phone Number</label>
                  <Input
                    type='tel'
                    value={newStaff.phone}
                    onChange={e => setNewStaff({ ...newStaff, phone: e.target.value })}
                    placeholder='Enter phone number'
                    className='bg-slate-50 border-slate-200 focus:border-red-300 focus:ring-red-200'
                  />
                </div>
                <div className='space-y-3'>
                  <label className='text-sm font-medium text-slate-700'>Role</label>
                  <select
                    value={newStaff.role}
                    onChange={e => setNewStaff({ ...newStaff, role: e.target.value })}
                    className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-300 focus:ring-red-200 text-slate-900'
                  >
                    {roles.map(role => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                onClick={addStaff}
                disabled={!newStaff.name || !newStaff.email}
                className='bg-red-600 hover:bg-red-700 text-white gap-2'
              >
                <Plus className='h-4 w-4' />
                Add Staff Member
              </Button>
            </CardContent>
          </Card>

          {/* Current Staff */}
          <Card className='bg-white shadow-sm border-slate-200'>
            <CardHeader className='pb-4'>
              <div className='flex items-center gap-4'>
                <div className='p-3 bg-green-100 rounded-xl'>
                  <Users className='h-6 w-6 text-green-600' />
                </div>
                <div>
                  <CardTitle className='text-2xl text-slate-900'>Current Staff</CardTitle>
                  <p className='text-slate-600 mt-1'>Manage your team members and their permissions</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              {staff.map(member => (
                <div key={member.id} className='p-6 bg-slate-50 rounded-xl border border-slate-200'>
                  <div className='flex flex-col lg:flex-row lg:items-center gap-6'>
                    <div className='flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                      <div>
                        <h4 className='font-semibold text-slate-900 text-lg mb-1'>{member.name}</h4>
                        <Badge variant='outline' className='text-xs'>
                          {member.role}
                        </Badge>
                      </div>
                      <div className='space-y-1'>
                        <div className='flex items-center gap-2 text-sm text-slate-600'>
                          <Mail className='h-4 w-4' />
                          {member.email}
                        </div>
                        <div className='flex items-center gap-2 text-sm text-slate-600'>
                          <Phone className='h-4 w-4' />
                          {member.phone}
                        </div>
                      </div>
                      <div className='flex items-center gap-3'>
                        <Badge
                          variant={member.status === 'accepted' ? 'default' : 'secondary'}
                          className={
                            member.status === 'accepted'
                              ? 'bg-green-100 text-green-800 hover:bg-green-100'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                          }
                        >
                          {member.status}
                        </Badge>
                        {member.status === 'pending' && (
                          <Button variant='outline' size='sm' className='text-xs bg-transparent'>
                            Resend Invite
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button 
                        variant='outline' 
                        size='sm' 
                        className='gap-2'
                        onClick={() => handleAssignRole(member.id)}
                      >
                        <Shield className='h-4 w-4' />
                        Assign Role
                      </Button>
                      <Button variant='ghost' size='sm' className='gap-2'>
                        <Edit3 className='h-4 w-4' />
                        Edit
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='gap-2 text-red-600 hover:text-red-700'
                      >
                        <Trash2 className='h-4 w-4' />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* User Role Assignment Modal */}
          {selectedUserId && (
            <Card className='bg-white shadow-sm border-slate-200'>
              <CardHeader className='pb-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <div className='p-3 bg-blue-100 rounded-xl'>
                      <Shield className='h-6 w-6 text-blue-600' />
                    </div>
                    <div>
                      <CardTitle className='text-2xl text-slate-900'>Assign User Role</CardTitle>
                      <p className='text-slate-600 mt-1'>Manage role assignment for staff member</p>
                    </div>
                  </div>
                  <Button 
                    variant='ghost' 
                    size='sm' 
                    onClick={() => setSelectedUserId(null)}
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {selectedUserId && (
                  <UserRoleAssignment
                    userId={selectedUserId}
                    onRoleChanged={() => {
                      console.log('User role changed');
                      setSelectedUserId(null);
                    }}
                    onCancel={() => setSelectedUserId(null)}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeSection === 'roles' && (
        <div className='space-y-8'>
          {/* Role Management Actions */}
          <Card className='bg-white shadow-sm border-slate-200'>
            <CardHeader className='pb-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  <div className='p-3 bg-purple-100 rounded-xl'>
                    <Shield className='h-6 w-6 text-purple-600' />
                  </div>
                  <div>
                    <CardTitle className='text-2xl text-slate-900'>Role Management</CardTitle>
                    <p className='text-slate-600 mt-1'>Create and configure organizational roles</p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowRoleEditor(true)}
                  className='bg-red-600 hover:bg-red-700 text-white gap-2'
                >
                  <Plus className='h-4 w-4' />
                  Create Role
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <RolesList
                onCreateRole={() => setShowRoleEditor(true)}
                onEditRole={(role: Role) => {
                  setSelectedRole(role);
                  setShowRoleEditor(true);
                }}
                onManagePermissions={(role: Role) => {
                  setSelectedRole(role);
                  setShowPermissionsMatrix(true);
                }}
              />
            </CardContent>
          </Card>

          {/* Role Editor Modal */}
          {showRoleEditor && (
            <Card className='bg-white shadow-sm border-slate-200'>
              <CardHeader className='pb-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <div className='p-3 bg-blue-100 rounded-xl'>
                      <Edit3 className='h-6 w-6 text-blue-600' />
                    </div>
                    <div>
                      <CardTitle className='text-2xl text-slate-900'>
                        {selectedRole ? 'Edit Role' : 'Create New Role'}
                      </CardTitle>
                      <p className='text-slate-600 mt-1'>Configure role details and properties</p>
                    </div>
                  </div>
                  <Button 
                    variant='ghost' 
                    size='sm' 
                    onClick={() => {
                      setShowRoleEditor(false);
                      setSelectedRole(null);
                    }}
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <RoleEditor
                  role={selectedRole}
                  onSave={(role: Role) => {
                    console.log('Role saved:', role);
                    setShowRoleEditor(false);
                    setSelectedRole(null);
                  }}
                  onCancel={() => {
                    setShowRoleEditor(false);
                    setSelectedRole(null);
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* Permissions Matrix Modal */}
          {showPermissionsMatrix && selectedRole && (
            <Card className='bg-white shadow-sm border-slate-200'>
              <CardHeader className='pb-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <div className='p-3 bg-green-100 rounded-xl'>
                      <Settings className='h-6 w-6 text-green-600' />
                    </div>
                    <div>
                      <CardTitle className='text-2xl text-slate-900'>Manage Permissions</CardTitle>
                      <p className='text-slate-600 mt-1'>Configure role permissions matrix</p>
                    </div>
                  </div>
                  <Button 
                    variant='ghost' 
                    size='sm' 
                    onClick={() => {
                      setShowPermissionsMatrix(false);
                      setSelectedRole(null);
                    }}
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {selectedRole && (
                  <PermissionsMatrix
                    role={selectedRole}
                    onSave={() => {
                      console.log('Permissions saved');
                      setShowPermissionsMatrix(false);
                      setSelectedRole(null);
                    }}
                    onCancel={() => {
                      setShowPermissionsMatrix(false);
                      setSelectedRole(null);
                    }}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * LocationSettings Component - Organization and Location Management
 */
function LocationSettings() {
  // Use try-catch to handle authentication context gracefully
  let user = null;
  try {
    const authContext = useAuthenticatedUser();
    user = authContext.user;
  } catch (error) {
    console.warn('Authentication context not available:', error);
  }
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Organization form states
  const [orgFormData, setOrgFormData] = useState({
    name: '',
    domain: '',
    logo_url: '',
    settings: {}
  });

  // Location form states
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [locationFormData, setLocationFormData] = useState({
    name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
    phone: '',
    email: '',
    website: '',
    settings: {},
    timezone: 'UTC'
  });

  // Business settings form
  const [businessSettings, setBusinessSettings] = useState({
    business_hours: '9:00 AM - 9:00 PM',
    booking_window: '30',
    cancellation_policy: '24 hours',
    class_capacity: '25',
    trial_period: '7',
    membership_types: 'Monthly, Annual, Day Pass'
  });

  // Load organization data
  useEffect(() => {
    loadOrganizationData();
  }, []);

  const loadOrganizationData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get organization data - assuming user has one primary org
      const orgsData = await fetchOrganizations({ page: 1, limit: 1 });
      
      if (orgsData.organizations.length > 0) {
        const org = orgsData.organizations[0];
        setOrganization(org);
        
        // Set form data
        setOrgFormData({
          name: org.name || '',
          domain: org.domain || '',
          logo_url: org.logo_url || '',
          settings: org.settings || {}
        });

        // Load business settings from organization settings
        if (org.settings?.business) {
          setBusinessSettings({
            ...businessSettings,
            ...org.settings.business
          });
        }

        // Load locations for this organization
        const locationsData = await fetchOrganizationLocations(org.id);
        setLocations(locationsData?.locations || []);
      }
    } catch (err) {
      console.error('Failed to load organization data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load organization data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOrganization = async () => {
    if (!organization) return;
    
    try {
      setSaving(true);
      setError(null);

      await updateOrganization(organization.id, {
        name: orgFormData.name,
        domain: orgFormData.domain || undefined,
        logo_url: orgFormData.logo_url || undefined
      });

      // Update business settings separately
      await updateOrganizationSettings(organization.id, {
        ...organization.settings,
        business: businessSettings
      });

      await loadOrganizationData(); // Refresh data
    } catch (err) {
      console.error('Failed to save organization:', err);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to save organization';
      if (err instanceof Error) {
        if (err.message.includes('logo_url')) {
          errorMessage = 'Invalid logo URL format. Please enter a valid URL or leave it empty.';
        } else if (err.message.includes('Permission denied') || err.message.includes('403')) {
          errorMessage = 'Permission denied: You need organization update permissions. Please contact an administrator.';
        } else if (err.message.includes('Authentication required') || err.message.includes('401')) {
          errorMessage = 'Authentication required: Please sign in to manage organization settings.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleLocationSubmit = async () => {
    if (!organization) return;

    try {
      setSaving(true);
      setError(null);

      if (editingLocation) {
        // Update existing location
        await updateLocation(organization.id, editingLocation.id, locationFormData);
      } else {
        // Create new location
        await createLocation(organization.id, locationFormData);
      }

      // Reset form and refresh locations
      setShowLocationForm(false);
      setEditingLocation(null);
      setLocationFormData({
        name: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'US',
        phone: '',
        email: '',
        website: '',
        settings: {},
        timezone: 'UTC'
      });

      await loadOrganizationData(); // Refresh data
    } catch (err) {
      console.error('Failed to save location:', err);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to save location';
      if (err instanceof Error) {
        if (err.message.includes('Permission denied') || err.message.includes('403')) {
          errorMessage = 'Permission denied: You need organization update permissions to manage locations. Please contact an administrator.';
        } else if (err.message.includes('Authentication required') || err.message.includes('401')) {
          errorMessage = 'Authentication required: Please sign in to manage locations.';
        } else if (err.message.includes('Organization not found') || err.message.includes('404')) {
          errorMessage = 'Organization not found. Please refresh the page and try again.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
    setLocationFormData({
      name: location.name,
      address_line1: location.address_line1 || '',
      address_line2: location.address_line2 || '',
      city: location.city || '',
      state: location.state || '',
      postal_code: location.postal_code || '',
      country: location.country || 'US',
      phone: location.phone || '',
      email: location.email || '',
      website: location.website || '',
      settings: location.settings || {},
      timezone: location.timezone || 'UTC'
    });
    setShowLocationForm(true);
  };

  const handleDeleteLocation = async (locationId: string) => {
    if (!organization || !window.confirm('Are you sure you want to delete this location?')) return;

    try {
      setSaving(true);
      setError(null);

      await deleteLocation(organization.id, locationId);
      await loadOrganizationData(); // Refresh data
    } catch (err) {
      console.error('Failed to delete location:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete location');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-96'>
        <div className='flex items-center gap-3 text-slate-600'>
          <Loader2 className='h-6 w-6 animate-spin' />
          <span>Loading organization data...</span>
        </div>
      </div>
    );
  }

  if (error && !organization) {
    return (
      <div className='max-w-4xl mx-auto p-6'>
        <Card className='bg-red-50 border-red-200'>
          <CardContent className='p-6'>
            <div className='flex items-center gap-3 text-red-700'>
              <ExternalLink className='h-5 w-5' />
              <span className='font-medium'>Error loading organization data</span>
            </div>
            <p className='mt-2 text-red-600'>{error}</p>
            <Button 
              onClick={loadOrganizationData} 
              className='mt-4 bg-red-600 hover:bg-red-700'
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      {/* Error Message */}
      {error && (
        <Card className='bg-red-50 border-red-200'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2 text-red-700'>
              <ExternalLink className='h-4 w-4' />
              <span className='font-medium'>Error: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Organization Details */}
      <Card className='bg-white shadow-sm border-slate-200'>
        <CardHeader className='pb-4'>
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-blue-100 rounded-xl'>
              <MapPin className='h-6 w-6 text-blue-600' />
            </div>
            <div>
              <CardTitle className='text-2xl text-slate-900'>Organization Details</CardTitle>
              <p className='text-slate-600 mt-1'>Manage your organization information and branding</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-3'>
              <label className='text-sm font-medium text-slate-700'>Organization Name *</label>
              <input
                type='text'
                value={orgFormData.name}
                onChange={e => setOrgFormData({ ...orgFormData, name: e.target.value })}
                placeholder='Enter organization name'
                className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-300 focus:ring-red-200 text-slate-900'
              />
            </div>
            <div className='space-y-3'>
              <label className='text-sm font-medium text-slate-700'>Domain</label>
              <input
                type='text'
                value={orgFormData.domain}
                onChange={e => setOrgFormData({ ...orgFormData, domain: e.target.value })}
                placeholder='yourgym.com'
                className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-300 focus:ring-red-200 text-slate-900'
              />
            </div>
          </div>
          
          <div className='space-y-3'>
            <label className='text-sm font-medium text-slate-700'>Logo URL</label>
            <input
              type='url'
              value={orgFormData.logo_url}
              onChange={e => setOrgFormData({ ...orgFormData, logo_url: e.target.value })}
              placeholder='https://example.com/logo.png'
              className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-300 focus:ring-red-200 text-slate-900'
            />
          </div>

          <Button
            onClick={handleSaveOrganization}
            disabled={saving || !orgFormData.name}
            className='bg-red-600 hover:bg-red-700 text-white gap-2'
          >
            {saving ? <Loader2 className='h-4 w-4 animate-spin' /> : <Save className='h-4 w-4' />}
            Save Organization
          </Button>
        </CardContent>
      </Card>

      {/* Business Settings */}
      <Card className='bg-white shadow-sm border-slate-200'>
        <CardHeader className='pb-4'>
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-purple-100 rounded-xl'>
              <Settings className='h-6 w-6 text-purple-600' />
            </div>
            <div>
              <CardTitle className='text-2xl text-slate-900'>Business Settings</CardTitle>
              <p className='text-slate-600 mt-1'>Configure your business operations and policies</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-3'>
              <label className='text-sm font-medium text-slate-700'>Business Hours</label>
              <input
                type='text'
                value={businessSettings.business_hours}
                onChange={e => setBusinessSettings({ ...businessSettings, business_hours: e.target.value })}
                placeholder='9:00 AM - 9:00 PM'
                className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-300 focus:ring-red-200 text-slate-900'
              />
            </div>
            <div className='space-y-3'>
              <label className='text-sm font-medium text-slate-700'>Booking Window (days)</label>
              <input
                type='text'
                value={businessSettings.booking_window}
                onChange={e => setBusinessSettings({ ...businessSettings, booking_window: e.target.value })}
                placeholder='30'
                className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-300 focus:ring-red-200 text-slate-900'
              />
            </div>
            <div className='space-y-3'>
              <label className='text-sm font-medium text-slate-700'>Cancellation Policy</label>
              <input
                type='text'
                value={businessSettings.cancellation_policy}
                onChange={e => setBusinessSettings({ ...businessSettings, cancellation_policy: e.target.value })}
                placeholder='24 hours'
                className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-300 focus:ring-red-200 text-slate-900'
              />
            </div>
            <div className='space-y-3'>
              <label className='text-sm font-medium text-slate-700'>Default Class Capacity</label>
              <input
                type='text'
                value={businessSettings.class_capacity}
                onChange={e => setBusinessSettings({ ...businessSettings, class_capacity: e.target.value })}
                placeholder='25'
                className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-300 focus:ring-red-200 text-slate-900'
              />
            </div>
            <div className='space-y-3'>
              <label className='text-sm font-medium text-slate-700'>Trial Period (days)</label>
              <input
                type='text'
                value={businessSettings.trial_period}
                onChange={e => setBusinessSettings({ ...businessSettings, trial_period: e.target.value })}
                placeholder='7'
                className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-300 focus:ring-red-200 text-slate-900'
              />
            </div>
            <div className='space-y-3'>
              <label className='text-sm font-medium text-slate-700'>Membership Types</label>
              <input
                type='text'
                value={businessSettings.membership_types}
                onChange={e => setBusinessSettings({ ...businessSettings, membership_types: e.target.value })}
                placeholder='Monthly, Annual, Day Pass'
                className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-300 focus:ring-red-200 text-slate-900'
              />
            </div>
          </div>

          <Button
            onClick={handleSaveOrganization}
            disabled={saving}
            className='bg-red-600 hover:bg-red-700 text-white gap-2'
          >
            {saving ? <Loader2 className='h-4 w-4 animate-spin' /> : <Save className='h-4 w-4' />}
            Save Business Settings
          </Button>
        </CardContent>
      </Card>

      {/* Locations Management */}
      <Card className='bg-white shadow-sm border-slate-200'>
        <CardHeader className='pb-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='p-3 bg-green-100 rounded-xl'>
                <MapPin className='h-6 w-6 text-green-600' />
              </div>
              <div>
                <CardTitle className='text-2xl text-slate-900'>Locations</CardTitle>
                <p className='text-slate-600 mt-1'>Manage your gym locations and facilities</p>
              </div>
            </div>
            <Button
              onClick={() => setShowLocationForm(true)}
              className='bg-red-600 hover:bg-red-700 text-white gap-2'
            >
              <Plus className='h-4 w-4' />
              Add Location
            </Button>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Location Form */}
          {showLocationForm && (
            <Card className='bg-slate-50 border-slate-200'>
              <CardHeader className='pb-4'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-lg'>
                    {editingLocation ? 'Edit Location' : 'Add New Location'}
                  </CardTitle>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      setShowLocationForm(false);
                      setEditingLocation(null);
                    }}
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <label className='text-sm font-medium text-slate-700'>Location Name *</label>
                    <input
                      type='text'
                      value={locationFormData.name}
                      onChange={e => setLocationFormData({ ...locationFormData, name: e.target.value })}
                      placeholder='Downtown Gym'
                      className='w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-red-300 focus:ring-red-200'
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='text-sm font-medium text-slate-700'>Phone</label>
                    <input
                      type='tel'
                      value={locationFormData.phone}
                      onChange={e => setLocationFormData({ ...locationFormData, phone: e.target.value })}
                      placeholder='(555) 123-4567'
                      className='w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-red-300 focus:ring-red-200'
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='text-sm font-medium text-slate-700'>Address Line 1</label>
                    <input
                      type='text'
                      value={locationFormData.address_line1}
                      onChange={e => setLocationFormData({ ...locationFormData, address_line1: e.target.value })}
                      placeholder='123 Main Street'
                      className='w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-red-300 focus:ring-red-200'
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='text-sm font-medium text-slate-700'>Address Line 2</label>
                    <input
                      type='text'
                      value={locationFormData.address_line2}
                      onChange={e => setLocationFormData({ ...locationFormData, address_line2: e.target.value })}
                      placeholder='Suite 100'
                      className='w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-red-300 focus:ring-red-200'
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='text-sm font-medium text-slate-700'>City</label>
                    <input
                      type='text'
                      value={locationFormData.city}
                      onChange={e => setLocationFormData({ ...locationFormData, city: e.target.value })}
                      placeholder='New York'
                      className='w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-red-300 focus:ring-red-200'
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='text-sm font-medium text-slate-700'>State</label>
                    <input
                      type='text'
                      value={locationFormData.state}
                      onChange={e => setLocationFormData({ ...locationFormData, state: e.target.value })}
                      placeholder='NY'
                      className='w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-red-300 focus:ring-red-200'
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='text-sm font-medium text-slate-700'>Email</label>
                    <input
                      type='email'
                      value={locationFormData.email}
                      onChange={e => setLocationFormData({ ...locationFormData, email: e.target.value })}
                      placeholder='location@gym.com'
                      className='w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-red-300 focus:ring-red-200'
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='text-sm font-medium text-slate-700'>Website</label>
                    <input
                      type='url'
                      value={locationFormData.website}
                      onChange={e => setLocationFormData({ ...locationFormData, website: e.target.value })}
                      placeholder='https://location.gym.com'
                      className='w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-red-300 focus:ring-red-200'
                    />
                  </div>
                </div>

                <div className='flex gap-3'>
                  <Button
                    onClick={handleLocationSubmit}
                    disabled={saving || !locationFormData.name}
                    className='bg-red-600 hover:bg-red-700 text-white gap-2'
                  >
                    {saving ? <Loader2 className='h-4 w-4 animate-spin' /> : <Save className='h-4 w-4' />}
                    {editingLocation ? 'Update Location' : 'Add Location'}
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setShowLocationForm(false);
                      setEditingLocation(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Locations List */}
          {!locations || locations.length === 0 ? (
            <div className='text-center py-8 text-slate-500'>
              <MapPin className='h-12 w-12 mx-auto mb-4 opacity-50' />
              <p>No locations configured yet. Add your first location to get started.</p>
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-4'>
              {locations?.map(location => (
                <div key={location.id} className='p-6 bg-slate-50 rounded-xl border border-slate-200'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <h4 className='font-semibold text-slate-900 mb-2'>{location.name}</h4>
                      <div className='space-y-1 text-sm text-slate-600'>
                        {location.address_line1 && (
                          <p>{location.address_line1}{location.address_line2 && `, ${location.address_line2}`}</p>
                        )}
                        {(location.city || location.state) && (
                          <p>{location.city}{location.state && `, ${location.state}`} {location.postal_code}</p>
                        )}
                        {location.phone && <p>Phone: {location.phone}</p>}
                        {location.email && <p>Email: {location.email}</p>}
                        {location.website && (
                          <p>Website: <ExternalLink className='inline h-3 w-3' /> 
                            <a href={location.website} target='_blank' rel='noopener noreferrer' 
                               className='text-blue-600 hover:underline ml-1'>
                              {location.website}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className='flex gap-2 ml-4'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleEditLocation(location)}
                        className='gap-2 text-blue-600 hover:text-blue-700'
                      >
                        <Edit3 className='h-4 w-4' />
                        Edit
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleDeleteLocation(location.id)}
                        className='gap-2 text-red-600 hover:text-red-700'
                      >
                        <Trash2 className='h-4 w-4' />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
