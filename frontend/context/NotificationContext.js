'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/ui/Toast';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification deve ser usado dentro de NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback(({ type = 'info', title, message, duration = 5000 }) => {
    const id = Date.now() + Math.random();

    setNotifications((prev) => [
      ...prev,
      { id, type, title, message, duration }
    ]);

    return id;
  }, []);

  const hideNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  const showSuccess = useCallback((message, title = 'Sucesso') => {
    return showNotification({ type: 'success', title, message });
  }, [showNotification]);

  const showError = useCallback((message, title = 'Erro') => {
    return showNotification({ type: 'error', title, message, duration: 7000 });
  }, [showNotification]);

  const showWarning = useCallback((message, title = 'Atenção') => {
    return showNotification({ type: 'warning', title, message, duration: 6000 });
  }, [showNotification]);

  const showInfo = useCallback((message, title = 'Informação') => {
    return showNotification({ type: 'info', title, message });
  }, [showNotification]);

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        hideNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}

      {/* Container de notificações */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <Toast
            key={notification.id}
            {...notification}
            onClose={hideNotification}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
