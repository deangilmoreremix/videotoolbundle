import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';

const ContentAwareCropping = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [cropSettings, setCropSettings] = useState({
    aspectRatio: '16:9',
    width: 1920,
    height: 1080,
    focusOn: ''
  });
  const { addToast } = useToast();

  const aspectRatios = {
    '16:9': { width: 1920, height: 1080 },
    '4:3': { width: 1600, height: 1200 },
    '1:1': { width: 1200, height: 1200 },
    '9:16': { width: 1080, height: 1920 },
    '3:4': { width: 1200, height: 1600 }
  };

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const handleAspectRatioChange = (ratio: keyof typeof aspectRatios) => {
    setCropSettings(prev => ({
      ...prev,
      aspectRatio: ratio,
      width: aspectRatios[ratio].width,
      height: aspectRatios[ratio].height
    }));
  };

  const handleCrop = async () => {
    if (!file) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      const result = await uploadToCloudinary(file);
      setProgress(60);

      // Build transformation string
      let transformation = `c_fill,w_${cropSettings.width},h_${cropSettings.height},g_auto`;
      if (cropSettings.focusOn) {
        transformation += `,g_${cropSettings.focusOn}`;
      }

      // Apply cropping transformation
      const processedUrl = result.secure_url.replace(
        '/upload/',
        `/upload/${transformation}/`
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
      title="Content-Aware Cropping"
      description="Intelligently crop images while preserving the important content"
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
                <label className="block text-sm font-medium mb-2">Aspect Ratio</label>
                <div className="grid grid-cols-5 gap-2">
                  {Object.keys(aspectRatios).map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => handleAspectRatioChange(ratio as keyof typeof aspectRatios)}
                      className={`p-2 rounded-lg border-2 transition-colors ${
                        cropSettings.aspectRatio === ratio 
                          ? 'border-red-500 bg-red-500/10' 
                          : 'border-gray-700 hover:border-red-500'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Focus On (Optional)</label>
                <select
                  value={cropSettings.focusOn}
                  onChange={(e) => setCropSettings(prev => ({
                    ...prev,
                    focusOn: e.target.value
                  }))}
                  className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700"
                >
                  <option value="">Auto-detect</option>
                  <option value="face">Faces</option>
                  <option value="center">Center</option>
                  <option value="north">Top</option>
                  <option value="south">Bottom</option>
                  <option value="east">Right</option>
                  <option value="west">Left</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Width (px)</label>
                  <input
                    type="number"
                    value={cropSettings.width}
                    onChange={(e) => setCropSettings(prev => ({
                      ...prev,
                      width: Number(e.target.value)
                    }))}
                    className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Height (px)</label>
                  <input
                    type="number"
                    value={cropSettings.height}
                    onChange={(e) => setCropSettings(prev => ({
                      ...prev,
                      height: Number(e.target.value)
                    }))}
                    className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700"
                  />
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="mb-4">Selected file: {file.name}</p>
              <Button onClick={handleCrop}>Crop Image</Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Analyzing content and cropping..."
          />
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
                Crop Another Image
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default ContentAwareCropping;