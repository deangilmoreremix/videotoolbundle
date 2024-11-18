import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';

interface TranscodingProfile {
  name: string;
  format: string;
  quality: string;
  resolution: string;
  description: string;
}

const DynamicTranscoding = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [selectedProfile, setSelectedProfile] = useState<string>('mobile');
  const { addToast } = useToast();

  const profiles: Record<string, TranscodingProfile> = {
    mobile: {
      name: 'Mobile Optimized',
      format: 'mp4',
      quality: 'auto:low',
      resolution: '720',
      description: 'Best for mobile devices with limited bandwidth'
    },
    tablet: {
      name: 'Tablet Optimized',
      format: 'mp4',
      quality: 'auto:good',
      resolution: '1080',
      description: 'Balanced quality for tablets and iPads'
    },
    desktop: {
      name: 'Desktop HD',
      format: 'mp4',
      quality: 'auto:best',
      resolution: '1440',
      description: 'High quality for desktop viewing'
    },
    web: {
      name: 'Web Optimized',
      format: 'webm',
      quality: 'auto:good',
      resolution: '1080',
      description: 'Optimized for web browsers with WebM support'
    }
  };

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const handleTranscode = async () => {
    if (!file) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      const result = await uploadToCloudinary(file);
      setProgress(60);

      const profile = profiles[selectedProfile];
      
      // Apply transcoding transformation
      const processedUrl = result.secure_url.replace(
        '/upload/',
        `/upload/q_${profile.quality},f_${profile.format},h_${profile.resolution}/`
      );
      
      setResultUrl(processedUrl);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Video transcoded successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Transcoding failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  return (
    <ToolLayout
      title="Dynamic Video Transcoding"
      description="Convert videos to optimal formats for different devices and platforms"
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
              <label className="block text-sm font-medium mb-4">Select Optimization Profile</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(profiles).map(([key, profile]) => (
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
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">Format:</span>{' '}
                        <span className="font-medium uppercase">{profile.format}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Resolution:</span>{' '}
                        <span className="font-medium">{profile.resolution}p</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <p className="mb-4">Selected file: {file.name}</p>
              <Button onClick={handleTranscode}>Transcode Video</Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Transcoding video for optimal playback..."
          />
        )}
        
        {status === 'completed' && resultUrl && (
          <div className="text-center space-y-4">
            <p className="text-green-500 mb-4">Video transcoded successfully!</p>
            <div className="max-w-2xl mx-auto border border-gray-800 rounded-lg overflow-hidden">
              <video 
                src={resultUrl} 
                controls 
                className="w-full"
                poster={resultUrl.replace(/\.[^/.]+$/, '.jpg')}
              />
            </div>
            <div className="flex justify-center gap-4">
              <Button as="a" href={resultUrl} download>
                Download Transcoded Video
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
                Transcode Another Video
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default DynamicTranscoding;