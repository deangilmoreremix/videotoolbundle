export interface ProcessingStatus {
  status: 'idle' | 'processing' | 'completed' | 'error';
  progress: number;
  message?: string;
  error?: string;
}

export interface VideoMetadata {
  width: number;
  height: number;
  duration: number;
  fps: number;
  hasAudio: boolean;
  format: string;
  size: number;
}

export interface FileUploadProps {
  accept: Record<string, string[]>;
  maxSize: number;
  onUpload: (file: File) => void;
  isUploading?: boolean;
}

export interface ToolLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export interface VideoPreviewProps {
  file: File;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  poster?: string;
}