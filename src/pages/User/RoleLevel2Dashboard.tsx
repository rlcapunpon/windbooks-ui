import { useAuth } from '../../contexts/AuthContextTypes';

const RoleLevel2Dashboard = () => {
  const { user, logout } = useAuth();

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
          <button
            onClick={logout}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            Logout
          </button>
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
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">User Management</h3>
            <p className="text-gray-600 mb-4">Create and manage team member accounts</p>
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              Manage Team
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">System Settings</h3>
            <p className="text-gray-600 mb-4">Configure team and operational settings</p>
            <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
              Settings
            </button>
          </div>
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
            Logged in as: {user?.email} • Role: {user?.isSuperAdmin ? 'Super Admin' : (user?.resources?.[0]?.role || 'Unknown')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleLevel2Dashboard;