import React, { useState } from 'react';
import { getAccessToken } from '../../utils/tokenStorage';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSuperAdmin: boolean;
  userId: string;
  userEmail: string;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  isSuperAdmin,
  userId,
  userEmail
}) => {
  const [formData, setFormData] = useState({
    userEmail: userEmail,
    currentPassword: '',
    newPassword: '',
    newPasswordConfirmation: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validation
    if (formData.newPassword !== formData.newPasswordConfirmation) {
      setError('New password confirmation does not match.');
      setIsLoading(false);
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      const requestBody = {
        userId,
        userEmail: isSuperAdmin ? formData.userEmail : userEmail,
        current_password: formData.currentPassword,
        new_password: formData.newPassword,
        new_password_confirmation: formData.newPasswordConfirmation
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/update/password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update password');
      }

      setSuccess(true);
      // Reset form
      setFormData({
        userEmail: userEmail,
        currentPassword: '',
        newPassword: '',
        newPasswordConfirmation: ''
      });

      // Close modal after a short delay to show success message
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);

    } catch (err) {
      console.error('Password update error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-labelledby="change-password-title">
      <div className="bg-white/95 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md border-2 border-gray-200 ring-1 ring-gray-100">
        <h2 id="change-password-title" className="text-3xl mb-6 text-center text-gray-800 font-semibold">
          {success ? 'Password Updated!' : 'Change Password'}
        </h2>

        {success ? (
          <div className="text-center">
            <div className="text-green-600 text-lg mb-4">
              ✓ Your password has been successfully updated.
            </div>
            <p className="text-gray-600">You can now use your new password to log in.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {isSuperAdmin && (
              <div className="mb-4">
                <label htmlFor="userEmail" className="block text-gray-700 mb-2 text-sm font-medium">User Email</label>
                <input
                  id="userEmail"
                  type="email"
                  name="userEmail"
                  value={formData.userEmail}
                  onChange={handleChange}
                  placeholder="Enter user email"
                  required
                  className="w-full p-3 bg-gray-50 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 transition-all duration-300 hover:border-gray-400"
                />
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="currentPassword" className="block text-gray-700 mb-2 text-sm font-medium">Current Password</label>
              <input
                id="currentPassword"
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter current password"
                required
                className="w-full p-3 bg-gray-50 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 transition-all duration-300 hover:border-gray-400"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="newPassword" className="block text-gray-700 mb-2 text-sm font-medium">New Password</label>
              <input
                id="newPassword"
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                required
                minLength={8}
                className="w-full p-3 bg-gray-50 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 transition-all duration-300 hover:border-gray-400"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="newPasswordConfirmation" className="block text-gray-700 mb-2 text-sm font-medium">Confirm New Password</label>
              <input
                id="newPasswordConfirmation"
                type="password"
                name="newPasswordConfirmation"
                value={formData.newPasswordConfirmation}
                onChange={handleChange}
                placeholder="Confirm new password"
                required
                minLength={8}
                className="w-full p-3 bg-gray-50 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 transition-all duration-300 hover:border-gray-400"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300 font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-green-500 via-blue-600 to-purple-500 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/25 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 transform hover:scale-105 font-semibold disabled:opacity-50 disabled:transform-none"
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChangePasswordModal;