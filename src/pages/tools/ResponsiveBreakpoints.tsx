import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';

interface BreakpointSettings {
  minWidth: number;
  maxWidth: number;
  maxImages: number;
  autoOptimize: boolean;
  format: 'auto' | 'webp' | 'avif';
}

interface Breakpoint {
  width: number;
  url: string;
  bytes: number;
}

const ResponsiveBreakpoints = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([]);
  const [settings, setSettings] = useState<BreakpointSettings>({
    minWidth: 200,
    maxWidth: 2000,
    maxImages: 5,
    autoOptimize: true,
    format: 'auto'
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

      // Generate breakpoints
      const widths = Array.from({ length: settings.maxImages }, (_, i) => {
        const range = settings.maxWidth - settings.minWidth;
        const step = range / (settings.maxImages - 1);
        return Math.round(settings.minWidth + (step * i));
      });

      // Generate responsive images
      const generatedBreakpoints = await Promise.all(
        widths.map(async (width) => {
          const url = result.secure_url.replace(
            '/upload/',
            `/upload/w_${width},c_scale${settings.autoOptimize ? ',q_auto' : ''}${settings.format !== 'auto' ? `,f_${settings.format}` : ''}/`
          );
          
          // Simulate file size calculation
          const bytes = Math.round(width * width * 0.1);
          
          return { width, url, bytes };
        })
      );

      setBreakpoints(generatedBreakpoints);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Breakpoints generated successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Breakpoint generation failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const generateSourceCode = () => {
    const srcset = breakpoints
      .map(bp => `${bp.url} ${bp.width}w`)
      .join(',\n  ');

    const sizes = breakpoints
      .map((bp, i) => {
        if (i === breakpoints.length - 1) return `${bp.width}px`;
        return `(max-width: ${bp.width}px) ${bp.width}px`;
      })
      .join(',\n  ');

    return `<img
  srcset="
    ${srcset}
  "
  sizes="
    ${sizes}
  "
  src="${breakpoints[breakpoints.length - 1].url}"
  alt="Responsive image"
/>`;
  };

  return (
    <ToolLayout
      title="Responsive Breakpoints"
      description="Generate optimal image breakpoints for responsive design"
    >
      <div className="space-y-8">
        <FileUpload
          accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
          onUpload={handleUpload}
          maxSize={10 * 1024 * 1024} // 10MB limit
        />
        
        {file && status === 'idle' && (
          <div className="space-y-6">
            <div className="max-w-xl mx-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Min Width (px)</label>
                  <input
                    type="number"
                    value={settings.minWidth}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      minWidth: Math.max(100, Math.min(4000, Number(e.target.value)))
                    }))}
                    className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Max Width (px)</label>
                  <input
                    type="number"
                    value={settings.maxWidth}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      maxWidth: Math.max(100, Math.min(4000, Number(e.target.value)))
                    }))}
                    className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Number of Breakpoints: {settings.maxImages}
                </label>
                <input
                  type="range"
                  min={2}
                  max={10}
                  value={settings.maxImages}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    maxImages: Number(e.target.value)
                  }))}
                  className="w-full accent-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Image Format</label>
                <select
                  value={settings.format}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    format: e.target.value as 'auto' | 'webp' | 'avif'
                  }))}
                  className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700"
                >
                  <option value="auto">Auto (Based on browser support)</option>
                  <option value="webp">WebP</option>
                  <option value="avif">AVIF</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoOptimize"
                  checked={settings.autoOptimize}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    autoOptimize: e.target.checked
                  }))}
                  className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                />
                <label htmlFor="autoOptimize" className="text-sm">
                  Automatically optimize quality and compression
                </label>
              </div>
            </div>
            
            <div className="text-center">
              <Button onClick={handleGenerate}>Generate Breakpoints</Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Generating responsive breakpoints..."
          />
        )}
        
        {status === 'completed' && breakpoints.length > 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {breakpoints.map((bp, index) => (
                <div key={index} className="border border-gray-800 rounded-lg overflow-hidden">
                  <div className="bg-gray-800 p-3">
                    <h4 className="font-medium">{bp.width}px</h4>
                    <p className="text-sm text-gray-400">{formatBytes(bp.bytes)}</p>
                  </div>
                  <img 
                    src={bp.url} 
                    alt={`${bp.width}px breakpoint`}
                    className="w-full"
                  />
                </div>
              ))}
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Implementation Code</h3>
                <Button
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(generateSourceCode());
                    addToast({
                      title: 'Code copied to clipboard',
                      type: 'success'
                    });
                  }}
                >
                  Copy Code
                </Button>
              </div>
              <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{generateSourceCode()}</code>
              </pre>
            </div>

            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => {
                  setStatus('idle');
                  setProgress(0);
                  setBreakpoints([]);
                  setFile(null);
                }}
              >
                Generate More Breakpoints
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default ResponsiveBreakpoints;