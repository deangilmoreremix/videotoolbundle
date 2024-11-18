import { VideoProcessingResult, GifSettings } from '../../types/video';
import { buildGifTransformations } from './transformations';

export const processVideoToGif = async (
  file: File,
  settings: GifSettings,
  onProgress?: (progress: number) => void
): Promise<VideoProcessingResult> => {
  try {
    // Create video element to get metadata
    const videoMetadata = await getVideoMetadata(file);
    
    // Calculate optimal settings if needed
    const finalSettings = {
      ...settings,
      width: settings.width || videoMetadata.width,
      height: settings.height || videoMetadata.height
    };

    // Validate settings
    const errors = validateSettings(finalSettings);
    if (errors.length > 0) {
      throw new Error(`Invalid settings: ${errors.join(', ')}`);
    }

    // Process the video
    const result = await processVideo(file, finalSettings, onProgress);
    
    return {
      url: result.url,
      format: 'gif',
      width: finalSettings.width!,
      height: finalSettings.height!,
      duration: finalSettings.duration || videoMetadata.duration,
      size: result.size,
      metadata: {
        fps: finalSettings.fps || 30,
        colorDepth: finalSettings.optimization?.colorReduction || 256,
        frameCount: calculateFrameCount(finalSettings)
      }
    };
  } catch (error) {
    throw new Error(`Failed to process video: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const getVideoMetadata = (file: File): Promise<{ width: number; height: number; duration: number }> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration
      });
    };
    
    video.onerror = () => {
      reject(new Error('Failed to load video metadata'));
    };
    
    video.src = URL.createObjectURL(file);
  });
};

const validateSettings = (settings: GifSettings): string[] => {
  const errors: string[] = [];

  if (!settings.width || !settings.height) {
    errors.push('Width and height are required');
  }
  if (settings.width! * settings.height! > 4096 * 4096) {
    errors.push('Image dimensions too large');
  }
  if (settings.duration && settings.duration > 30) {
    errors.push('Maximum duration exceeded (30 seconds)');
  }

  return errors;
};

const calculateFrameCount = (settings: GifSettings): number => {
  const duration = settings.duration || 5;
  const fps = settings.fps || 30;
  let frames = duration * fps;

  if (settings.effects?.boomerang) frames *= 2;
  if (settings.effects?.speedUp) frames = Math.ceil(frames / settings.effects.speedUp);

  return frames;
};

const processVideo = async (
  file: File,
  settings: GifSettings,
  onProgress?: (progress: number) => void
): Promise<{ url: string; size: number }> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.VITE_CLOUDINARY_UPLOAD_PRESET || '');

  const transformations = buildGifTransformations(settings);
  formData.append('transformation', transformations);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.VITE_CLOUDINARY_CLOUD_NAME}/video/upload`,
    {
      method: 'POST',
      body: formData
    }
  );

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  const result = await response.json();
  
  return {
    url: result.secure_url,
    size: result.bytes
  };
};