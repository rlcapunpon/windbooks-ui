import { useAuth } from '../../contexts/AuthContext';

const RoleLevel3Dashboard = () => {
  const { user, logout } = useAuth();

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

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Generate Reports</h3>
            <p className="text-gray-600 mb-4">Create and export operational reports</p>
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
              Export Reports
            </button>
          </div>
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
            Logged in as: {user?.email} • Role: {user?.isSuperAdmin ? 'Super Admin' : (user?.resources?.[0]?.role || 'Unknown')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleLevel3Dashboard;