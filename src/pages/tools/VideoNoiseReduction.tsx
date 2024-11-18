import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';

interface NoiseSettings {
  intensity: number;
  type: 'spatial' | 'temporal' | 'both';
  preserveDetails: boolean;
}

const VideoNoiseReduction = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [settings, setSettings] = useState<NoiseSettings>({
    intensity: 50,
    type: 'both',
    preserveDetails: true
  });
  const { addToast } = useToast();

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const handleReduceNoise = async () => {
    if (!file) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      const result = await uploadToCloudinary(file);
      setProgress(60);

      // Apply noise reduction transformation
      const transformations = [
        `e_noise_reduction:${settings.intensity}`,
        settings.type !== 'both' && `e_noise_type:${settings.type}`,
        settings.preserveDetails && 'e_preserve_details'
      ].filter(Boolean).join(',');

      const processedUrl = result.secure_url.replace(
        '/upload/',
        `/upload/${transformations}/`
      );
      
      setResultUrl(processedUrl);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Noise reduction completed successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Noise reduction failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  return (
    <ToolLayout
      title="Video Noise Reduction"
      description="Remove unwanted noise and grain from your videos using AI"
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
                  Noise Reduction Intensity: {settings.intensity}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={settings.intensity}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    intensity: Number(e.target.value)
                  }))}
                  className="w-full accent-red-500"
                />
                <div className="flex justify-between text-sm text-gray-400 mt-1">
                  <span>Subtle</span>
                  <span>Aggressive</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Noise Reduction Type</label>
                <div className="grid grid-cols-3 gap-4">
                  {(['spatial', 'temporal', 'both'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setSettings(prev => ({ ...prev, type }))}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        settings.type === type 
                          ? 'border-red-500 bg-red-500/10' 
                          : 'border-gray-700 hover:border-red-500'
                      }`}
                    >
                      <div className="text-lg font-bold mb-1 capitalize">{type}</div>
                      <div className="text-sm text-gray-400">
                        {type === 'spatial' && 'Frame by frame'}
                        {type === 'temporal' && 'Across frames'}
                        {type === 'both' && 'Combined approach'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="preserveDetails"
                  checked={settings.preserveDetails}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    preserveDetails: e.target.checked
                  }))}
                  className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                />
                <label htmlFor="preserveDetails" className="text-sm">
                  Preserve fine details and textures
                </label>
              </div>
            </div>
            
            <div className="text-center">
              <Button onClick={handleReduceNoise}>Reduce Noise</Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Analyzing and reducing video noise..."
          />
        )}
        
        {status === 'completed' && resultUrl && (
          <div className="text-center space-y-4">
            <p className="text-green-500 mb-4">Noise reduction completed!</p>
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
                <h4 className="text-sm font-medium p-2 bg-gray-800">Noise Reduced</h4>
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
                Download Video
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
                Process Another Video
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default VideoNoiseReduction;