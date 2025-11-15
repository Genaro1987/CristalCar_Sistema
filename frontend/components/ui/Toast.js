'use client';

import { useEffect } from 'react';

const Toast = ({ id, type = 'info', title, message, duration = 5000, onClose }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  const colors = {
    success: 'bg-green-500 border-green-600',
    error: 'bg-red-500 border-red-600',
    warning: 'bg-yellow-500 border-yellow-600',
    info: 'bg-blue-500 border-blue-600',
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div
      className={`${colors[type]} text-white px-6 py-4 rounded-lg shadow-lg border-l-4 min-w-[300px] max-w-md animate-slide-in-right`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl font-bold flex-shrink-0">
          {icons[type]}
        </div>
        <div className="flex-1">
          {title && (
            <div className="font-bold mb-1 text-lg">
              {title}
            </div>
          )}
          {message && (
            <div className="text-sm opacity-90">
              {message}
            </div>
          )}
        </div>
        <button
          onClick={() => onClose(id)}
          className="text-white hover:text-gray-200 flex-shrink-0 text-xl leading-none ml-2"
          aria-label="Fechar"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;
