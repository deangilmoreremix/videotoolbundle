import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';

const ContentExtraction = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [extractionType, setExtractionType] = useState<'text' | 'objects' | 'faces'>('text');
  const { addToast } = useToast();

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const handleExtract = async () => {
    if (!file) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      const result = await uploadToCloudinary(file);
      setProgress(60);

      // Apply extraction transformation based on type
      let transformation = '';
      switch (extractionType) {
        case 'text':
          transformation = 'e_text_extract';
          break;
        case 'objects':
          transformation = 'e_object_extract';
          break;
        case 'faces':
          transformation = 'e_face_extract';
          break;
      }

      const processedUrl = result.secure_url.replace(
        '/upload/',
        `/upload/${transformation}/`
      );
      
      setResultUrl(processedUrl);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Content extracted successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Extraction failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  return (
    <ToolLayout
      title="Content Extraction"
      description="Extract specific content from images using AI"
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
              <label className="block text-sm font-medium mb-2">Extraction Type</label>
              <div className="grid grid-cols-3 gap-4">
                {(['text', 'objects', 'faces'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setExtractionType(type)}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      extractionType === type 
                        ? 'border-red-500 bg-red-500/10' 
                        : 'border-gray-700 hover:border-red-500'
                    }`}
                  >
                    <div className="text-lg font-bold mb-1 capitalize">{type}</div>
                    <div className="text-sm text-gray-400">
                      {type === 'text' && 'Extract text content'}
                      {type === 'objects' && 'Extract objects'}
                      {type === 'faces' && 'Extract faces'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <p className="mb-4">Selected file: {file.name}</p>
              <Button onClick={handleExtract}>Extract Content</Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message={`Extracting ${extractionType} from image...`}
          />
        )}
        
        {status === 'completed' && resultUrl && (
          <div className="text-center space-y-4">
            <p className="text-green-500 mb-4">Content extracted successfully!</p>
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
                <h4 className="text-sm font-medium p-2 bg-gray-800">Extracted Content</h4>
                <img 
                  src={resultUrl} 
                  alt="Extracted" 
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <Button as="a" href={resultUrl} download>
                Download Result
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
                Extract More Content
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default ContentExtraction;