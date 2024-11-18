import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';

const ContentAwareEncoding = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [quality, setQuality] = useState<'auto' | 'best' | 'good' | 'eco'>('auto');
  const { addToast } = useToast();

  const qualitySettings = {
    auto: 'q_auto',
    best: 'q_auto:best',
    good: 'q_auto:good',
    eco: 'q_auto:eco'
  };

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const handleEncode = async () => {
    if (!file) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      const result = await uploadToCloudinary(file);
      setProgress(60);

      // Apply content-aware encoding
      const processedUrl = result.secure_url.replace(
        '/upload/',
        `/upload/${qualitySettings[quality]},f_auto/`
      );
      
      setResultUrl(processedUrl);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Image encoded successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Encoding failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  return (
    <ToolLayout
      title="Content-Aware Encoding"
      description="Optimize image quality and file size based on content analysis"
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
              <label className="block text-sm font-medium mb-2">Quality Profile</label>
              <div className="grid grid-cols-2 gap-4">
                {(['auto', 'best', 'good', 'eco'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setQuality(level)}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      quality === level 
                        ? 'border-red-500 bg-red-500/10' 
                        : 'border-gray-700 hover:border-red-500'
                    }`}
                  >
                    <div className="text-lg font-bold mb-1 capitalize">{level}</div>
                    <div className="text-sm text-gray-400">
                      {level === 'auto' && 'Smart automatic selection'}
                      {level === 'best' && 'Maximum quality'}
                      {level === 'good' && 'Balanced optimization'}
                      {level === 'eco' && 'Maximum compression'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <p className="mb-4">Selected file: {file.name}</p>
              <Button onClick={handleEncode}>Optimize Image</Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Analyzing and optimizing your image..."
          />
        )}
        
        {status === 'completed' && resultUrl && (
          <div className="text-center space-y-4">
            <p className="text-green-500 mb-4">Image optimized successfully!</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-800 rounded-lg overflow-hidden">
                <h4 className="text-sm font-medium p-2 bg-gray-800">Original</h4>
                <img 
                  src={URL.createObjectURL(file)} 
                  alt="Original" 
                  className="w-full"
                />
                <div className="p-2 bg-gray-800 text-sm">
                  Size: {(file.size / 1024).toFixed(1)} KB
                </div>
              </div>
              <div className="border border-gray-800 rounded-lg overflow-hidden">
                <h4 className="text-sm font-medium p-2 bg-gray-800">Optimized</h4>
                <img 
                  src={resultUrl} 
                  alt="Optimized" 
                  className="w-full"
                />
                <div className="p-2 bg-gray-800 text-sm">
                  Profile: {quality.toUpperCase()}
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <Button as="a" href={resultUrl} download>
                Download Optimized Image
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
                Optimize Another Image
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default ContentAwareEncoding;