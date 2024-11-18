export interface TrimSettings {
  startTime: number;
  endTime: number;
  transition: {
    enabled: boolean;
    type: 'fade' | 'dissolve' | 'none';
    duration: number;
  };
  preserveAudio: boolean;
}

export interface TrimResult {
  url: string;
  duration: number;
  size: number;
  startTime: number;
  endTime: number;
}

export interface TrimPreviewProps {
  file: File;
  settings: TrimSettings;
  className?: string;
}

export interface TrimSettingsPanelProps {
  settings: TrimSettings;
  onChange: (settings: TrimSettings) => void;
  duration: number;
}