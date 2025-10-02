import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserService } from '../../services/userService';

interface Resource {
  id: string;
  name: string;
  description: string;
  type?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UserResource {
  resource: Resource;
  role: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
}

interface ResourceToAssign {
  resourceId: string;
  resourceName: string;
  roleId: string;
}

const EditRoles = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [userResources, setUserResources] = useState<UserResource[]>([]);
  const [searchResults, setSearchResults] = useState<Resource[]>([]);
  const [resourcesToAssign, setResourcesToAssign] = useState<ResourceToAssign[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setError('User ID is required');
        setLoading(false);
        return;
      }

      try {
        const [userResourcesData, availableRolesData, userData] = await Promise.all([
          UserService.getUserResourcesById(userId),
          UserService.getAvailableRoles(),
          UserService.getUserById(userId)
        ]);

        setUserResources(Array.isArray(userResourcesData) ? userResourcesData : []);
        setAvailableRoles(Array.isArray(availableRolesData) ? availableRolesData : []);
        setUser(userData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load user data');
        // Ensure arrays are set to empty arrays on error
        setUserResources([]);
        setAvailableRoles([]);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  useEffect(() => {
    const searchResources = async () => {
      if (searchQuery.trim().length > 0) {
        try {
          const results = await UserService.searchResources(searchQuery);
          setSearchResults(Array.isArray(results) ? results : []);
        } catch (error) {
          console.error('Failed to search resources:', error);
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
    };

    const debounceTimer = setTimeout(searchResources, 300); // 300ms debounce
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSearchClick = async () => {
    if (searchQuery.trim().length > 0) {
      try {
        const results = await UserService.searchResources(searchQuery);
        setSearchResults(Array.isArray(results) ? results : []);
      } catch (error) {
        console.error('Failed to search resources:', error);
        setSearchResults([]);
      }
    }
  };

  const handleAddResource = (resource: Resource) => {
    if (!resourcesToAssign.some(r => r.resourceId === resource.id)) {
      setResourcesToAssign(prev => [...prev, {
        resourceId: resource.id,
        resourceName: resource.name,
        roleId: ''
      }]);
    }
  };

  const handleRemoveResource = (resourceId: string) => {
    setResourcesToAssign(prev => prev.filter(r => r.resourceId !== resourceId));
  };

  const handleRoleChange = (resourceId: string, roleId: string) => {
    setResourcesToAssign(prev => prev.map(r =>
      r.resourceId === resourceId ? { ...r, roleId } : r
    ));
  };

  const handleSubmit = async () => {
    if (resourcesToAssign.length === 0) return;

    setSubmitting(true);
    try {
      const promises = resourcesToAssign.map(resource =>
        UserService.assignRole(userId!, resource.resourceId, resource.roleId)
      );
      await Promise.all(promises);

      // Refresh user resources
      const updatedResources = await UserService.getUserResourcesById(userId!);
      setUserResources(updatedResources);
      setResourcesToAssign([]);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Failed to assign roles:', error);
      setError('Failed to assign roles');
    } finally {
      setSubmitting(false);
    }
  };

  // TODO: Implement API calls and functionality

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" role="status"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/roles')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Role Management
        </button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Roles</h1>
        <p className="text-gray-600">Manage user roles and resource assignments for {user ? <span className="text-xl font-semibold text-blue-900"> {user.email}</span> : ''}</p>
      </div>

      {/* Current User Resources Section */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Current User Resources</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Role
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(userResources) && userResources.length > 0 ? (
                userResources.map((userResource) => (
                  <tr key={userResource.resource.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {userResource.resource.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {userResource.role}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="px-6 py-4 text-center text-gray-500">
                    No assigned resources found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Search Resources</h2>
        </div>
        <div className="px-6 py-4">
          <div className="flex">
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleSearchClick}
              className="px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {Array.isArray(searchResults) && searchResults.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(searchResults) && searchResults.map((resource) => (
                  <tr key={resource.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {resource.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {resource.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleAddResource(resource)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Add
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Request Section */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Resources to Assign</h2>
        </div>

        {resourcesToAssign.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resource Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {resourcesToAssign.map((resource) => (
                    <tr key={resource.resourceId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {resource.resourceName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={resource.roleId}
                          onChange={(e) => handleRoleChange(resource.resourceId, e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option value="">Select Role</option>
                          {Array.isArray(availableRoles) && availableRoles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleRemoveResource(resource.resourceId)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-gray-200">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Assigning...
                  </>
                ) : (
                  'Submit'
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="px-6 py-4 text-center text-gray-500">
            No resources selected for assignment
          </div>
        )}
      </div>
    </div>
  );
};

export default EditRoles;