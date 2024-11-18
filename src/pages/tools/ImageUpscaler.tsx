import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';

const ImageUpscaler = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [scale, setScale] = useState(2);
  const [resultUrl, setResultUrl] = useState<string>('');
  const { addToast } = useToast();

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const handleUpscale = async () => {
    if (!file) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      // Upload to Cloudinary
      const result = await uploadToCloudinary(file);
      setProgress(60);

      // Apply upscaling transformation
      const upscaledUrl = result.secure_url.replace(
        '/upload/',
        `/upload/w_${scale * 1000},h_${scale * 1000},c_scale/`
      );
      setResultUrl(upscaledUrl);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Upscaling successful',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Upscaling failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  return (
    <ToolLayout
      title="AI Image Upscaler"
      description="Enhance your images with AI-powered upscaling"
    >
      <div className="space-y-8">
        <FileUpload
          accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
          onUpload={handleUpload}
          maxSize={10 * 1024 * 1024} // 10MB limit
        />
        
        {file && status === 'idle' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4">
              <label className="text-sm">Scale Factor:</label>
              <select
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="bg-gray-800 rounded-lg px-3 py-2"
              >
                <option value={2}>2x</option>
                <option value={4}>4x</option>
                <option value={8}>8x</option>
              </select>
            </div>
            
            <div className="text-center">
              <p className="mb-4">Selected file: {file.name}</p>
              <Button onClick={handleUpscale}>Upscale Image</Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus status="processing" progress={progress} />
        )}
        
        {status === 'completed' && resultUrl && (
          <div className="text-center space-y-4">
            <p className="text-green-500 mb-4">Upscaling completed!</p>
            <div className="max-w-md mx-auto border border-gray-800 rounded-lg overflow-hidden">
              <img src={resultUrl} alt="Upscaled image" className="w-full" />
            </div>
            <Button as="a" href={resultUrl} download>
              Download Image
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default ImageUpscaler;