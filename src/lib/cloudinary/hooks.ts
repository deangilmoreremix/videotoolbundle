import { useState, useCallback } from 'react';
import { uploadToCloudinary, deleteResource, getResourceInfo } from './config';

interface UseCloudinaryUploadOptions {
  folder?: string;
  resourceType?: 'image' | 'video' | 'raw';
  transformation?: string;
  eager?: any[];
  maxSize?: number;
  acceptedTypes?: string[];
}

interface UseCloudinaryUploadReturn {
  upload: (file: File) => Promise<{
    public_id: string;
    secure_url: string;
    format: string;
  }>;
  isUploading: boolean;
  progress: number;
  error: Error | null;
  reset: () => void;
}

export const useCloudinaryUpload = (options: UseCloudinaryUploadOptions = {}): UseCloudinaryUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  const upload = useCallback(async (file: File) => {
    try {
      // Validate file size
      if (options.maxSize && file.size > options.maxSize) {
        throw new Error(`File size exceeds ${options.maxSize / (1024 * 1024)}MB limit`);
      }

      // Validate file type
      if (options.acceptedTypes && !options.acceptedTypes.includes(file.type)) {
        throw new Error('File type not supported');
      }

      setIsUploading(true);
      setError(null);

      const result = await uploadToCloudinary(file, {
        ...options,
        onProgress: setProgress
      });

      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Upload failed'));
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, [options]);

  return { upload, isUploading, progress, error, reset };
};

interface UseCloudinaryResourceOptions {
  resourceType?: 'image' | 'video';
  autoLoad?: boolean;
}

interface UseCloudinaryResourceReturn {
  resourceInfo: any;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  remove: () => Promise<void>;
}

export const useCloudinaryResource = (
  publicId: string,
  options: UseCloudinaryResourceOptions = {}
): UseCloudinaryResourceReturn => {
  const [resourceInfo, setResourceInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const info = await getResourceInfo(publicId, options.resourceType);
      setResourceInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load resource info'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [publicId, options.resourceType]);

  const remove = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await deleteResource(publicId, options.resourceType);
      setResourceInfo(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete resource'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [publicId, options.resourceType]);

  React.useEffect(() => {
    if (options.autoLoad) {
      refresh();
    }
  }, [options.autoLoad, refresh]);

  return { resourceInfo, isLoading, error, refresh, remove };
};