import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';

const Blur = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [blurSettings, setBlurSettings] = useState({
    intensity: 500,
    region: 'all',
    customRegion: ''
  });
  const { addToast } = useToast();

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const handleBlur = async () => {
    if (!file) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      const result = await uploadToCloudinary(file);
      setProgress(60);

      // Apply blur transformation based on settings
      let transformation = '';
      if (blurSettings.region === 'all') {
        transformation = `e_blur:${blurSettings.intensity}`;
      } else if (blurSettings.region === 'background') {
        transformation = `e_background_blur:${blurSettings.intensity}`;
      } else if (blurSettings.region === 'custom' && blurSettings.customRegion) {
        transformation = `e_blur:${blurSettings.intensity}/e_region_${blurSettings.customRegion}`;
      }

      const processedUrl = result.secure_url.replace(
        '/upload/',
        `/upload/${transformation}/`
      );
      
      setResultUrl(processedUrl);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Blur effect applied successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Blur application failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  return (
    <ToolLayout
      title="Blur Effect"
      description="Apply customizable blur effects to your images"
    >
      <div className="space-y-8">
        <FileUpload
          accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
          onUpload={handleUpload}
          maxSize={10 * 1024 * 1024} // 10MB limit
        />
        
        {file && status === 'idle' && (
          <div className="space-y-6">
            <div className="max-w-md mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Blur Region</label>
                <select
                  value={blurSettings.region}
                  onChange={(e) => setBlurSettings(prev => ({
                    ...prev,
                    region: e.target.value
                  }))}
                  className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700"
                >
                  <option value="all">Entire Image</option>
                  <option value="background">Background Only</option>
                  <option value="custom">Custom Region</option>
                </select>
              </div>

              {blurSettings.region === 'custom' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Custom Region</label>
                  <textarea
                    value={blurSettings.customRegion}
                    onChange={(e) => setBlurSettings(prev => ({
                      ...prev,
                      customRegion: e.target.value
                    }))}
                    placeholder="Describe the region to blur (e.g., 'face', 'top_left')"
                    className="w-full h-24 bg-gray-800 rounded-lg px-4 py-3 border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Blur Intensity: {blurSettings.intensity}
                </label>
                <input
                  type="range"
                  min={0}
                  max={2000}
                  value={blurSettings.intensity}
                  onChange={(e) => setBlurSettings(prev => ({
                    ...prev,
                    intensity: Number(e.target.value)
                  }))}
                  className="w-full accent-red-500"
                />
                <div className="flex justify-between text-sm text-gray-400 mt-1">
                  <span>Subtle</span>
                  <span>Medium</span>
                  <span>Strong</span>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="mb-4">Selected file: {file.name}</p>
              <Button 
                onClick={handleBlur}
                disabled={blurSettings.region === 'custom' && !blurSettings.customRegion}
              >
                Apply Blur
              </Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Applying blur effect..."
          />
        )}
        
        {status === 'completed' && resultUrl && (
          <div className="text-center space-y-4">
            <p className="text-green-500 mb-4">Blur effect applied successfully!</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-800 rounded-lg overflow-hidden">
                <h4 className="text-sm font-medium p-2 bg-gray-800">Original</h4>
                <img 
                  src={URL.createObjectURL(file)} 
                  alt="Original" 
                  className="w-full"
                />
              </div>
              <div className="border border-gray-800 rounded-lg overflow-hidden">
                <h4 className="text-sm font-medium p-2 bg-gray-800">Blurred</h4>
                <img 
                  src={resultUrl} 
                  alt="Blurred" 
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <Button as="a" href={resultUrl} download>
                Download Image
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
                Blur Another Image
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default Blur;