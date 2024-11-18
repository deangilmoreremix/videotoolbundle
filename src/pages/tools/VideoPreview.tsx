import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';

interface PreviewSettings {
  duration: number;
  frameCount: number;
  layout: 'horizontal' | 'vertical' | 'grid';
  interval: 'uniform' | 'key-moments';
  columns?: number;
}

const VideoPreview = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [settings, setSettings] = useState<PreviewSettings>({
    duration: 10,
    frameCount: 6,
    layout: 'horizontal',
    interval: 'uniform',
    columns: 3
  });
  const { addToast } = useToast();

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const handleGeneratePreview = async () => {
    if (!file) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      const result = await uploadToCloudinary(file);
      setProgress(60);

      // Build transformation string based on settings
      let transformation = '';
      const frameInterval = Math.floor(settings.duration / settings.frameCount);

      if (settings.layout === 'grid') {
        transformation = `/w_${settings.columns * 320},c_fill,so_0,eo_${settings.duration},dl_${frameInterval},fl_splice,c_scale`;
      } else {
        const direction = settings.layout === 'horizontal' ? 'w' : 'h';
        transformation = `/w_320,c_fill,so_0,eo_${settings.duration},dl_${frameInterval},fl_${direction}_concat`;
      }

      if (settings.interval === 'key-moments') {
        transformation += ',g_auto';
      }

      // Apply preview generation transformation
      const processedUrl = result.secure_url.replace(
        '/upload/',
        `/upload${transformation}/`
      );
      
      setResultUrl(processedUrl);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Preview generated successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Preview generation failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  return (
    <ToolLayout
      title="Video Preview Generator"
      description="Create engaging video previews and thumbnails with customizable layouts"
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
                <label className="block text-sm font-medium mb-2">Preview Layout</label>
                <div className="grid grid-cols-3 gap-4">
                  {(['horizontal', 'vertical', 'grid'] as const).map((layout) => (
                    <button
                      key={layout}
                      onClick={() => setSettings(prev => ({ ...prev, layout }))}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        settings.layout === layout 
                          ? 'border-red-500 bg-red-500/10' 
                          : 'border-gray-700 hover:border-red-500'
                      }`}
                    >
                      <div className="text-lg font-bold mb-1 capitalize">{layout}</div>
                    </button>
                  ))}
                </div>
              </div>

              {settings.layout === 'grid' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Grid Columns</label>
                  <input
                    type="range"
                    min={2}
                    max={4}
                    value={settings.columns}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      columns: Number(e.target.value)
                    }))}
                    className="w-full accent-red-500"
                  />
                  <div className="flex justify-between text-sm text-gray-400 mt-1">
                    <span>2 columns</span>
                    <span>3 columns</span>
                    <span>4 columns</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Frame Count: {settings.frameCount}
                </label>
                <input
                  type="range"
                  min={4}
                  max={12}
                  value={settings.frameCount}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    frameCount: Number(e.target.value)
                  }))}
                  className="w-full accent-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Preview Duration: {settings.duration}s
                </label>
                <input
                  type="range"
                  min={5}
                  max={30}
                  step={5}
                  value={settings.duration}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    duration: Number(e.target.value)
                  }))}
                  className="w-full accent-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Frame Selection</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, interval: 'uniform' }))}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      settings.interval === 'uniform' 
                        ? 'border-red-500 bg-red-500/10' 
                        : 'border-gray-700 hover:border-red-500'
                    }`}
                  >
                    <div className="text-lg font-bold mb-1">Uniform</div>
                    <div className="text-sm text-gray-400">Equal time intervals</div>
                  </button>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, interval: 'key-moments' }))}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      settings.interval === 'key-moments' 
                        ? 'border-red-500 bg-red-500/10' 
                        : 'border-gray-700 hover:border-red-500'
                    }`}
                  >
                    <div className="text-lg font-bold mb-1">Key Moments</div>
                    <div className="text-sm text-gray-400">AI-detected highlights</div>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <Button onClick={handleGeneratePreview}>Generate Preview</Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Generating video preview..."
          />
        )}
        
        {status === 'completed' && resultUrl && (
          <div className="text-center space-y-4">
            <p className="text-green-500 mb-4">Preview generated successfully!</p>
            <div className="max-w-3xl mx-auto border border-gray-800 rounded-lg overflow-hidden">
              <img 
                src={resultUrl} 
                alt="Video Preview" 
                className="w-full"
              />
            </div>
            <div className="flex justify-center gap-4">
              <Button as="a" href={resultUrl} download>
                Download Preview
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
                Generate Another Preview
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default VideoPreview;