import React from 'react';
import { GifSettings } from '../../types/gif';
import { Settings, Clock, Layers, Palette } from 'lucide-react';

interface GifSettingsPanelProps {
  settings: GifSettings;
  onChange: (settings: GifSettings) => void;
}

const GifSettingsPanel: React.FC<GifSettingsPanelProps> = ({ settings, onChange }) => {
  const updateSettings = (key: string, value: any) => {
    onChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="space-y-6">
      {/* Basic Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Basic Settings
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Width (px)</label>
            <input
              type="number"
              value={settings.width}
              onChange={(e) => updateSettings('width', Number(e.target.value))}
              className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Height (px)</label>
            <input
              type="number"
              value={settings.height}
              onChange={(e) => updateSettings('height', Number(e.target.value))}
              className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Frame Rate: {settings.fps} FPS
          </label>
          <input
            type="range"
            min={1}
            max={30}
            value={settings.fps}
            onChange={(e) => updateSettings('fps', Number(e.target.value))}
            className="w-full accent-red-500"
          />
        </div>
      </div>

      {/* Timing Controls */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Timing Controls
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Start Time (s)</label>
            <input
              type="number"
              min={0}
              step={0.1}
              value={settings.startTime}
              onChange={(e) => updateSettings('startTime', Number(e.target.value))}
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
              onChange={(e) => updateSettings('duration', Number(e.target.value))}
              className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700"
            />
          </div>
        </div>
      </div>

      {/* Optimization */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Layers className="w-5 h-5" />
          Optimization
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.optimization.enabled}
              onChange={(e) => updateSettings('optimization', {
                ...settings.optimization,
                enabled: e.target.checked
              })}
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
                  onChange={(e) => updateSettings('optimization', {
                    ...settings.optimization,
                    colorReduction: Number(e.target.value)
                  })}
                  className="w-full accent-red-500"
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.optimization.dithering}
                  onChange={(e) => updateSettings('optimization', {
                    ...settings.optimization,
                    dithering: e.target.checked
                  })}
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
                  onChange={(e) => updateSettings('optimization', {
                    ...settings.optimization,
                    lossy: Number(e.target.value)
                  })}
                  className="w-full accent-red-500"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Effects */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Effects
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.effects.reverse}
                onChange={(e) => updateSettings('effects', {
                  ...settings.effects,
                  reverse: e.target.checked
                })}
                className="rounded border-gray-700 text-red-500 focus:ring-red-500"
              />
              <span className="text-sm">Reverse Playback</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.effects.boomerang}
                onChange={(e) => updateSettings('effects', {
                  ...settings.effects,
                  boomerang: e.target.checked
                })}
                className="rounded border-gray-700 text-red-500 focus:ring-red-500"
              />
              <span className="text-sm">Boomerang Effect</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Speed: {settings.effects.speedUp}x
            </label>
            <input
              type="range"
              min={0.25}
              max={4}
              step={0.25}
              value={settings.effects.speedUp}
              onChange={(e) => updateSettings('effects', {
                ...settings.effects,
                speedUp: Number(e.target.value)
              })}
              className="w-full accent-red-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GifSettingsPanel;