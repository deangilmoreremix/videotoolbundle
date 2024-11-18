import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';

interface TranscriptionSettings {
  language: string;
  format: 'text' | 'srt' | 'vtt';
  speakerDetection: boolean;
  timestamps: boolean;
}

const AiTranscription = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultData, setResultData] = useState<{
    videoUrl: string;
    transcription: string;
  } | null>(null);
  const [settings, setSettings] = useState<TranscriptionSettings>({
    language: 'en',
    format: 'text',
    speakerDetection: true,
    timestamps: true
  });
  const { addToast } = useToast();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' }
  ];

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const handleTranscribe = async () => {
    if (!file) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      const result = await uploadToCloudinary(file);
      setProgress(60);

      // Apply transcription transformation
      const processedUrl = result.secure_url.replace(
        '/upload/',
        `/upload/l_transcription:${settings.language}:${settings.format}${settings.speakerDetection ? ':speakers' : ''}${settings.timestamps ? ':timestamps' : ''}/`
      );

      // Simulate transcription result
      const mockTranscription = `
[00:00:00] Speaker 1: Welcome to our presentation.
[00:00:05] Speaker 2: Thank you for having me here today.
[00:00:10] Speaker 1: Let's discuss the main topics.
[00:00:15] Speaker 2: I'd love to share our findings.
      `.trim();

      setResultData({
        videoUrl: processedUrl,
        transcription: mockTranscription
      });
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Transcription completed successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Transcription failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  return (
    <ToolLayout
      title="AI Transcription"
      description="Convert speech to text with advanced AI transcription"
    >
      <div className="space-y-8">
        <FileUpload
          accept={{ 'video/*': ['.mp4', '.mov', '.avi', '.webm'], 'audio/*': ['.mp3', '.wav', '.m4a'] }}
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
                <label className="block text-sm font-medium mb-2">Output Format</label>
                <div className="grid grid-cols-3 gap-4">
                  {(['text', 'srt', 'vtt'] as const).map((format) => (
                    <button
                      key={format}
                      onClick={() => setSettings(prev => ({ ...prev, format }))}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        settings.format === format 
                          ? 'border-red-500 bg-red-500/10' 
                          : 'border-gray-700 hover:border-red-500'
                      }`}
                    >
                      <div className="text-lg font-bold mb-1 uppercase">{format}</div>
                      <div className="text-sm text-gray-400">
                        {format === 'text' && 'Plain text'}
                        {format === 'srt' && 'Subtitle format'}
                        {format === 'vtt' && 'Web subtitles'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="speakerDetection"
                    checked={settings.speakerDetection}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      speakerDetection: e.target.checked
                    }))}
                    className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                  />
                  <label htmlFor="speakerDetection" className="text-sm">
                    Enable speaker detection
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="timestamps"
                    checked={settings.timestamps}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      timestamps: e.target.checked
                    }))}
                    className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                  />
                  <label htmlFor="timestamps" className="text-sm">
                    Include timestamps
                  </label>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <Button onClick={handleTranscribe}>Start Transcription</Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Processing audio and generating transcription..."
          />
        )}
        
        {status === 'completed' && resultData && (
          <div className="space-y-6">
            <div className="max-w-2xl mx-auto border border-gray-800 rounded-lg overflow-hidden">
              {file.type.startsWith('video/') ? (
                <video 
                  src={resultData.videoUrl} 
                  controls 
                  className="w-full"
                  poster={resultData.videoUrl.replace(/\.[^/.]+$/, '.jpg')}
                />
              ) : (
                <audio 
                  src={resultData.videoUrl} 
                  controls 
                  className="w-full"
                />
              )}
            </div>

            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-medium mb-4">Transcription</h3>
              <div className="bg-gray-800 rounded-lg p-4">
                <pre className="whitespace-pre-wrap font-mono text-sm">
                  {resultData.transcription}
                </pre>
              </div>
            </div>

            <div className="text-center space-x-4">
              <Button
                as="a"
                href={`data:text/plain;charset=utf-8,${encodeURIComponent(resultData.transcription)}`}
                download={`transcription.${settings.format}`}
              >
                Download Transcription
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
                Transcribe Another File
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default AiTranscription;