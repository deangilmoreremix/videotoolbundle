import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';

const ColorEnhancement = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [settings, setSettings] = useState({
    vibrance: 20,
    saturation: 10,
    contrast: 10,
    brightness: 0,
    warmth: 0
  });
  const { addToast } = useToast();

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const handleEnhance = async () => {
    if (!file) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      const result = await uploadToCloudinary(file);
      setProgress(60);

      // Build transformation string based on settings
      const transformations = [
        settings.vibrance && `e_vibrance:${settings.vibrance}`,
        settings.saturation && `e_saturation:${settings.saturation}`,
        settings.contrast && `e_contrast:${settings.contrast}`,
        settings.brightness && `e_brightness:${settings.brightness}`,
        settings.warmth && `e_art_${settings.warmth > 0 ? 'incognito' : 'eucalyptus'}`
      ].filter(Boolean).join(',');

      // Apply color enhancement transformations
      const processedUrl = result.secure_url.replace(
        '/upload/',
        `/upload/${transformations}/`
      );
      
      setResultUrl(processedUrl);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Colors enhanced successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Enhancement failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  const resetSettings = () => {
    setSettings({
      vibrance: 20,
      saturation: 10,
      contrast: 10,
      brightness: 0,
      warmth: 0
    });
  };

  return (
    <ToolLayout
      title="Color Enhancement"
      description="Enhance and adjust image colors with precision controls"
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
                <label className="block text-sm font-medium mb-2">
                  Vibrance: {settings.vibrance}
                </label>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  value={settings.vibrance}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    vibrance: Number(e.target.value)
                  }))}
                  className="w-full accent-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Saturation: {settings.saturation}
                </label>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  value={settings.saturation}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    saturation: Number(e.target.value)
                  }))}
                  className="w-full accent-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Contrast: {settings.contrast}
                </label>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  value={settings.contrast}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    contrast: Number(e.target.value)
                  }))}
                  className="w-full accent-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Brightness: {settings.brightness}
                </label>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  value={settings.brightness}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    brightness: Number(e.target.value)
                  }))}
                  className="w-full accent-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Color Temperature: {settings.warmth}
                </label>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  value={settings.warmth}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    warmth: Number(e.target.value)
                  }))}
                  className="w-full accent-red-500"
                />
                <div className="flex justify-between text-sm text-gray-400 mt-1">
                  <span>Cool</span>
                  <span>Neutral</span>
                  <span>Warm</span>
                </div>
              </div>
            </div>
            
            <div className="text-center space-x-4">
              <Button onClick={handleEnhance}>
                Enhance Colors
              </Button>
              <Button 
                variant="outline" 
                onClick={resetSettings}
              >
                Reset Settings
              </Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Enhancing colors..."
          />
        )}
        
        {status === 'completed' && resultUrl && (
          <div className="text-center space-y-4">
            <p className="text-green-500 mb-4">Colors enhanced successfully!</p>
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
                <h4 className="text-sm font-medium p-2 bg-gray-800">Enhanced</h4>
                <img 
                  src={resultUrl} 
                  alt="Enhanced" 
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <Button as="a" href={resultUrl} download>
                Download Enhanced Image
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setStatus('idle');
                  setProgress(0);
                  setResultUrl('');
                  setFile(null);
                  resetSettings();
                }}
              >
                Enhance Another Image
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default ColorEnhancement;