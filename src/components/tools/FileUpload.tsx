import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { cn } from '../../lib/utils';
import MediaPreview from '../ui/MediaPreview';

interface FileUploadProps {
  accept?: Record<string, string[]>;
  maxSize?: number;
  onUpload: (file: File) => void;
  isUploading?: boolean;
  file?: File | null;
  onRemove?: () => void;
  className?: string;
  showControls?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  accept, 
  maxSize = 100 * 1024 * 1024, 
  onUpload,
  isUploading = false,
  file,
  onRemove,
  className,
  showControls = true
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.[0]) {
      onUpload(acceptedFiles[0]);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    disabled: isUploading || !!file
  });

  return (
    <div className={className}>
      {!file && (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            isDragActive ? 'border-red-500 bg-red-500/10' : 'border-gray-700 hover:border-red-500',
            isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          )}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium">
            {isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
          </p>
          <p className="text-gray-400 mt-2">or click to select a file</p>
          <p className="text-sm text-gray-500 mt-2">
            Maximum file size: {Math.round(maxSize / (1024 * 1024))}MB
          </p>
        </div>
      )}

      {file && (
        <MediaPreview
          file={file}
          onRemove={onRemove}
          showControls={showControls}
          className="max-w-xl mx-auto"
        />
      )}
    </div>
  );
};

export default FileUpload;