import React from 'react';
import { cn } from '../../lib/utils';
import { useCloudinaryUpload } from './hooks';
import { Button } from '../../components/ui/Button';
import { Upload, X, Loader2 } from 'lucide-react';

interface CloudinaryUploadProps {
  onUpload: (result: { public_id: string; secure_url: string; format: string }) => void;
  onError?: (error: Error) => void;
  folder?: string;
  resourceType?: 'image' | 'video' | 'raw';
  maxSize?: number;
  acceptedTypes?: string[];
  className?: string;
  children?: React.ReactNode;
}

export const CloudinaryUpload: React.FC<CloudinaryUploadProps> = ({
  onUpload,
  onError,
  folder,
  resourceType = 'auto',
  maxSize,
  acceptedTypes,
  className,
  children
}) => {
  const { upload, isUploading, progress, error } = useCloudinaryUpload({
    folder,
    resourceType,
    maxSize,
    acceptedTypes
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await upload(file);
      onUpload(result);
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error('Upload failed'));
    }
  };

  return (
    <div className={cn('relative', className)}>
      <input
        type="file"
        onChange={handleFileChange}
        accept={acceptedTypes?.join(',')}
        disabled={isUploading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
      {children || (
        <div className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          isUploading ? 'border-gray-700 bg-gray-800/50' : 'border-gray-700 hover:border-red-500'
        )}>
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-red-500" />
              <p className="text-sm text-gray-400">Uploading... {progress}%</p>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 mx-auto mb-4 text-gray-400" />
              <p className="text-sm text-gray-400">
                Click or drag file to upload
              </p>
              {maxSize && (
                <p className="text-xs text-gray-500 mt-2">
                  Max size: {(maxSize / (1024 * 1024)).toFixed(0)}MB
                </p>
              )}
            </>
          )}
        </div>
      )}
      {error && (
        <div className="mt-2 p-2 bg-red-500/10 border border-red-500 rounded text-sm text-red-500">
          {error.message}
        </div>
      )}
    </div>
  );
};

interface CloudinaryImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  publicId: string;
  transformation?: string[];
  width?: number;
  height?: number;
  quality?: 'auto' | number;
  format?: 'auto' | string;
}

export const CloudinaryImage: React.FC<CloudinaryImageProps> = ({
  publicId,
  transformation,
  width,
  height,
  quality = 'auto',
  format = 'auto',
  alt = '',
  className,
  ...props
}) => {
  const transformations = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);
  if (transformation) transformations.push(...transformation);

  const transformationString = transformations.length > 0 
    ? transformations.join(',') + '/'
    : '';

  const imageUrl = `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/${transformationString}${publicId}`;

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      {...props}
    />
  );
};

interface CloudinaryVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  publicId: string;
  transformation?: string[];
  format?: string;
  quality?: string;
  streaming?: boolean;
}

export const CloudinaryVideo: React.FC<CloudinaryVideoProps> = ({
  publicId,
  transformation,
  format,
  quality = 'auto',
  streaming = true,
  className,
  ...props
}) => {
  const transformations = [];

  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);
  if (streaming) transformations.push('sp_auto');
  if (transformation) transformations.push(...transformation);

  const transformationString = transformations.length > 0 
    ? transformations.join(',') + '/'
    : '';

  const videoUrl = `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/video/upload/${transformationString}${publicId}`;

  return (
    <video
      src={videoUrl}
      className={className}
      {...props}
    />
  );
};