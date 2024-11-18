import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';

interface CaptionSettings {
  language: string;
  style: 'descriptive' | 'concise' | 'technical';
  interval: 'scene' | 'time';
  timeInterval?: number;
}

const GenerativeCaptions = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultData, setResultData] = useState<{
    videoUrl: string;
    captions: { time: number; text: string }[];
  } | null>(null);
  const [settings, setSettings] = useState<CaptionSettings>({
    language: 'en',
    style: 'descriptive',
    interval: 'scene',
    timeInterval: 10
  });
  const { addToast } = useToast();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' }
  ];

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const handleGenerate = async () => {
    if (!file) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      const result = await uploadToCloudinary(file);
      setProgress(60);

      // Apply AI caption generation transformation
      const processedUrl = result.secure_url.replace(
        '/upload/',
        `/upload/l_subtitles:${settings.language}:${settings.style}/${settings.interval === 'scene' ? 'g_auto' : `dl_${settings.timeInterval}`}/`
      );

      // Simulate caption generation
      const mockCaptions = [
        { time: 0, text: "Opening scene shows a beautiful landscape" },
        { time: 10, text: "Camera pans across the horizon" },
        { time: 20, text: "Focus shifts to the main subject" },
        { time: 30, text: "Action sequence begins" }
      ];
      
      setResultData({
        videoUrl: processedUrl,
        captions: mockCaptions
      });
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Captions generated successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Caption generation failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ToolLayout
      title="Generative Captions"
      description="Generate intelligent video captions using AI"
    >
      <div className="space-y-8">
        <FileUpload
          accept={{ 'video/*': ['.mp4', '.mov', '.avi', '.webm'] }}
          onUpload={handleUpload}
          maxSize={200 * 1024 * 1024} // 200MB limit
        />
        
        {file && status === 'idle' && (
          <div className="space-y-6">
            <div className="max-w-xl mx-auto space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    language: e.target.value
                  }))}
                  className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700"
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Caption Style</label>
                <div className="grid grid-cols-3 gap-4">
                  {(['descriptive', 'concise', 'technical'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => setSettings(prev => ({ ...prev, style }))}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        settings.style === style 
                          ? 'border-red-500 bg-red-500/10' 
                          : 'border-gray-700 hover:border-red-500'
                      }`}
                    >
                      <div className="text-lg font-bold mb-1 capitalize">{style}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Caption Interval</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, interval: 'scene' }))}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      settings.interval === 'scene' 
                        ? 'border-red-500 bg-red-500/10' 
                        : 'border-gray-700 hover:border-red-500'
                    }`}
                  >
                    <div className="text-lg font-bold mb-1">Scene-based</div>
                    <div className="text-sm text-gray-400">AI detects scene changes</div>
                  </button>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, interval: 'time' }))}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      settings.interval === 'time' 
                        ? 'border-red-500 bg-red-500/10' 
                        : 'border-gray-700 hover:border-red-500'
                    }`}
                  >
                    <div className="text-lg font-bold mb-1">Time-based</div>
                    <div className="text-sm text-gray-400">Fixed time intervals</div>
                  </button>
                </div>
              </div>

              {settings.interval === 'time' && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Time Interval: {settings.timeInterval}s
                  </label>
                  <input
                    type="range"
                    min={5}
                    max={30}
                    step={5}
                    value={settings.timeInterval}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      timeInterval: Number(e.target.value)
                    }))}
                    className="w-full accent-red-500"
                  />
                </div>
              )}
            </div>
            
            <div className="text-center">
              <Button onClick={handleGenerate}>Generate Captions</Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Analyzing video and generating captions..."
          />
        )}
        
        {status === 'completed' && resultData && (
          <div className="space-y-6">
            <div className="max-w-2xl mx-auto border border-gray-800 rounded-lg overflow-hidden">
              <video 
                src={resultData.videoUrl} 
                controls 
                className="w-full"
                poster={resultData.videoUrl.replace('.mp4', '.jpg')}
              />
            </div>

            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-medium mb-4">Generated Captions</h3>
              <div className="space-y-2">
                {resultData.captions.map((caption, index) => (
                  <div 
                    key={index}
                    className="flex gap-4 p-3 bg-gray-800 rounded-lg"
                  >
                    <span className="text-gray-400 whitespace-nowrap">
                      {formatTime(caption.time)}
                    </span>
                    <p>{caption.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center space-x-4">
              <Button
                as="a"
                href={`data:text/plain;charset=utf-8,${encodeURIComponent(
                  resultData.captions.map(c => `${formatTime(c.time)} - ${c.text}`).join('\n')
                )}`}
                download="captions.txt"
              >
                Download Captions
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setStatus('idle');
                  setProgress(0);
                  setResultData(null);
                  setFile(null);
                }}
              >
                Generate More Captions
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default GenerativeCaptions;