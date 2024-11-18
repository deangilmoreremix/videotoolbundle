import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import { Button } from '../../components/ui/Button';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { useToast } from '../../hooks/useToast';

const ImageGeneration = () => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<'realistic' | 'artistic' | 'abstract'>('realistic');
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const { addToast } = useToast();

  const handleGenerate = async () => {
    if (!prompt) {
      addToast({
        title: 'Please enter a prompt',
        type: 'error'
      });
      return;
    }

    try {
      setStatus('processing');
      setProgress(20);

      // Image generation will be implemented with Cloudinary's API
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Image generated successfully',
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
      title="AI Image Generation"
      description="Generate unique images from text descriptions using AI"
    >
      <div className="space-y-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Enter Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-32 bg-gray-800 rounded-lg px-4 py-3 border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              placeholder="Describe the image you want to generate..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Style</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as 'realistic' | 'artistic' | 'abstract')}
              className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700"
            >
              <option value="realistic">Realistic</option>
              <option value="artistic">Artistic</option>
              <option value="abstract">Abstract</option>
            </select>
          </div>

          <div className="text-center">
            <Button 
              onClick={handleGenerate}
              disabled={!prompt || status === 'processing'}
            >
              Generate Image
            </Button>
          </div>
        </div>

        {status === 'processing' && (
          <ProcessingStatus status="processing" progress={progress} />
        )}

        {status === 'completed' && resultUrl && (
          <div className="text-center space-y-4">
            <p className="text-green-500 mb-4">Image generated successfully!</p>
            <div className="max-w-2xl mx-auto border border-gray-800 rounded-lg overflow-hidden">
              <img 
                src={resultUrl} 
                alt="Generated image" 
                className="w-full"
              />
            </div>
            <Button as="a" href={resultUrl} download>
              Download Image
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default ImageGeneration;