import React from 'react';
import { Toast, ToastProvider } from './toast';

export function Toaster() {
  return (
    <ToastProvider>
      <Toast />
    </ToastProvider>
  );
}

export { useToast } from './use-toast';