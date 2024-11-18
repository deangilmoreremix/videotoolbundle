import React from 'react';
import { GifSettings } from '../../types/video';

interface GifPreviewProps {
  file: File;
  settings: GifSettings;
  className?: string;
}

const GifPreview: React.FC<GifPreviewProps> = ({ file, settings, className = '' }) => {
  const videoUrl = URL.createObjectURL(file);

  return (
    <div className={`relative ${className}`}>
      <video
        src={videoUrl}
        className="w-full rounded-lg"
        controls
        style={{
          maxWidth: settings.width ? `${settings.width}px` : undefined,
          maxHeight: settings.height ? `${settings.height}px` : undefined
        }}
      />
      
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2">
        <div className="flex justify-between">
          <span>
            Size: {settings.width}x{settings.height}
          </span>
          <span>FPS: {settings.fps}</span>
          <span>
            Duration: {settings.duration}s
          </span>
        </div>
      </div>
    </div>
  );
};

export default GifPreview;