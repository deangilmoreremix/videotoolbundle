export interface GifSettings {
  width: number;
  height: number;
  fps: number;
  quality: number;
  startTime: number;
  duration: number;
  loop: boolean;
  loopCount: number;
  optimization: {
    enabled: boolean;
    colorReduction: number;
    dithering: boolean;
    lossy: number;
  };
  effects: {
    reverse: boolean;
    boomerang: boolean;
    speedUp: number;
    fadeIn: boolean;
    fadeOut: boolean;
  };
}

export interface GifResult {
  url: string;
  width: number;
  height: number;
  duration: number;
  size: number;
  metadata: {
    fps: number;
    colorDepth: number;
    frameCount: number;
  };
}

export interface GifPreviewProps {
  file: File;
  settings: GifSettings;
  className?: string;
}

export interface GifSettingsPanelProps {
  settings: GifSettings;
  onChange: (settings: GifSettings) => void;
}