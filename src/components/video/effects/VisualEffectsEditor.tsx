import React from 'react';
import { VisualEffects } from '../../../types/imageToVideo';
import { Button } from '../../ui/Button';
import { Slider } from '../../ui/Slider';
import { ColorPicker } from '../../ui/ColorPicker';

interface VisualEffectsEditorProps {
  effects: VisualEffects;
  onChange: (effects: VisualEffects) => void;
}

const VisualEffectsEditor: React.FC<VisualEffectsEditorProps> = ({
  effects,
  onChange
}) => {
  const handleChange = (key: keyof VisualEffects, value: any) => {
    onChange({ ...effects, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* AI Enhancement */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">AI Enhancement</h3>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={effects.aiEnhancement.enabled}
              onChange={(e) => handleChange('aiEnhancement', {
                ...effects.aiEnhancement,
                enabled: e.target.checked
              })}
              className="rounded border-gray-700 text-red-500 focus:ring-red-500"
            />
            <span className="text-sm">Enable</span>
          </label>
        </div>

        {effects.aiEnhancement.enabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Strength</label>
              <Slider
                min={0}
                max={100}
                value={effects.aiEnhancement.strength}
                onChange={(value) => handleChange('aiEnhancement', {
                  ...effects.aiEnhancement,
                  strength: value
                })}
                suffix="%"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mode</label>
              <select
                value={effects.aiEnhancement.mode}
                onChange={(e) => handleChange('aiEnhancement', {
                  ...effects.aiEnhancement,
                  mode: e.target.value
                })}
                className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700"
              >
                <option value="auto">Auto</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {effects.aiEnhancement.mode === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Sharpness</label>
                  <Slider
                    min={0}
                    max={100}
                    value={effects.aiEnhancement.parameters?.sharpness}
                    onChange={(value) => handleChange('aiEnhancement', {
                      ...effects.aiEnhancement,
                      parameters: {
                        ...effects.aiEnhancement.parameters,
                        sharpness: value
                      }
                    })}
                    suffix="%"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Denoise</label>
                  <Slider
                    min={0}
                    max={100}
                    value={effects.aiEnhancement.parameters?.denoise}
                    onChange={(value) => handleChange('aiEnhancement', {
                      ...effects.aiEnhancement,
                      parameters: {
                        ...effects.aiEnhancement.parameters,
                        denoise: value
                      }
                    })}
                    suffix="%"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Color Grading */}
      <div className="space-y-4">
        {/* ... Color grading controls ... */}
      </div>

      {/* Filters */}
      <div className="space-y-4">
        {/* ... Filter controls ... */}
      </div>

      {/* Vignette */}
      <div className="space-y-4">
        {/* ... Vignette controls ... */}
      </div>

      {/* Blur */}
      <div className="space-y-4">
        {/* ... Blur controls ... */}
      </div>
    </div>
  );
};

export default VisualEffectsEditor;