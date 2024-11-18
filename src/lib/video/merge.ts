import { MergeSettings, MergeResult } from '../../types/merge';
import { uploadToCloudinary } from '../cloudinary';

export const mergeVideos = async (
  settings: MergeSettings,
  onProgress?: (progress: number) => void
): Promise<MergeResult> => {
  try {
    // Upload all videos
    const uploadedVideos = await Promise.all(
      settings.files.map(async (file, index) => {
        const result = await uploadToCloudinary(file);
        if (onProgress) {
          onProgress(20 + ((index + 1) / settings.files.length) * 40);
        }
        return result.public_id;
      })
    );

    // Build concatenation transformation
    const concatenateUrl = uploadedVideos.reduce((url, videoId, index) => {
      if (index === 0) return url;
      return url + `/fl_splice,l_video:${videoId}`;
    }, `https://res.cloudinary.com/${process.env.VITE_CLOUDINARY_CLOUD_NAME}/video/upload/fl_splice/${uploadedVideos[0]}`);

    // Calculate total duration
    const totalDuration = await calculateTotalDuration(settings.files);

    return {
      url: concatenateUrl,
      duration: totalDuration,
      size: 0, // This would need to be calculated from the actual response
      segmentCount: settings.files.length
    };
  } catch (error) {
    throw new Error(`Failed to merge videos: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const calculateTotalDuration = async (files: File[]): Promise<number> => {
  const durations = await Promise.all(
    files.map(file => getVideoDuration(file))
  );
  return durations.reduce((total, duration) => total + duration, 0);
};

const getVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      resolve(video.duration);
    };
    
    video.onerror = () => {
      reject(new Error('Failed to load video metadata'));
    };
    
    video.src = URL.createObjectURL(file);
  });
};