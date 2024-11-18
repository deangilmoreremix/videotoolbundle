import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';

const StyleTransfer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [styleFile, setStyleFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [intensity, setIntensity] = useState(100);
  const { addToast } = useToast();

  const handleContentUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const handleStyleUpload = (uploadedFile: File) => {
    setStyleFile(uploadedFile);
  };

  const handleTransfer = async () => {
    if (!file || !styleFile) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      // Upload content image
      const contentResult = await uploadToCloudinary(file);
      setProgress(40);

      // Upload style image
      const styleResult = await uploadToCloudinary(styleFile);
      setProgress(60);

      // Apply style transfer transformation
      const processedUrl = contentResult.secure_url.replace(
        '/upload/',
        `/upload/l_${styleResult.public_id},e_style_transfer:${intensity}/`
      );
      
      setResultUrl(processedUrl);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Style transfer completed successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Style transfer failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  return (
    <ToolLayout
      title="Style Transfer"
      description="Apply artistic styles from one image to another using AI"
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Content Image</h3>
            <FileUpload
              accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
              onUpload={handleContentUpload}
              maxSize={10 * 1024 * 1024} // 10MB limit
            />
            {file && (
              <p className="mt-2 text-sm text-gray-400">
                Selected: {file.name}
              </p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Style Image</h3>
            <FileUpload
              accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
              onUpload={handleStyleUpload}
              maxSize={10 * 1024 * 1024} // 10MB limit
            />
            {styleFile && (
              <p className="mt-2 text-sm text-gray-400">
                Selected: {styleFile.name}
              </p>
            )}
          </div>
        </div>

        {file && styleFile && status === 'idle' && (
          <div className="space-y-6">
            <div className="max-w-md mx-auto">
              <label className="block text-sm font-medium mb-2">
                Style Intensity: {intensity}%
              </label>
              <input
                type="range"
                min={1}
                max={200}
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full accent-red-500"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>Subtle</span>
                <span>Balanced</span>
                <span>Strong</span>
              </div>
            </div>

            <div className="text-center">
              <Button onClick={handleTransfer}>Transfer Style</Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Applying artistic style transfer..."
          />
        )}
        
        {status === 'completed' && resultUrl && (
          <div className="text-center space-y-4">
            <p className="text-green-500 mb-4">Style transfer completed!</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-gray-800 rounded-lg overflow-hidden">
                <h4 className="text-sm font-medium p-2 bg-gray-800">Content Image</h4>
                <img 
                  src={URL.createObjectURL(file)} 
                  alt="Content" 
                  className="w-full"
                />
              </div>
              <div className="border border-gray-800 rounded-lg overflow-hidden">
                <h4 className="text-sm font-medium p-2 bg-gray-800">Style Image</h4>
                <img 
                  src={URL.createObjectURL(styleFile)} 
                  alt="Style" 
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
                  setStyleFile(null);
                  setIntensity(100);
                }}
              >
                Start New Transfer
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default StyleTransfer;