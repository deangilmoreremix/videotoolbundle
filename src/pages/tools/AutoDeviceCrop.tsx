import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';

interface DevicePreset {
  name: string;
  width: number;
  height: number;
  description: string;
}

const AutoDeviceCrop = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrls, setResultUrls] = useState<Record<string, string>>({});
  const { addToast } = useToast();

  const devicePresets: Record<string, DevicePreset> = {
    mobile: {
      name: 'Mobile',
      width: 390,
      height: 844,
      description: 'iPhone 14 and similar devices'
    },
    tablet: {
      name: 'Tablet',
      width: 820,
      height: 1180,
      description: 'iPad Air and similar tablets'
    },
    desktop: {
      name: 'Desktop',
      width: 1920,
      height: 1080,
      description: 'Standard desktop displays'
    },
    instagram: {
      name: 'Instagram Post',
      width: 1080,
      height: 1080,
      description: 'Square format for Instagram'
    },
    story: {
      name: 'Story/Reels',
      width: 1080,
      height: 1920,
      description: 'Vertical format for stories'
    }
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
      setProgress(40);

      // Generate crops for each device preset
      const crops: Record<string, string> = {};
      let currentProgress = 40;
      const progressStep = 50 / Object.keys(devicePresets).length;

      for (const [key, preset] of Object.entries(devicePresets)) {
        const cropUrl = result.secure_url.replace(
          '/upload/',
          `/upload/w_${preset.width},h_${preset.height},c_fill,g_auto/`
        );
        crops[key] = cropUrl;
        currentProgress += progressStep;
        setProgress(Math.round(currentProgress));
      }

      setResultUrls(crops);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Device-specific crops generated successfully',
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
      title="Auto Device Crop"
      description="Automatically crop images for different devices and platforms"
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
            <Button onClick={handleCrop}>Generate Device Crops</Button>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Generating device-specific crops..."
          />
        )}
        
        {status === 'completed' && Object.keys(resultUrls).length > 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(resultUrls).map(([key, url]) => (
                <div key={key} className="border border-gray-800 rounded-lg overflow-hidden">
                  <div className="bg-gray-800 p-3">
                    <h4 className="font-medium">{devicePresets[key].name}</h4>
                    <p className="text-sm text-gray-400">
                      {devicePresets[key].width}x{devicePresets[key].height}
                    </p>
                  </div>
                  <div className="relative bg-gray-900">
                    <img 
                      src={url} 
                      alt={`${devicePresets[key].name} crop`}
                      className="w-full"
                    />
                  </div>
                  <div className="bg-gray-800 p-3 flex justify-end">
                    <Button as="a" href={url} download size="sm">
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => {
                  setStatus('idle');
                  setProgress(0);
                  setResultUrls({});
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

export default AutoDeviceCrop;