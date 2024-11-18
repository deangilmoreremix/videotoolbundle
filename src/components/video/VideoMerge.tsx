import React, { useState, useCallback } from 'react';
import { Button } from '../ui/Button';
import ProcessingStatus from '../tools/ProcessingStatus';
import VideoUploadArea from './VideoUploadArea';
import { cn } from '../../lib/utils';
import MediaPreview from '../ui/MediaPreview';

interface VideoMergeProps {
  onMergeComplete?: (url: string) => void;
  maxFiles?: number;
  maxFileSize?: number;
  className?: string;
}

interface VideoFile {
  id: string;
  file: File;
}

const VideoMerge: React.FC<VideoMergeProps> = ({
  onMergeComplete,
  maxFiles = 10,
  maxFileSize = 200 * 1024 * 1024,
  className
}) => {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);

  const handleUpload = useCallback((acceptedFiles: File[]) => {
    const newVideos = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file
    }));

    setVideos(prev => {
      const combined = [...prev, ...newVideos];
      return combined.slice(0, maxFiles);
    });
  }, [maxFiles]);

  const removeVideo = (id: string) => {
    setVideos(prev => prev.filter(v => v.id !== id));
  };

  const moveVideo = (id: string, direction: 'up' | 'down') => {
    setVideos(prev => {
      const index = prev.findIndex(v => v.id === id);
      if (
        (direction === 'up' && index === 0) ||
        (direction === 'down' && index === prev.length - 1)
      ) return prev;

      const newVideos = [...prev];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      [newVideos[index], newVideos[newIndex]] = [newVideos[newIndex], newVideos[index]];
      return newVideos;
    });
  };

  return (
    <div className={cn('space-y-6', className)}>
      <VideoUploadArea
        onUpload={handleUpload}
        maxFiles={maxFiles}
        maxFileSize={maxFileSize}
        currentFileCount={videos.length}
      />

      {videos.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Selected Videos ({videos.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((video, index) => (
              <div key={video.id} className="relative">
                <MediaPreview
                  file={video.file}
                  onRemove={() => removeVideo(video.id)}
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => moveVideo(video.id, 'up')}
                    disabled={index === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => moveVideo(video.id, 'down')}
                    disabled={index === videos.length - 1}
                  >
                    ↓
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {status === 'processing' && (
        <ProcessingStatus 
          status="processing" 
          progress={progress}
          message="Merging videos..."
        />
      )}
    </div>
  );
};

export default VideoMerge;