import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';
import { Video, Palette, Sliders, Volume2, Clock } from 'lucide-react';

interface TransformSettings {
  color: {
    brightness: number;
    contrast: number;
    saturation: number;
    vibrance: number;
    gamma: number;
  };
  effects: {
    vignette: boolean;
    noise: boolean;
    grain: boolean;
    fadeIn: boolean;
    fadeOut: boolean;
  };
  audio: {
    volume: number;
    fadeIn: boolean;
    fadeOut: boolean;
    mute: boolean;
  };
  speed: {
    rate: number;
    preservePitch: boolean;
  };
}

const VideoTransforms = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [settings, setSettings] = useState<TransformSettings>({
    color: {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      vibrance: 0,
      gamma: 1
    },
    effects: {
      vignette: false,
      noise: false,
      grain: false,
      fadeIn: false,
      fadeOut: false
    },
    audio: {
      volume: 100,
      fadeIn: false,
      fadeOut: false,
      mute: false
    },
    speed: {
      rate: 1,
      preservePitch: true
    }
  });
  const { addToast } = useToast();

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const handleTransform = async () => {
    if (!file) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      const result = await uploadToCloudinary(file);
      setProgress(60);

      // Build transformation string
      const transformations = [];

      // Color adjustments
      if (settings.color.brightness !== 0) {
        transformations.push(`e_brightness:${settings.color.brightness}`);
      }
      if (settings.color.contrast !== 0) {
        transformations.push(`e_contrast:${settings.color.contrast}`);
      }
      if (settings.color.saturation !== 0) {
        transformations.push(`e_saturation:${settings.color.saturation}`);
      }
      if (settings.color.vibrance !== 0) {
        transformations.push(`e_vibrance:${settings.color.vibrance}`);
      }
      if (settings.color.gamma !== 1) {
        transformations.push(`e_gamma:${settings.color.gamma}`);
      }

      // Effects
      if (settings.effects.vignette) {
        transformations.push('e_vignette:30');
      }
      if (settings.effects.noise) {
        transformations.push('e_noise:20');
      }
      if (settings.effects.grain) {
        transformations.push('e_grayscale');
      }
      if (settings.effects.fadeIn) {
        transformations.push('e_fade:2000');
      }
      if (settings.effects.fadeOut) {
        transformations.push('e_fade:-2000');
      }

      // Audio adjustments
      if (settings.audio.mute) {
        transformations.push('ac_none');
      } else {
        if (settings.audio.volume !== 100) {
          transformations.push(`ac_volume:${settings.audio.volume}`);
        }
        if (settings.audio.fadeIn) {
          transformations.push('af_fade_in:2000');
        }
        if (settings.audio.fadeOut) {
          transformations.push('af_fade_out:2000');
        }
      }

      // Speed adjustments
      if (settings.speed.rate !== 1) {
        transformations.push(`e_acceleration:${settings.speed.rate * 100}`);
        if (settings.speed.preservePitch) {
          transformations.push('ac_preserve_pitch');
        }
      }

      // Apply transformations
      const processedUrl = transformations.length > 0
        ? result.secure_url.replace('/upload/', `/upload/${transformations.join(',')}/`)
        : result.secure_url;
      
      setResultUrl(processedUrl);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Video transformed successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Transformation failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  return (
    <ToolLayout
      title="Video Transforms"
      description="Apply professional transformations and effects to your videos"
    >
      <div className="space-y-8">
        <FileUpload
          accept={{ 'video/*': ['.mp4', '.mov', '.avi', '.webm'] }}
          onUpload={handleUpload}
          maxSize={200 * 1024 * 1024} // 200MB limit
        />
        
        {file && status === 'idle' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Color Adjustments */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Color Adjustments
                </h3>
                
                <div className="space-y-4">
                  {Object.entries(settings.color).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium mb-2">
                        {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
                        {key === 'gamma' ? '' : '%'}
                      </label>
                      <input
                        type="range"
                        min={key === 'gamma' ? 0.1 : -100}
                        max={key === 'gamma' ? 3 : 100}
                        step={key === 'gamma' ? 0.1 : 1}
                        value={value}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          color: {
                            ...prev.color,
                            [key]: Number(e.target.value)
                          }
                        }))}
                        className="w-full accent-red-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Effects */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Sliders className="w-5 h-5" />
                  Effects
                </h3>
                
                <div className="space-y-2">
                  {Object.entries(settings.effects).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          effects: {
                            ...prev.effects,
                            [key]: e.target.checked
                          }
                        }))}
                        className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                      />
                      <span className="text-sm capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Audio */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  Audio
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Volume: {settings.audio.volume}%
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={200}
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

                  <div className="space-y-2">
                    {Object.entries(settings.audio)
                      .filter(([key]) => key !== 'volume')
                      .map(([key, value]) => (
                        <label key={key} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              audio: {
                                ...prev.audio,
                                [key]: e.target.checked
                              }
                            }))}
                            className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                          />
                          <span className="text-sm capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Speed */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Speed
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Playback Rate: {settings.speed.rate}x
                    </label>
                    <input
                      type="range"
                      min={0.25}
                      max={4}
                      step={0.25}
                      value={settings.speed.rate}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        speed: {
                          ...prev.speed,
                          rate: Number(e.target.value)
                        }
                      }))}
                      className="w-full accent-red-500"
                    />
                  </div>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.speed.preservePitch}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        speed: {
                          ...prev.speed,
                          preservePitch: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                    />
                    <span className="text-sm">Preserve audio pitch</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <Button onClick={handleTransform}>Apply Transforms</Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Applying video transformations..."
          />
        )}
        
        {status === 'completed' && resultUrl && (
          <div className="text-center space-y-4">
            <p className="text-green-500 mb-4">Video transformed successfully!</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-800 rounded-lg overflow-hidden">
                <h4 className="text-sm font-medium p-2 bg-gray-800">Original</h4>
                <video 
                  src={URL.createObjectURL(file)} 
                  controls 
                  className="w-full"
                />
              </div>
              <div className="border border-gray-800 rounded-lg overflow-hidden">
                <h4 className="text-sm font-medium p-2 bg-gray-800">Transformed</h4>
                <video 
                  src={resultUrl} 
                  controls 
                  className="w-full"
                  poster={resultUrl.replace(/\.[^/.]+$/, '.jpg')}
                />
              </div>
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
                  setFile(null);
                }}
              >
                Transform Another Video
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default VideoTransforms;