import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';

const AddBrolls = () => {
  const [mainVideo, setMainVideo] = useState<File | null>(null);
  const [brollVideo, setBrollVideo] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const { addToast } = useToast();

  const handleMainVideoUpload = (file: File) => {
    setMainVideo(file);
  };

  const handleBrollUpload = (file: File) => {
    setBrollVideo(file);
  };

  const handleMerge = async () => {
    if (!mainVideo || !brollVideo) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      // Upload main video
      const mainResult = await uploadToCloudinary(mainVideo);
      setProgress(40);

      // Upload b-roll video
      const brollResult = await uploadToCloudinary(brollVideo);
      setProgress(60);

      // Create overlay transformation
      const processedUrl = mainResult.secure_url.replace(
        '/upload/',
        `/upload/l_video:${brollResult.public_id},w_0.3,h_0.3,g_north_east,o_70/`
      );
      
      setResultUrl(processedUrl);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'B-roll added successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Failed to add b-roll',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  return (
    <ToolLayout
      title="Add B-roll Video"
      description="Add picture-in-picture b-roll footage to your main video"
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Main Video</h3>
            <FileUpload
              accept={{ 'video/*': ['.mp4', '.mov', '.avi'] }}
              onUpload={handleMainVideoUpload}
              maxSize={100 * 1024 * 1024} // 100MB limit
            />
            {mainVideo && (
              <p className="mt-2 text-sm text-gray-400">
                Selected: {mainVideo.name}
              </p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">B-roll Video</h3>
            <FileUpload
              accept={{ 'video/*': ['.mp4', '.mov', '.avi'] }}
              onUpload={handleBrollUpload}
              maxSize={100 * 1024 * 1024} // 100MB limit
            />
            {brollVideo && (
              <p className="mt-2 text-sm text-gray-400">
                Selected: {brollVideo.name}
              </p>
            )}
          </div>
        </div>

        {mainVideo && brollVideo && status === 'idle' && (
          <div className="text-center">
            <Button onClick={handleMerge}>Add B-roll</Button>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus status="processing" progress={progress} />
        )}
        
        {status === 'completed' && resultUrl && (
          <div className="text-center space-y-4">
            <p className="text-green-500 mb-4">B-roll added successfully!</p>
            <div className="max-w-2xl mx-auto border border-gray-800 rounded-lg overflow-hidden">
              <video 
                src={resultUrl} 
                controls 
                className="w-full"
                poster={resultUrl.replace('.mp4', '.jpg')}
              />
            </div>
            <div className="flex justify-center gap-4">
              <Button as="a" href={resultUrl} download>
                Download Video
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setStatus('idle');
                  setProgress(0);
                  setResultUrl('');
                  setMainVideo(null);
                  setBrollVideo(null);
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

export default AddBrolls;