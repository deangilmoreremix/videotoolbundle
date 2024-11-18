import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';

const GenerativeReplace = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [target, setTarget] = useState<string>('');
  const [replacement, setReplacement] = useState<string>('');
  const { addToast } = useToast();

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const handleReplace = async () => {
    if (!file || !target || !replacement) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      const result = await uploadToCloudinary(file);
      setProgress(60);

      // Apply generative replacement transformation
      const processedUrl = result.secure_url.replace(
        '/upload/',
        `/upload/e_gen_replace:${target};${replacement}/`
      );
      
      setResultUrl(processedUrl);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Object replaced successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Replacement failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  return (
    <ToolLayout
      title="Generative Replace"
      description="Replace objects in images with AI-generated alternatives"
    >
      <div className="space-y-8">
        <FileUpload
          accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
          onUpload={handleUpload}
          maxSize={10 * 1024 * 1024} // 10MB limit
        />
        
        {file && status === 'idle' && (
          <div className="space-y-6">
            <div className="max-w-md mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Object to Replace</label>
                <textarea
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="Describe what you want to replace (e.g., 'red car', 'wooden chair')"
                  className="w-full h-24 bg-gray-800 rounded-lg px-4 py-3 border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Replacement Description</label>
                <textarea
                  value={replacement}
                  onChange={(e) => setReplacement(e.target.value)}
                  placeholder="Describe what you want to replace it with (e.g., 'blue sports car', 'modern leather chair')"
                  className="w-full h-24 bg-gray-800 rounded-lg px-4 py-3 border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>
            
            <div className="text-center">
              <p className="mb-4">Selected file: {file.name}</p>
              <Button 
                onClick={handleReplace}
                disabled={!target.trim() || !replacement.trim()}
              >
                Replace Object
              </Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Replacing object with AI-generated content..."
          />
        )}
        
        {status === 'completed' && resultUrl && (
          <div className="text-center space-y-4">
            <p className="text-green-500 mb-4">Object replaced successfully!</p>
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
                  setTarget('');
                  setReplacement('');
                }}
              >
                Replace Another Object
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default GenerativeReplace;