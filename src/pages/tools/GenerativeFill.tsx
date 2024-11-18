import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';

const GenerativeFill = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [expandDirection, setExpandDirection] = useState<'all' | 'horizontal' | 'vertical'>('all');
  const { addToast } = useToast();

  const expansionSettings = {
    all: { w: 1.5, h: 1.5 },
    horizontal: { w: 2, h: 1 },
    vertical: { w: 1, h: 2 }
  };

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const handleFill = async () => {
    if (!file) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      const result = await uploadToCloudinary(file);
      setProgress(60);

      // Apply generative fill transformation
      const settings = expansionSettings[expandDirection];
      const processedUrl = result.secure_url.replace(
        '/upload/',
        `/upload/w_${settings.w}x,h_${settings.h}x,c_scale,g_auto,e_gen_fill/`
      );
      
      setResultUrl(processedUrl);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Image expanded successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Expansion failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  return (
    <ToolLayout
      title="Generative Fill"
      description="Expand your images using AI-powered content generation"
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
              <label className="block text-sm font-medium mb-2">Expansion Direction</label>
              <div className="grid grid-cols-3 gap-4">
                {(['all', 'horizontal', 'vertical'] as const).map((direction) => (
                  <button
                    key={direction}
                    onClick={() => setExpandDirection(direction)}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      expandDirection === direction 
                        ? 'border-red-500 bg-red-500/10' 
                        : 'border-gray-700 hover:border-red-500'
                    }`}
                  >
                    <div className="text-lg font-bold mb-1 capitalize">{direction}</div>
                    <div className="text-sm text-gray-400">
                      {direction === 'all' && 'Expand all sides'}
                      {direction === 'horizontal' && 'Expand width'}
                      {direction === 'vertical' && 'Expand height'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <p className="mb-4">Selected file: {file.name}</p>
              <Button onClick={handleFill}>Generate Fill</Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Expanding your image with AI-generated content..."
          />
        )}
        
        {status === 'completed' && resultUrl && (
          <div className="text-center space-y-4">
            <p className="text-green-500 mb-4">Image expanded successfully!</p>
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
                <h4 className="text-sm font-medium p-2 bg-gray-800">Expanded</h4>
                <img 
                  src={resultUrl} 
                  alt="Expanded" 
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <Button as="a" href={resultUrl} download>
                Download Expanded Image
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
                Expand Another Image
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default GenerativeFill;