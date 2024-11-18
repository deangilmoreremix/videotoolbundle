import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';
import { X, ArrowUp, ArrowDown } from 'lucide-react';

interface SpliceImage {
  id: string;
  file: File;
  transition: 'fade' | 'slide' | 'zoom' | 'none';
  duration: number;
}

const Splicing = () => {
  const [images, setImages] = useState<SpliceImage[]>([]);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const { addToast } = useToast();

  const transitions = [
    { value: 'fade', label: 'Fade' },
    { value: 'slide', label: 'Slide' },
    { value: 'zoom', label: 'Zoom' },
    { value: 'none', label: 'None' }
  ];

  const handleUpload = (uploadedFile: File) => {
    const newImage: SpliceImage = {
      id: Math.random().toString(36).substr(2, 9),
      file: uploadedFile,
      transition: 'fade',
      duration: 2
    };
    setImages([...images, newImage]);
  };

  const removeImage = (id: string) => {
    setImages(images.filter(img => img.id !== id));
  };

  const updateImage = (id: string, updates: Partial<SpliceImage>) => {
    setImages(images.map(img => 
      img.id === id ? { ...img, ...updates } : img
    ));
  };

  const moveImage = (id: string, direction: 'up' | 'down') => {
    const index = images.findIndex(img => img.id === id);
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === images.length - 1)
    ) return;

    const newImages = [...images];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    setImages(newImages);
  };

  const handleSplice = async () => {
    if (images.length < 2) {
      addToast({
        title: 'Please add at least 2 images',
        type: 'error'
      });
      return;
    }
    
    try {
      setStatus('processing');
      setProgress(20);

      // Upload all images
      const uploadedImages = await Promise.all(
        images.map(async (image, index) => {
          const result = await uploadToCloudinary(image.file);
          setProgress(20 + ((index + 1) / images.length) * 40);
          return {
            ...image,
            publicId: result.public_id
          };
        })
      );

      // Create splicing transformation
      let baseUrl = `https://res.cloudinary.com/${process.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`;
      const transformations = uploadedImages.slice(1).map((image, index) => {
        const transition = image.transition === 'none' ? '' : `e_${image.transition}:${image.duration * 1000}`;
        return `/l_${image.publicId}${transition ? `,${transition}` : ''}/fl_layer_apply`;
      }).join('');

      const finalUrl = `${baseUrl}/${uploadedImages[0].publicId}${transformations}`;
      
      setResultUrl(finalUrl);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Images spliced successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Splicing failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  return (
    <ToolLayout
      title="Image Splicing"
      description="Combine multiple images with smooth transitions and effects"
    >
      <div className="space-y-8">
        {images.length < 5 && (
          <FileUpload
            accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
            onUpload={handleUpload}
            maxSize={10 * 1024 * 1024} // 10MB limit
          />
        )}
        
        {images.length > 0 && status === 'idle' && (
          <div className="space-y-6">
            <div className="space-y-4">
              {images.map((image, index) => (
                <div 
                  key={image.id}
                  className="bg-gray-800 rounded-lg p-4 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Image {index + 1}</span>
                      {index > 0 && (
                        <span className="text-sm text-gray-400">
                          (Transition from previous image)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => moveImage(image.id, 'up')}
                        disabled={index === 0}
                        className="p-1 hover:bg-gray-700 rounded disabled:opacity-50"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveImage(image.id, 'down')}
                        disabled={index === images.length - 1}
                        className="p-1 hover:bg-gray-700 rounded disabled:opacity-50"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeImage(image.id)}
                        className="p-1 hover:bg-gray-700 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {index > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Transition Effect
                        </label>
                        <select
                          value={image.transition}
                          onChange={(e) => updateImage(image.id, {
                            transition: e.target.value as SpliceImage['transition']
                          })}
                          className="w-full bg-gray-900 rounded-lg px-3 py-2 border border-gray-700"
                        >
                          {transitions.map(t => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Duration (seconds)
                        </label>
                        <input
                          type="number"
                          min={0.5}
                          max={5}
                          step={0.5}
                          value={image.duration}
                          onChange={(e) => updateImage(image.id, {
                            duration: Number(e.target.value)
                          })}
                          className="w-full bg-gray-900 rounded-lg px-3 py-2 border border-gray-700"
                        />
                      </div>
                    </div>
                  )}

                  <div className="border border-gray-700 rounded-lg overflow-hidden">
                    <img 
                      src={URL.createObjectURL(image.file)} 
                      alt={`Image ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <Button 
                onClick={handleSplice}
                disabled={images.length < 2}
              >
                Splice Images
              </Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Splicing images with transitions..."
          />
        )}
        
        {status === 'completed' && resultUrl && (
          <div className="text-center space-y-4">
            <p className="text-green-500 mb-4">Images spliced successfully!</p>
            <div className="border border-gray-800 rounded-lg overflow-hidden">
              <img 
                src={resultUrl} 
                alt="Spliced result" 
                className="w-full"
              />
            </div>
            <div className="flex justify-center gap-4">
              <Button as="a" href={resultUrl} download>
                Download Image
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setStatus('idle');
                  setProgress(0);
                  setResultUrl('');
                  setImages([]);
                }}
              >
                Create New Splice
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default Splicing;