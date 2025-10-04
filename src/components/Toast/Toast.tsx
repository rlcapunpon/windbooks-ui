import React from 'react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  type?: 'success' | 'info' | 'warning' | 'error';
  onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, isVisible, type = 'info', onClose }) => {
  if (!isVisible) return null;

  const baseClasses = 'p-4 rounded-lg shadow-lg mb-4 flex justify-between items-start';
  const typeClasses = {
    success: 'bg-green-500 text-white',
    info: 'bg-blue-500 text-white',
    warning: 'bg-yellow-500 text-black',
    error: 'bg-red-500 text-white',
  };

  return (
    <div
      className={`${baseClasses} ${typeClasses[type]}`}
      role="alert"
      aria-live="assertive"
      data-testid="toast"
    >
      <div className="whitespace-pre-line flex-1">
        {message}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-current hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-white rounded"
          aria-label="Close notification"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Toast;