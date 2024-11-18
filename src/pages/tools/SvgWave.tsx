import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast';
import ProcessingStatus from '../../components/tools/ProcessingStatus';

const SvgWave = () => {
  const [waveType, setWaveType] = useState<'sine' | 'triangle' | 'square'>('sine');
  const [color, setColor] = useState('#FF0000');
  const [height, setHeight] = useState(100);
  const [width, setWidth] = useState(1200);
  const [amplitude, setAmplitude] = useState(50);
  const [frequency, setFrequency] = useState(3);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const { addToast } = useToast();

  const generateWavePath = () => {
    const points = [];
    const steps = 100;
    
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * width;
      let y = height / 2;
      
      switch (waveType) {
        case 'sine':
          y += Math.sin((i / steps) * Math.PI * 2 * frequency) * amplitude;
          break;
        case 'triangle':
          y += ((2 * amplitude) / Math.PI) * Math.asin(Math.sin((i / steps) * Math.PI * 2 * frequency));
          break;
        case 'square':
          y += amplitude * Math.sign(Math.sin((i / steps) * Math.PI * 2 * frequency));
          break;
      }
      
      points.push(`${x},${y}`);
    }
    
    return `M0,${height} L${points.join(' L')} L${width},${height} Z`;
  };

  const handleGenerate = async () => {
    try {
      setStatus('processing');
      setProgress(20);

      const svgContent = `
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
          <path d="${generateWavePath()}" fill="${color}" />
        </svg>
      `;

      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const file = new File([blob], 'wave.svg', { type: 'image/svg+xml' });

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.VITE_CLOUDINARY_UPLOAD_PRESET!);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();
      setResultUrl(result.secure_url);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'SVG wave generated successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  return (
    <ToolLayout
      title="SVG Wave Generator"
      description="Create beautiful SVG waves for your website designs"
    >
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Wave Type</label>
            <select
              value={waveType}
              onChange={(e) => setWaveType(e.target.value as 'sine' | 'triangle' | 'square')}
              className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700"
            >
              <option value="sine">Sine Wave</option>
              <option value="triangle">Triangle Wave</option>
              <option value="square">Square Wave</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-20 bg-gray-800 rounded-lg border border-gray-700"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 bg-gray-800 rounded-lg px-4 py-2 border border-gray-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Amplitude: {amplitude}px
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={amplitude}
              onChange={(e) => setAmplitude(Number(e.target.value))}
              className="w-full accent-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Frequency: {frequency}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="w-full accent-red-500"
            />
          </div>
        </div>

        <div className="text-center">
          <Button onClick={handleGenerate} disabled={status === 'processing'}>
            Generate Wave
          </Button>
        </div>

        {status === 'processing' && (
          <ProcessingStatus status="processing" progress={progress} />
        )}

        {status === 'completed' && resultUrl && (
          <div className="space-y-4">
            <div className="border border-gray-800 rounded-lg overflow-hidden bg-gray-900 p-4">
              <img src={resultUrl} alt="Generated wave" className="w-full" />
            </div>
            <div className="flex justify-center gap-4">
              <Button as="a" href={resultUrl} download="wave.svg">
                Download SVG
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setStatus('idle');
                  setProgress(0);
                  setResultUrl('');
                }}
              >
                Create Another
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default SvgWave;