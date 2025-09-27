import { useAuth } from '../../contexts/AuthContextTypes';
import { UserService } from '../../services/userService';

const Dashboard = () => {
  const { user } = useAuth();

  // Get user roles from the new structure
  const userRoles = user?.resources?.map((resource: { role: string }) => resource.role) || [];
  const primaryRole = userRoles[0] || 'viewer'; // Default to viewer if no roles

  // Function to get proper role display name
  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'STAFF': 'Staff',
      'MANAGER': 'Manager',
      'ADMIN': 'Administrator',
      'SUPER_ADMIN': 'Super Administrator',
      'viewer': 'Viewer',
      'admin': 'Administrator',
      'manager': 'Manager',
      'editor': 'Editor'
    };
    return roleMap[role.toUpperCase()] || role;
  };

  // Function to get role level (1-4) for layout switching
  const getRoleLevel = () => {
    if (UserService.isSuperAdmin()) return 1; // Super Admin
    if (primaryRole.toLowerCase().includes('admin') || primaryRole.toLowerCase() === 'super_admin') return 1; // Admin level
    if (primaryRole.toLowerCase().includes('manager')) return 2; // Manager level
    if (primaryRole.toLowerCase().includes('staff') || primaryRole.toLowerCase().includes('editor')) return 3; // Staff level
    return 4; // Basic user level
  };

  const roleLevel = getRoleLevel();

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
            <h1 className="text-3xl font-bold mb-2">{UserService.isSuperAdmin() ? 'Super Admin' : 'Administrator'} Dashboard</h1>
            <p className="text-text-light-secondary">
              {UserService.isSuperAdmin() ? 'Full system access and management capabilities' : 'System administration and user management'}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-blue-600">1,247</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Active Sessions</h3>
              <p className="text-3xl font-bold text-green-600">89</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">System Health</h3>
              <p className="text-3xl font-bold text-green-600">98%</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Revenue</h3>
              <p className="text-3xl font-bold text-purple-600">$45,231</p>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(UserService.hasPermission('USER.READ') || UserService.hasPermission('*')) && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">User Management</h3>
                <p className="text-gray-600 mb-4">Create, edit, and manage all user accounts</p>
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  Manage Users
                </button>
              </div>
            )}

            {(UserService.hasPermission('SETTINGS.MANAGE') || UserService.hasPermission('*')) && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">System Settings</h3>
                <p className="text-gray-600 mb-4">Configure system-wide settings and preferences</p>
                <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                  System Config
                </button>
              </div>
            )}

            {(UserService.hasPermission('REPORTS.EXPORT') || UserService.hasPermission('*')) && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Reports & Analytics</h3>
                <p className="text-gray-600 mb-4">View comprehensive system reports and analytics</p>
                <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                  View Reports
                </button>
              </div>
            )}
          </div>

          {/* Super Admin Only Features */}
          {UserService.isSuperAdmin() && (
            <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
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
            <h1 className="text-3xl font-bold mb-2">Manager Dashboard</h1>
            <p className="text-text-light-secondary">Team management and operational oversight</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Team Members</h3>
              <p className="text-3xl font-bold text-blue-600">24</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Active Projects</h3>
              <p className="text-3xl font-bold text-green-600">8</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Pending Tasks</h3>
              <p className="text-3xl font-bold text-orange-600">12</p>
            </div>
          </div>

          {/* Manager Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(UserService.hasPermission('USER.READ') || UserService.hasPermission('*')) && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">User Management</h3>
                <p className="text-gray-600 mb-4">Create and manage team member accounts</p>
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  Manage Team
                </button>
              </div>
            )}

            {(UserService.hasPermission('SETTINGS.MANAGE') || UserService.hasPermission('*')) && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">System Settings</h3>
                <p className="text-gray-600 mb-4">Configure team and operational settings</p>
                <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                  Settings
                </button>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Team Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-800">New user account created</p>
                  <p className="text-sm text-gray-600">john.doe@company.com</p>
                </div>
                <span className="text-sm text-gray-500">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-800">Settings updated</p>
                  <p className="text-sm text-gray-600">Team notification preferences</p>
                </div>
                <span className="text-sm text-gray-500">4 hours ago</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-gray-800">User role changed</p>
                  <p className="text-sm text-gray-600">sarah.accountant promoted to Manager</p>
                </div>
                <span className="text-sm text-gray-500">1 day ago</span>
              </div>
            </div>
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
            <h1 className="text-3xl font-bold mb-2">Staff Dashboard</h1>
            <p className="text-text-light-secondary">Daily operations and reporting access</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">My Tasks</h3>
              <p className="text-3xl font-bold text-blue-600">7</p>
              <p className="text-sm text-gray-600 mt-1">3 completed today</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Reports Generated</h3>
              <p className="text-3xl font-bold text-green-600">12</p>
              <p className="text-sm text-gray-600 mt-1">This month</p>
            </div>
          </div>

          {/* Staff Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">User Directory</h3>
              <p className="text-gray-600 mb-4">View team member information and contact details</p>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                View Directory
              </button>
            </div>

            {(UserService.hasPermission('REPORTS.EXPORT') || UserService.hasPermission('*')) && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Generate Reports</h3>
                <p className="text-gray-600 mb-4">Create and export operational reports</p>
                <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                  Export Reports
                </button>
              </div>
            )}
          </div>

          {/* Current Tasks */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">My Current Tasks</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <div>
                    <p className="font-medium text-gray-800">Review monthly expense reports</p>
                    <p className="text-sm text-gray-600">Due: Today, 5:00 PM</p>
                  </div>
                </div>
                <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">High Priority</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <div>
                    <p className="font-medium text-gray-800">Update client contact information</p>
                    <p className="text-sm text-gray-600">Due: Tomorrow</p>
                  </div>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Medium</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <div>
                    <p className="font-medium text-gray-800">Generate quarterly summary</p>
                    <p className="text-sm text-gray-600">Due: Friday</p>
                  </div>
                </div>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Low</span>
              </div>
            </div>
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
          <h1 className="text-3xl font-bold mb-2">User Dashboard</h1>
          <p className="text-text-light-secondary">Access your account information and basic features</p>
        </div>

        {/* Welcome Section */}
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome back, {user?.details?.nickName || user?.email?.split('@')[0] || 'User'}!</h2>
            <p className="text-gray-600">Here's your account overview and available features.</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Profile</h3>
            </div>
            <p className="text-gray-600 mb-4">View and update your personal information</p>
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              View Profile
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Directory</h3>
            </div>
            <p className="text-gray-600 mb-4">Browse team members and contact information</p>
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
              Browse Directory
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Help & Support</h3>
            </div>
            <p className="text-gray-600 mb-4">Get help and support for using the system</p>
            <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
              Get Help
            </button>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
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