import React, { useState } from 'react';
import { ParallaxSettings } from '../../../types/imageToVideo';
import { Button } from '../../ui/Button';
import { Slider } from '../../ui/Slider';
import { LayerEditor } from './LayerEditor';

interface ParallaxEditorProps {
  settings: ParallaxSettings;
  onChange: (settings: ParallaxSettings) => void;
  layers: File[];
  onLayersChange: (layers: File[]) => void;
}

const ParallaxEditor: React.FC<ParallaxEditorProps> = ({
  settings,
  onChange,
  layers,
  onLayersChange
}) => {
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null);

  const handleChange = (key: keyof ParallaxSettings, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Parallax Effect</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {/* Add layer handler */}}
        >
          Add Layer
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Depth</label>
          <Slider
            min={0}
            max={100}
            value={settings.depth}
            onChange={(value) => handleChange('depth', value)}
            suffix="%"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Perspective</label>
          <Slider
            min={100}
            max={2000}
            value={settings.perspective}
            onChange={(value) => handleChange('perspective', value)}
            suffix="px"
          />
        </div>
      </div>

      <div className="border border-gray-700 rounded-lg p-4">
        <h4 className="text-sm font-medium mb-4">Layers</h4>
        <div className="space-y-2">
          {layers.map((layer, index) => (
            <LayerEditor
              key={index}
              layer={layer}
              isSelected={selectedLayer === index}
              onSelect={() => setSelectedLayer(index)}
              onRemove={() => {
                const newLayers = [...layers];
                newLayers.splice(index, 1);
                onLayersChange(newLayers);
              }}
              settings={settings.layers[index]}
              onChange={(layerSettings) => {
                const newLayers = [...settings.layers];
                newLayers[index] = layerSettings;
                handleChange('layers', newLayers);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParallaxEditor;