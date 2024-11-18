import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';
import { ReverseSettings } from '../../types/reverse';
import { buildReverseTransformations, validateReverseSettings } from '../../lib/reverse';

const ReverseVideo = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [settings, setSettings] = useState<ReverseSettings>({
    speed: 1,
    preserveAudio: true,
    loop: false,
    transition: {
      enabled: false,
      type: 'fade',
      duration: 0.5
    }
  });
  const { addToast } = useToast();

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const handleReverse = async () => {
    if (!file) return;
    
    // Validate settings
    const errors = validateReverseSettings(settings);
    if (errors.length > 0) {
      addToast({
        title: 'Invalid settings',
        description: errors.join('. '),
        type: 'error'
      });
      return;
    }
    
    try {
      setStatus('processing');
      setProgress(20);

      const result = await uploadToCloudinary(file);
      setProgress(60);

      // Build transformation string
      const transformations = buildReverseTransformations(settings);

      // Apply transformations
      const processedUrl = result.secure_url.replace(
        '/upload/',
        `/upload/${transformations}/`
      );
      
      setResultUrl(processedUrl);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Video reversed successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Reverse process failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  return (
    <ToolLayout
      title="Reverse Video"
      description="Create reverse playback versions of your videos with custom effects"
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
                  Playback Speed: {settings.speed}x
                </label>
                <input
                  type="range"
                  min={0.25}
                  max={4}
                  step={0.25}
                  value={settings.speed}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    speed: Number(e.target.value)
                  }))}
                  className="w-full accent-red-500"
                />
                <div className="flex justify-between text-sm text-gray-400 mt-1">
                  <span>0.25x</span>
                  <span>1x</span>
                  <span>4x</span>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.preserveAudio}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      preserveAudio: e.target.checked
                    }))}
                    className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                  />
                  <span className="text-sm">Preserve audio (play in reverse)</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.loop}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      loop: e.target.checked
                    }))}
                    className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                  />
                  <span className="text-sm">Loop video</span>
                </label>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Transition Effect</label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.transition.enabled}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        transition: {
                          ...prev.transition,
                          enabled: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                    />
                    <span className="text-sm">Enable transition</span>
                  </label>
                </div>

                {settings.transition.enabled && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Type</label>
                      <select
                        value={settings.transition.type}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          transition: {
                            ...prev.transition,
                            type: e.target.value as ReverseSettings['transition']['type']
                          }
                        }))}
                        className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700"
                      >
                        <option value="fade">Fade</option>
                        <option value="dissolve">Dissolve</option>
                        <option value="none">None</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Duration: {settings.transition.duration}s
                      </label>
                      <input
                        type="range"
                        min={0.1}
                        max={2}
                        step={0.1}
                        value={settings.transition.duration}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          transition: {
                            ...prev.transition,
                            duration: Number(e.target.value)
                          }
                        }))}
                        className="w-full accent-red-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-center">
              <Button onClick={handleReverse}>Reverse Video</Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Processing video reversal..."
          />
        )}
        
        {status === 'completed' && resultUrl && (
          <div className="text-center space-y-4">
            <p className="text-green-500 mb-4">Video reversed successfully!</p>
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
                Download Reversed Video
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
                Reverse Another Video
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default ReverseVideo;