import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ProcessingStatusProps {
  status: 'processing' | 'completed' | 'error';
  progress: number;
  message?: string;
  className?: string;
}

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ 
  status, 
  progress, 
  message,
  className 
}) => {
  return (
    <div className={cn("bg-gray-800 rounded-lg p-6 text-center", className)}>
      <div className="mb-4">
        {status === 'processing' && (
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-red-500" />
        )}
      </div>
      
      <h3 className="text-xl font-semibold mb-2">
        {status === 'processing' && 'Processing...'}
        {status === 'completed' && 'Completed!'}
        {status === 'error' && 'Error occurred'}
      </h3>
      
      {message && <p className="text-gray-400 mb-2">{message}</p>}
      
      {status === 'processing' && (
        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
          <div 
            className="bg-red-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
          <p className="text-sm text-gray-400 mt-2">{progress}% complete</p>
        </div>
      )}
    </div>
  );
};

export default ProcessingStatus;