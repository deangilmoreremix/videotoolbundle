import React from 'react';
import { Play, Pause, Video as VideoIcon } from 'lucide-react';

interface VideoPreviewProps {
  src?: string;
  isPlaying: boolean;
  onTogglePlay: () => void;
  className?: string;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({
  src,
  isPlaying,
  onTogglePlay,
  className = ''
}) => {
  return (
    <div className={`relative w-32 h-20 bg-gray-900 rounded overflow-hidden ${className}`}>
      {src ? (
        <video
          src={src}
          className="w-full h-full object-cover"
          autoPlay={isPlaying}
          loop
          muted
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <VideoIcon className="w-8 h-8 text-gray-600" />
        </div>
      )}
      <button
        onClick={onTogglePlay}
        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity"
      >
        {isPlaying ? (
          <Pause className="w-8 h-8" />
        ) : (
          <Play className="w-8 h-8" />
        )}
      </button>
    </div>
  );
};

export default VideoPreview;