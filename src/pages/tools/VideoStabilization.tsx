import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';

interface StabilizationSettings {
  strength: number;
  smoothing: number;
  cropMargin: number;
  preserveQuality: boolean;
}

const VideoStabilization = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [settings, setSettings] = useState<StabilizationSettings>({
    strength: 50,
    smoothing: 50,
    cropMargin: 10,
    preserveQuality: true
  });
  const { addToast } = useToast();

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const handleStabilize = async () => {
    if (!file) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      const result = await uploadToCloudinary(file);
      setProgress(60);

      // Apply stabilization transformation
      const transformations = [
        `e_stabilize:${settings.strength}`,
        `e_stabilize_smooth:${settings.smoothing}`,
        `c_crop,w_${100 - settings.cropMargin}p,h_${100 - settings.cropMargin}p`,
        settings.preserveQuality && 'q_100'
      ].filter(Boolean).join(',');

      const processedUrl = result.secure_url.replace(
        '/upload/',
        `/upload/${transformations}/`
      );
      
      setResultUrl(processedUrl);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Video stabilized successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Stabilization failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  return (
    <ToolLayout
      title="Video Stabilization"
      description="Stabilize shaky videos using AI-powered motion compensation"
    >
      <div className="space-y-8">
        <FileUpload
          accept={{ 'video/*': ['.mp4', '.mov', '.avi', '.webm'] }}
          onUpload={handleUpload}
          maxSize={200 * 1024 * 1024} // 200MB limit
        />
        
        {file && status === 'idle' && (
          <div className="space-y-6">
            <div className="max-w-xl mx-auto space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Stabilization Strength: {settings.strength}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={settings.strength}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    strength: Number(e.target.value)
                  }))}
                  className="w-full accent-red-500"
                />
                <div className="flex justify-between text-sm text-gray-400 mt-1">
                  <span>Subtle</span>
                  <span>Aggressive</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Motion Smoothing: {settings.smoothing}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={settings.smoothing}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    smoothing: Number(e.target.value)
                  }))}
                  className="w-full accent-red-500"
                />
                <div className="flex justify-between text-sm text-gray-400 mt-1">
                  <span>Natural</span>
                  <span>Cinematic</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Crop Margin: {settings.cropMargin}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={30}
                  value={settings.cropMargin}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    cropMargin: Number(e.target.value)
                  }))}
                  className="w-full accent-red-500"
                />
                <p className="text-sm text-gray-400 mt-1">
                  Higher values provide more room for stabilization but result in more cropping
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="preserveQuality"
                  checked={settings.preserveQuality}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    preserveQuality: e.target.checked
                  }))}
                  className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                />
                <label htmlFor="preserveQuality" className="text-sm">
                  Preserve original video quality
                </label>
              </div>
            </div>
            
            <div className="text-center">
              <Button onClick={handleStabilize}>Stabilize Video</Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Analyzing motion and stabilizing video..."
          />
        )}
        
        {status === 'completed' && resultUrl && (
          <div className="text-center space-y-4">
            <p className="text-green-500 mb-4">Video stabilized successfully!</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-800 rounded-lg overflow-hidden">
                <h4 className="text-sm font-medium p-2 bg-gray-800">Original</h4>
                <video 
                  src={URL.createObjectURL(file)} 
                  controls 
                  className="w-full"
                />
              </div>
              <div className="border border-gray-800 rounded-lg overflow-hidden">
                <h4 className="text-sm font-medium p-2 bg-gray-800">Stabilized</h4>
                <video 
                  src={resultUrl} 
                  controls 
                  className="w-full"
                  poster={resultUrl.replace(/\.[^/.]+$/, '.jpg')}
                />
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <Button as="a" href={resultUrl} download>
                Download Stabilized Video
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setStatus('idle');
                  setProgress(0);
                  setResultUrl('');
                  setFile(null);
                }}
              >
                Stabilize Another Video
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default VideoStabilization;