export interface MergeSettings {
  files: File[];
  transitions: {
    type: 'fade' | 'dissolve' | 'none';
    duration: number;
  }[];
  output: {
    format: 'mp4' | 'webm';
    quality: 'auto' | 'best' | 'good' | 'eco';
    resolution: {
      width: number;
      height: number;
      maintain: boolean;
    };
  };
}

export interface MergeResult {
  url: string;
  duration: number;
  size: number;
  segmentCount: number;
}

export interface MergePreviewProps {
  files: File[];
  settings: MergeSettings;
  className?: string;
}

export interface MergeSettingsPanelProps {
  settings: MergeSettings;
  onChange: (settings: MergeSettings) => void;
}

export interface VideoSegmentProps {
  file: File;
  index: number;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}