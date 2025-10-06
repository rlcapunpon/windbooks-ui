import { useAuth } from '../../contexts/AuthContextTypes';

const RoleLevel1Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background-light-primary text-text-light-primary">
      <nav className="bg-background-light-surface/95 backdrop-blur-md p-4 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-text-light-primary">Windbooks UI</h1>
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
              Super Admin
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
          <h1 className="text-heading">Super Admin Dashboard</h1>
          <p className="text-body">Full system access and management capabilities</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-primary">1,247</p>
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Active Sessions</h3>
            <p className="text-3xl font-bold text-green-600">89</p>
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">System Health</h3>
            <p className="text-3xl font-bold text-green-600">98%</p>
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Revenue</h3>
            <p className="text-3xl font-bold text-purple-600">$45,231</p>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">User Management</h3>
            <p className="text-gray-600 mb-4">Create, edit, and manage all user accounts</p>
            <button className="btn-primary w-full">Manage Users</button>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">System Settings</h3>
            <p className="text-gray-600 mb-4">Configure system-wide settings and preferences</p>
            <button className="btn-primary w-full">System Config</button>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Reports & Analytics</h3>
            <p className="text-gray-600 mb-4">View comprehensive system reports and analytics</p>
            <button className="btn-primary w-full">View Reports</button>
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

export default RoleLevel1Dashboard;