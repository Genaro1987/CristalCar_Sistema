'use client';

import { useEffect, useMemo } from 'react';

const typeStyles = {
  success: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    container: 'bg-success-light/20 border-success text-success-dark backdrop-blur-sm',
    iconBg: 'bg-success',
    title: 'text-success-dark',
  },
  error: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 4h.01M5.64 5.64l12.72 12.72" />
        <circle cx="12" cy="12" r="9" strokeWidth={2} />
      </svg>
    ),
    container: 'bg-danger-light/20 border-danger text-danger-dark backdrop-blur-sm',
    iconBg: 'bg-danger',
    title: 'text-danger-dark',
  },
  warning: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M4.93 19h14.14L12 5 4.93 19z" />
      </svg>
    ),
    container: 'bg-primary-50 border-primary-400 text-primary-900 backdrop-blur-sm',
    iconBg: 'bg-primary-500',
    title: 'text-primary-900',
  },
  info: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20.5a8.5 8.5 0 100-17 8.5 8.5 0 000 17z" />
      </svg>
    ),
    container: 'bg-secondary-100 border-secondary-400 text-secondary-900 backdrop-blur-sm',
    iconBg: 'bg-secondary-600',
    title: 'text-secondary-900',
  },
};

export default function Toast({ id, type = 'info', title, message, duration = 5000, onClose }) {
  const styles = useMemo(() => typeStyles[type] || typeStyles.info, [type]);

  useEffect(() => {
    if (!duration) return undefined;

    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [duration, id, onClose]);

  return (
    <div
      className={`w-80 rounded-xl border-2 shadow-xl px-4 py-3.5 flex gap-3 items-start animate-slide-in ${styles.container}`}
      style={{
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      <div className={`rounded-full p-1.5 ${styles.iconBg} text-white flex-shrink-0`}>
        {styles.icon}
      </div>
      <div className="flex-1 text-sm leading-5">
        {title && <p className={`font-bold ${styles.title} mb-0.5`}>{title}</p>}
        {message && <p className="text-current opacity-90">{message}</p>}
      </div>
      <button
        type="button"
        onClick={() => onClose(id)}
        className="text-current/60 hover:text-current transition-colors focus:outline-none flex-shrink-0 ml-1"
        aria-label="Fechar alerta"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
