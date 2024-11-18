export interface ImageToVideoSettings {
  // Basic settings
  duration: number;
  fps: number;

  // Advanced Motion
  motion: {
    enabled: boolean;
    type: 'kenBurns' | 'parallax' | '3d' | 'custom';
    kenBurns?: {
      scale: number;
      pan: {
        x: number;
        y: number;
      };
      rotation: number;
    };
    parallax?: {
      depth: number;
      perspective: number;
      layers: number;
    };
    perspective3d?: {
      rotationX: number;
      rotationY: number;
      rotationZ: number;
      depth: number;
    };
    customPath?: {
      points: MotionPoint[];
      easing: string;
      tension: number;
    };
  };

  // Visual Effects
  effects: {
    aiEnhancement: {
      enabled: boolean;
      strength: number;
      mode: 'auto' | 'custom';
      parameters?: {
        sharpness: number;
        denoise: number;
        clarity: number;
      };
    };
    colorGrading: {
      enabled: boolean;
      brightness: number;
      contrast: number;
      saturation: number;
      temperature: number;
      tint: number;
      highlights: number;
      shadows: number;
      vibrance: number;
    };
    filters: {
      type: string;
      intensity: number;
      blend: number;
    }[];
    vignette: {
      enabled: boolean;
      intensity: number;
      feather: number;
      color: string;
    };
    blur: {
      enabled: boolean;
      type: 'gaussian' | 'radial' | 'motion';
      amount: number;
      region?: string;
    };
  };

  // Audio
  audio: {
    enabled: boolean;
    tracks: AudioTrack[];
    masterVolume: number;
    normalization: {
      enabled: boolean;
      targetLevel: number;
      peakLimit: number;
    };
    ducking: {
      enabled: boolean;
      threshold: number;
      reduction: number;
      attack: number;
      release: number;
    };
  };

  // Text and Graphics
  overlays: {
    text: TextOverlay[];
    images: ImageOverlay[];
    shapes: ShapeOverlay[];
    lowerThirds: LowerThird[];
  };

  // Output
  output: {
    format: 'mp4' | 'webm' | 'gif';
    quality: 'auto' | 'best' | 'good' | 'eco';
    resolution: {
      width: number;
      height: number;
    };
    aspectRatio: '16:9' | '4:3' | '1:1' | '9:16';
    bitrate?: number;
    codec?: string;
  };
}

export interface MotionPoint {
  x: number;
  y: number;
  z?: number;
  time: number;
  easing?: string;
}

export interface AudioTrack {
  id: string;
  type: 'music' | 'sfx' | 'voice';
  source: File | string;
  volume: number;
  fadeIn?: {
    duration: number;
    curve: string;
  };
  fadeOut?: {
    duration: number;
    curve: string;
  };
  trim?: {
    start: number;
    end: number;
  };
  loop?: boolean;
  eq?: {
    low: number;
    mid: number;
    high: number;
  };
}

export interface TextOverlay {
  id: string;
  text: string;
  style: {
    fontFamily: string;
    fontSize: number;
    color: string;
    bold: boolean;
    italic: boolean;
    alignment: 'left' | 'center' | 'right';
    effects: {
      glow?: {
        color: string;
        radius: number;
      };
      shadow?: {
        color: string;
        blur: number;
        offset: { x: number; y: number };
      };
      outline?: {
        color: string;
        width: number;
      };
    };
  };
  position: {
    x: number;
    y: number;
    z?: number;
  };
  animation: {
    type: 'fade' | 'slide' | 'typewriter' | 'scale' | 'custom';
    duration: number;
    delay: number;
    easing: string;
    keyframes?: AnimationKeyframe[];
  };
}

export interface ImageOverlay {
  id: string;
  source: File | string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  opacity: number;
  blendMode: string;
  mask?: string;
  animation?: {
    type: string;
    duration: number;
    keyframes: AnimationKeyframe[];
  };
}

export interface ShapeOverlay {
  id: string;
  type: 'rectangle' | 'circle' | 'polygon';
  style: {
    fill: string;
    stroke: string;
    strokeWidth: number;
    opacity: number;
  };
  points: number[];
  animation?: {
    type: string;
    duration: number;
    keyframes: AnimationKeyframe[];
  };
}

export interface LowerThird {
  id: string;
  title: string;
  subtitle?: string;
  style: 'modern' | 'minimal' | 'corporate' | 'custom';
  colors: {
    background: string;
    text: string;
    accent: string;
  };
  animation: {
    in: string;
    out: string;
    duration: number;
  };
  timing: {
    start: number;
    duration: number;
  };
}

export interface AnimationKeyframe {
  time: number;
  properties: {
    [key: string]: number | string;
  };
  easing?: string;
}