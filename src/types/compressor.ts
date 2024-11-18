export interface CompressionSettings {
  quality: 'auto' | 'best' | 'good' | 'eco';
  format: 'mp4' | 'webm';
  resolution: {
    width: number;
    height: number;
    maintain: boolean;
  };
  bitrate: {
    target: number;
    maximum: number;
  };
  audio: {
    enabled: boolean;
    quality: 'high' | 'medium' | 'low';
    bitrate: number;
  };
}

export interface CompressionResult {
  url: string;
  size: number;
  duration: number;
  resolution: {
    width: number;
    height: number;
  };
  format: string;
  bitrate: number;
}

export interface CompressionPreviewProps {
  file: File;
  settings: CompressionSettings;
  className?: string;
}

export interface CompressionSettingsPanelProps {
  settings: CompressionSettings;
  onChange: (settings: CompressionSettings) => void;
}