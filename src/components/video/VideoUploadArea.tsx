import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Video } from 'lucide-react';
import { cn } from '../../lib/utils';
import MediaPreview from '../ui/MediaPreview';
import { Button } from '../ui/Button';

interface VideoUploadAreaProps {
  onUpload: (files: File[]) => void;
  maxFiles: number;
  maxFileSize: number;
  currentFileCount: number;
  className?: string;
  files?: File[];
  onRemove?: (index: number) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
}

const VideoUploadArea: React.FC<VideoUploadAreaProps> = ({
  onUpload,
  maxFiles,
  maxFileSize,
  currentFileCount,
  className,
  files = [],
  onRemove,
  onReorder
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onUpload,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.webm']
    },
    maxSize: maxFileSize,
    multiple: true,
    disabled: currentFileCount >= maxFiles
  });

  return (
    <div className={cn('space-y-6', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          isDragActive ? 'border-red-500 bg-red-500/10' : 'border-gray-700 hover:border-red-500',
          currentFileCount >= maxFiles && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <Video className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium">
          {isDragActive ? 'Drop your videos here' : 'Drag & drop videos here'}
        </p>
        <p className="text-gray-400 mt-2">or click to select files</p>
        <p className="text-sm text-gray-500 mt-2">
          Maximum {maxFiles} videos, up to {Math.round(maxFileSize / (1024 * 1024))}MB each
        </p>
        {currentFileCount > 0 && (
          <p className="text-sm text-gray-400 mt-2">
            {currentFileCount} of {maxFiles} videos selected
          </p>
        )}
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {files.map((file, index) => (
            <div key={index} className="relative">
              <MediaPreview
                file={file}
                onRemove={() => onRemove?.(index)}
                actions={onReorder && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onReorder(index, index - 1)}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onReorder(index, index + 1)}
                      disabled={index === files.length - 1}
                    >
                      ↓
                    </Button>
                  </>
                )}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoUploadArea;