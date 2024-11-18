import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';
import { ImageToVideoSettings } from '../../types/imageToVideo';
import { MotionPathEditor } from '../../components/video/motion/MotionPathEditor';
import { KenBurnsEditor } from '../../components/video/motion/KenBurnsEditor';
import { ParallaxEditor } from '../../components/video/motion/ParallaxEditor';
import { ColorGradingControls } from '../../components/video/ColorGradingControls';

const ImageToVideo = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [settings, setSettings] = useState<ImageToVideoSettings>({
    duration: 5,
    fps: 30,
    motion: {
      enabled: true,
      type: 'kenBurns',
      kenBurns: {
        scale: 1.2,
        pan: { x: 0, y: 0 },
        rotation: 0
      }
    },
    effects: {
      colorGrading: {
        enabled: true,
        brightness: 0,
        contrast: 0,
        saturation: 0,
        temperature: 0,
        tint: 0
      }
    },
    audio: {
      enabled: false,
      volume: 100,
      fadeIn: false,
      fadeOut: false
    },
    output: {
      format: 'mp4',
      quality: 'auto',
      resolution: {
        width: 1920,
        height: 1080
      }
    }
  });
  const { addToast } = useToast();

  const handleUpload = (uploadedFile: File) => {
    if (files.length < 10) {
      setFiles(prev => [...prev, uploadedFile]);
    } else {
      addToast({
        title: 'Maximum files reached',
        description: 'You can only upload up to 10 images',
        type: 'error'
      });
    }
  };

  const handleGenerate = async () => {
    if (files.length === 0) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      // Upload all images
      const uploadedFiles = await Promise.all(
        files.map(async (file, index) => {
          const result = await uploadToCloudinary(file);
          setProgress(20 + ((index + 1) / files.length) * 40);
          return result.public_id;
        })
      );

      // Build transformation string
      const transformations = [
        settings.motion.enabled && `e_${settings.motion.type}`,
        settings.effects.colorGrading.enabled && [
          `e_brightness:${settings.effects.colorGrading.brightness}`,
          `e_contrast:${settings.effects.colorGrading.contrast}`,
          `e_saturation:${settings.effects.colorGrading.saturation}`
        ],
        `w_${settings.output.resolution.width}`,
        `h_${settings.output.resolution.height}`,
        `fps_${settings.fps}`,
        `du_${settings.duration}`,
        `f_${settings.output.format}`,
        `q_${settings.output.quality}`
      ].flat().filter(Boolean).join(',');

      // Create video URL
      const videoUrl = `https://res.cloudinary.com/${process.env.VITE_CLOUDINARY_CLOUD_NAME}/video/upload/${transformations}/${uploadedFiles.join(';')}.${settings.output.format}`;
      
      setResultUrl(videoUrl);
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
      title="Image to Video"
      description="Convert images into dynamic videos with professional effects"
    >
      <div className="space-y-8">
        <FileUpload
          accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
          onUpload={handleUpload}
          maxSize={10 * 1024 * 1024} // 10MB limit
        />
        
        {files.length > 0 && status === 'idle' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Motion Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Motion</h3>
                {settings.motion.type === 'kenBurns' && (
                  <KenBurnsEditor
                    settings={settings.motion.kenBurns!}
                    onChange={(kenBurns) => setSettings(prev => ({
                      ...prev,
                      motion: {
                        ...prev.motion,
                        kenBurns
                      }
                    }))}
                  />
                )}
              </div>

              {/* Effects Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Effects</h3>
                <ColorGradingControls
                  settings={settings.effects.colorGrading}
                  onChange={(colorGrading) => setSettings(prev => ({
                    ...prev,
                    effects: {
                      ...prev.effects,
                      colorGrading
                    }
                  }))}
                />
              </div>
            </div>

            {/* Output Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Output Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Format</label>
                  <select
                    value={settings.output.format}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      output: {
                        ...prev.output,
                        format: e.target.value as 'mp4' | 'webm'
                      }
                    }))}
                    className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700"
                  >
                    <option value="mp4">MP4</option>
                    <option value="webm">WebM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Quality</label>
                  <select
                    value={settings.output.quality}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      output: {
                        ...prev.output,
                        quality: e.target.value as 'auto' | 'best' | 'good' | 'eco'
                      }
                    }))}
                    className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700"
                  >
                    <option value="auto">Auto</option>
                    <option value="best">Best</option>
                    <option value="good">Good</option>
                    <option value="eco">Economy</option>
                  </select>
                </div>
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
            message="Generating video from images..."
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
                poster={resultUrl.replace(/\.[^/.]+$/, '.jpg')}
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
                Create Another Video
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default ImageToVideo;