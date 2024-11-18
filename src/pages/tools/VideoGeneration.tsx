import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';
import VideoStyleSelect from '../../components/video/VideoStyleSelect';
import TransitionSelect from '../../components/video/TransitionSelect';
import MediaPreview from '../../components/video/MediaPreview';
import { Music, Volume2 } from 'lucide-react';

interface VideoSettings {
  style: string;
  transition: string;
  duration: number;
  audio: {
    enabled: boolean;
    volume: number;
    fadeIn: boolean;
    fadeOut: boolean;
  };
  quality: 'auto' | 'best' | 'good' | 'eco';
}

const VideoGeneration = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [settings, setSettings] = useState<VideoSettings>({
    style: 'cinematic',
    transition: 'fade',
    duration: 15,
    audio: {
      enabled: true,
      volume: 100,
      fadeIn: true,
      fadeOut: true
    },
    quality: 'auto'
  });
  const { addToast } = useToast();

  const handleUpload = (uploadedFile: File) => {
    if (files.length < 10) {
      setFiles(prev => [...prev, uploadedFile]);
    } else {
      addToast({
        title: 'Maximum files reached',
        description: 'You can only upload up to 10 files',
        type: 'error'
      });
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleReorderFiles = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= files.length) return;
    const newFiles = [...files];
    const [movedFile] = newFiles.splice(fromIndex, 1);
    newFiles.splice(toIndex, 0, movedFile);
    setFiles(newFiles);
  };

  const handleGenerate = async () => {
    if (files.length === 0) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      // Upload all files
      const uploadedFiles = await Promise.all(
        files.map(async (file, index) => {
          const result = await uploadToCloudinary(file);
          setProgress(20 + ((index + 1) / files.length) * 40);
          return result.public_id;
        })
      );

      // Build transformation string
      const transformations = [
        `e_${settings.style}`,
        `e_transition:${settings.transition}`,
        `du_${settings.duration}`,
        settings.audio.enabled && [
          `ac_${settings.audio.volume}`,
          settings.audio.fadeIn && 'af_fade_in:2000',
          settings.audio.fadeOut && 'af_fade_out:2000'
        ].filter(Boolean).join(','),
        `q_${settings.quality}`
      ].filter(Boolean).join(',');

      // Create video URL with transformations
      const processedUrl = `https://res.cloudinary.com/${process.env.VITE_CLOUDINARY_CLOUD_NAME}/video/upload/${transformations}/${uploadedFiles.join(';')}.mp4`;
      
      setResultUrl(processedUrl);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Video generated successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Video generation failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  return (
    <ToolLayout
      title="Video Generation"
      description="Generate professional videos from your images and media assets"
    >
      <div className="space-y-8">
        {files.length < 10 && (
          <FileUpload
            accept={{ 
              'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
              'video/*': ['.mp4', '.mov', '.avi']
            }}
            onUpload={handleUpload}
            maxSize={50 * 1024 * 1024} // 50MB limit
          />
        )}
        
        {files.length > 0 && status === 'idle' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium mb-4">Media Files</h3>
              <MediaPreview
                files={files}
                onRemove={handleRemoveFile}
                onReorder={handleReorderFiles}
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Video Style</h3>
              <VideoStyleSelect
                value={settings.style}
                onChange={(style) => setSettings(prev => ({ ...prev, style }))}
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Transition Effect</h3>
              <TransitionSelect
                value={settings.transition}
                onChange={(transition) => setSettings(prev => ({ ...prev, transition }))}
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Duration & Audio</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Video Duration: {settings.duration} seconds
                  </label>
                  <input
                    type="range"
                    min={5}
                    max={60}
                    step={5}
                    value={settings.duration}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      duration: Number(e.target.value)
                    }))}
                    className="w-full accent-red-500"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Music className="w-5 h-5" />
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
                    <span className="text-sm">Enable background music</span>
                  </div>

                  {settings.audio.enabled && (
                    <div className="space-y-4 pl-7">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Volume: {settings.audio.volume}%
                        </label>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={settings.audio.volume}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            audio: {
                              ...prev.audio,
                              volume: Number(e.target.value)
                            }
                          }))}
                          className="w-full accent-red-500"
                        />
                      </div>

                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={settings.audio.fadeIn}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              audio: {
                                ...prev.audio,
                                fadeIn: e.target.checked
                              }
                            }))}
                            className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                          />
                          <span className="text-sm">Fade in</span>
                        </label>

                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={settings.audio.fadeOut}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              audio: {
                                ...prev.audio,
                                fadeOut: e.target.checked
                              }
                            }))}
                            className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                          />
                          <span className="text-sm">Fade out</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Output Quality</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(['auto', 'best', 'good', 'eco'] as const).map((quality) => (
                  <button
                    key={quality}
                    onClick={() => setSettings(prev => ({ ...prev, quality }))}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      settings.quality === quality 
                        ? 'border-red-500 bg-red-500/10' 
                        : 'border-gray-700 hover:border-red-500'
                    }`}
                  >
                    <div className="text-lg font-bold mb-1 uppercase">{quality}</div>
                    <p className="text-sm text-gray-400">
                      {quality === 'auto' && 'Smart optimization'}
                      {quality === 'best' && 'Highest quality'}
                      {quality === 'good' && 'Balanced quality'}
                      {quality === 'eco' && 'Smaller file size'}
                    </p>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <Button onClick={handleGenerate}>Generate Video</Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Generating video with selected effects..."
          />
        )}
        
        {status === 'completed' && resultUrl && (
          <div className="text-center space-y-4">
            <p className="text-green-500 mb-4">Video generated successfully!</p>
            <div className="max-w-2xl mx-auto border border-gray-800 rounded-lg overflow-hidden">
              <video 
                src={resultUrl} 
                controls 
                className="w-full"
                poster={resultUrl.replace('.mp4', '.jpg')}
              />
            </div>
            <div className="flex justify-center gap-4">
              <Button as="a" href={resultUrl} download>
                Download Video
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setStatus('idle');
                  setProgress(0);
                  setResultUrl('');
                  setFiles([]);
                }}
              >
                Generate Another Video
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default VideoGeneration;