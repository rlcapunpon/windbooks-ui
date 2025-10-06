
import React, { useState, useEffect } from 'react';
import type { UserDetails } from '../../api/auth';

interface UpdateUserModalProps {
  user: UserDetails;
  onClose: () => void;
  onSave: (updatedUser: Partial<UserDetails>) => void;
}

const UpdateUserModal: React.FC<UpdateUserModalProps> = ({ user, onClose, onSave }) => {
  const [updatedUser, setUpdatedUser] = useState<Partial<UserDetails>>({
    firstName: user.firstName,
    lastName: user.lastName,
    nickName: user.nickName,
    contactNumber: user.contactNumber,
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    setUpdatedUser({
      firstName: user.firstName,
      lastName: user.lastName,
      nickName: user.nickName,
      contactNumber: user.contactNumber,
    });
  }, [user]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!updatedUser.firstName?.trim()) {
      newErrors.firstName = 'First Name is required';
    }
    if (!updatedUser.lastName?.trim()) {
      newErrors.lastName = 'Last Name is required';
    }
    if (!updatedUser.nickName?.trim()) {
      newErrors.nickName = 'Nickname is required';
    }
    if (!updatedUser.contactNumber?.trim()) {
      newErrors.contactNumber = 'Contact Number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdatedUser(prevUser => ({
      ...prevUser,
      [name]: value,
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: '',
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(updatedUser);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md border-2 border-gray-200 ring-1 ring-gray-100">
        <h2 className="text-3xl mb-6 text-center text-gray-800 font-semibold">Update User Details</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 text-sm font-medium">First Name</label>
            <input
              type="text"
              name="firstName"
              value={updatedUser.firstName || ''}
              onChange={handleChange}
              placeholder="Enter your first name"
              className="w-full p-3 bg-gray-50 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 transition-all duration-300 hover:border-gray-400"
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 text-sm font-medium">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={updatedUser.lastName || ''}
              onChange={handleChange}
              placeholder="Enter your last name"
              className="w-full p-3 bg-gray-50 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 transition-all duration-300 hover:border-gray-400"
            />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 text-sm font-medium">Nickname</label>
            <input
              type="text"
              name="nickName"
              value={updatedUser.nickName || ''}
              onChange={handleChange}
              placeholder="Enter your nickname"
              className="w-full p-3 bg-gray-50 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 transition-all duration-300 hover:border-gray-400"
            />
            {errors.nickName && <p className="text-red-500 text-sm mt-1">{errors.nickName}</p>}
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2 text-sm font-medium">Contact Number</label>
            <input
              type="text"
              name="contactNumber"
              value={updatedUser.contactNumber || ''}
              onChange={handleChange}
              placeholder="Enter your contact number"
              className="w-full p-3 bg-gray-50 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 transition-all duration-300 hover:border-gray-400"
            />
            {errors.contactNumber && <p className="text-red-500 text-sm mt-1">{errors.contactNumber}</p>}
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-green-500 via-blue-600 to-purple-500 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/25 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 transform hover:scale-105 font-semibold"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateUserModal;
