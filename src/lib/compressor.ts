import { CompressionSettings, CompressionResult } from '../types/compressor';

export const buildCompressionTransformations = (settings: CompressionSettings): string => {
  const transformations: string[] = [];

  // Quality and format
  transformations.push(`q_${settings.quality}`);
  transformations.push(`f_${settings.format}`);

  // Resolution
  if (settings.resolution.maintain) {
    transformations.push('c_scale');
  } else {
    transformations.push('c_fill');
  }
  if (settings.resolution.width) transformations.push(`w_${settings.resolution.width}`);
  if (settings.resolution.height) transformations.push(`h_${settings.resolution.height}`);

  // Bitrate
  if (settings.bitrate.target) {
    transformations.push(`br_${settings.bitrate.target}k`);
  }
  if (settings.bitrate.maximum) {
    transformations.push(`br_max_${settings.bitrate.maximum}k`);
  }

  // Audio settings
  if (!settings.audio.enabled) {
    transformations.push('ac_none');
  } else {
    transformations.push(`ac_${settings.audio.quality}`);
    if (settings.audio.bitrate) {
      transformations.push(`ab_${settings.audio.bitrate}k`);
    }
  }

  return transformations.join(',');
};

export const calculateOptimalBitrate = (width: number, height: number, duration: number): number => {
  const pixels = width * height;
  const baseRate = 1000; // 1Mbps base rate
  
  if (pixels <= 921600) { // 1280x720
    return baseRate;
  } else if (pixels <= 2073600) { // 1920x1080
    return baseRate * 2;
  } else {
    return baseRate * 4;
  }
};

export const validateCompressionSettings = (settings: CompressionSettings): string[] => {
  const errors: string[] = [];

  if (settings.resolution.width && settings.resolution.width < 1) {
    errors.push('Width must be greater than 0');
  }
  if (settings.resolution.height && settings.resolution.height < 1) {
    errors.push('Height must be greater than 0');
  }
  if (settings.bitrate.target && settings.bitrate.target < 100) {
    errors.push('Target bitrate must be at least 100 kbps');
  }
  if (settings.bitrate.maximum && settings.bitrate.maximum < settings.bitrate.target) {
    errors.push('Maximum bitrate must be greater than target bitrate');
  }

  return errors;
};