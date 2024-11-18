import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

interface Toast {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'info';
}

interface ToasterProps {
  toasts?: Toast[];
  onDismiss?: (id: string) => void;
}

export const Toaster = ({ toasts = [], onDismiss }: ToasterProps) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`
              bg-gray-900 border rounded-lg shadow-lg p-4 pr-8 min-w-[300px] max-w-md
              ${toast.type === 'success' ? 'border-green-500' : ''}
              ${toast.type === 'error' ? 'border-red-500' : ''}
              ${toast.type === 'info' ? 'border-purple-500' : ''}
              ${!toast.type ? 'border-gray-800' : ''}
            `}
          >
            {onDismiss && (
              <button
                onClick={() => onDismiss(toast.id)}
                className="absolute top-3 right-3 text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <div className="flex flex-col gap-1">
              <p className="font-medium">{toast.title}</p>
              {toast.description && (
                <p className="text-sm text-gray-400">{toast.description}</p>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};