import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';

const AutoThumbnailing = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrls, setResultUrls] = useState<string[]>([]);
  const { addToast } = useToast();

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const handleGenerate = async () => {
    if (!file) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      const result = await uploadToCloudinary(file);
      setProgress(60);

      // Generate multiple thumbnails at different timestamps
      const timestamps = [0, 25, 50, 75];
      const thumbnails = timestamps.map(time => {
        return result.secure_url.replace(
          '/upload/',
          `/upload/w_1280,h_720,c_fill,so_${time}/`
        );
      });
      
      setResultUrls(thumbnails);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Thumbnails generated successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Thumbnail generation failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  return (
    <ToolLayout
      title="Auto Thumbnailing"
      description="Automatically generate engaging thumbnails from your videos using AI"
    >
      <div className="space-y-8">
        <FileUpload
          accept={{ 'video/*': ['.mp4', '.mov', '.avi'] }}
          onUpload={handleUpload}
          maxSize={100 * 1024 * 1024}
        />
        
        {file && status === 'idle' && (
          <div className="text-center">
            <p className="mb-4">Selected file: {file.name}</p>
            <Button onClick={handleGenerate}>Generate Thumbnails</Button>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus status="processing" progress={progress} />
        )}
        
        {status === 'completed' && resultUrls.length > 0 && (
          <div className="space-y-4">
            <p className="text-green-500 text-center mb-4">Thumbnails generated!</p>
            <div className="grid grid-cols-2 gap-4">
              {resultUrls.map((url, index) => (
                <div key={index} className="border border-gray-800 rounded-lg overflow-hidden">
                  <img src={url} alt={`Thumbnail ${index + 1}`} className="w-full" />
                  <div className="p-2 bg-gray-800 flex justify-end">
                    <Button as="a" href={url} download size="sm">
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default AutoThumbnailing;