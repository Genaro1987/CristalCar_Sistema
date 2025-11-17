'use client';

import { useEffect, useMemo } from 'react';

const typeStyles = {
  success: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    container: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    title: 'text-emerald-900',
  },
  error: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 4h.01M5.64 5.64l12.72 12.72" />
        <circle cx="12" cy="12" r="9" strokeWidth={2} />
      </svg>
    ),
    container: 'bg-red-50 border-red-200 text-red-800',
    title: 'text-red-900',
  },
  warning: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M4.93 19h14.14L12 5 4.93 19z" />
      </svg>
    ),
    container: 'bg-amber-50 border-amber-200 text-amber-800',
    title: 'text-amber-900',
  },
  info: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20.5a8.5 8.5 0 100-17 8.5 8.5 0 000 17z" />
      </svg>
    ),
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    title: 'text-blue-900',
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
    <div className={`w-80 rounded-lg border shadow-lg px-4 py-3 flex gap-3 items-start ${styles.container}`}>
      <div className="mt-0.5 text-current">
        {styles.icon}
      </div>
      <div className="flex-1 text-sm leading-5">
        {title && <p className={`font-semibold ${styles.title}`}>{title}</p>}
        {message && <p className="mt-1 text-current">{message}</p>}
      </div>
      <button
        type="button"
        onClick={() => onClose(id)}
        className="text-current/80 hover:text-current focus:outline-none"
        aria-label="Fechar alerta"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
