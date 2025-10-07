import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface PasswordUpdateSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'USER' | 'SUPERADMIN';
  lastUpdateDays: number | null; // null means never updated
}

export const PasswordUpdateSuggestionModal: React.FC<PasswordUpdateSuggestionModalProps> = ({
  isOpen,
  onClose,
  userRole,
  lastUpdateDays,
}) => {
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  const handleUpdatePassword = () => {
    navigate('/profile');
    onClose();
  };

  const handleLater = () => {
    onClose();
  };

  const isSuperadminNeverUpdated = userRole === 'SUPERADMIN' && lastUpdateDays === null;
  const isNeverUpdated = lastUpdateDays === null;
  const daysSinceUpdate = lastUpdateDays || 0;

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      role="dialog"
      aria-labelledby="password-update-title"
      aria-describedby="password-update-description"
      tabIndex={-1}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`text-2xl ${isSuperadminNeverUpdated ? 'text-red-500' : 'text-yellow-500'}`}>
              {isSuperadminNeverUpdated ? '🛡️' : '⚠️'}
            </div>
            <h3 id="password-update-title" className="text-lg font-semibold text-gray-900">
              Password Update Recommended
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-xl font-bold"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div id="password-update-description" className="mb-6">
          {isNeverUpdated ? (
            <div>
              <p className="text-gray-700 mb-3">
                You have never updated your password since account creation.
              </p>
              {isSuperadminNeverUpdated && (
                <p className="text-red-600 font-medium">
                  For security reasons, please update your password immediately.
                </p>
              )}
            </div>
          ) : (
            <div>
              <p className="text-gray-700 mb-3">
                Your password was last updated {daysSinceUpdate} days ago.
              </p>
              {daysSinceUpdate >= 90 && (
                <p className="text-yellow-600 font-medium">
                  It's been over 90 days since your last password update. We recommend updating it for better security.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleUpdatePassword}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
          >
            {isSuperadminNeverUpdated ? 'Update Password Now' : 'Update Password'}
          </button>
          
          {!isSuperadminNeverUpdated && (
            <button
              onClick={handleLater}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
            >
              Later
            </button>
          )}
        </div>
      </div>
    </div>
  );
};