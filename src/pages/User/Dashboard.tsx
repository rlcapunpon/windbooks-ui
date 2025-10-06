import { useAuth } from '../../contexts/AuthContextTypes';
import { UserService } from '../../services/userService';
import { useState, useEffect } from 'react';

const Dashboard = () => {
  const { user } = useAuth();

  // Admin status state for SUPERADMIN users
  const [adminStatus, setAdminStatus] = useState<{
    totalUsers: number;
    totalResources: number;
    activeUsers: number;
    activeResources: number;
    inactiveUsers: number;
    inactiveResources: number;
    deletedUsers: number;
    deletedResources: number;
    totalRoles: number;
  } | null>(null);
  const [adminStatusLoading, setAdminStatusLoading] = useState(false);

  // Fetch admin status for SUPERADMIN users
  useEffect(() => {
    const fetchAdminStatus = async () => {
      if (UserService.isSuperAdmin()) {
        setAdminStatusLoading(true);

        try {
          const data = await UserService.getAdminStatus();
          setAdminStatus(data);
        } catch (error) {
          console.error('Error fetching admin status:', error);
        } finally {
          setAdminStatusLoading(false);
        }
      }
    };

    fetchAdminStatus();
  }, []);

  // Get user roles from the new structure
  const userRoles = user?.resources?.map((resource: { role: string }) => resource.role) || [];
  const primaryRole = userRoles[0] || 'viewer'; // Default to viewer if no roles

  // Function to get proper role display name
  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'SUPERADMIN': 'Super Administrator',
      'APPROVER': 'Approver',
      'STAFF': 'Staff',
      'CLIENT': 'Client',
      'super_admin': 'Super Administrator',
      'admin': 'Administrator',
      'approver': 'Approver',
      'staff': 'Staff',
      'client': 'Client',
      'manager': 'Manager',
      'editor': 'Editor',
      'viewer': 'Viewer'
    };
    return roleMap[role.toLowerCase()] || role;
  };

  // Function to get role level based on permission mappings
  const getRoleLevel = () => {
    if (UserService.isSuperAdmin()) return 1; // Super Admin - Full access

    // Check for APPROVER role
    if (user?.resources?.some(resource => resource.role?.toUpperCase() === 'APPROVER')) return 2; // Approver level

    // Check for STAFF role
    if (user?.resources?.some(resource => resource.role?.toUpperCase() === 'STAFF')) return 3; // Staff level

    // Check for CLIENT role
    if (user?.resources?.some(resource => resource.role?.toUpperCase() === 'CLIENT')) return 4; // Client level

    return 5; // Basic user level
  };

  // Get assigned organizations from user resources
  const getAssignedOrganizations = (): { resourceId: string; resourceName: string }[] => {
    if (!user?.resources) return [];

    // Extract organization IDs and names from user resources
    // For non-SUPERADMIN users, exclude WINDBOOKS_APP from organization count
    return user.resources
      .filter(resource => resource.resourceId !== null && resource.resourceName != null)
      .filter(resource => resource.resourceName !== 'WINDBOOKS_APP')
      .map(resource => ({
        resourceId: resource.resourceId!,
        resourceName: resource.resourceName!
      }));
  };



  const roleLevel = getRoleLevel();
  const assignedOrganizations = getAssignedOrganizations();

  // Show loading if no user data yet
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Role Level 1: Super Admin / Admin Layout
  if (roleLevel === 1) {
    return (
      <div className="min-h-screen bg-background-light-primary text-text-light-primary">
        <nav className="bg-background-light-surface/95 backdrop-blur-md p-4 border-b border-gray-200">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-text-light-primary">Windbooks UI</h1>
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                {UserService.isSuperAdmin() ? 'Super Admin' : 'Administrator'}
              </span>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-heading">Super Admin Dashboard</h1>
            <p className="text-body">
              Full system access and management capabilities with tax configuration
            </p>
          </div>

          {/* Organization Overview */}
          <div className="card p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Organization Access</h3>
            <p className="text-gray-600 mb-4">You have full access to all organizations and resources</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignedOrganizations.map((org) => (
                <div key={org.resourceId} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800">{org.resourceName}</h4>
                  <p className="text-sm text-primary-dark">Full Access</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats - Real admin statistics for SUPERADMIN */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Users</h3>
              <p className="text-3xl font-bold text-gray-400">
                {adminStatusLoading ? '...' : adminStatus?.totalUsers ?? '--'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {adminStatus ? `${adminStatus.activeUsers} active, ${adminStatus.inactiveUsers} inactive` : 'Data will be loaded from API'}
              </p>
            </div>
            <div className="card p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Resources</h3>
              <p className="text-3xl font-bold text-gray-400">
                {adminStatusLoading ? '...' : adminStatus?.totalResources ?? '--'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {adminStatus ? `${adminStatus.activeResources} active, ${adminStatus.inactiveResources} inactive` : 'Data will be loaded from API'}
              </p>
            </div>
            <div className="card p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Roles</h3>
              <p className="text-3xl font-bold text-gray-400">
                {adminStatusLoading ? '...' : adminStatus?.totalRoles ?? '--'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                all active
              </p>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(UserService.hasPermission('USER.READ') || UserService.hasPermission('*')) && (
              <div className="card p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">User Management</h3>
                <p className="text-gray-600 mb-4">Create, edit, and manage all user accounts</p>
                <button className="btn-primary w-full">Manage Users</button>
              </div>
            )}

            {(UserService.hasPermission('SETTINGS.MANAGE') || UserService.hasPermission('*')) && (
              <div className="card p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">System Settings</h3>
                <p className="text-gray-600 mb-4">Configure system-wide settings and preferences</p>
                <button className="btn-primary w-full">System Config</button>
              </div>
            )}

            {(UserService.hasPermission('REPORTS.EXPORT') || UserService.hasPermission('*')) && (
              <div className="card p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Reports & Analytics</h3>
                <p className="text-gray-600 mb-4">View comprehensive system reports and analytics</p>
                <button className="btn-primary w-full">View Reports</button>
              </div>
            )}

            {/* Tax Configuration - Super Admin Only */}
            <div className="card p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Tax Configuration</h3>
              <p className="text-gray-600 mb-4">Configure tax settings and fiscal year management</p>
              <button className="btn-primary w-full">Tax Settings</button>
            </div>
          </div>

          {/* Super Admin Only Features */}
          {UserService.isSuperAdmin() && (
            <div className="mt-8 card p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">System Administration</h3>
              <p className="text-gray-600 mb-4">Full system control and administration capabilities</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-2">Security</h4>
                  <p className="text-sm text-red-700">Manage authentication, permissions, and security policies</p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">System Health</h4>
                  <p className="text-sm text-blue-700">Monitor system performance and health metrics</p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Audit Logs</h4>
                  <p className="text-sm text-green-700">Review system activity and audit trails</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-sm text-text-light-disabled">
              Logged in as: {user?.email} • Role: {UserService.isSuperAdmin() ? 'Super Admin' : getRoleDisplayName(primaryRole)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Role Level 2: Manager Layout
  if (roleLevel === 2) {
    return (
      <div className="min-h-screen bg-background-light-primary text-text-light-primary">
        <nav className="bg-background-light-surface/95 backdrop-blur-md p-4 border-b border-gray-200">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-text-light-primary">Windbooks UI</h1>
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">
                Manager
              </span>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-heading">Approver Dashboard</h1>
            <p className="text-body">Organization oversight and approval management</p>
          </div>

          {/* Organization Access */}
          <div className="card p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Organization Access</h3>
            <p className="text-gray-600 mb-4">You have approval access to organizations</p>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-800">{assignedOrganizations.length}</p>
              <p className="text-gray-600">Organization{assignedOrganizations.length !== 1 ? 's' : ''} with approval access</p>
            </div>
          </div>

          {/* Quick Stats - Placeholder for real metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Pending Approvals</h3>
              <p className="text-3xl font-bold text-gray-400">--</p>
              <p className="text-sm text-gray-500 mt-1">Data will be loaded from API</p>
            </div>
            <div className="card p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Approved This Month</h3>
              <p className="text-3xl font-bold text-gray-400">--</p>
              <p className="text-sm text-gray-500 mt-1">Data will be loaded from API</p>
            </div>
            <div className="card p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Organization Reports</h3>
              <p className="text-3xl font-bold text-gray-400">--</p>
              <p className="text-sm text-gray-500 mt-1">Data will be loaded from API</p>
            </div>
          </div>

          {/* Approver Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Review Requests</h3>
              <p className="text-gray-600 mb-4">Review and approve organization requests and workflows</p>
              <button className="btn-primary w-full">Review Pending</button>
            </div>

            <div className="card p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Organization Reports</h3>
              <p className="text-gray-600 mb-4">View reports from assigned organizations</p>
              <button className="btn-primary w-full">View Reports</button>
            </div>
          </div>

          {/* Recent Activity - Placeholder */}
          <div className="mt-8 card p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Team Activity</h3>
            <p className="text-gray-500 text-center py-8">Activity data will be loaded from API</p>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-text-light-disabled">
              Logged in as: {user?.email} • Role: {getRoleDisplayName(primaryRole)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Role Level 3: Staff Layout
  if (roleLevel === 3) {
    return (
      <div className="min-h-screen bg-background-light-primary text-text-light-primary">
        <nav className="bg-background-light-surface/95 backdrop-blur-md p-4 border-b border-gray-200">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-text-light-primary">Windbooks UI</h1>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                Staff
              </span>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-heading">Staff Dashboard</h1>
            <p className="text-body">Operational access to assigned organizations</p>
          </div>

          {/* Organization Access */}
          <div className="card p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Organization Access</h3>
            <p className="text-gray-600 mb-4">You have operational access to organizations</p>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-800">{assignedOrganizations.length}</p>
              <p className="text-gray-600">Organization{assignedOrganizations.length !== 1 ? 's' : ''} with operational access</p>
            </div>
          </div>

          {/* Quick Stats - Placeholder for real metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="card p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">My Tasks</h3>
              <p className="text-3xl font-bold text-gray-400">--</p>
              <p className="text-sm text-gray-500 mt-1">Data will be loaded from API</p>
            </div>
            <div className="card p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Reports Generated</h3>
              <p className="text-3xl font-bold text-gray-400">--</p>
              <p className="text-sm text-gray-500 mt-1">Data will be loaded from API</p>
            </div>
          </div>

          {/* Staff Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="card p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">User Directory</h3>
              <p className="text-gray-600 mb-4">View team member information and contact details</p>
              <button className="btn-primary w-full">View Directory</button>
            </div>

            {(UserService.hasPermission('REPORTS.EXPORT') || UserService.hasPermission('*')) && (
              <div className="card p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Generate Reports</h3>
                <p className="text-gray-600 mb-4">Create and export operational reports</p>
                <button className="btn-primary w-full">Export Reports</button>
              </div>
            )}
          </div>

          {/* Current Tasks - Placeholder */}
          <div className="card p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">My Current Tasks</h3>
            <p className="text-gray-500 text-center py-8">Task data will be loaded from API</p>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-text-light-disabled">
              Logged in as: {user?.email} • Role: {getRoleDisplayName(primaryRole)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Role Level 4: Basic User Layout (Default)
  return (
    <div className="min-h-screen bg-background-light-primary text-text-light-primary">
      <nav className="bg-background-light-surface/95 backdrop-blur-md p-4 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-text-light-primary">Windbooks UI</h1>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
              User
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-heading">Client Dashboard</h1>
          <p className="text-body">Limited access to assigned organizations and resources</p>
        </div>

        {/* Organization Access */}
        <div className="card p-8 rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome back, {user?.details?.nickName || user?.email?.split('@')[0] || 'Client'}!</h2>
            <p className="text-gray-600">You have limited access to organizations</p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-gray-800">{assignedOrganizations.length}</p>
            <p className="text-gray-600">Organization{assignedOrganizations.length !== 1 ? 's' : ''} with limited access</p>
          </div>
        </div>

        {/* Client Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="card p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">View Resources</h3>
            </div>
            <p className="text-gray-600 mb-4">Access assigned organization resources</p>
            <button className="btn-primary w-full">View Resources</button>
          </div>

          <div className="card p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Profile</h3>
            </div>
            <p className="text-gray-600 mb-4">View and update your personal information</p>
            <button className="btn-primary w-full">View Profile</button>
          </div>

          <div className="card p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Help & Support</h3>
            </div>
            <p className="text-gray-600 mb-4">Get help and support for using the system</p>
            <button className="btn-primary w-full">Get Help</button>
          </div>
        </div>

        {/* Account Info */}
        <div className="card p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{user?.email || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Role</label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{UserService.isSuperAdmin() ? 'Super Admin' : getRoleDisplayName(primaryRole)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Login</label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">Today</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-text-light-disabled">
            Logged in as: {user?.email} • Role: {UserService.isSuperAdmin() ? 'Super Admin' : getRoleDisplayName(primaryRole)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;