import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';

interface StreamProfile {
  name: string;
  bitrate: string;
  resolution: string;
  description: string;
}

const AdaptiveStreaming = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrls, setResultUrls] = useState<Record<string, string>>({});
  const { addToast } = useToast();

  const streamProfiles: Record<string, StreamProfile> = {
    high: {
      name: 'High Quality',
      bitrate: '5000k',
      resolution: '1080',
      description: 'Full HD quality for high-speed connections'
    },
    medium: {
      name: 'Medium Quality',
      bitrate: '2500k',
      resolution: '720',
      description: 'HD quality for standard connections'
    },
    low: {
      name: 'Low Quality',
      bitrate: '800k',
      resolution: '480',
      description: 'SD quality for slower connections'
    },
    mobile: {
      name: 'Mobile Quality',
      bitrate: '400k',
      resolution: '360',
      description: 'Optimized for mobile data'
    }
  };

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const handleCreateStream = async () => {
    if (!file) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      const result = await uploadToCloudinary(file);
      setProgress(40);

      // Create streaming variants
      const variants: Record<string, string> = {};
      let currentProgress = 40;
      const progressStep = 50 / Object.keys(streamProfiles).length;

      for (const [key, profile] of Object.entries(streamProfiles)) {
        const streamUrl = result.secure_url.replace(
          '/upload/',
          `/upload/q_auto,f_auto,br_${profile.bitrate},h_${profile.resolution}/`
        );
        variants[key] = streamUrl;
        currentProgress += progressStep;
        setProgress(Math.round(currentProgress));
      }

      setResultUrls(variants);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Adaptive streams created successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Stream creation failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  return (
    <ToolLayout
      title="Adaptive Streaming"
      description="Create adaptive bitrate streams for optimal video playback across different network conditions"
    >
      <div className="space-y-8">
        <FileUpload
          accept={{ 'video/*': ['.mp4', '.mov', '.avi', '.webm'] }}
          onUpload={handleUpload}
          maxSize={500 * 1024 * 1024} // 500MB limit
        />
        
        {file && status === 'idle' && (
          <div className="space-y-6">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-lg font-medium mb-4">Stream Variants to be Created</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(streamProfiles).map(([key, profile]) => (
                  <div
                    key={key}
                    className="p-4 rounded-lg border border-gray-700 bg-gray-800"
                  >
                    <div className="text-lg font-bold mb-1">{profile.name}</div>
                    <div className="text-sm text-gray-400 mb-2">{profile.description}</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">Bitrate:</span>{' '}
                        <span className="font-medium">{profile.bitrate}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Resolution:</span>{' '}
                        <span className="font-medium">{profile.resolution}p</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <p className="mb-4">Selected file: {file.name}</p>
              <Button onClick={handleCreateStream}>Create Adaptive Streams</Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Creating adaptive streaming variants..."
          />
        )}
        
        {status === 'completed' && Object.keys(resultUrls).length > 0 && (
          <div className="space-y-6">
            <p className="text-green-500 text-center mb-4">Adaptive streams created successfully!</p>
            
            <div className="space-y-4">
              {Object.entries(resultUrls).map(([key, url]) => (
                <div key={key} className="border border-gray-800 rounded-lg overflow-hidden">
                  <div className="bg-gray-800 p-3">
                    <h4 className="font-medium">{streamProfiles[key].name}</h4>
                    <p className="text-sm text-gray-400">
                      {streamProfiles[key].resolution}p @ {streamProfiles[key].bitrate}
                    </p>
                  </div>
                  <div className="p-4">
                    <video 
                      src={url} 
                      controls 
                      className="w-full"
                      poster={url.replace(/\.[^/.]+$/, '.jpg')}
                    >
                      <source src={url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <div className="bg-gray-800 p-3 flex justify-end">
                    <Button as="a" href={url} download size="sm">
                      Download Stream
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
                Create New Streams
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default AdaptiveStreaming;