import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';

const SceneDetection = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [scenes, setScenes] = useState<{ timestamp: number; thumbnail: string }[]>([]);
  const { addToast } = useToast();

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const handleDetectScenes = async () => {
    if (!file) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      const result = await uploadToCloudinary(file);
      setProgress(60);

      // Simulate scene detection with thumbnails at different timestamps
      const detectedScenes = [0, 15, 30, 45].map(timestamp => ({
        timestamp,
        thumbnail: result.secure_url.replace(
          '/upload/',
          `/upload/so_${timestamp},w_640,h_360,c_fill/`
        )
      }));
      
      setScenes(detectedScenes);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Scenes detected successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Scene detection failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  return (
    <ToolLayout
      title="Scene Detection"
      description="Automatically detect and extract scenes from your videos"
    >
      <div className="space-y-8">
        <FileUpload
          accept={{ 'video/*': ['.mp4', '.mov', '.avi'] }}
          onUpload={handleUpload}
          maxSize={100 * 1024 * 1024}
        />
        
        {file && status === 'idle' && (
          <div className="text-center">
            <p className="mb-4">Selected file: {file.name}</p>
            <Button onClick={handleDetectScenes}>Detect Scenes</Button>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus status="processing" progress={progress} />
        )}
        
        {status === 'completed' && scenes.length > 0 && (
          <div className="space-y-4">
            <p className="text-green-500 text-center mb-4">Scenes detected!</p>
            <div className="grid grid-cols-2 gap-4">
              {scenes.map((scene, index) => (
                <div key={index} className="border border-gray-800 rounded-lg overflow-hidden">
                  <img src={scene.thumbnail} alt={`Scene ${index + 1}`} className="w-full" />
                  <div className="p-2 bg-gray-800">
                    <p className="text-sm">Timestamp: {scene.timestamp}s</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default SceneDetection;