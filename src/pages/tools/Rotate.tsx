import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';
import { RotateCw, RotateCcw } from 'lucide-react';

const Rotate = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [angle, setAngle] = useState(0);
  const { addToast } = useToast();

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const rotateBy = (degrees: number) => {
    setAngle((current) => {
      const newAngle = (current + degrees) % 360;
      return newAngle < 0 ? newAngle + 360 : newAngle;
    });
  };

  const handleRotate = async () => {
    if (!file) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      const result = await uploadToCloudinary(file);
      setProgress(60);

      // Apply rotation transformation
      const processedUrl = result.secure_url.replace(
        '/upload/',
        `/upload/a_${angle}/`
      );
      
      setResultUrl(processedUrl);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Image rotated successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Rotation failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  return (
    <ToolLayout
      title="Rotate Image"
      description="Rotate your images with precise angle control"
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
              <div className="text-center mb-4">
                <p className="text-lg font-medium">Current Angle: {angle}°</p>
              </div>
              
              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => rotateBy(-90)}
                  variant="outline"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Rotate Left
                </Button>
                <Button
                  onClick={() => rotateBy(90)}
                  variant="outline"
                >
                  <RotateCw className="w-5 h-5 mr-2" />
                  Rotate Right
                </Button>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">
                  Fine Adjustment
                </label>
                <input
                  type="range"
                  min={0}
                  max={359}
                  value={angle}
                  onChange={(e) => setAngle(Number(e.target.value))}
                  className="w-full accent-red-500"
                />
              </div>
            </div>
            
            <div className="text-center">
              <p className="mb-4">Selected file: {file.name}</p>
              <Button onClick={handleRotate}>Apply Rotation</Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Rotating image..."
          />
        )}
        
        {status === 'completed' && resultUrl && (
          <div className="text-center space-y-4">
            <p className="text-green-500 mb-4">Image rotated successfully!</p>
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
                <h4 className="text-sm font-medium p-2 bg-gray-800">Rotated</h4>
                <img 
                  src={resultUrl} 
                  alt="Rotated" 
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
                  setAngle(0);
                }}
              >
                Rotate Another Image
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default Rotate;