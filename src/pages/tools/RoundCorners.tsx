import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';

const RoundCorners = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [radius, setRadius] = useState(20);
  const { addToast } = useToast();

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const handleRoundCorners = async () => {
    if (!file) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      const result = await uploadToCloudinary(file);
      setProgress(60);

      // Apply corner rounding transformation
      const processedUrl = result.secure_url.replace(
        '/upload/',
        `/upload/r_${radius}/`
      );
      
      setResultUrl(processedUrl);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Corners rounded successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Processing failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  return (
    <ToolLayout
      title="Round Corners"
      description="Add rounded corners to your images with precise control"
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
                Corner Radius: {radius}px
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full accent-red-500"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>Square</span>
                <span>Rounded</span>
                <span>Circular</span>
              </div>
            </div>
            
            <div className="text-center">
              <p className="mb-4">Selected file: {file.name}</p>
              <Button onClick={handleRoundCorners}>Round Corners</Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Applying rounded corners..."
          />
        )}
        
        {status === 'completed' && resultUrl && (
          <div className="text-center space-y-4">
            <p className="text-green-500 mb-4">Corners rounded successfully!</p>
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
                <h4 className="text-sm font-medium p-2 bg-gray-800">Result</h4>
                <img 
                  src={resultUrl} 
                  alt="Result" 
                  className="w-full"
                />
              </div>
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
                  setFile(null);
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

export default RoundCorners;