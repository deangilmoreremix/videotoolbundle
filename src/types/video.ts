export interface GifSettings {
  width: number;
  height: number;
  fps: number;
  startTime: number;
  duration: number;
  quality: number;
  optimization: {
    enabled: boolean;
    colorReduction: number;
    dithering: boolean;
    lossy: number;
  };
  aiEnhancement: {
    enabled: boolean;
    mode: 'quality' | 'performance' | 'balanced';
    preserveMotion: boolean;
    smartFrames: boolean;
  };
  effects: {
    loop: boolean;
    boomerang: boolean;
    reverse: boolean;
    fadeIn: boolean;
    fadeOut: boolean;
  };
}

export interface VideoTransformations {
  quality?: string;
  format?: string;
  width?: number;
  height?: number;
  bitrate?: number;
  audio?: {
    enabled: boolean;
    bitrate?: number;
  };
}

export interface VideoEffect {
  type: string;
  params: Record<string, any>;
  startTime?: number;
  endTime?: number;
  layer?: number;
}

export interface VideoMetadata {
  duration: number;
  dimensions: {
    width: number;
    height: number;
  };
  fps: number;
  bitrate: number;
  format: string;
  audioTracks: AudioTrack[];
  chapters?: Chapter[];
}

export interface AudioTrack {
  id: string;
  language?: string;
  channels: number;
  sampleRate: number;
  bitrate: number;
}

export interface Chapter {
  title: string;
  startTime: number;
  endTime: number;
  thumbnail?: string;
}

export interface RenderProgress {
  stage: string;
  progress: number;
  timeRemaining?: number;
  currentFrame?: number;
  totalFrames?: number;
  error?: string;
}

export interface VideoAsset {
  id: string;
  type: 'video' | 'image' | 'audio';
  url: string;
  duration?: number;
  thumbnail?: string;
  metadata?: VideoMetadata;
}