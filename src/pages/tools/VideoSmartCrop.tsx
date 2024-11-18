import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';

interface CropProfile {
  name: string;
  width: number;
  height: number;
  description: string;
}

const VideoSmartCrop = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [selectedProfile, setSelectedProfile] = useState<string>('youtube');
  const { addToast } = useToast();

  const cropProfiles: Record<string, CropProfile> = {
    youtube: {
      name: 'YouTube',
      width: 1920,
      height: 1080,
      description: '16:9 aspect ratio for standard YouTube videos'
    },
    instagram: {
      name: 'Instagram Square',
      width: 1080,
      height: 1080,
      description: '1:1 aspect ratio for Instagram feed posts'
    },
    story: {
      name: 'Story/Reels',
      width: 1080,
      height: 1920,
      description: '9:16 aspect ratio for Stories and Reels'
    },
    facebook: {
      name: 'Facebook Feed',
      width: 1280,
      height: 720,
      description: '16:9 aspect ratio optimized for Facebook'
    },
    tiktok: {
      name: 'TikTok',
      width: 1080,
      height: 1920,
      description: '9:16 aspect ratio for TikTok videos'
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
      setProgress(60);

      const profile = cropProfiles[selectedProfile];
      
      // Apply smart cropping transformation
      const processedUrl = result.secure_url.replace(
        '/upload/',
        `/upload/w_${profile.width},h_${profile.height},c_fill,g_auto/`
      );
      
      setResultUrl(processedUrl);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Video cropped successfully',
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
      title="Video Smart Crop"
      description="Automatically crop and resize videos for different social media platforms"
    >
      <div className="space-y-8">
        <FileUpload
          accept={{ 'video/*': ['.mp4', '.mov', '.avi', '.webm'] }}
          onUpload={handleUpload}
          maxSize={200 * 1024 * 1024} // 200MB limit
        />
        
        {file && status === 'idle' && (
          <div className="space-y-6">
            <div className="max-w-3xl mx-auto">
              <label className="block text-sm font-medium mb-4">Select Platform Format</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(cropProfiles).map(([key, profile]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedProfile(key)}
                    className={`p-4 text-left rounded-lg border-2 transition-colors ${
                      selectedProfile === key 
                        ? 'border-red-500 bg-red-500/10' 
                        : 'border-gray-700 hover:border-red-500'
                    }`}
                  >
                    <div className="text-lg font-bold mb-1">{profile.name}</div>
                    <div className="text-sm text-gray-400 mb-2">{profile.description}</div>
                    <div className="text-sm">
                      <span className="text-gray-400">Resolution:</span>{' '}
                      <span className="font-medium">{profile.width}x{profile.height}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <p className="mb-4">Selected file: {file.name}</p>
              <Button onClick={handleCrop}>Crop Video</Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Analyzing content and cropping video..."
          />
        )}
        
        {status === 'completed' && resultUrl && (
          <div className="text-center space-y-4">
            <p className="text-green-500 mb-4">Video cropped successfully!</p>
            <div className="max-w-2xl mx-auto border border-gray-800 rounded-lg overflow-hidden">
              <div className="bg-gray-800 p-3">
                <h4 className="font-medium">{cropProfiles[selectedProfile].name}</h4>
                <p className="text-sm text-gray-400">
                  {cropProfiles[selectedProfile].width}x{cropProfiles[selectedProfile].height}
                </p>
              </div>
              <video 
                src={resultUrl} 
                controls 
                className="w-full"
                poster={resultUrl.replace(/\.[^/.]+$/, '.jpg')}
              />
            </div>
            <div className="flex justify-center gap-4">
              <Button as="a" href={resultUrl} download>
                Download Cropped Video
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
                Crop Another Video
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default VideoSmartCrop;