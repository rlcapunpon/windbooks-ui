import React from 'react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  type?: 'success' | 'info' | 'warning' | 'error';
}

const Toast: React.FC<ToastProps> = ({ message, isVisible, type = 'info' }) => {
  if (!isVisible) return null;

  const baseClasses = 'p-4 rounded-lg shadow-lg mb-4';
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
      <div className="whitespace-pre-line">
        {message}
      </div>
    </div>
  );
};

export default Toast;