import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';

const SmartCrop = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '4:3' | '3:2'>('1:1');
  const [resultUrl, setResultUrl] = useState<string>('');
  const { addToast } = useToast();

  const aspectRatioValues = {
    '1:1': { width: 1000, height: 1000 },
    '16:9': { width: 1600, height: 900 },
    '4:3': { width: 1200, height: 900 },
    '3:2': { width: 1200, height: 800 }
  };

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const handleCrop = async () => {
    if (!file) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      const result = await uploadToCloudinary(file);
      setProgress(60);

      const dimensions = aspectRatioValues[aspectRatio];
      const processedUrl = result.secure_url.replace(
        '/upload/',
        `/upload/c_fill,g_auto,w_${dimensions.width},h_${dimensions.height}/`
      );
      
      setResultUrl(processedUrl);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Image cropped successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Cropping failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  return (
    <ToolLayout
      title="Smart Crop"
      description="Automatically crop images while preserving the important content"
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
              <label className="block text-sm font-medium mb-2">Aspect Ratio</label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as '1:1' | '16:9' | '4:3' | '3:2')}
                className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700"
              >
                <option value="1:1">Square (1:1)</option>
                <option value="16:9">Landscape (16:9)</option>
                <option value="4:3">Classic (4:3)</option>
                <option value="3:2">Portrait (3:2)</option>
              </select>
            </div>
            
            <div className="text-center">
              <p className="mb-4">Selected file: {file.name}</p>
              <Button onClick={handleCrop}>Crop Image</Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus status="processing" progress={progress} />
        )}
        
        {status === 'completed' && resultUrl && (
          <div className="text-center space-y-4">
            <p className="text-green-500 mb-4">Image cropped successfully!</p>
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
                <h4 className="text-sm font-medium p-2 bg-gray-800">Cropped</h4>
                <img 
                  src={resultUrl} 
                  alt="Cropped" 
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
                Crop Another
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default SmartCrop;