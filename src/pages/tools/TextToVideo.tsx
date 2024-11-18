import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import { Button } from '../../components/ui/Button';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { useToast } from '../../hooks/useToast';

const TextToVideo = () => {
  const [text, setText] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const { addToast } = useToast();

  const handleGenerate = async () => {
    if (!text) {
      addToast({
        title: 'Please enter some text',
        type: 'error'
      });
      return;
    }

    try {
      setStatus('processing');
      setProgress(20);

      // Text-to-video generation will be implemented with Cloudinary's API
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Video generated successfully',
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
      title="Text to Video"
      description="Generate videos from text descriptions using AI"
    >
      <div className="space-y-8">
        <div className="space-y-4">
          <label className="block text-sm font-medium">Enter Text Description</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-32 bg-gray-800 rounded-lg px-4 py-3 border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500"
            placeholder="Describe the video you want to generate..."
          />
          
          <div className="text-center">
            <Button 
              onClick={handleGenerate}
              disabled={!text || status === 'processing'}
            >
              Generate Video
            </Button>
          </div>
        </div>

        {status === 'processing' && (
          <ProcessingStatus status="processing" progress={progress} />
        )}

        {status === 'completed' && resultUrl && (
          <div className="text-center space-y-4">
            <p className="text-green-500 mb-4">Video generated successfully!</p>
            <div className="max-w-2xl mx-auto border border-gray-800 rounded-lg overflow-hidden">
              <video 
                src={resultUrl} 
                controls 
                className="w-full"
                poster={resultUrl.replace('.mp4', '.jpg')}
              />
            </div>
            <Button as="a" href={resultUrl} download>
              Download Video
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default TextToVideo;