import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContextTypes';
import Banner from '../../components/Banner';

interface User {
  id: string;
  email: string;
  role: 'ROLE_LEVEL_1' | 'ROLE_LEVEL_2' | 'ROLE_LEVEL_3' | 'ROLE_LEVEL_4' | 'ROLE_LEVEL_5';
  createdAt: string;
  lastLogin?: string;
  status: 'active' | 'inactive';
}

const Dashboard = () => {
  const { logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    role: 'ROLE_LEVEL_4' as User['role'],
    confirmPassword: ''
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        email: 'admin@windbooks.com',
        role: 'ROLE_LEVEL_1',
        createdAt: '2024-01-15',
        lastLogin: '2024-09-19',
        status: 'active'
      },
      {
        id: '2',
        email: 'john.doe@company.com',
        role: 'ROLE_LEVEL_3',
        createdAt: '2024-03-20',
        lastLogin: '2024-09-18',
        status: 'active'
      },
      {
        id: '3',
        email: 'sarah.accountant@windbooks.com',
        role: 'ROLE_LEVEL_2',
        createdAt: '2024-02-10',
        lastLogin: '2024-09-17',
        status: 'active'
      }
    ];
    setUsers(mockUsers);
  }, []);

  const handleCreateUser = () => {
    if (newUser.password !== newUser.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const user: User = {
      id: Date.now().toString(),
      email: newUser.email,
      role: newUser.role,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    setUsers([...users, user]);
    setNewUser({ email: '', password: '', role: 'ROLE_LEVEL_4', confirmPassword: '' });
    setShowCreateModal(false);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;

    setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
    setEditingUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ROLE_LEVEL_1': return 'bg-red-100 text-red-800';
      case 'ROLE_LEVEL_2': return 'bg-purple-100 text-purple-800';
      case 'ROLE_LEVEL_3': return 'bg-blue-100 text-blue-800';
      case 'ROLE_LEVEL_4': return 'bg-green-100 text-green-800';
      case 'ROLE_LEVEL_5': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background-light-primary text-text-light-primary">
      <Banner
        title="Windbooks Admin"
        subtitle="User Management Dashboard"
        variant="default"
      >
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            + Add User
          </button>
          <button
            onClick={logout}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
          >
            Logout
          </button>
        </div>
      </Banner>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-primary">{users.length}</p>
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Active Users</h3>
            <p className="text-3xl font-bold text-green-600">{users.filter(u => u.status === 'active').length}</p>
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Admins</h3>
            <p className="text-3xl font-bold text-red-600">{users.filter(u => u.role === 'ROLE_LEVEL_1').length}</p>
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Managers</h3>
            <p className="text-3xl font-bold text-purple-600">{users.filter(u => u.role === 'ROLE_LEVEL_2').length}</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-heading">User Management</h2>
            <p className="text-gray-600">Manage users, roles, and permissions</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.createdAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin || 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-primary hover:text-primary-dark mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Create New User</h3>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                className="form-input"
              />
              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                className="form-input"
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={newUser.confirmPassword}
                onChange={(e) => setNewUser({...newUser, confirmPassword: e.target.value})}
                className="form-input"
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value as User['role']})}
                className="form-input"
              >
                <option value="ROLE_LEVEL_1">Level 1 (Super Admin)</option>
                <option value="ROLE_LEVEL_2">Level 2 (Manager)</option>
                <option value="ROLE_LEVEL_3">Level 3 (Staff)</option>
                <option value="ROLE_LEVEL_4">Level 4 (User)</option>
                <option value="ROLE_LEVEL_5">Level 5 (Read-Only)</option>
              </select>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCreateUser}
                className="btn-primary flex-1"
              >
                Create User
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Edit User</h3>
            <div className="space-y-4">
              <input
                type="email"
                value={editingUser.email}
                onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                className="form-input"
              />
              <select
                value={editingUser.role}
                onChange={(e) => setEditingUser({...editingUser, role: e.target.value as User['role']})}
                className="form-input"
              >
                <option value="ROLE_LEVEL_1">Level 1 (Super Admin)</option>
                <option value="ROLE_LEVEL_2">Level 2 (Manager)</option>
                <option value="ROLE_LEVEL_3">Level 3 (Staff)</option>
                <option value="ROLE_LEVEL_4">Level 4 (User)</option>
                <option value="ROLE_LEVEL_5">Level 5 (Read-Only)</option>
              </select>
              <select
                value={editingUser.status}
                onChange={(e) => setEditingUser({...editingUser, status: e.target.value as User['status']})}
                className="form-input"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleUpdateUser}
                className="btn-primary flex-1"
              >
                Update User
              </button>
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;