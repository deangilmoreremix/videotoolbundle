import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';

const SmartObjectRemoval = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [objects, setObjects] = useState<string[]>([]);
  const [newObject, setNewObject] = useState('');
  const { addToast } = useToast();

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const addObject = () => {
    if (newObject.trim()) {
      setObjects([...objects, newObject.trim()]);
      setNewObject('');
    }
  };

  const removeObject = (index: number) => {
    setObjects(objects.filter((_, i) => i !== index));
  };

  const handleRemove = async () => {
    if (!file || objects.length === 0) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      const result = await uploadToCloudinary(file);
      setProgress(60);

      // Apply smart object removal transformation
      const objectList = objects.join(';');
      const processedUrl = result.secure_url.replace(
        '/upload/',
        `/upload/e_gen_remove:${objectList},e_gen_fill/`
      );
      
      setResultUrl(processedUrl);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Objects removed successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Object removal failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  return (
    <ToolLayout
      title="Smart Object Removal"
      description="Remove multiple objects from images with intelligent background reconstruction"
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
              <label className="block text-sm font-medium mb-2">Objects to Remove</label>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newObject}
                    onChange={(e) => setNewObject(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addObject()}
                    placeholder="Enter object description"
                    className="flex-1 bg-gray-800 rounded-lg px-4 py-2 border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                  <Button onClick={addObject} disabled={!newObject.trim()}>
                    Add
                  </Button>
                </div>

                {objects.length > 0 && (
                  <div className="space-y-2">
                    {objects.map((obj, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between bg-gray-800 rounded-lg p-3"
                      >
                        <span>{obj}</span>
                        <button
                          onClick={() => removeObject(index)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-center">
              <p className="mb-4">Selected file: {file.name}</p>
              <Button 
                onClick={handleRemove}
                disabled={objects.length === 0}
              >
                Remove Objects
              </Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Removing objects and reconstructing image..."
          />
        )}
        
        {status === 'completed' && resultUrl && (
          <div className="text-center space-y-4">
            <p className="text-green-500 mb-4">Objects removed successfully!</p>
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
                  setObjects([]);
                  setNewObject('');
                }}
              >
                Remove More Objects
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default SmartObjectRemoval;