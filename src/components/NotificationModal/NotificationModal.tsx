import React from 'react';

export type NotificationType = 'success' | 'info' | 'warning' | 'error';

export interface NotificationInfo {
  type: NotificationType;
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  duration?: number; // Auto-close after duration (in ms)
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: NotificationInfo | null;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notification
}) => {
  if (!isOpen || !notification) return null;

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getBackgroundColor = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'from-green-500 to-emerald-600';
      case 'info':
        return 'from-blue-500 to-cyan-600';
      case 'warning':
        return 'from-yellow-500 to-orange-600';
      case 'error':
        return 'from-red-500 to-pink-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md border-2 border-gray-200 ring-1 ring-gray-100">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4">
            {getIcon(notification.type)}
          </div>

          <h2 className="text-2xl mb-4 text-gray-800 font-semibold">{notification.title}</h2>

          <p className="text-gray-600 mb-6 leading-relaxed">{notification.message}</p>

          {notification.actionText && notification.onAction && (
            <button
              onClick={notification.onAction}
              className={`w-full mb-4 bg-gradient-to-r ${getBackgroundColor(notification.type)} text-white p-3 rounded-lg hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 font-semibold`}
            >
              {notification.actionText}
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-700 p-3 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;