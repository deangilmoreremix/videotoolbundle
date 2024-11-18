import React from 'react';
import { ImageToVideoSettings } from '../../types/imageToVideo';

interface ColorGradingControlsProps {
  settings: ImageToVideoSettings['effects']['colorGrading'];
  onChange: (settings: ImageToVideoSettings['effects']['colorGrading']) => void;
}

const ColorGradingControls: React.FC<ColorGradingControlsProps> = ({
  settings,
  onChange
}) => {
  const handleChange = (key: keyof typeof settings, value: number) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Color Grading</h3>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => onChange({ ...settings, enabled: e.target.checked })}
            className="rounded border-gray-700 text-red-500 focus:ring-red-500"
          />
          <span className="text-sm">Enable</span>
        </label>
      </div>

      {settings.enabled && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Brightness: {settings.brightness}
            </label>
            <input
              type="range"
              min={-100}
              max={100}
              value={settings.brightness}
              onChange={(e) => handleChange('brightness', Number(e.target.value))}
              className="w-full accent-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Contrast: {settings.contrast}
            </label>
            <input
              type="range"
              min={-100}
              max={100}
              value={settings.contrast}
              onChange={(e) => handleChange('contrast', Number(e.target.value))}
              className="w-full accent-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Saturation: {settings.saturation}
            </label>
            <input
              type="range"
              min={-100}
              max={100}
              value={settings.saturation}
              onChange={(e) => handleChange('saturation', Number(e.target.value))}
              className="w-full accent-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Temperature: {settings.temperature}
            </label>
            <input
              type="range"
              min={-100}
              max={100}
              value={settings.temperature}
              onChange={(e) => handleChange('temperature', Number(e.target.value))}
              className="w-full accent-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Tint: {settings.tint}
            </label>
            <input
              type="range"
              min={-100}
              max={100}
              value={settings.tint}
              onChange={(e) => handleChange('tint', Number(e.target.value))}
              className="w-full accent-red-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorGradingControls;