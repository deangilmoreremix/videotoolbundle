import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';

const RemoveVideoBg = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const { addToast } = useToast();

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const handleRemoveBackground = async () => {
    if (!file) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      const result = await uploadToCloudinary(file);
      setProgress(60);

      // Apply background removal transformation
      const processedUrl = result.secure_url.replace('/upload/', '/upload/e_background_removal/');
      setResultUrl(processedUrl);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Background removal completed',
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
      title="Video Background Removal"
      description="Remove backgrounds from your videos automatically using AI"
    >
      <div className="space-y-8">
        <FileUpload
          accept={{ 'video/*': ['.mp4', '.mov', '.avi'] }}
          onUpload={handleUpload}
          maxSize={100 * 1024 * 1024} // 100MB limit
        />
        
        {file && status === 'idle' && (
          <div className="text-center">
            <p className="mb-4">Selected file: {file.name}</p>
            <Button onClick={handleRemoveBackground}>Remove Background</Button>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus status="processing" progress={progress} />
        )}
        
        {status === 'completed' && resultUrl && (
          <div className="text-center space-y-4">
            <p className="text-green-500 mb-4">Background removal completed!</p>
            <div className="max-w-2xl mx-auto border border-gray-800 rounded-lg overflow-hidden">
              <video 
                src={resultUrl} 
                controls 
                className="w-full"
                poster={resultUrl.replace('.mp4', '.jpg')}
              />
            </div>
            <Button as="a" href={resultUrl} download>
              Download Video
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default RemoveVideoBg;