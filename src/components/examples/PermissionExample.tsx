'use client'

import { usePermission, usePermissions, ProtectedComponent, RequireAnyPermission } from '@/lib/auth-permissions';
import { PERMISSIONS } from '@/lib/permissions';
import { useAuth } from '@/lib/auth-context';

// Example component showing how to use the permission system
export function PermissionExampleComponent() {
  const { user } = useAuth();
  
  // Check single permission
  const canManageStaff = usePermission(PERMISSIONS.MANAGE_STAFF);
  const canViewFinancials = usePermission(PERMISSIONS.VIEW_FINANCIALS);
  
  // Check multiple permissions (ALL required)
  const canFullyManageGym = usePermissions([
    PERMISSIONS.MANAGE_GYM_SETTINGS,
    PERMISSIONS.MANAGE_STAFF,
    PERMISSIONS.MANAGE_FINANCIALS,
  ]);
  
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">Permission Examples</h2>
      
      {/* Example 1: Conditional rendering based on permission */}
      {canManageStaff && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold">Staff Management</h3>
          <p>You can manage staff members</p>
          <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">
            Invite Staff
          </button>
        </div>
      )}
      
      {/* Example 2: Using ProtectedComponent wrapper */}
      <ProtectedComponent 
        permission={PERMISSIONS.VIEW_FINANCIALS}
        fallback={
          <div className="p-4 bg-gray-50 rounded-lg text-gray-500">
            <p>You don't have permission to view financial data</p>
          </div>
        }
      >
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold">Financial Overview</h3>
          <p>Revenue this month: $45,000</p>
          <button className="mt-2 px-4 py-2 bg-green-600 text-white rounded">
            View Detailed Report
          </button>
        </div>
      </ProtectedComponent>
      
      {/* Example 3: Using RequireAnyPermission for flexible access */}
      <RequireAnyPermission
        permissions={[
          PERMISSIONS.MANAGE_CLASSES,
          PERMISSIONS.VIEW_CLASSES,
        ]}
      >
        <div className="p-4 bg-purple-50 rounded-lg">
          <h3 className="font-semibold">Class Management</h3>
          <p>View and manage gym classes</p>
          
          {/* Nested permission check for edit capability */}
          <ProtectedComponent permission={PERMISSIONS.MANAGE_CLASSES}>
            <button className="mt-2 px-4 py-2 bg-purple-600 text-white rounded">
              Create New Class
            </button>
          </ProtectedComponent>
        </div>
      </RequireAnyPermission>
      
      {/* Example 4: Role-based UI customization */}
      <div className="p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold">Welcome, {user?.full_name || 'User'}</h3>
        <p>Your role: <span className="font-medium capitalize">{user?.role}</span></p>
        
        {user?.role === 'owner' && (
          <p className="text-sm text-yellow-800 mt-2">
            As an owner, you have full access to all features
          </p>
        )}
        
        {user?.role === 'manager' && (
          <p className="text-sm text-yellow-800 mt-2">
            As a manager, you can manage classes and view reports
          </p>
        )}
        
        {user?.role === 'trainer' && (
          <p className="text-sm text-yellow-800 mt-2">
            As a trainer, you can manage your classes and track client performance
          </p>
        )}
      </div>
      
      {/* Example 5: Permission-based navigation menu */}
      <nav className="p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-4">Navigation</h3>
        <ul className="space-y-2">
          <li>
            <a href="/" className="text-blue-600 hover:underline">Dashboard</a>
          </li>
          
          <ProtectedComponent permission={PERMISSIONS.VIEW_STAFF}>
            <li>
              <a href="/people/staff" className="text-blue-600 hover:underline">Staff</a>
            </li>
          </ProtectedComponent>
          
          <ProtectedComponent permission={PERMISSIONS.VIEW_FINANCIALS}>
            <li>
              <a href="/financial" className="text-blue-600 hover:underline">Financials</a>
            </li>
          </ProtectedComponent>
          
          <ProtectedComponent permission={PERMISSIONS.VIEW_ANALYTICS}>
            <li>
              <a href="/analytics" className="text-blue-600 hover:underline">Analytics</a>
            </li>
          </ProtectedComponent>
          
          <ProtectedComponent permission={PERMISSIONS.MANAGE_GYM_SETTINGS}>
            <li>
              <a href="/settings" className="text-blue-600 hover:underline">Settings</a>
            </li>
          </ProtectedComponent>
        </ul>
      </nav>
    </div>
  );
}

// Example of protecting an entire page component
export function ProtectedPageExample() {
  const canAccessPage = usePermission(PERMISSIONS.VIEW_ANALYTICS);
  
  if (!canAccessPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to view this page.</p>
          <a href="/" className="mt-4 inline-block text-blue-600 hover:underline">
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
      {/* Page content here */}
    </div>
  );
}