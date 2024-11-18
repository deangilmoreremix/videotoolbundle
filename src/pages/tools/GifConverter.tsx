import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';

const GifConverter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [settings, setSettings] = useState({
    quality: 80,
    colors: 256,
    dithering: true,
    lossy: 20,
    optimize: true
  });
  const { addToast } = useToast();

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const handleConvert = async () => {
    if (!file) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      const result = await uploadToCloudinary(file);
      setProgress(60);

      // Build transformation string
      const transformations = [
        'f_gif',
        `q_${settings.quality}`,
        `colors_${settings.colors}`,
        settings.dithering && 'e_dither',
        settings.optimize && `lossy_${settings.lossy}`
      ].filter(Boolean).join(',');

      // Apply GIF conversion transformations
      const processedUrl = result.secure_url.replace(
        '/upload/',
        `/upload/${transformations}/`
      );
      
      setResultUrl(processedUrl);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'GIF conversion completed successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Conversion failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  return (
    <ToolLayout
      title="GIF Converter"
      description="Convert and optimize GIF files with advanced controls"
    >
      <div className="space-y-8">
        <FileUpload
          accept={{ 'image/gif': ['.gif'] }}
          onUpload={handleUpload}
          maxSize={50 * 1024 * 1024} // 50MB limit
        />
        
        {file && status === 'idle' && (
          <div className="space-y-6">
            <div className="max-w-xl mx-auto space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Quality: {settings.quality}%
                </label>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={settings.quality}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    quality: Number(e.target.value)
                  }))}
                  className="w-full accent-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Colors: {settings.colors}
                </label>
                <input
                  type="range"
                  min={2}
                  max={256}
                  step={2}
                  value={settings.colors}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    colors: Number(e.target.value)
                  }))}
                  className="w-full accent-red-500"
                />
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.dithering}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      dithering: e.target.checked
                    }))}
                    className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                  />
                  <span className="text-sm">Enable dithering</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.optimize}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      optimize: e.target.checked
                    }))}
                    className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                  />
                  <span className="text-sm">Enable lossy optimization</span>
                </label>

                {settings.optimize && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Lossy Compression: {settings.lossy}%
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={settings.lossy}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        lossy: Number(e.target.value)
                      }))}
                      className="w-full accent-red-500"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-center">
              <Button onClick={handleConvert}>Convert GIF</Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Converting and optimizing GIF..."
          />
        )}
        
        {status === 'completed' && resultUrl && (
          <div className="text-center space-y-4">
            <p className="text-green-500 mb-4">GIF converted successfully!</p>
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
                <h4 className="text-sm font-medium p-2 bg-gray-800">Converted</h4>
                <img 
                  src={resultUrl} 
                  alt="Converted" 
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <Button as="a" href={resultUrl} download>
                Download GIF
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
                Convert Another GIF
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default GifConverter;