import { useState, useEffect } from 'react';
import { UserService } from '../../services/userService';
import type { User } from '../../api/auth';
import UpdateUserModal from '../../components/UpdateUserModal/UpdateUserModal';
import { getAccessToken, getUserIdFromToken } from '../../utils/tokenStorage';

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastLogin, setLastLogin] = useState<string | null>(null);
  const [passwordUpdateInfo, setPasswordUpdateInfo] = useState<{
    create_date: string;
    last_update: string | null;
    updated_by: string | null;
    how_many: number;
  } | null>(null);
  const [securityLoading, setSecurityLoading] = useState(true);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);

        // First try to get from cached data
        let userData = UserService.getCachedUserData();

        // If no cached data or details are missing, fetch fresh data
        if (!userData || !userData.details?.firstName) {
          userData = await UserService.fetchAndStoreUserData();
        }

        setUser(userData);
      } catch (err) {
        console.error('Failed to load user profile:', err);
        setError('Failed to load profile information');
      } finally {
        setLoading(false);
      }
    };

    const loadSecurityInfo = async () => {
      try {
        setSecurityLoading(true);

        // Load last login information
        const lastLoginResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/last-login`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`,
          },
        });

        if (lastLoginResponse.ok) {
          const lastLoginData = await lastLoginResponse.json();
          setLastLogin(lastLoginData.last_login);
        }

        // Load password update information
        const userId = getUserIdFromToken();
        if (userId) {
          const passwordUpdateResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/last-update/creds/${userId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${getAccessToken()}`,
            },
          });

          if (passwordUpdateResponse.ok) {
            const passwordUpdateData = await passwordUpdateResponse.json();
            setPasswordUpdateInfo(passwordUpdateData);
          }
        }
      } catch (err) {
        console.error('Failed to load security information:', err);
        // Don't set error state for security info, just leave as loading
      } finally {
        setSecurityLoading(false);
      }
    };

    loadUserProfile();
    loadSecurityInfo();
  }, []);

  const handleSaveDetails = async (updatedDetails: Partial<User['details']>) => {
    if (!user) return;

    try {
      const updatedUser = await UserService.updateUserDetails(updatedDetails);
      setUser(updatedUser);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to update user details:', error);
      // Optionally, show an error message in the modal
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="text-yellow-800 font-semibold">No Profile Data</h2>
          <p className="text-yellow-600">Unable to load profile information. Please try logging in again.</p>
        </div>
      </div>
    );
  }

  const isSuperAdmin = UserService.isSuperAdmin();
  const userRoles = UserService.getUserRoles();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">Your account information and details.</p>
      </div>

      {isModalOpen && user && user.details && (
        <UpdateUserModal
          user={user.details}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveDetails}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{user.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                user.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <div className="mt-1 space-y-1">
                {isSuperAdmin ? (
                  <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Super Administrator
                  </span>
                ) : (
                  Object.entries(
                    userRoles.reduce((acc, role) => {
                      acc[role] = (acc[role] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg">
                      <span className="text-sm font-medium text-blue-900 capitalize">
                        {role.toLowerCase()}
                      </span>
                      <span className="text-sm font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded">
                        {count}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Personal Details</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Update Details
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <p className="mt-1 text-sm text-gray-900">
                {user.details?.firstName && user.details?.lastName
                  ? `${user.details.firstName} ${user.details.lastName}`
                  : 'Not provided'
                }
              </p>
            </div>

            {user.details?.nickName && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Nickname</label>
                <p className="mt-1 text-sm text-gray-900">{user.details.nickName}</p>
              </div>
            )}

            {user.details?.contactNumber && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                <p className="mt-1 text-sm text-gray-900">{user.details.contactNumber}</p>
              </div>
            )}
          </div>
        </div>

        {/* Reports To - Only show for non-superadmin users */}
        {!isSuperAdmin && user.details?.reportTo && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Reports To</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {user.details.reportTo.firstName?.[0] || user.details.reportTo.email?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {user.details.reportTo.firstName && user.details.reportTo.lastName
                      ? `${user.details.reportTo.firstName} ${user.details.reportTo.lastName}`
                      : user.details.reportTo.email
                    }
                  </h3>
                  {user.details.reportTo.nickName && user.details.reportTo.nickName !== user.details.reportTo.firstName && (
                    <p className="text-sm text-gray-600">({user.details.reportTo.nickName})</p>
                  )}
                  <p className="text-sm text-gray-600">{user.details.reportTo.email}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Account Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">User ID</label>
              <p className="mt-1 text-sm text-gray-900 font-mono">{user.id}</p>
            </div>

            {user.createdAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Member Since</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Security and Auth */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Security and Auth</h2>
            <button
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Change Password
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Login</label>
              <p className="mt-1 text-sm text-gray-900">
                {securityLoading ? 'Loading...' : (lastLogin ? new Date(lastLogin).toLocaleString() : 'Never')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Last Password Change</label>
              <p className="mt-1 text-sm text-gray-900">
                {securityLoading ? 'Loading...' : (passwordUpdateInfo?.last_update ? new Date(passwordUpdateInfo.last_update).toLocaleString() : 'Never')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
