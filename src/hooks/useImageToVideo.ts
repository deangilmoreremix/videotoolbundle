import { useState, useCallback } from 'react';
import { ImageToVideoSettings, MotionKeyframe } from '../types/imageToVideo';
import { uploadToCloudinary } from '../lib/cloudinary';

interface UseImageToVideoReturn {
  images: File[];
  settings: ImageToVideoSettings;
  progress: number;
  status: 'idle' | 'processing' | 'completed' | 'error';
  addImages: (files: File[]) => void;
  removeImage: (index: number) => void;
  reorderImages: (fromIndex: number, toIndex: number) => void;
  updateSettings: (updates: Partial<ImageToVideoSettings>) => void;
  addMotionKeyframe: (keyframe: MotionKeyframe) => void;
  removeMotionKeyframe: (index: number) => void;
  generateVideo: () => Promise<string>;
}

export const useImageToVideo = (): UseImageToVideoReturn => {
  const [images, setImages] = useState<File[]>([]);
  const [settings, setSettings] = useState<ImageToVideoSettings>({
    duration: 5,
    fps: 30,
    transition: {
      type: 'fade',
      duration: 0.5,
      easing: 'ease-in-out'
    },
    motion: {
      enabled: false,
      type: 'pan',
      path: [],
      speed: 1,
      smoothing: 50
    },
    audio: {
      enabled: false,
      volume: 100,
      fadeIn: false,
      fadeOut: false,
      loop: false,
      trim: { start: 0, end: 0 }
    },
    effects: {
      colorGrading: {
        enabled: false,
        brightness: 0,
        contrast: 0,
        saturation: 0,
        temperature: 0,
        tint: 0
      },
      filters: [],
      overlays: [],
      text: []
    },
    output: {
      format: 'mp4',
      quality: 'auto',
      resolution: {
        width: 1920,
        height: 1080
      },
      aspectRatio: '16:9'
    }
  });
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');

  const addImages = useCallback((files: File[]) => {
    setImages(prev => [...prev, ...files]);
  }, []);

  const removeImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const reorderImages = useCallback((fromIndex: number, toIndex: number) => {
    setImages(prev => {
      const newImages = [...prev];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return newImages;
    });
  }, []);

  const updateSettings = useCallback((updates: Partial<ImageToVideoSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const addMotionKeyframe = useCallback((keyframe: MotionKeyframe) => {
    setSettings(prev => ({
      ...prev,
      motion: {
        ...prev.motion,
        path: [...prev.motion.path, keyframe]
      }
    }));
  }, []);

  const removeMotionKeyframe = useCallback((index: number) => {
    setSettings(prev => ({
      ...prev,
      motion: {
        ...prev.motion,
        path: prev.motion.path.filter((_, i) => i !== index)
      }
    }));
  }, []);

  const generateVideo = useCallback(async () => {
    try {
      setStatus('processing');
      setProgress(0);

      // Upload all images to Cloudinary
      const uploadedImages = await Promise.all(
        images.map(async (image, index) => {
          const result = await uploadToCloudinary(image);
          setProgress((index + 1) / images.length * 50);
          return result.public_id;
        })
      );

      // Build transformation string based on settings
      const transformations = [];

      // Add motion effects
      if (settings.motion.enabled) {
        transformations.push(`e_${settings.motion.type}`);
      }

      // Add transitions
      transformations.push(`e_transition:${settings.transition.type}:${settings.transition.duration * 1000}`);

      // Add color grading
      if (settings.effects.colorGrading.enabled) {
        const { brightness, contrast, saturation } = settings.effects.colorGrading;
        transformations.push(`e_brightness:${brightness},e_contrast:${contrast},e_saturation:${saturation}`);
      }

      // Add output settings
      transformations.push(
        `w_${settings.output.resolution.width},h_${settings.output.resolution.height}`,
        `fps_${settings.fps}`,
        `q_${settings.output.quality}`
      );

      // Create video URL with all transformations
      const videoUrl = `https://res.cloudinary.com/${process.env.VITE_CLOUDINARY_CLOUD_NAME}/video/upload/${
        transformations.join(',')
      }/${uploadedImages.join(';')}.${settings.output.format}`;

      setProgress(100);
      setStatus('completed');

      return videoUrl;
    } catch (error) {
      setStatus('error');
      throw error;
    }
  }, [images, settings]);

  return {
    images,
    settings,
    progress,
    status,
    addImages,
    removeImage,
    reorderImages,
    updateSettings,
    addMotionKeyframe,
    removeMotionKeyframe,
    generateVideo
  };
};