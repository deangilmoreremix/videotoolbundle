import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';
import { X, ArrowUp, ArrowDown, Move } from 'lucide-react';

interface GalleryImage {
  id: string;
  file: File;
  url?: string;
  alt: string;
  featured: boolean;
}

interface GallerySettings {
  layout: 'grid' | 'carousel' | 'masonry';
  thumbnailSize: number;
  zoomEnabled: boolean;
  lightboxEnabled: boolean;
  autoplay: boolean;
}

const ProductGallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [settings, setSettings] = useState<GallerySettings>({
    layout: 'grid',
    thumbnailSize: 200,
    zoomEnabled: true,
    lightboxEnabled: true,
    autoplay: false
  });
  const { addToast } = useToast();

  const handleUpload = (file: File) => {
    const newImage: GalleryImage = {
      id: Math.random().toString(36).substr(2, 9),
      file,
      alt: file.name,
      featured: images.length === 0
    };
    setImages(prev => [...prev, newImage]);
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
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

  const setFeatured = (id: string) => {
    setImages(prev => prev.map(img => ({
      ...img,
      featured: img.id === id
    })));
  };

  const handleGenerate = async () => {
    if (images.length === 0) return;
    
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
            url: result.secure_url
          };
        })
      );

      setImages(uploadedImages);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Gallery generated successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Gallery generation failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  const generateCode = () => {
    if (!images.some(img => img.url)) return '';

    const galleryCode = `
<!-- Product Gallery -->
<div class="product-gallery" data-layout="${settings.layout}">
  ${images.map(img => `
  <div class="gallery-item${img.featured ? ' featured' : ''}">
    <img 
      src="${img.url}" 
      alt="${img.alt}"
      ${settings.zoomEnabled ? 'data-zoom="true"' : ''}
      ${settings.lightboxEnabled ? 'data-lightbox="gallery"' : ''}
    />
  </div>
  `).join('')}
</div>

<style>
.product-gallery {
  display: grid;
  gap: 1rem;
  ${settings.layout === 'grid' 
    ? `grid-template-columns: repeat(auto-fill, minmax(${settings.thumbnailSize}px, 1fr));`
    : settings.layout === 'masonry'
    ? 'columns: 3;'
    : ''
  }
}

.gallery-item {
  position: relative;
  overflow: hidden;
  ${settings.layout === 'masonry' ? 'break-inside: avoid;' : ''}
}

.gallery-item img {
  width: 100%;
  height: auto;
  transition: transform 0.3s ease;
}

${settings.zoomEnabled ? `
.gallery-item img:hover {
  transform: scale(1.1);
}
` : ''}

.featured {
  grid-column: 1 / -1;
}
</style>

${settings.autoplay ? `
<script>
const gallery = document.querySelector('.product-gallery');
let currentIndex = 0;

setInterval(() => {
  const items = gallery.querySelectorAll('.gallery-item');
  items[currentIndex].classList.remove('active');
  currentIndex = (currentIndex + 1) % items.length;
  items[currentIndex].classList.add('active');
}, 3000);
</script>
` : ''}`;

    return galleryCode;
  };

  return (
    <ToolLayout
      title="Product Gallery"
      description="Create interactive product galleries optimized for all devices"
    >
      <div className="space-y-8">
        <FileUpload
          accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
          onUpload={handleUpload}
          maxSize={10 * 1024 * 1024} // 10MB limit
        />
        
        {images.length > 0 && status === 'idle' && (
          <div className="space-y-6">
            <div className="max-w-xl mx-auto space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Gallery Layout</label>
                <div className="grid grid-cols-3 gap-4">
                  {(['grid', 'carousel', 'masonry'] as const).map((layout) => (
                    <button
                      key={layout}
                      onClick={() => setSettings(prev => ({ ...prev, layout }))}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        settings.layout === layout 
                          ? 'border-red-500 bg-red-500/10' 
                          : 'border-gray-700 hover:border-red-500'
                      }`}
                    >
                      <div className="text-lg font-bold mb-1 capitalize">{layout}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Thumbnail Size: {settings.thumbnailSize}px
                </label>
                <input
                  type="range"
                  min={100}
                  max={400}
                  step={50}
                  value={settings.thumbnailSize}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    thumbnailSize: Number(e.target.value)
                  }))}
                  className="w-full accent-red-500"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="zoomEnabled"
                    checked={settings.zoomEnabled}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      zoomEnabled: e.target.checked
                    }))}
                    className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                  />
                  <label htmlFor="zoomEnabled" className="text-sm">
                    Enable image zoom on hover
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="lightboxEnabled"
                    checked={settings.lightboxEnabled}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      lightboxEnabled: e.target.checked
                    }))}
                    className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                  />
                  <label htmlFor="lightboxEnabled" className="text-sm">
                    Enable lightbox on click
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoplay"
                    checked={settings.autoplay}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      autoplay: e.target.checked
                    }))}
                    className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                  />
                  <label htmlFor="autoplay" className="text-sm">
                    Enable autoplay (carousel only)
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Gallery Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div 
                    key={image.id}
                    className={`relative group border border-gray-800 rounded-lg overflow-hidden ${
                      image.featured ? 'ring-2 ring-red-500' : ''
                    }`}
                  >
                    <img 
                      src={URL.createObjectURL(image.file)}
                      alt={image.alt}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button
                          onClick={() => moveImage(image.id, 'up')}
                          disabled={index === 0}
                          className="p-1 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveImage(image.id, 'down')}
                          disabled={index === images.length - 1}
                          className="p-1 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeImage(image.id)}
                          className="p-1 bg-gray-800 rounded hover:bg-gray-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => setFeatured(image.id)}
                        className="absolute bottom-2 left-2 text-sm bg-gray-800 px-2 py-1 rounded hover:bg-gray-700"
                      >
                        {image.featured ? 'Featured' : 'Set as Featured'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <Button onClick={handleGenerate}>Generate Gallery</Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Generating product gallery..."
          />
        )}
        
        {status === 'completed' && images.some(img => img.url) && (
          <div className="space-y-6">
            <div className={`grid gap-4 ${
              settings.layout === 'grid' 
                ? `grid-cols-2 md:grid-cols-4` 
                : settings.layout === 'masonry'
                ? 'columns-3'
                : 'grid-cols-1'
            }`}>
              {images.map(image => (
                <div 
                  key={image.id}
                  className={`${
                    settings.layout === 'masonry' 
                      ? 'break-inside-avoid' 
                      : image.featured ? 'col-span-full' : ''
                  }`}
                >
                  <img 
                    src={image.url}
                    alt={image.alt}
                    className={`w-full rounded-lg ${
                      settings.zoomEnabled ? 'hover:scale-105 transition-transform' : ''
                    }`}
                  />
                </div>
              ))}
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Implementation Code</h3>
                <Button
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(generateCode());
                    addToast({
                      title: 'Code copied to clipboard',
                      type: 'success'
                    });
                  }}
                >
                  Copy Code
                </Button>
              </div>
              <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{generateCode()}</code>
              </pre>
            </div>

            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => {
                  setStatus('idle');
                  setProgress(0);
                  setImages([]);
                }}
              >
                Create New Gallery
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default ProductGallery;