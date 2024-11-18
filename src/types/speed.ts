export interface SpeedSettings {
  rate: number;
  preservePitch: boolean;
  smoothing: boolean;
  transition: {
    enabled: boolean;
    type: 'fade' | 'dissolve' | 'none';
    duration: number;
  };
}

export interface SpeedResult {
  url: string;
  duration: number;
  size: number;
  originalDuration: number;
}

export interface SpeedPreviewProps {
  file: File;
  settings: SpeedSettings;
  className?: string;
}

export interface SpeedSettingsPanelProps {
  settings: SpeedSettings;
  onChange: (settings: SpeedSettings) => void;
}