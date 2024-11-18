import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';
import { CompressionSettings } from '../../types/compressor';
import { buildCompressionTransformations, calculateOptimalBitrate, validateCompressionSettings } from '../../lib/compressor';

const VideoCompressor = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [settings, setSettings] = useState<CompressionSettings>({
    quality: 'auto',
    format: 'mp4',
    resolution: {
      width: 1920,
      height: 1080,
      maintain: true
    },
    bitrate: {
      target: 2000,
      maximum: 4000
    },
    audio: {
      enabled: true,
      quality: 'medium',
      bitrate: 128
    }
  });
  const { addToast } = useToast();

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    
    // Get video metadata and calculate optimal settings
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      const optimalBitrate = calculateOptimalBitrate(
        video.videoWidth,
        video.videoHeight,
        video.duration
      );
      
      setSettings(prev => ({
        ...prev,
        resolution: {
          ...prev.resolution,
          width: video.videoWidth,
          height: video.videoHeight
        },
        bitrate: {
          target: optimalBitrate,
          maximum: optimalBitrate * 1.5
        }
      }));
    };
    
    video.src = URL.createObjectURL(uploadedFile);
  };

  const handleCompress = async () => {
    if (!file) return;
    
    // Validate settings
    const errors = validateCompressionSettings(settings);
    if (errors.length > 0) {
      addToast({
        title: 'Invalid settings',
        description: errors.join('. '),
        type: 'error'
      });
      return;
    }
    
    try {
      setStatus('processing');
      setProgress(20);

      const result = await uploadToCloudinary(file);
      setProgress(60);

      // Build transformation string
      const transformations = buildCompressionTransformations(settings);

      // Apply transformations
      const processedUrl = result.secure_url.replace(
        '/upload/',
        `/upload/${transformations}/`
      );
      
      setResultUrl(processedUrl);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Video compressed successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Compression failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  return (
    <ToolLayout
      title="Video Compressor"
      description="Compress your videos while maintaining quality"
    >
      <div className="space-y-8">
        <FileUpload
          accept={{ 'video/*': ['.mp4', '.mov', '.avi', '.webm'] }}
          onUpload={handleUpload}
          maxSize={200 * 1024 * 1024} // 200MB limit
        />
        
        {file && status === 'idle' && (
          <div className="space-y-6">
            <div className="max-w-xl mx-auto space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Quality Profile</label>
                <select
                  value={settings.quality}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    quality: e.target.value as CompressionSettings['quality']
                  }))}
                  className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700"
                >
                  <option value="auto">Auto (Optimized)</option>
                  <option value="best">Best Quality</option>
                  <option value="good">Good Quality</option>
                  <option value="eco">Economy</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Output Format</label>
                <select
                  value={settings.format}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    format: e.target.value as CompressionSettings['format']
                  }))}
                  className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700"
                >
                  <option value="mp4">MP4</option>
                  <option value="webm">WebM</option>
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Resolution</label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.resolution.maintain}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        resolution: {
                          ...prev.resolution,
                          maintain: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                    />
                    <span className="text-sm">Maintain aspect ratio</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Width</label>
                    <input
                      type="number"
                      value={settings.resolution.width}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        resolution: {
                          ...prev.resolution,
                          width: Number(e.target.value)
                        }
                      }))}
                      className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Height</label>
                    <input
                      type="number"
                      value={settings.resolution.height}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        resolution: {
                          ...prev.resolution,
                          height: Number(e.target.value)
                        }
                      }))}
                      className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium">Bitrate Control</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Target (kbps)</label>
                    <input
                      type="number"
                      value={settings.bitrate.target}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        bitrate: {
                          ...prev.bitrate,
                          target: Number(e.target.value)
                        }
                      }))}
                      className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Maximum (kbps)</label>
                    <input
                      type="number"
                      value={settings.bitrate.maximum}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        bitrate: {
                          ...prev.bitrate,
                          maximum: Number(e.target.value)
                        }
                      }))}
                      className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Audio Settings</label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.audio.enabled}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        audio: {
                          ...prev.audio,
                          enabled: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                    />
                    <span className="text-sm">Include audio</span>
                  </label>
                </div>

                {settings.audio.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Quality</label>
                      <select
                        value={settings.audio.quality}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          audio: {
                            ...prev.audio,
                            quality: e.target.value as CompressionSettings['audio']['quality']
                          }
                        }))}
                        className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Bitrate (kbps)</label>
                      <input
                        type="number"
                        value={settings.audio.bitrate}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          audio: {
                            ...prev.audio,
                            bitrate: Number(e.target.value)
                          }
                        }))}
                        className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-center">
              <Button onClick={handleCompress}>Compress Video</Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Compressing video..."
          />
        )}
        
        {status === 'completed' && resultUrl && (
          <div className="text-center space-y-4">
            <p className="text-green-500 mb-4">Video compressed successfully!</p>
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
                Download Compressed Video
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
                Compress Another Video
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default VideoCompressor;