import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';

const AudioExtract = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const { addToast } = useToast();

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const handleExtract = async () => {
    if (!file) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      const result = await uploadToCloudinary(file);
      setProgress(60);

      // Extract audio using Cloudinary's audio extraction transformation
      const processedUrl = result.secure_url.replace('/upload/', '/upload/f_mp3/');
      setResultUrl(processedUrl);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Audio extracted successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Audio extraction failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  return (
    <ToolLayout
      title="Audio Extractor"
      description="Extract audio from your videos in high quality"
    >
      <div className="space-y-8">
        <FileUpload
          accept={{ 'video/*': ['.mp4', '.mov', '.avi'] }}
          onUpload={handleUpload}
          maxSize={200 * 1024 * 1024} // 200MB limit
        />
        
        {file && status === 'idle' && (
          <div className="text-center">
            <p className="mb-4">Selected file: {file.name}</p>
            <Button onClick={handleExtract}>Extract Audio</Button>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus status="processing" progress={progress} />
        )}
        
        {status === 'completed' && resultUrl && (
          <div className="text-center space-y-4">
            <p className="text-green-500 mb-4">Audio extracted successfully!</p>
            <div className="max-w-md mx-auto border border-gray-800 rounded-lg p-6">
              <audio controls className="w-full">
                <source src={resultUrl} type="audio/mp3" />
                Your browser does not support the audio element.
              </audio>
            </div>
            <div className="flex justify-center gap-4">
              <Button as="a" href={resultUrl} download="extracted-audio.mp3">
                Download Audio
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setStatus('idle');
                  setProgress(0);
                  setResultUrl('');
                  setFile(null);
                }}
              >
                Extract Another
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default AudioExtract;