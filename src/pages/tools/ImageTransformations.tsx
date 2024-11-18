import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';
import { CornerUpLeft, CornerUpRight, Layers, Droplet, Box } from 'lucide-react';

interface TransformSettings {
  roundCorners: {
    enabled: boolean;
    radius: number;
    all: boolean;
    topLeft: number;
    topRight: number;
    bottomLeft: number;
    bottomRight: number;
  };
  rotate: {
    enabled: boolean;
    angle: number;
  };
  dropShadow: {
    enabled: boolean;
    color: string;
    blur: number;
    spread: number;
    opacity: number;
    x: number;
    y: number;
  };
  blur: {
    enabled: boolean;
    amount: number;
    type: 'full' | 'background' | 'region';
    region: string;
  };
  layers: {
    enabled: boolean;
    opacity: number;
    blendMode: string;
  };
}

const ImageTransformations = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [settings, setSettings] = useState<TransformSettings>({
    roundCorners: {
      enabled: false,
      radius: 20,
      all: true,
      topLeft: 20,
      topRight: 20,
      bottomLeft: 20,
      bottomRight: 20
    },
    rotate: {
      enabled: false,
      angle: 0
    },
    dropShadow: {
      enabled: false,
      color: '#000000',
      blur: 20,
      spread: 0,
      opacity: 50,
      x: 5,
      y: 5
    },
    blur: {
      enabled: false,
      amount: 20,
      type: 'full',
      region: ''
    },
    layers: {
      enabled: false,
      opacity: 100,
      blendMode: 'normal'
    }
  });
  const { addToast } = useToast();

  const blendModes = [
    'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
    'color-dodge', 'color-burn', 'hard-light', 'soft-light'
  ];

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
      let transformations = [];

      // Round corners
      if (settings.roundCorners.enabled) {
        if (settings.roundCorners.all) {
          transformations.push(`r_${settings.roundCorners.radius}`);
        } else {
          transformations.push(
            `r_${settings.roundCorners.topLeft}:${settings.roundCorners.topRight}:` +
            `${settings.roundCorners.bottomRight}:${settings.roundCorners.bottomLeft}`
          );
        }
      }

      // Rotation
      if (settings.rotate.enabled) {
        transformations.push(`a_${settings.rotate.angle}`);
      }

      // Drop shadow
      if (settings.dropShadow.enabled) {
        const shadowColor = settings.dropShadow.color.replace('#', '');
        transformations.push(
          `e_shadow:${settings.dropShadow.spread}:${settings.dropShadow.blur}:` +
          `${shadowColor}:${settings.dropShadow.opacity}`
        );
      }

      // Blur
      if (settings.blur.enabled) {
        if (settings.blur.type === 'full') {
          transformations.push(`e_blur:${settings.blur.amount}`);
        } else if (settings.blur.type === 'background') {
          transformations.push(`e_background_blur:${settings.blur.amount}`);
        } else if (settings.blur.type === 'region' && settings.blur.region) {
          transformations.push(`e_blur:${settings.blur.amount}/e_region_${settings.blur.region}`);
        }
      }

      // Layers
      if (settings.layers.enabled) {
        transformations.push(
          `o_${settings.layers.opacity},e_blend_mode_${settings.layers.blendMode}`
        );
      }

      // Apply transformations
      const processedUrl = transformations.length > 0
        ? result.secure_url.replace('/upload/', `/upload/${transformations.join(',')}/`)
        : result.secure_url;
      
      setResultUrl(processedUrl);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Image transformed successfully',
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

  const quickRotate = (direction: 'left' | 'right') => {
    setSettings(prev => ({
      ...prev,
      rotate: {
        ...prev.rotate,
        enabled: true,
        angle: prev.rotate.angle + (direction === 'left' ? -90 : 90)
      }
    }));
  };

  return (
    <ToolLayout
      title="Image Transformations"
      description="Apply professional transformations to your images"
    >
      <div className="space-y-8">
        <FileUpload
          accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
          onUpload={handleUpload}
          maxSize={10 * 1024 * 1024} // 10MB limit
        />
        
        {file && status === 'idle' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Round Corners */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Box className="w-5 h-5" />
                    Round Corners
                  </h3>
                  <input
                    type="checkbox"
                    checked={settings.roundCorners.enabled}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      roundCorners: {
                        ...prev.roundCorners,
                        enabled: e.target.checked
                      }
                    }))}
                    className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                  />
                </div>

                {settings.roundCorners.enabled && (
                  <div className="space-y-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.roundCorners.all}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          roundCorners: {
                            ...prev.roundCorners,
                            all: e.target.checked
                          }
                        }))}
                        className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                      />
                      <span className="text-sm">Same radius for all corners</span>
                    </label>

                    {settings.roundCorners.all ? (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Radius: {settings.roundCorners.radius}px
                        </label>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={settings.roundCorners.radius}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            roundCorners: {
                              ...prev.roundCorners,
                              radius: Number(e.target.value)
                            }
                          }))}
                          className="w-full accent-red-500"
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Top Left: {settings.roundCorners.topLeft}px
                          </label>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={settings.roundCorners.topLeft}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              roundCorners: {
                                ...prev.roundCorners,
                                topLeft: Number(e.target.value)
                              }
                            }))}
                            className="w-full accent-red-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Top Right: {settings.roundCorners.topRight}px
                          </label>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={settings.roundCorners.topRight}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              roundCorners: {
                                ...prev.roundCorners,
                                topRight: Number(e.target.value)
                              }
                            }))}
                            className="w-full accent-red-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Bottom Left: {settings.roundCorners.bottomLeft}px
                          </label>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={settings.roundCorners.bottomLeft}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              roundCorners: {
                                ...prev.roundCorners,
                                bottomLeft: Number(e.target.value)
                              }
                            }))}
                            className="w-full accent-red-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Bottom Right: {settings.roundCorners.bottomRight}px
                          </label>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={settings.roundCorners.bottomRight}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              roundCorners: {
                                ...prev.roundCorners,
                                bottomRight: Number(e.target.value)
                              }
                            }))}
                            className="w-full accent-red-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Rotate */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <CornerUpRight className="w-5 h-5" />
                    Rotate
                  </h3>
                  <input
                    type="checkbox"
                    checked={settings.rotate.enabled}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      rotate: {
                        ...prev.rotate,
                        enabled: e.target.checked
                      }
                    }))}
                    className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                  />
                </div>

                {settings.rotate.enabled && (
                  <div className="space-y-4">
                    <div className="flex justify-center gap-4">
                      <Button
                        variant="outline"
                        onClick={() => quickRotate('left')}
                      >
                        <CornerUpLeft className="w-4 h-4 mr-2" />
                        Rotate Left
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => quickRotate('right')}
                      >
                        <CornerUpRight className="w-4 h-4 mr-2" />
                        Rotate Right
                      </Button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Angle: {settings.rotate.angle}°
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={359}
                        value={settings.rotate.angle}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          rotate: {
                            ...prev.rotate,
                            angle: Number(e.target.value)
                          }
                        }))}
                        className="w-full accent-red-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Drop Shadow */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Droplet className="w-5 h-5" />
                    Drop Shadow
                  </h3>
                  <input
                    type="checkbox"
                    checked={settings.dropShadow.enabled}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      dropShadow: {
                        ...prev.dropShadow,
                        enabled: e.target.checked
                      }
                    }))}
                    className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                  />
                </div>

                {settings.dropShadow.enabled && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Shadow Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={settings.dropShadow.color}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            dropShadow: {
                              ...prev.dropShadow,
                              color: e.target.value
                            }
                          }))}
                          className="h-10 w-20 bg-gray-800 rounded-lg border border-gray-700"
                        />
                        <input
                          type="text"
                          value={settings.dropShadow.color}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            dropShadow: {
                              ...prev.dropShadow,
                              color: e.target.value
                            }
                          }))}
                          className="flex-1 bg-gray-800 rounded-lg px-4 py-2 border border-gray-700"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Blur: {settings.dropShadow.blur}px
                        </label>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={settings.dropShadow.blur}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            dropShadow: {
                              ...prev.dropShadow,
                              blur: Number(e.target.value)
                            }
                          }))}
                          className="w-full accent-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Spread: {settings.dropShadow.spread}px
                        </label>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={settings.dropShadow.spread}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            dropShadow: {
                              ...prev.dropShadow,
                              spread: Number(e.target.value)
                            }
                          }))}
                          className="w-full accent-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Opacity: {settings.dropShadow.opacity}%
                        </label>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={settings.dropShadow.opacity}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            dropShadow: {
                              ...prev.dropShadow,
                              opacity: Number(e.target.value)
                            }
                          }))}
                          className="w-full accent-red-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Blur */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Droplet className="w-5 h-5" />
                    Blur
                  </h3>
                  <input
                    type="checkbox"
                    checked={settings.blur.enabled}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      blur: {
                        ...prev.blur,
                        enabled: e.target.checked
                      }
                    }))}
                    className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                  />
                </div>

                {settings.blur.enabled && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Blur Type</label>
                      <select
                        value={settings.blur.type}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          blur: {
                            ...prev.blur,
                            type: e.target.value as 'full' | 'background' | 'region'
                          }
                        }))}
                        className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700"
                      >
                        <option value="full">Full Image</option>
                        <option value="background">Background Only</option>
                        <option value="region">Custom Region</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Blur Amount: {settings.blur.amount}
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={2000}
                        value={settings.blur.amount}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          blur: {
                            ...prev.blur,
                            amount: Number(e.target.value)
                          }
                        }))}
                        className="w-full accent-red-500"
                      />
                    </div>

                    {settings.blur.type === 'region' && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Region</label>
                        <input
                          type="text"
                          value={settings.blur.region}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            blur: {
                              ...prev.blur,
                              region: e.target.value
                            }
                          }))}
                          placeholder="e.g., faces, text, top_left"
                          className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Layers */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    Layers
                  </h3>
                  <input
                    type="checkbox"
                    checked={settings.layers.enabled}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      layers: {
                        ...prev.layers,
                        enabled: e.target.checked
                      }
                    }))}
                    className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                  />
                </div>

                {settings.layers.enabled && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Opacity: {settings.layers.opacity}%
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={settings.layers.opacity}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          layers: {
                            ...prev.layers,
                            opacity: Number(e.target.value)
                          }
                        }))}
                        className="w-full accent-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Blend Mode</label>
                      <select
                        value={settings.layers.blendMode}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          layers: {
                            ...prev.layers,
                            blendMode: e.target.value
                          }
                        }))}
                        className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700"
                      >
                        {blendModes.map(mode => (
                          <option key={mode} value={mode}>
                            {mode.replace('-', ' ').toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-center">
              <Button onClick={handleTransform}>Apply Transformations</Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Applying image transformations..."
          />
        )}
        
        {status === 'completed' && resultUrl && (
          <div className="text-center space-y-4">
            <p className="text-green-500 mb-4">Transformations applied successfully!</p>
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
                <h4 className="text-sm font-medium p-2 bg-gray-800">Transformed</h4>
                <img 
                  src={resultUrl} 
                  alt="Transformed" 
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
                Transform Another Image
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default ImageTransformations;