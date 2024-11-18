import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';

const BlurBackground = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [blurStrength, setBlurStrength] = useState(500);
  const [resultUrl, setResultUrl] = useState<string>('');
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

      // Apply background blur transformation
      const processedUrl = result.secure_url.replace(
        '/upload/',
        `/upload/e_background_blur:${blurStrength}/`
      );
      
      setResultUrl(processedUrl);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Background blur applied successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Background blur failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  return (
    <ToolLayout
      title="Blur Image Background"
      description="Add a professional blur effect to image backgrounds while keeping the subject in focus"
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
              <label className="block text-sm font-medium mb-2">
                Blur Strength: {blurStrength}
              </label>
              <input
                type="range"
                min="100"
                max="2000"
                step="100"
                value={blurStrength}
                onChange={(e) => setBlurStrength(Number(e.target.value))}
                className="w-full accent-red-500"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>Subtle</span>
                <span>Strong</span>
              </div>
            </div>
            
            <div className="text-center">
              <p className="mb-4">Selected file: {file.name}</p>
              <Button onClick={handleBlur}>Apply Blur Effect</Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus status="processing" progress={progress} />
        )}
        
        {status === 'completed' && resultUrl && (
          <div className="text-center space-y-4">
            <p className="text-green-500 mb-4">Background blur applied!</p>
            <div className="max-w-2xl mx-auto border border-gray-800 rounded-lg overflow-hidden">
              <img 
                src={resultUrl} 
                alt="Processed image" 
                className="w-full"
              />
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
                }}
              >
                Process Another Image
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default BlurBackground;