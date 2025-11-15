'use client';

import { useState } from 'react';

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'warning' }) {
  if (!isOpen) return null;

  const typeStyles = {
    warning: {
      icon: '⚠️',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconBg: 'bg-yellow-100',
      iconText: 'text-yellow-600',
      confirmBg: 'bg-red-500 hover:bg-red-600',
      titleColor: 'text-yellow-900'
    },
    danger: {
      icon: '🗑️',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconBg: 'bg-red-100',
      iconText: 'text-red-600',
      confirmBg: 'bg-red-500 hover:bg-red-600',
      titleColor: 'text-red-900'
    },
    info: {
      icon: 'ℹ️',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600',
      confirmBg: 'bg-blue-500 hover:bg-blue-600',
      titleColor: 'text-blue-900'
    },
    success: {
      icon: '✅',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconBg: 'bg-green-100',
      iconText: 'text-green-600',
      confirmBg: 'bg-green-500 hover:bg-green-600',
      titleColor: 'text-green-900'
    }
  };

  const style = typeStyles[type];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full ${style.iconBg} flex items-center justify-center text-2xl`}>
              {style.icon}
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${style.titleColor} mb-2`}>
                {title}
              </h3>
              <p className="text-gray-700 text-sm">
                {message}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${style.confirmBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AlertModal({ isOpen, onClose, title, message, type = 'info' }) {
  if (!isOpen) return null;

  const typeStyles = {
    error: {
      icon: '❌',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconBg: 'bg-red-100',
      iconText: 'text-red-600',
      titleColor: 'text-red-900',
      buttonBg: 'bg-red-500 hover:bg-red-600'
    },
    warning: {
      icon: '⚠️',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconBg: 'bg-yellow-100',
      iconText: 'text-yellow-600',
      titleColor: 'text-yellow-900',
      buttonBg: 'bg-yellow-500 hover:bg-yellow-600'
    },
    info: {
      icon: 'ℹ️',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600',
      titleColor: 'text-blue-900',
      buttonBg: 'bg-blue-500 hover:bg-blue-600'
    },
    success: {
      icon: '✅',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconBg: 'bg-green-100',
      iconText: 'text-green-600',
      titleColor: 'text-green-900',
      buttonBg: 'bg-green-500 hover:bg-green-600'
    }
  };

  const style = typeStyles[type];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full ${style.iconBg} flex items-center justify-center text-2xl`}>
              {style.icon}
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${style.titleColor} mb-2`}>
                {title}
              </h3>
              <p className="text-gray-700 text-sm">
                {message}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end p-6 pt-0">
          <button
            onClick={onClose}
            className={`px-6 py-2 text-white rounded-lg transition-colors ${style.buttonBg}`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export function PromptModal({ isOpen, onClose, onConfirm, title, message, placeholder = '', confirmText = 'Confirmar', cancelText = 'Cancelar' }) {
  const [value, setValue] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (value.trim()) {
      onConfirm(value);
      onClose();
      setValue('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
              ✏️
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                {title}
              </h3>
              <p className="text-gray-700 text-sm mb-3">
                {message}
              </p>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleConfirm()}
                placeholder={placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={() => {
              onClose();
              setValue('');
            }}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!value.trim()}
            className="flex-1 px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
