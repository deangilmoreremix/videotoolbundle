import { Cloudinary } from '@cloudinary/url-gen';

const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME || 'dlkc1izl7';
const apiKey = process.env.VITE_CLOUDINARY_API_KEY;
const apiSecret = process.env.VITE_CLOUDINARY_API_SECRET;
const uploadPreset = 'VideoRemix App';

export const cld = new Cloudinary({
  cloud: {
    cloudName,
  }
});

export const uploadToCloudinary = async (file: File): Promise<{ public_id: string; secure_url: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('cloud_name', cloudName);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  return response.json();
};

export const getVideoUrl = (publicId: string, transformation: string = ''): string => {
  return `https://res.cloudinary.com/${cloudName}/video/upload/${transformation}/${publicId}`;
};

export const getImageUrl = (publicId: string, transformation: string = ''): string => {
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${publicId}`;
};