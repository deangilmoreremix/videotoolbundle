import React, { useState } from 'react';
import { Sliders, Wand2, Video } from 'lucide-react';
import { Button } from '../../ui/Button';
import { cn } from '../../../lib/utils';
import { uploadToCloudinary } from '../../../lib/cloudinary';

interface EnhancementSettings {
  denoise: {
    enabled: boolean;
    strength: number;
  };
  sharpness: {
    enabled: boolean;
    amount: number;
  };
  colorBalance: {
    enabled: boolean;
    temperature: number;
    tint: number;
    vibrance: number;
  };
  stabilization: {
    enabled: boolean;
    strength: number;
  };
}

interface VideoEnhancerProps {
  file: File;
  onEnhancementComplete?: (url: string) => void;
  className?: string;
}

const VideoEnhancer: React.FC<VideoEnhancerProps> = ({
  file,
  onEnhancementComplete,
  className
}) => {
  const [settings, setSettings] = useState<EnhancementSettings>({
    denoise: {
      enabled: true,
      strength: 50
    },
    sharpness: {
      enabled: true,
      amount: 50
    },
    colorBalance: {
      enabled: true,
      temperature: 0,
      tint: 0,
      vibrance: 20
    },
    stabilization: {
      enabled: true,
      strength: 50
    }
  });

  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const updateSettings = (
    category: keyof EnhancementSettings,
    key: string,
    value: number | boolean
  ) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const enhance = async () => {
    try {
      setProcessing(true);
      setProgress(10);

      // Build transformation string based on enabled enhancements
      const transformations = [];

      if (settings.denoise.enabled) {
        transformations.push(`e_noise:${settings.denoise.strength}`);
      }

      if (settings.sharpness.enabled) {
        transformations.push(`e_sharpen:${settings.sharpness.amount}`);
      }

      if (settings.colorBalance.enabled) {
        transformations.push(
          `e_tint:${settings.colorBalance.tint}:${settings.colorBalance.temperature}`,
          `e_vibrance:${settings.colorBalance.vibrance}`
        );
      }

      if (settings.stabilization.enabled) {
        transformations.push(`e_stabilize:${settings.stabilization.strength}`);
      }

      setProgress(30);

      // Upload and process video
      const result = await uploadToCloudinary(file, {
        resource_type: 'video',
        eager: [
          { 
            raw_transformation: transformations.join(','),
            format: 'mp4'
          }
        ],
        eager_async: true
      });

      setProgress(90);

      // Get the enhanced video URL
      const enhancedUrl = result.eager[0].secure_url;
      
      setProgress(100);
      onEnhancementComplete?.(enhancedUrl);

    } catch (error) {
      console.error('Enhancement failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Video Enhancement</h3>
        <Button
          onClick={enhance}
          disabled={processing}
        >
          {processing ? 'Enhancing...' : 'Enhance Video'}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Denoise */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              <span>Noise Reduction</span>
            </label>
            <input
              type="checkbox"
              checked={settings.denoise.enabled}
              onChange={(e) => updateSettings('denoise', 'enabled', e.target.checked)}
              className="rounded border-gray-700 text-red-500 focus:ring-red-500"
            />
          </div>
          {settings.denoise.enabled && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Strength: {settings.denoise.strength}%
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={settings.denoise.strength}
                onChange={(e) => updateSettings('denoise', 'strength', Number(e.target.value))}
                className="w-full accent-red-500"
              />
            </div>
          )}
        </div>

        {/* Sharpness */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              <span>Sharpness</span>
            </label>
            <input
              type="checkbox"
              checked={settings.sharpness.enabled}
              onChange={(e) => updateSettings('sharpness', 'enabled', e.target.checked)}
              className="rounded border-gray-700 text-red-500 focus:ring-red-500"
            />
          </div>
          {settings.sharpness.enabled && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Amount: {settings.sharpness.amount}%
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={settings.sharpness.amount}
                onChange={(e) => updateSettings('sharpness', 'amount', Number(e.target.value))}
                className="w-full accent-red-500"
              />
            </div>
          )}
        </div>

        {/* Color Balance */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span>Color Balance</span>
            </label>
            <input
              type="checkbox"
              checked={settings.colorBalance.enabled}
              onChange={(e) => updateSettings('colorBalance', 'enabled', e.target.checked)}
              className="rounded border-gray-700 text-red-500 focus:ring-red-500"
            />
          </div>
          {settings.colorBalance.enabled && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Temperature: {settings.colorBalance.temperature}
                </label>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  value={settings.colorBalance.temperature}
                  onChange={(e) => updateSettings('colorBalance', 'temperature', Number(e.target.value))}
                  className="w-full accent-red-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Tint: {settings.colorBalance.tint}
                </label>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  value={settings.colorBalance.tint}
                  onChange={(e) => updateSettings('colorBalance', 'tint', Number(e.target.value))}
                  className="w-full accent-red-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Vibrance: {settings.colorBalance.vibrance}
                </label>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  value={settings.colorBalance.vibrance}
                  onChange={(e) => updateSettings('colorBalance', 'vibrance', Number(e.target.value))}
                  className="w-full accent-red-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Stabilization */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              <span>Stabilization</span>
            </label>
            <input
              type="checkbox"
              checked={settings.stabilization.enabled}
              onChange={(e) => updateSettings('stabilization', 'enabled', e.target.checked)}
              className="rounded border-gray-700 text-red-500 focus:ring-red-500"
            />
          </div>
          {settings.stabilization.enabled && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Strength: {settings.stabilization.strength}%
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={settings.stabilization.strength}
                onChange={(e) => updateSettings('stabilization', 'strength', Number(e.target.value))}
                className="w-full accent-red-500"
              />
            </div>
          )}
        </div>
      </div>

      {processing && (
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wand2 className="w-5 h-5 animate-pulse" />
            <span>Enhancing video...</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoEnhancer;