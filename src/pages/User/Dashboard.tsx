import { useAuth } from '../../contexts/AuthContext';
import { UserService } from '../../services/userService';

const Dashboard = () => {
  const { user } = useAuth();

  // Get user roles from the new structure
  const userRoles = user?.resources?.map(resource => resource.role) || [];
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

  // Show loading if no user data yet
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="text-black" data-testid="user-dashboard" id="dashboard-container">
      {/* Welcome Section */}
      <div className="mb-8 bg-gradient-to-r from-gray-900 to-gray-800 p-8 rounded-2xl shadow-xl text-white" id="welcome-section">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white" id="welcome-title">
          Welcome back, {user?.details?.nickName || user?.email?.split('@')[0]}! 🚀
        </h1>
        <p className="text-lg text-gray-300 mb-2" id="dashboard-role">
          {UserService.isSuperAdmin() ? 'Super Administrator' : getRoleDisplayName(primaryRole)} Dashboard
        </p>
        {user?.resources && user.resources.length > 0 && (
          <p className="text-sm text-gray-300" id="resources-count">
            Resources: {user.resources.length} assigned
          </p>
        )}
        <div className="flex items-center gap-2 mt-2" id="account-status">
          <div className={`w-2 h-2 rounded-full ${user?.isActive ? 'bg-green-400' : 'bg-red-400'}`} id="status-indicator"></div>
          <span className="text-sm text-gray-300">
            Account {user?.isActive ? 'Active' : 'Inactive'}
          </span>
          {UserService.isSuperAdmin() && (
            <>
              <div className="w-2 h-2 rounded-full bg-yellow-400" id="super-admin-indicator"></div>
              <span className="text-sm text-yellow-300" id="super-admin-label">Super Admin</span>
            </>
          )}
        </div>
      </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="dashboard-grid">
          {/* User Management Card - Available for levels 1-4 */}
          {(UserService.hasPermission('USER.READ') || UserService.hasPermission('*')) && (
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300" id="user-management-card">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-black" id="user-management-title">User Management</h3>
              </div>
              <p className="text-gray-600 mb-4" id="user-management-description">
                {UserService.isSuperAdmin() ? 'Full user administration and system management' :
                 primaryRole === 'admin' ? 'Create and manage user accounts' :
                 primaryRole === 'manager' ? 'Manage team members and permissions' :
                 'View user information and basic management'}
              </p>
              <div className="flex flex-wrap gap-2" id="user-management-permissions">
                {UserService.hasPermission('*') && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full" id="full-access-badge">Full Access</span>
                )}
                {UserService.hasPermission('USER.CREATE') && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full" id="create-users-badge">Create Users</span>
                )}
                {UserService.hasPermission('USER.READ') && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full" id="view-users-badge">View Users</span>
                )}
              </div>
            </div>
          )}

          {/* Reports Card - Available for levels 1-3 */}
          {(UserService.hasPermission('REPORTS.EXPORT') || UserService.hasPermission('*')) && (
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300" id="reports-card">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-black" id="reports-title">Reports & Analytics</h3>
              </div>
              <p className="text-gray-600 mb-4" id="reports-description">
                Generate and export comprehensive reports
              </p>
              <div className="flex flex-wrap gap-2" id="reports-badges">
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full" id="export-reports-badge">Export Reports</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full" id="analytics-badge">Analytics</span>
              </div>
            </div>
          )}

          {/* Settings Card - Available for levels 1-2 */}
          {(UserService.hasPermission('SETTINGS.MANAGE') || UserService.hasPermission('*')) && (
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300" id="settings-card">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-black" id="settings-title">System Settings</h3>
              </div>
              <p className="text-gray-600 mb-4" id="settings-description">
                Configure system-wide settings and preferences
              </p>
              <div className="flex flex-wrap gap-2" id="settings-badges">
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full" id="system-config-badge">System Config</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full" id="preferences-badge">Preferences</span>
              </div>
            </div>
          )}

          {/* Basic Access Card - Available for all levels */}
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300" id="account-info-card">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-slate-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-black" id="account-info-title">Account Information</h3>
            </div>
            <p className="text-gray-600 mb-4" id="account-info-description">
              View your account details and profile information
            </p>
            <div className="space-y-2 text-sm" id="account-info-details">
              <div className="flex justify-between">
                <span className="text-gray-600" id="email-label">Email:</span>
                <span className="text-black font-medium" id="email-value">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600" id="full-name-label">Full Name:</span>
                <span className="text-black font-medium" id="full-name-value">
                  {user?.details ? `${user.details.firstName} ${user.details.lastName}` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600" id="nickname-label">Nickname:</span>
                <span className="text-black font-medium" id="nickname-value">{user?.details?.nickName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600" id="contact-label">Contact:</span>
                <span className="text-black font-medium" id="contact-value">{user?.details?.contactNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600" id="reports-to-label">Reports To:</span>
                <span className="text-black font-medium" id="reports-to-value">
                  {user?.details?.reportTo ? `${user.details.reportTo.firstName} ${user.details.reportTo.lastName}` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600" id="resources-label">Resources:</span>
                <span className="text-black font-medium" id="resources-value">{user?.resources?.length || 0} assigned</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600" id="status-label">Status:</span>
                <span className={`font-medium ${user?.isActive ? 'text-green-600' : 'text-red-600'}`} id="status-value">
                  {user?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600" id="member-since-label">Member since:</span>
                <span className="text-black font-medium" id="member-since-value">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Admin Only Features - Super Admin only */}
          {UserService.isSuperAdmin() && (
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 md:col-span-2 lg:col-span-3" id="admin-features-card">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-black" id="admin-features-title">System Administration</h3>
              </div>
              <p className="text-gray-600 mb-4" id="admin-features-description">
                Full system control and administration capabilities
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="admin-features-grid">
                <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-lg border border-red-200" id="security-feature">
                  <h4 className="font-semibold text-red-800 mb-2" id="security-title">Security</h4>
                  <p className="text-sm text-red-700" id="security-description">Manage authentication, permissions, and security policies</p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200" id="system-health-feature">
                  <h4 className="font-semibold text-blue-800 mb-2" id="system-health-title">System Health</h4>
                  <p className="text-sm text-blue-700" id="system-health-description">Monitor system performance and health metrics</p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200" id="audit-logs-feature">
                  <h4 className="font-semibold text-green-800 mb-2" id="audit-logs-title">Audit Logs</h4>
                  <p className="text-sm text-green-700" id="audit-logs-description">Review system activity and audit trails</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white p-6 rounded-2xl shadow-xl border border-gray-200" id="quick-actions-section">
          <h3 className="text-lg font-semibold text-black mb-4" id="quick-actions-title">Quick Actions</h3>
          <div className="flex flex-wrap gap-3" id="quick-actions-buttons">
            <button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105" id="view-profile-btn">
              View Profile
            </button>
            {(UserService.hasPermission('SETTINGS.MANAGE') || UserService.hasPermission('*')) && (
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105" id="settings-btn">
                Settings
              </button>
            )}
            {(UserService.hasPermission('REPORTS.EXPORT') || UserService.hasPermission('*')) && (
              <button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105" id="generate-report-btn">
                Generate Report
              </button>
            )}
          </div>
        </div>
    </div>
  );
};

export default Dashboard;