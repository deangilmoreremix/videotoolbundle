import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';

interface ChapterSettings {
  minDuration: number;
  detectionMode: 'scene' | 'content' | 'hybrid';
  autoTitles: boolean;
}

interface Chapter {
  startTime: number;
  endTime: number;
  title: string;
  thumbnail: string;
}

const AutoChaptering = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultData, setResultData] = useState<{
    videoUrl: string;
    chapters: Chapter[];
  } | null>(null);
  const [settings, setSettings] = useState<ChapterSettings>({
    minDuration: 30,
    detectionMode: 'hybrid',
    autoTitles: true
  });
  const { addToast } = useToast();

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const handleGenerateChapters = async () => {
    if (!file) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      const result = await uploadToCloudinary(file);
      setProgress(60);

      // Apply chapter detection transformation
      const processedUrl = result.secure_url.replace(
        '/upload/',
        `/upload/e_chapter_detection:${settings.detectionMode}:${settings.minDuration}${settings.autoTitles ? ':auto_title' : ''}/`
      );

      // Simulate chapter detection results
      const mockChapters: Chapter[] = [
        {
          startTime: 0,
          endTime: 45,
          title: "Introduction",
          thumbnail: processedUrl.replace('/upload/', '/upload/so_0,w_320,h_180,c_fill/')
        },
        {
          startTime: 45,
          endTime: 120,
          title: "Main Content",
          thumbnail: processedUrl.replace('/upload/', '/upload/so_45,w_320,h_180,c_fill/')
        },
        {
          startTime: 120,
          endTime: 180,
          title: "Key Points",
          thumbnail: processedUrl.replace('/upload/', '/upload/so_120,w_320,h_180,c_fill/')
        },
        {
          startTime: 180,
          endTime: 240,
          title: "Conclusion",
          thumbnail: processedUrl.replace('/upload/', '/upload/so_180,w_320,h_180,c_fill/')
        }
      ];

      setResultData({
        videoUrl: processedUrl,
        chapters: mockChapters
      });
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Chapters generated successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Chapter generation failed',
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
      title="Auto Chaptering"
      description="Automatically detect and create chapters for your videos"
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
                <label className="block text-sm font-medium mb-2">Detection Mode</label>
                <div className="grid grid-cols-3 gap-4">
                  {(['scene', 'content', 'hybrid'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setSettings(prev => ({ ...prev, detectionMode: mode }))}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        settings.detectionMode === mode 
                          ? 'border-red-500 bg-red-500/10' 
                          : 'border-gray-700 hover:border-red-500'
                      }`}
                    >
                      <div className="text-lg font-bold mb-1 capitalize">{mode}</div>
                      <div className="text-sm text-gray-400">
                        {mode === 'scene' && 'Visual changes'}
                        {mode === 'content' && 'Content analysis'}
                        {mode === 'hybrid' && 'Combined approach'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Minimum Chapter Duration: {settings.minDuration}s
                </label>
                <input
                  type="range"
                  min={10}
                  max={120}
                  step={10}
                  value={settings.minDuration}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    minDuration: Number(e.target.value)
                  }))}
                  className="w-full accent-red-500"
                />
                <div className="flex justify-between text-sm text-gray-400 mt-1">
                  <span>10s</span>
                  <span>1m</span>
                  <span>2m</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoTitles"
                  checked={settings.autoTitles}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    autoTitles: e.target.checked
                  }))}
                  className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                />
                <label htmlFor="autoTitles" className="text-sm">
                  Generate chapter titles automatically
                </label>
              </div>
            </div>
            
            <div className="text-center">
              <Button onClick={handleGenerateChapters}>Generate Chapters</Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Analyzing video and generating chapters..."
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
              <h3 className="text-lg font-medium mb-4">Generated Chapters</h3>
              <div className="space-y-4">
                {resultData.chapters.map((chapter, index) => (
                  <div 
                    key={index}
                    className="flex gap-4 p-4 bg-gray-800 rounded-lg"
                  >
                    <img 
                      src={chapter.thumbnail} 
                      alt={chapter.title}
                      className="w-32 h-18 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{chapter.title}</h4>
                      <p className="text-sm text-gray-400">
                        {formatTime(chapter.startTime)} - {formatTime(chapter.endTime)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center space-x-4">
              <Button
                as="a"
                href={`data:text/plain;charset=utf-8,${encodeURIComponent(
                  resultData.chapters.map(c => 
                    `${formatTime(c.startTime)} - ${formatTime(c.endTime)}\n${c.title}\n`
                  ).join('\n')
                )}`}
                download="chapters.txt"
              >
                Download Chapter Data
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
                Generate More Chapters
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default AutoChaptering;