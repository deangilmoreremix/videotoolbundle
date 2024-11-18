import { v2 as cloudinary } from '@cloudinary/url-gen';

// Initialize Cloudinary configuration
const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error('Missing Cloudinary configuration. Please check your environment variables.');
}

// Configure Cloudinary instance
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true
});

// Upload function with progress tracking
export const uploadToCloudinary = async (
  file: File,
  options: {
    onProgress?: (progress: number) => void;
    folder?: string;
    resourceType?: 'image' | 'video' | 'raw';
    transformation?: string;
    eager?: any[];
  } = {}
): Promise<{
  public_id: string;
  secure_url: string;
  format: string;
  resource_type: string;
  eager?: any[];
}> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'ml_default');
  
  if (options.folder) {
    formData.append('folder', options.folder);
  }
  
  if (options.transformation) {
    formData.append('transformation', options.transformation);
  }
  
  if (options.eager) {
    formData.append('eager', JSON.stringify(options.eager));
  }

  const xhr = new XMLHttpRequest();
  
  const uploadPromise = new Promise<any>((resolve, reject) => {
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/${options.resourceType || 'auto'}/upload`);
    
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && options.onProgress) {
        const progress = Math.round((e.loaded / e.total) * 100);
        options.onProgress(progress);
      }
    };
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve(response);
      } else {
        reject(new Error('Upload failed'));
      }
    };
    
    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.send(formData);
  });

  return uploadPromise;
};

// Generate optimized URL with transformations
export const buildUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: 'auto' | number;
    format?: 'auto' | string;
    effect?: string;
    transformation?: string[];
  } = {}
): string => {
  const transformations = [];

  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.crop) transformations.push(`c_${options.crop}`);
  if (options.quality) transformations.push(`q_${options.quality}`);
  if (options.format) transformations.push(`f_${options.format}`);
  if (options.effect) transformations.push(`e_${options.effect}`);
  if (options.transformation) transformations.push(...options.transformation);

  const transformationString = transformations.length > 0 
    ? transformations.join(',') + '/'
    : '';

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformationString}${publicId}`;
};

// Generate video URL with transformations
export const buildVideoUrl = (
  publicId: string,
  options: {
    transformation?: string[];
    format?: string;
    quality?: string;
    streaming?: boolean;
  } = {}
): string => {
  const transformations = [];

  if (options.transformation) transformations.push(...options.transformation);
  if (options.format) transformations.push(`f_${options.format}`);
  if (options.quality) transformations.push(`q_${options.quality}`);
  if (options.streaming) transformations.push('sp_auto');

  const transformationString = transformations.length > 0 
    ? transformations.join(',') + '/'
    : '';

  return `https://res.cloudinary.com/${cloudName}/video/upload/${transformationString}${publicId}`;
};

// Delete resource from Cloudinary
export const deleteResource = async (publicId: string, resourceType: 'image' | 'video' = 'image'): Promise<void> => {
  const formData = new FormData();
  formData.append('public_id', publicId);
  formData.append('api_key', apiKey);
  
  const timestamp = Math.round((new Date()).getTime() / 1000);
  formData.append('timestamp', timestamp.toString());
  
  const signature = cloudinary.utils.api_sign_request(
    { public_id: publicId, timestamp },
    apiSecret
  );
  formData.append('signature', signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`,
    {
      method: 'POST',
      body: formData
    }
  );

  if (!response.ok) {
    throw new Error('Failed to delete resource');
  }
};

// Get resource info
export const getResourceInfo = async (publicId: string, resourceType: 'image' | 'video' = 'image'): Promise<any> => {
  const timestamp = Math.round((new Date()).getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { public_id: publicId, timestamp },
    apiSecret
  );

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/resources/${resourceType}/${publicId}?api_key=${apiKey}&timestamp=${timestamp}&signature=${signature}`
  );

  if (!response.ok) {
    throw new Error('Failed to get resource info');
  }

  return response.json();
};

export { cloudinary };