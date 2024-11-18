import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';
import { Video, Settings, Wand2 } from 'lucide-react';

interface GifSettings {
  width: number;
  height: number;
  fps: number;
  startTime: number;
  duration: number;
  quality: number;
  optimization: {
    enabled: boolean;
    colorReduction: number;
    dithering: boolean;
    lossy: number;
  };
  aiEnhancement: {
    enabled: boolean;
    mode: 'quality' | 'performance' | 'balanced';
    preserveMotion: boolean;
    smartFrames: boolean;
  };
  effects: {
    loop: boolean;
    boomerang: boolean;
    reverse: boolean;
    fadeIn: boolean;
    fadeOut: boolean;
  };
}

const VideoToGif = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [settings, setSettings] = useState<GifSettings>({
    width: 800,
    height: 600,
    fps: 15,
    startTime: 0,
    duration: 5,
    quality: 80,
    optimization: {
      enabled: true,
      colorReduction: 256,
      dithering: true,
      lossy: 20
    },
    aiEnhancement: {
      enabled: true,
      mode: 'balanced',
      preserveMotion: true,
      smartFrames: true
    },
    effects: {
      loop: true,
      boomerang: false,
      reverse: false,
      fadeIn: false,
      fadeOut: false
    }
  });
  const { addToast } = useToast();

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    
    // Get video metadata to set optimal settings
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      const aspectRatio = video.videoWidth / video.videoHeight;
      const newHeight = Math.round(settings.width / aspectRatio);
      
      setSettings(prev => ({
        ...prev,
        height: newHeight
      }));
    };
    
    video.src = URL.createObjectURL(uploadedFile);
  };

  const handleConvert = async () => {
    if (!file) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      const result = await uploadToCloudinary(file);
      setProgress(60);

      // Build transformation string
      const transformations = [
        `w_${settings.width}`,
        `h_${settings.height}`,
        `fps_${settings.fps}`,
        `so_${settings.startTime}`,
        `du_${settings.duration}`,
        settings.optimization.enabled && [
          `colors_${settings.optimization.colorReduction}`,
          settings.optimization.dithering && 'e_dither',
          `lossy_${settings.optimization.lossy}`
        ],
        settings.aiEnhancement.enabled && [
          `e_enhance:${settings.aiEnhancement.mode}`,
          settings.aiEnhancement.preserveMotion && 'e_preserve_motion',
          settings.aiEnhancement.smartFrames && 'e_smart_frame_selection'
        ],
        settings.effects.loop && 'fl_loop',
        settings.effects.boomerang && 'e_boomerang',
        settings.effects.reverse && 'e_reverse',
        settings.effects.fadeIn && 'e_fade:2000',
        settings.effects.fadeOut && 'e_fade:-2000',
        'f_gif'
      ].flat().filter(Boolean).join(',');

      // Generate GIF URL with transformations
      const processedUrl = result.secure_url.replace(
        '/upload/',
        `/upload/${transformations}/`
      );
      
      setResultUrl(processedUrl);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Video converted to GIF successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Conversion failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  return (
    <ToolLayout
      title="Video to GIF"
      description="Convert your videos to high-quality GIFs with advanced controls"
    >
      <div className="space-y-8">
        <FileUpload
          accept={{ 'video/*': ['.mp4', '.mov', '.avi', '.webm'] }}
          onUpload={handleUpload}
          maxSize={100 * 1024 * 1024} // 100MB limit
        />
        
        {file && status === 'idle' && (
          <div className="space-y-6">
            <div className="max-w-xl mx-auto space-y-6">
              <div>
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Basic Settings
                </h3>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Width (px)</label>
                    <input
                      type="number"
                      value={settings.width}
                      onChange={(e) => setSettings(prev => ({
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
                      value={settings.height}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        height: Number(e.target.value)
                      }))}
                      className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">
                    Frame Rate: {settings.fps} FPS
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={30}
                    value={settings.fps}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      fps: Number(e.target.value)
                    }))}
                    className="w-full accent-red-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Start Time (s)</label>
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={settings.startTime}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        startTime: Number(e.target.value)
                      }))}
                      className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Duration (s)</label>
                    <input
                      type="number"
                      min={0.1}
                      step={0.1}
                      value={settings.duration}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        duration: Number(e.target.value)
                      }))}
                      className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  Optimization
                </h3>
                <div className="space-y-4 mt-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.optimization.enabled}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        optimization: {
                          ...prev.optimization,
                          enabled: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                    />
                    <span className="text-sm">Enable Advanced Optimization</span>
                  </label>

                  {settings.optimization.enabled && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Color Reduction: {settings.optimization.colorReduction} colors
                        </label>
                        <input
                          type="range"
                          min={2}
                          max={256}
                          step={2}
                          value={settings.optimization.colorReduction}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            optimization: {
                              ...prev.optimization,
                              colorReduction: Number(e.target.value)
                            }
                          }))}
                          className="w-full accent-red-500"
                        />
                      </div>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.optimization.dithering}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            optimization: {
                              ...prev.optimization,
                              dithering: e.target.checked
                            }
                          }))}
                          className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                        />
                        <span className="text-sm">Enable Dithering</span>
                      </label>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Lossy Compression: {settings.optimization.lossy}%
                        </label>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={settings.optimization.lossy}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            optimization: {
                              ...prev.optimization,
                              lossy: Number(e.target.value)
                            }
                          }))}
                          className="w-full accent-red-500"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Effects
                </h3>
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.effects.loop}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          effects: {
                            ...prev.effects,
                            loop: e.target.checked
                          }
                        }))}
                        className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                      />
                      <span className="text-sm">Loop GIF</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.effects.boomerang}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          effects: {
                            ...prev.effects,
                            boomerang: e.target.checked
                          }
                        }))}
                        className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                      />
                      <span className="text-sm">Boomerang Effect</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.effects.reverse}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          effects: {
                            ...prev.effects,
                            reverse: e.target.checked
                          }
                        }))}
                        className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                      />
                      <span className="text-sm">Reverse Playback</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.effects.fadeIn}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          effects: {
                            ...prev.effects,
                            fadeIn: e.target.checked
                          }
                        }))}
                        className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                      />
                      <span className="text-sm">Fade In</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.effects.fadeOut}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          effects: {
                            ...prev.effects,
                            fadeOut: e.target.checked
                          }
                        }))}
                        className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                      />
                      <span className="text-sm">Fade Out</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <Button onClick={handleConvert}>Convert to GIF</Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Converting video to GIF..."
          />
        )}
        
        {status === 'completed' && resultUrl && (
          <div className="text-center space-y-4">
            <p className="text-green-500 mb-4">Video converted to GIF successfully!</p>
            <div className="max-w-2xl mx-auto border border-gray-800 rounded-lg overflow-hidden">
              <img 
                src={resultUrl} 
                alt="Converted GIF" 
                className="w-full"
              />
            </div>
            <div className="flex justify-center gap-4">
              <Button as="a" href={resultUrl} download="converted.gif">
                Download GIF
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
                Convert Another Video
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default VideoToGif;