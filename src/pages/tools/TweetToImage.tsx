import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';
import ProcessingStatus from '../../components/tools/ProcessingStatus';

const TweetToImage = () => {
  const [tweetText, setTweetText] = useState('');
  const [author, setAuthor] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const { addToast } = useToast();

  const handleGenerate = async () => {
    if (!tweetText) {
      addToast({
        title: 'Please enter tweet text',
        type: 'error'
      });
      return;
    }
    
    try {
      setStatus('processing');
      setProgress(20);

      // Create base image with background
      const bgColor = theme === 'dark' ? '1c1c1c' : 'ffffff';
      const textColor = theme === 'dark' ? 'white' : '000000';
      
      // Encode text for URL
      const encodedText = encodeURIComponent(tweetText);
      const encodedAuthor = encodeURIComponent(author || 'Anonymous');

      // Generate image URL with text overlay
      const imageUrl = `https://res.cloudinary.com/${process.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/w_1200,h_630,c_fill,b_rgb:${bgColor}/l_text:Arial_32_bold:${encodedText},co_${textColor},w_1000,c_fit,g_north,y_100/l_text:Arial_24:@${encodedAuthor},co_${textColor},g_south_west,x_100,y_80/social_template.png`;

      setResultUrl(imageUrl);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Tweet image generated successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Image generation failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  return (
    <ToolLayout
      title="Tweet to Image"
      description="Convert tweets into beautiful, shareable images"
    >
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Tweet Text</label>
            <textarea
              value={tweetText}
              onChange={(e) => setTweetText(e.target.value)}
              className="w-full h-32 bg-gray-800 rounded-lg px-4 py-3 border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              placeholder="Enter your tweet text here..."
              maxLength={280}
            />
            <p className="text-sm text-gray-400 mt-1">
              {280 - tweetText.length} characters remaining
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Author (optional)</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              placeholder="Enter author's name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Theme</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={theme === 'dark'}
                  onChange={() => setTheme('dark')}
                  className="mr-2"
                />
                Dark
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={theme === 'light'}
                  onChange={() => setTheme('light')}
                  className="mr-2"
                />
                Light
              </label>
            </div>
          </div>

          <div className="text-center">
            <Button onClick={handleGenerate} disabled={!tweetText || status === 'processing'}>
              Generate Image
            </Button>
          </div>
        </div>

        {status === 'processing' && (
          <ProcessingStatus status="processing" progress={progress} />
        )}

        {status === 'completed' && resultUrl && (
          <div className="space-y-4">
            <div className="border border-gray-800 rounded-lg overflow-hidden">
              <img src={resultUrl} alt="Generated tweet" className="w-full" />
            </div>
            <div className="flex justify-center gap-4">
              <Button as="a" href={resultUrl} download="tweet.png">
                Download Image
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

export default TweetToImage;