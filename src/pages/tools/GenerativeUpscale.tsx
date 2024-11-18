import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';

const GenerativeUpscale = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [scale, setScale] = useState<2 | 4>(2);
  const { addToast } = useToast();

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const handleUpscale = async () => {
    if (!file) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      const result = await uploadToCloudinary(file);
      setProgress(60);

      // Apply upscaling transformation with AI enhancement
      const processedUrl = result.secure_url.replace(
        '/upload/',
        `/upload/w_${scale * 1000},h_${scale * 1000},c_scale,e_enhance,q_auto:best/`
      );
      
      setResultUrl(processedUrl);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Image upscaled successfully',
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
      title="Generative Upscale"
      description="Upscale your images to higher resolutions while maintaining quality using AI"
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
              <label className="block text-sm font-medium mb-2">Scale Factor</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setScale(2)}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    scale === 2 
                      ? 'border-red-500 bg-red-500/10' 
                      : 'border-gray-700 hover:border-red-500'
                  }`}
                >
                  <div className="text-lg font-bold mb-1">2x</div>
                  <div className="text-sm text-gray-400">Good for moderate upscaling</div>
                </button>
                <button
                  onClick={() => setScale(4)}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    scale === 4 
                      ? 'border-red-500 bg-red-500/10' 
                      : 'border-gray-700 hover:border-red-500'
                  }`}
                >
                  <div className="text-lg font-bold mb-1">4x</div>
                  <div className="text-sm text-gray-400">Best for significant enlargement</div>
                </button>
              </div>
            </div>
            
            <div className="text-center">
              <p className="mb-4">Selected file: {file.name}</p>
              <Button onClick={handleUpscale}>Upscale Image</Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Upscaling your image with AI enhancement..."
          />
        )}
        
        {status === 'completed' && resultUrl && (
          <div className="text-center space-y-4">
            <p className="text-green-500 mb-4">Image upscaled successfully!</p>
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
                <h4 className="text-sm font-medium p-2 bg-gray-800">
                  Upscaled ({scale}x)
                </h4>
                <img 
                  src={resultUrl} 
                  alt="Upscaled" 
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <Button as="a" href={resultUrl} download>
                Download Upscaled Image
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
                Upscale Another Image
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default GenerativeUpscale;