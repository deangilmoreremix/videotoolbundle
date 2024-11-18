import React from 'react';
import { ArrowUp, ArrowDown, X } from 'lucide-react';
import VideoPreview from './VideoPreview';

interface VideoFile {
  id: string;
  file: File;
  preview?: string;
}

interface VideoListProps {
  videos: VideoFile[];
  onRemove: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  previewIndex: number | null;
  isPlaying: boolean;
  onTogglePreview: (index: number) => void;
}

const VideoList: React.FC<VideoListProps> = ({
  videos,
  onRemove,
  onMove,
  previewIndex,
  isPlaying,
  onTogglePreview
}) => {
  return (
    <div className="space-y-2">
      {videos.map((video, index) => (
        <div 
          key={video.id}
          className="flex items-center gap-4 bg-gray-800 rounded-lg p-3"
        >
          <VideoPreview
            src={video.preview}
            isPlaying={previewIndex === index && isPlaying}
            onTogglePlay={() => onTogglePreview(index)}
          />

          <div className="flex-1">
            <p className="font-medium truncate">{video.file.name}</p>
            <p className="text-sm text-gray-400">
              {(video.file.size / (1024 * 1024)).toFixed(1)} MB
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onMove(video.id, 'up')}
              disabled={index === 0}
              className="p-1 hover:bg-gray-700 rounded disabled:opacity-50"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => onMove(video.id, 'down')}
              disabled={index === videos.length - 1}
              className="p-1 hover:bg-gray-700 rounded disabled:opacity-50"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => onRemove(video.id)}
              className="p-1 hover:bg-gray-700 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoList;