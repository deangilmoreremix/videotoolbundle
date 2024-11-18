import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';

const SpeedVideo = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState<number>(1);
  const [resultUrl, setResultUrl] = useState<string>('');
  const { addToast } = useToast();

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const handleSpeedChange = async () => {
    if (!file) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      const result = await uploadToCloudinary(file);
      setProgress(60);

      // Apply speed transformation
      // For speed > 1, we're speeding up (e.g., 2x means accelerate by 200%)
      // For speed < 1, we're slowing down (e.g., 0.5x means decelerate by 50%)
      const acceleration = speed >= 1 ? speed * 100 : (1 / speed) * -100;
      const processedUrl = result.secure_url.replace(
        '/upload/',
        `/upload/e_acceleration:${acceleration}/`
      );
      
      setResultUrl(processedUrl);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Video speed adjusted successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Speed adjustment failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  return (
    <ToolLayout
      title="Speed Video"
      description="Adjust the playback speed of your videos with precision"
    >
      <div className="space-y-8">
        <FileUpload
          accept={{ 'video/*': ['.mp4', '.mov', '.avi'] }}
          onUpload={handleUpload}
          maxSize={100 * 1024 * 1024} // 100MB limit
        />
        
        {file && status === 'idle' && (
          <div className="space-y-6">
            <div className="max-w-md mx-auto">
              <label className="block text-sm font-medium mb-2">
                Playback Speed: {speed}x
              </label>
              <div className="space-y-4">
                <input
                  type="range"
                  min="0.25"
                  max="4"
                  step="0.25"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full accent-red-500"
                />
                <div className="flex justify-between text-sm text-gray-400">
                  <span>0.25x (Slower)</span>
                  <span>1x (Normal)</span>
                  <span>4x (Faster)</span>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="mb-4">Selected file: {file.name}</p>
              <Button onClick={handleSpeedChange}>Adjust Speed</Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus status="processing" progress={progress} />
        )}
        
        {status === 'completed' && resultUrl && (
          <div className="text-center space-y-4">
            <p className="text-green-500 mb-4">Speed adjustment completed!</p>
            <div className="max-w-2xl mx-auto border border-gray-800 rounded-lg overflow-hidden">
              <video 
                src={resultUrl} 
                controls 
                className="w-full"
                poster={resultUrl.replace('.mp4', '.jpg')}
              />
            </div>
            <Button as="a" href={resultUrl} download>
              Download Modified Video
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default SpeedVideo;