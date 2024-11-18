import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';

const BackgroundReplace = () => {
  const [file, setFile] = useState<File | null>(null);
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const { addToast } = useToast();

  const handleMainUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const handleBgUpload = (uploadedFile: File) => {
    setBgFile(uploadedFile);
  };

  const handleReplace = async () => {
    if (!file || !bgFile) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      // Upload main image
      const mainResult = await uploadToCloudinary(file);
      setProgress(40);

      // Upload background image
      const bgResult = await uploadToCloudinary(bgFile);
      setProgress(60);

      // Apply background replacement transformation
      const processedUrl = mainResult.secure_url.replace(
        '/upload/',
        `/upload/e_background_removal/l_${bgResult.public_id},w_1.0,h_1.0,c_fill/fl_layer_apply/`
      );
      
      setResultUrl(processedUrl);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Background replaced successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Background replacement failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  return (
    <ToolLayout
      title="Background Replace"
      description="Replace image backgrounds with custom images using AI"
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Main Image</h3>
            <FileUpload
              accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
              onUpload={handleMainUpload}
              maxSize={10 * 1024 * 1024} // 10MB limit
            />
            {file && (
              <p className="mt-2 text-sm text-gray-400">
                Selected: {file.name}
              </p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">New Background</h3>
            <FileUpload
              accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
              onUpload={handleBgUpload}
              maxSize={10 * 1024 * 1024} // 10MB limit
            />
            {bgFile && (
              <p className="mt-2 text-sm text-gray-400">
                Selected: {bgFile.name}
              </p>
            )}
          </div>
        </div>

        {file && bgFile && status === 'idle' && (
          <div className="text-center">
            <Button onClick={handleReplace}>Replace Background</Button>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Replacing background with AI..."
          />
        )}
        
        {status === 'completed' && resultUrl && (
          <div className="text-center space-y-4">
            <p className="text-green-500 mb-4">Background replaced successfully!</p>
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
                  setBgFile(null);
                }}
              >
                Replace Another
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default BackgroundReplace;