import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import VideoMerge from '../../components/video/VideoMerge';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/ui/Button';

const VideoMergePage = () => {
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const { addToast } = useToast();

  const handleMergeComplete = (url: string) => {
    setResultUrl(url);
    addToast({
      title: 'Videos merged successfully',
      type: 'success'
    });
  };

  return (
    <ToolLayout
      title="Video Merger"
      description="Combine multiple videos into a single video file"
    >
      <div className="space-y-8">
        <VideoMerge onMergeComplete={handleMergeComplete} />

        {resultUrl && (
          <div className="text-center space-y-4">
            <div className="max-w-2xl mx-auto border border-gray-800 rounded-lg overflow-hidden">
              <video 
                src={resultUrl} 
                controls 
                className="w-full"
                poster={resultUrl.replace(/\.[^/.]+$/, '.jpg')}
              />
            </div>
            <div className="flex justify-center gap-4">
              <Button as="a" href={resultUrl} download>
                Download Merged Video
              </Button>
              <Button
                variant="outline"
                onClick={() => setResultUrl(null)}
              >
                Merge More Videos
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default VideoMergePage;