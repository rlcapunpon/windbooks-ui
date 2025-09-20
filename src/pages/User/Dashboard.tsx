import { useUserData } from '../../hooks/useUserData';

const Dashboard = () => {
  const { user, loading, error, hasPermission, isSuperAdmin } = useUserData();

  // Get user roles from the new structure
  const userRoles = user?.resources?.map(resource => resource.role) || [];
  const primaryRole = userRoles[0] || 'viewer'; // Default to viewer if no roles

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: 'Administrator',
      manager: 'Manager',
      editor: 'Editor',
      viewer: 'Viewer'
    };
    return roleMap[role.toLowerCase()] || 'User';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
          <h3 className="text-red-800 font-semibold">Error Loading Dashboard</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-black" data-testid="user-dashboard">
      {/* Welcome Section */}
      <div className="mb-8 bg-gradient-to-r from-gray-900 to-gray-800 p-8 rounded-2xl shadow-xl text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">
          Welcome back, {user?.email?.split('@')[0]}! 🚀
        </h1>
        <p className="text-lg text-gray-300 mb-2">
          {isSuperAdmin() ? 'Super Administrator' : getRoleDisplayName(primaryRole)} Dashboard
        </p>
        {user?.resources && user.resources.length > 0 && (
          <p className="text-sm text-gray-300">
            Resources: {user.resources.length} assigned
          </p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <div className={`w-2 h-2 rounded-full ${user?.isActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className="text-sm text-gray-300">
            Account {user?.isActive ? 'Active' : 'Inactive'}
          </span>
          {isSuperAdmin() && (
            <>
              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
              <span className="text-sm text-yellow-300">Super Admin</span>
            </>
          )}
        </div>
      </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Management Card - Available for levels 1-4 */}
          {(hasPermission('USER.READ') || hasPermission('*')) && (
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-black">User Management</h3>
              </div>
              <p className="text-gray-600 mb-4">
                {isSuperAdmin() ? 'Full user administration and system management' :
                 primaryRole === 'admin' ? 'Create and manage user accounts' :
                 primaryRole === 'manager' ? 'Manage team members and permissions' :
                 'View user information and basic management'}
              </p>
              <div className="flex flex-wrap gap-2">
                {hasPermission('*') && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Full Access</span>
                )}
                {hasPermission('USER.CREATE') && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Create Users</span>
                )}
                {hasPermission('USER.READ') && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">View Users</span>
                )}
              </div>
            </div>
          )}

          {/* Reports Card - Available for levels 1-3 */}
          {(hasPermission('REPORTS.EXPORT') || hasPermission('*')) && (
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-black">Reports & Analytics</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Generate and export comprehensive reports
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Export Reports</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Analytics</span>
              </div>
            </div>
          )}

          {/* Settings Card - Available for levels 1-2 */}
          {(hasPermission('SETTINGS.MANAGE') || hasPermission('*')) && (
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-black">System Settings</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Configure system-wide settings and preferences
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">System Config</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Preferences</span>
              </div>
            </div>
          )}

          {/* Basic Access Card - Available for all levels */}
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-slate-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-black">Account Information</h3>
            </div>
            <p className="text-gray-600 mb-4">
              View your account details and profile information
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="text-black font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Role:</span>
                <span className="text-black font-medium">{getRoleDisplayName(primaryRole)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Resources:</span>
                <span className="text-black font-medium">{user?.resources?.length || 0} assigned</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${user?.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">User ID:</span>
                <span className="text-black font-medium font-mono text-xs">{user?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Member since:</span>
                <span className="text-black font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Admin Only Features - Super Admin only */}
          {isSuperAdmin() && (
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 md:col-span-2 lg:col-span-3">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-black">System Administration</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Full system control and administration capabilities
              </p>
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
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-black mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              View Profile
            </button>
            {(hasPermission('SETTINGS.MANAGE') || hasPermission('*')) && (
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                Settings
              </button>
            )}
            {(hasPermission('REPORTS.EXPORT') || hasPermission('*')) && (
              <button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                Generate Report
              </button>
            )}
          </div>
        </div>
    </div>
  );
};

export default Dashboard;