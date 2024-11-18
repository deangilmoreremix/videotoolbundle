import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';
import { Move, X } from 'lucide-react';

interface Overlay {
  id: string;
  file: File;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number;
  scale: number;
}

const VideoOverlays = () => {
  const [mainVideo, setMainVideo] = useState<File | null>(null);
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const { addToast } = useToast();

  const positions = {
    'top-left': 'north_west',
    'top-right': 'north_east',
    'bottom-left': 'south_west',
    'bottom-right': 'south_east',
    'center': 'center'
  };

  const handleMainVideoUpload = (file: File) => {
    setMainVideo(file);
  };

  const handleOverlayUpload = (file: File) => {
    const newOverlay: Overlay = {
      id: Math.random().toString(36).substr(2, 9),
      file,
      position: 'top-right',
      opacity: 100,
      scale: 30
    };
    setOverlays([...overlays, newOverlay]);
  };

  const updateOverlay = (id: string, updates: Partial<Overlay>) => {
    setOverlays(overlays.map(overlay => 
      overlay.id === id ? { ...overlay, ...updates } : overlay
    ));
  };

  const removeOverlay = (id: string) => {
    setOverlays(overlays.filter(overlay => overlay.id !== id));
  };

  const handleApplyOverlays = async () => {
    if (!mainVideo || overlays.length === 0) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      // Upload main video
      const mainResult = await uploadToCloudinary(mainVideo);
      setProgress(40);

      // Upload all overlays
      const uploadedOverlays = await Promise.all(
        overlays.map(async (overlay) => {
          const result = await uploadToCloudinary(overlay.file);
          return {
            ...overlay,
            publicId: result.public_id
          };
        })
      );
      setProgress(70);

      // Build transformation string
      const overlayTransformations = uploadedOverlays
        .map(overlay => 
          `/l_${overlay.publicId},w_${overlay.scale},o_${overlay.opacity},g_${positions[overlay.position]}/fl_layer_apply`
        )
        .join('');

      const finalUrl = mainResult.secure_url.replace(
        '/upload/',
        `/upload${overlayTransformations}/`
      );
      
      setResultUrl(finalUrl);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Overlays applied successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Failed to apply overlays',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  return (
    <ToolLayout
      title="Video Overlays"
      description="Add custom overlays, watermarks, and logos to your videos"
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Main Video</h3>
            <FileUpload
              accept={{ 'video/*': ['.mp4', '.mov', '.avi'] }}
              onUpload={handleMainVideoUpload}
              maxSize={200 * 1024 * 1024} // 200MB limit
            />
            {mainVideo && (
              <p className="mt-2 text-sm text-gray-400">
                Selected: {mainVideo.name}
              </p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Add Overlay</h3>
            <FileUpload
              accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif'] }}
              onUpload={handleOverlayUpload}
              maxSize={5 * 1024 * 1024} // 5MB limit
            />
          </div>
        </div>

        {overlays.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Overlay Settings</h3>
            {overlays.map((overlay) => (
              <div 
                key={overlay.id}
                className="bg-gray-800 rounded-lg p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Move className="w-5 h-5 text-gray-400" />
                    <span className="font-medium">Overlay: {overlay.file.name}</span>
                  </div>
                  <button
                    onClick={() => removeOverlay(overlay.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Position</label>
                    <select
                      value={overlay.position}
                      onChange={(e) => updateOverlay(overlay.id, {
                        position: e.target.value as Overlay['position']
                      })}
                      className="w-full bg-gray-900 rounded-lg px-3 py-2 border border-gray-700"
                    >
                      <option value="top-left">Top Left</option>
                      <option value="top-right">Top Right</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="bottom-right">Bottom Right</option>
                      <option value="center">Center</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Opacity: {overlay.opacity}%
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={overlay.opacity}
                      onChange={(e) => updateOverlay(overlay.id, {
                        opacity: Number(e.target.value)
                      })}
                      className="w-full accent-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Size: {overlay.scale}%
                    </label>
                    <input
                      type="range"
                      min={5}
                      max={100}
                      value={overlay.scale}
                      onChange={(e) => updateOverlay(overlay.id, {
                        scale: Number(e.target.value)
                      })}
                      className="w-full accent-red-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {mainVideo && overlays.length > 0 && status === 'idle' && (
          <div className="text-center">
            <Button onClick={handleApplyOverlays}>Apply Overlays</Button>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Applying overlays to video..."
          />
        )}
        
        {status === 'completed' && resultUrl && (
          <div className="text-center space-y-4">
            <p className="text-green-500 mb-4">Overlays applied successfully!</p>
            <div className="max-w-2xl mx-auto border border-gray-800 rounded-lg overflow-hidden">
              <video 
                src={resultUrl} 
                controls 
                className="w-full"
                poster={resultUrl.replace(/\.[^/.]+$/, '.jpg')}
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
                  setOverlays([]);
                }}
              >
                Create New Video
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default VideoOverlays;