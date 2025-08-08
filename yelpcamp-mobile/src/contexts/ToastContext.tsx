import * as React from 'react';
const { createContext, useContext, useState } = React;
type ReactNode = React.ReactNode;
import Toast, { ToastType } from '../components/Toast';

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'info',
    duration: 3000,
  });

  const showToast = (message: string, type: ToastType = 'info', duration: number = 3000) => {
    setToast({
      visible: true,
      message,
      type,
      duration,
    });
  };

  const showSuccess = (message: string, duration: number = 3000) => {
    showToast(message, 'success', duration);
  };

  const showError = (message: string, duration: number = 4000) => {
    showToast(message, 'error', duration);
  };

  const showWarning = (message: string, duration: number = 3500) => {
    showToast(message, 'warning', duration);
  };

  const showInfo = (message: string, duration: number = 3000) => {
    showToast(message, 'info', duration);
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  const value: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
        duration={toast.duration}
      />
    </ToastContext.Provider>
  );
} 