import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';
import { Layers as LayersIcon, X, ArrowUp, ArrowDown } from 'lucide-react';

interface Layer {
  id: string;
  file: File;
  opacity: number;
  blendMode: string;
}

const Layers = () => {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const { addToast } = useToast();

  const blendModes = [
    'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
    'color_dodge', 'color_burn', 'hard_light', 'soft_light'
  ];

  const handleUpload = (uploadedFile: File) => {
    const newLayer: Layer = {
      id: Math.random().toString(36).substr(2, 9),
      file: uploadedFile,
      opacity: 100,
      blendMode: 'normal'
    };
    setLayers([...layers, newLayer]);
  };

  const removeLayer = (id: string) => {
    setLayers(layers.filter(layer => layer.id !== id));
  };

  const updateLayer = (id: string, updates: Partial<Layer>) => {
    setLayers(layers.map(layer => 
      layer.id === id ? { ...layer, ...updates } : layer
    ));
  };

  const moveLayer = (id: string, direction: 'up' | 'down') => {
    const index = layers.findIndex(layer => layer.id === id);
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === layers.length - 1)
    ) return;

    const newLayers = [...layers];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newLayers[index], newLayers[newIndex]] = [newLayers[newIndex], newLayers[index]];
    setLayers(newLayers);
  };

  const handleMerge = async () => {
    if (layers.length === 0) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      // Upload all layers
      const uploadedLayers = await Promise.all(
        layers.map(async (layer, index) => {
          const result = await uploadToCloudinary(layer.file);
          setProgress(20 + ((index + 1) / layers.length) * 40);
          return {
            ...layer,
            publicId: result.public_id
          };
        })
      );

      // Create layering transformation
      let baseUrl = `https://res.cloudinary.com/${process.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`;
      const transformations = uploadedLayers.slice(1).map(layer => 
        `/l_${layer.publicId},o_${layer.opacity},e_${layer.blendMode}/fl_layer_apply`
      ).join('');

      const finalUrl = `${baseUrl}/${uploadedLayers[0].publicId}${transformations}`;
      
      setResultUrl(finalUrl);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Layers merged successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Layer merging failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  return (
    <ToolLayout
      title="Image Layers"
      description="Combine multiple images with custom blend modes and opacity"
    >
      <div className="space-y-8">
        {layers.length < 5 && (
          <FileUpload
            accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
            onUpload={handleUpload}
            maxSize={10 * 1024 * 1024} // 10MB limit
          />
        )}
        
        {layers.length > 0 && status === 'idle' && (
          <div className="space-y-6">
            <div className="space-y-4">
              {layers.map((layer, index) => (
                <div 
                  key={layer.id}
                  className="bg-gray-800 rounded-lg p-4 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LayersIcon className="w-5 h-5 text-gray-400" />
                      <span className="font-medium">Layer {index + 1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => moveLayer(layer.id, 'up')}
                        disabled={index === 0}
                        className="p-1 hover:bg-gray-700 rounded disabled:opacity-50"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveLayer(layer.id, 'down')}
                        disabled={index === layers.length - 1}
                        className="p-1 hover:bg-gray-700 rounded disabled:opacity-50"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeLayer(layer.id)}
                        className="p-1 hover:bg-gray-700 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Blend Mode
                      </label>
                      <select
                        value={layer.blendMode}
                        onChange={(e) => updateLayer(layer.id, { blendMode: e.target.value })}
                        className="w-full bg-gray-900 rounded-lg px-3 py-2 border border-gray-700"
                      >
                        {blendModes.map(mode => (
                          <option key={mode} value={mode}>
                            {mode.replace('_', ' ').toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Opacity: {layer.opacity}%
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={layer.opacity}
                        onChange={(e) => updateLayer(layer.id, { opacity: Number(e.target.value) })}
                        className="w-full accent-red-500"
                      />
                    </div>
                  </div>

                  <div className="border border-gray-700 rounded-lg overflow-hidden">
                    <img 
                      src={URL.createObjectURL(layer.file)} 
                      alt={`Layer ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <Button 
                onClick={handleMerge}
                disabled={layers.length < 2}
              >
                Merge Layers
              </Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Merging layers..."
          />
        )}
        
        {status === 'completed' && resultUrl && (
          <div className="text-center space-y-4">
            <p className="text-green-500 mb-4">Layers merged successfully!</p>
            <div className="border border-gray-800 rounded-lg overflow-hidden">
              <img 
                src={resultUrl} 
                alt="Merged result" 
                className="w-full"
              />
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
                  setLayers([]);
                }}
              >
                Create New Composition
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default Layers;