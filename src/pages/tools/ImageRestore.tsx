import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';

const ImageRestore = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const { addToast } = useToast();

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const handleRestore = async () => {
    if (!file) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      const result = await uploadToCloudinary(file);
      setProgress(60);

      // Apply restoration transformations
      const processedUrl = result.secure_url.replace(
        '/upload/',
        '/upload/e_enhance,e_unsharp_mask:200,e_auto_contrast/'
      );
      
      setResultUrl(processedUrl);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Image restored successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Restoration failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  return (
    <ToolLayout
      title="Image Restoration"
      description="Restore and enhance old or damaged photos using AI"
    >
      <div className="space-y-8">
        <FileUpload
          accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
          onUpload={handleUpload}
          maxSize={10 * 1024 * 1024} // 10MB limit
        />
        
        {file && status === 'idle' && (
          <div className="text-center">
            <p className="mb-4">Selected file: {file.name}</p>
            <Button onClick={handleRestore}>Restore Image</Button>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus status="processing" progress={progress} />
        )}
        
        {status === 'completed' && resultUrl && (
          <div className="text-center space-y-4">
            <p className="text-green-500 mb-4">Image restored successfully!</p>
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
                <h4 className="text-sm font-medium p-2 bg-gray-800">Restored</h4>
                <img 
                  src={resultUrl} 
                  alt="Restored" 
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
                Restore Another
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default ImageRestore;