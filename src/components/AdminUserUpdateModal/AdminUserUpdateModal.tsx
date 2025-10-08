import React, { useState, useEffect } from 'react';
import { UserService } from '../../services/userService';

interface AdminUserUpdateModalProps {
  isOpen: boolean;
  userId: string;
  onClose: () => void;
  onSave: () => void;
}

interface UserDetails {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  nickName: string | null;
  contactNumber: string | null;
  reportToId: string | null;
  reportTo: {
    id: string;
    email: string;
    details: {
      firstName: string | null;
      lastName: string | null;
      nickName: string | null;
    } | null;
  } | null;
}

interface SearchUserResult {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
}

const AdminUserUpdateModal: React.FC<AdminUserUpdateModalProps> = ({
  isOpen,
  userId,
  onClose,
  onSave
}) => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUserResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedManager, setSelectedManager] = useState<{
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  } | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nickName: '',
    contactNumber: '',
    reportsTo: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Fetch user details when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetails();
    }
  }, [isOpen, userId]);

  // Update form data when user details are loaded
  useEffect(() => {
    if (userDetails) {
      setFormData({
        firstName: userDetails.firstName || '',
        lastName: userDetails.lastName || '',
        nickName: userDetails.nickName || '',
        contactNumber: userDetails.contactNumber || '',
        reportsTo: userDetails.reportToId || ''
      });
      
      // Set selected manager from existing reportTo data
      if (userDetails.reportTo) {
        setSelectedManager({
          id: userDetails.reportTo.id,
          email: userDetails.reportTo.email,
          firstName: userDetails.reportTo.details?.firstName || null,
          lastName: userDetails.reportTo.details?.lastName || null
        });
      } else {
        setSelectedManager(null);
      }
      
      setSearchResults([]); // Clear search results
      setSearchQuery(''); // Clear search query
    }
  }, [userDetails]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const details = await UserService.getUserDetails(userId);
      setUserDetails({
        id: details.id,
        email: details.user.email,
        firstName: details.firstName,
        lastName: details.lastName,
        nickName: details.nickName,
        contactNumber: details.contactNumber,
        reportToId: details.reportToId,
        reportTo: details.reportTo
      });
    } catch (err) {
      console.error('Failed to fetch user details:', err);
      setError('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const results = await UserService.searchUsers(1, 10, searchQuery);
      // Filter out the current user from results
      const filteredResults = results.data.filter((user: SearchUserResult) => user.id !== userId);
      setSearchResults(filteredResults);
    } catch (err) {
      console.error('Failed to search users:', err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectManager = (user: SearchUserResult) => {
    setSelectedManager(user);
    setFormData(prev => ({
      ...prev,
      reportsTo: user.id
    }));
    setSearchResults([]);
    setSearchQuery('');
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First Name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last Name is required';
    }
    if (!formData.nickName.trim()) {
      newErrors.nickName = 'Nickname is required';
    }
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact Number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await UserService.updateUserDetailsAdmin(userId, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        nickName: formData.nickName,
        contactNumber: formData.contactNumber,
        reportTo: formData.reportsTo || undefined
      });

      onSave();
      onClose();
    } catch (err) {
      console.error('Failed to update user details:', err);
      setError('Failed to update user details');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay fixed inset-0 flex items-center justify-center p-4 z-50">
      <div className="modal-content p-8 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl mb-6 text-center text-gray-800 font-semibold">Update User Details</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading user details...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="firstName" className="form-label">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter first name"
                  className="form-input w-full"
                />
                {errors.firstName && <p className="error-text">{errors.firstName}</p>}
              </div>

              <div>
                <label htmlFor="lastName" className="form-label">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter last name"
                  className="form-input w-full"
                />
                {errors.lastName && <p className="error-text">{errors.lastName}</p>}
              </div>

              <div>
                <label htmlFor="nickName" className="form-label">Nickname</label>
                <input
                  id="nickName"
                  type="text"
                  name="nickName"
                  value={formData.nickName}
                  onChange={handleInputChange}
                  placeholder="Enter nickname"
                  className="form-input w-full"
                />
                {errors.nickName && <p className="error-text">{errors.nickName}</p>}
              </div>

              <div>
                <label htmlFor="contactNumber" className="form-label">Contact Number</label>
                <input
                  id="contactNumber"
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  placeholder="Enter contact number"
                  className="form-input w-full"
                />
                {errors.contactNumber && <p className="error-text">{errors.contactNumber}</p>}
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="reportsToSearch" className="form-label">Reports to</label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    id="reportsToSearch"
                    type="text"
                    value={selectedManager ? selectedManager.email : searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by email..."
                    className="form-input flex-1"
                    disabled={!!selectedManager}
                  />
                  <button
                    type="button"
                    onClick={handleSearch}
                    disabled={searchLoading || !!selectedManager}
                    className="btn-primary p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    title="Search users"
                  >
                    {searchLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    )}
                  </button>
                  {selectedManager && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedManager(null);
                        setFormData(prev => ({ ...prev, reportsTo: '' }));
                        setSearchQuery('');
                      }}
                      className="btn-secondary px-4 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {searchResults.length > 0 && (
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Email</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
                          <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {searchResults.map((user) => (
                          <tr key={user.id} className="border-t border-gray-200">
                            <td className="px-4 py-2 text-sm text-gray-900">{user.email}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {user.firstName} {user.lastName}
                            </td>
                            <td className="px-4 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleSelectManager(user)}
                                className="btn-primary px-3 py-1 text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                              >
                                Select
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="btn-secondary px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {saving ? 'Saving...' : 'Submit'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminUserUpdateModal;