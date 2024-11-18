import { createContext } from 'react';

interface ToastContextType {
  addToast: (toast: {
    title?: string;
    description?: string;
    type?: 'default' | 'success' | 'error' | 'warning';
  }) => void;
  toasts: Array<{
    title?: string;
    description?: string;
    type?: 'default' | 'success' | 'error' | 'warning';
  }>;
}

export const ToastContext = createContext<ToastContextType>({
  addToast: () => {},
  toasts: [],
});