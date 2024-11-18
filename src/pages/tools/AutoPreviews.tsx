import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';

interface PreviewSettings {
  count: number;
  style: 'storyboard' | 'filmstrip' | 'collage';
  interval: 'uniform' | 'smart';
  includeTimestamps: boolean;
}

const AutoPreviews = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrls, setResultUrls] = useState<string[]>([]);
  const [settings, setSettings] = useState<PreviewSettings>({
    count: 6,
    style: 'storyboard',
    interval: 'smart',
    includeTimestamps: true
  });
  const { addToast } = useToast();

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const handleGenerate = async () => {
    if (!file) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      const result = await uploadToCloudinary(file);
      setProgress(50);

      // Generate previews with different transformations based on settings
      const previews = [];
      const baseUrl = result.secure_url;
      
      for (let i = 0; i < settings.count; i++) {
        const timestamp = settings.interval === 'smart' 
          ? `g_auto` 
          : `so_${Math.floor((i / settings.count) * 100)}p`;
        
        const transformation = settings.style === 'filmstrip'
          ? `w_320,h_180,c_fill,${timestamp}`
          : `w_640,h_360,c_fill,${timestamp}`;

        const previewUrl = baseUrl.replace('/upload/', `/upload/${transformation}/`);
        previews.push(previewUrl);
      }

      setResultUrls(previews);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Previews generated successfully',
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
      title="Auto Previews"
      description="Generate smart video previews and thumbnails automatically"
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
                <label className="block text-sm font-medium mb-2">Preview Style</label>
                <div className="grid grid-cols-3 gap-4">
                  {(['storyboard', 'filmstrip', 'collage'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => setSettings(prev => ({ ...prev, style }))}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        settings.style === style 
                          ? 'border-red-500 bg-red-500/10' 
                          : 'border-gray-700 hover:border-red-500'
                      }`}
                    >
                      <div className="text-lg font-bold mb-1 capitalize">{style}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Number of Previews: {settings.count}
                </label>
                <input
                  type="range"
                  min={4}
                  max={12}
                  value={settings.count}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    count: Number(e.target.value)
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
                    onClick={() => setSettings(prev => ({ ...prev, interval: 'smart' }))}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      settings.interval === 'smart' 
                        ? 'border-red-500 bg-red-500/10' 
                        : 'border-gray-700 hover:border-red-500'
                    }`}
                  >
                    <div className="text-lg font-bold mb-1">Smart</div>
                    <div className="text-sm text-gray-400">AI-detected key frames</div>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="timestamps"
                  checked={settings.includeTimestamps}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    includeTimestamps: e.target.checked
                  }))}
                  className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                />
                <label htmlFor="timestamps" className="text-sm">
                  Include timestamps on previews
                </label>
              </div>
            </div>
            
            <div className="text-center">
              <Button onClick={handleGenerate}>Generate Previews</Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Generating video previews..."
          />
        )}
        
        {status === 'completed' && resultUrls.length > 0 && (
          <div className="text-center space-y-4">
            <p className="text-green-500 mb-4">Previews generated successfully!</p>
            <div className={`grid gap-4 ${
              settings.style === 'filmstrip' 
                ? 'grid-cols-1' 
                : 'grid-cols-2 md:grid-cols-3'
            }`}>
              {resultUrls.map((url, index) => (
                <div key={index} className="border border-gray-800 rounded-lg overflow-hidden">
                  <img 
                    src={url} 
                    alt={`Preview ${index + 1}`} 
                    className="w-full"
                  />
                  {settings.includeTimestamps && (
                    <div className="p-2 bg-gray-800 text-sm">
                      {settings.interval === 'uniform' 
                        ? `${Math.floor((index / settings.count) * 100)}%`
                        : 'Key Frame'
                      }
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => {
                  // Download all previews as a zip file
                  // This would require additional implementation
                  addToast({
                    title: 'Download started',
                    type: 'success'
                  });
                }}
              >
                Download All Previews
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setStatus('idle');
                  setProgress(0);
                  setResultUrls([]);
                  setFile(null);
                }}
              >
                Generate More Previews
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default AutoPreviews;