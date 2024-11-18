export interface ReverseSettings {
  speed: number;
  preserveAudio: boolean;
  loop: boolean;
  transition: {
    enabled: boolean;
    type: 'fade' | 'dissolve' | 'none';
    duration: number;
  };
}

export interface ReverseResult {
  url: string;
  duration: number;
  size: number;
}

export interface ReversePreviewProps {
  file: File;
  settings: ReverseSettings;
  className?: string;
}

export interface ReverseSettingsPanelProps {
  settings: ReverseSettings;
  onChange: (settings: ReverseSettings) => void;
}