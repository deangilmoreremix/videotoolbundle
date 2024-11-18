import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';

const GenerativeRestore = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [intensity, setIntensity] = useState<'light' | 'medium' | 'strong'>('medium');
  const { addToast } = useToast();

  const intensitySettings = {
    light: { improve: 25, enhance: 'auto_mild' },
    medium: { improve: 50, enhance: 'auto_moderate' },
    strong: { improve: 75, enhance: 'auto_aggressive' }
  };

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const handleRestore = async () => {
    if (!file) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      const result = await uploadToCloudinary(file);
      setProgress(60);

      // Apply restoration transformations
      const settings = intensitySettings[intensity];
      const processedUrl = result.secure_url.replace(
        '/upload/',
        `/upload/e_improve:${settings.improve},e_enhance:${settings.enhance}/`
      );
      
      setResultUrl(processedUrl);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Image restored successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Restoration failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  return (
    <ToolLayout
      title="Generative Restore"
      description="Restore and enhance old or damaged photos using AI"
    >
      <div className="space-y-8">
        <FileUpload
          accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
          onUpload={handleUpload}
          maxSize={10 * 1024 * 1024} // 10MB limit
        />
        
        {file && status === 'idle' && (
          <div className="space-y-6">
            <div className="max-w-md mx-auto">
              <label className="block text-sm font-medium mb-2">Restoration Intensity</label>
              <div className="grid grid-cols-3 gap-4">
                {(['light', 'medium', 'strong'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setIntensity(level)}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      intensity === level 
                        ? 'border-red-500 bg-red-500/10' 
                        : 'border-gray-700 hover:border-red-500'
                    }`}
                  >
                    <div className="text-lg font-bold mb-1 capitalize">{level}</div>
                    <div className="text-sm text-gray-400">
                      {level === 'light' && 'Subtle restoration'}
                      {level === 'medium' && 'Balanced results'}
                      {level === 'strong' && 'Maximum effect'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <p className="mb-4">Selected file: {file.name}</p>
              <Button onClick={handleRestore}>Restore Image</Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Restoring your image with AI enhancement..."
          />
        )}
        
        {status === 'completed' && resultUrl && (
          <div className="text-center space-y-4">
            <p className="text-green-500 mb-4">Image restored successfully!</p>
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
                <h4 className="text-sm font-medium p-2 bg-gray-800">Restored</h4>
                <img 
                  src={resultUrl} 
                  alt="Restored" 
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <Button as="a" href={resultUrl} download>
                Download Restored Image
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
                Restore Another Image
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default GenerativeRestore;