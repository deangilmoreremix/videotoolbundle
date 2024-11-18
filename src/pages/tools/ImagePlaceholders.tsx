import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';

interface PlaceholderSettings {
  type: 'blur' | 'pixelate' | 'dominant' | 'vectorize';
  quality: number;
  size: number;
}

const ImagePlaceholders = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrls, setResultUrls] = useState<{
    placeholder: string;
    original: string;
  } | null>(null);
  const [settings, setSettings] = useState<PlaceholderSettings>({
    type: 'blur',
    quality: 1,
    size: 10
  });
  const { addToast } = useToast();

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

      // Generate placeholder based on selected type
      let placeholderUrl = '';
      switch (settings.type) {
        case 'blur':
          placeholderUrl = result.secure_url.replace(
            '/upload/',
            `/upload/w_${settings.size},e_blur:${settings.quality * 1000}/`
          );
          break;
        case 'pixelate':
          placeholderUrl = result.secure_url.replace(
            '/upload/',
            `/upload/w_${settings.size},e_pixelate:${settings.quality * 10}/`
          );
          break;
        case 'dominant':
          placeholderUrl = result.secure_url.replace(
            '/upload/',
            `/upload/w_${settings.size},e_predominant/`
          );
          break;
        case 'vectorize':
          placeholderUrl = result.secure_url.replace(
            '/upload/',
            `/upload/w_${settings.size},e_vectorize:${settings.quality * 10}/`
          );
          break;
      }

      setResultUrls({
        placeholder: placeholderUrl,
        original: result.secure_url
      });
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Placeholder generated successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Placeholder generation failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  const generateCode = () => {
    if (!resultUrls) return '';

    return `<!-- Progressive Image Loading -->
<div class="progressive-image">
  <!-- Low-quality placeholder -->
  <img
    src="${resultUrls.placeholder}"
    class="placeholder"
    alt="Low-quality placeholder"
  />
  
  <!-- High-quality image -->
  <img
    src="${resultUrls.original}"
    class="full-image"
    alt="Full quality image"
    loading="lazy"
  />
</div>

<style>
.progressive-image {
  position: relative;
}

.progressive-image img {
  display: block;
  width: 100%;
  height: auto;
}

.progressive-image .placeholder {
  filter: blur(10px);
  transition: opacity 0.3s ease-in-out;
}

.progressive-image .full-image {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.progressive-image .full-image.loaded {
  opacity: 1;
}
</style>

<script>
document.querySelectorAll('.progressive-image .full-image').forEach(img => {
  img.onload = () => img.classList.add('loaded');
});
</script>`;
  };

  return (
    <ToolLayout
      title="Image Placeholders"
      description="Generate low-quality image placeholders for progressive loading"
    >
      <div className="space-y-8">
        <FileUpload
          accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
          onUpload={handleUpload}
          maxSize={10 * 1024 * 1024} // 10MB limit
        />
        
        {file && status === 'idle' && (
          <div className="space-y-6">
            <div className="max-w-xl mx-auto space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Placeholder Type</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(['blur', 'pixelate', 'dominant', 'vectorize'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setSettings(prev => ({ ...prev, type }))}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        settings.type === type 
                          ? 'border-red-500 bg-red-500/10' 
                          : 'border-gray-700 hover:border-red-500'
                      }`}
                    >
                      <div className="text-lg font-bold mb-1 capitalize">{type}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Quality Level: {settings.quality}
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={settings.quality}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    quality: Number(e.target.value)
                  }))}
                  className="w-full accent-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Placeholder Size: {settings.size}px
                </label>
                <input
                  type="range"
                  min={5}
                  max={100}
                  value={settings.size}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    size: Number(e.target.value)
                  }))}
                  className="w-full accent-red-500"
                />
              </div>
            </div>
            
            <div className="text-center">
              <Button onClick={handleGenerate}>Generate Placeholder</Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Generating image placeholder..."
          />
        )}
        
        {status === 'completed' && resultUrls && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="border border-gray-800 rounded-lg overflow-hidden">
                  <h4 className="text-sm font-medium p-2 bg-gray-800">Placeholder Preview</h4>
                  <img 
                    src={resultUrls.placeholder} 
                    alt="Placeholder" 
                    className="w-full"
                  />
                </div>
                <div className="text-sm text-gray-400 text-center">
                  Low-quality placeholder image
                </div>
              </div>

              <div className="space-y-4">
                <div className="border border-gray-800 rounded-lg overflow-hidden">
                  <h4 className="text-sm font-medium p-2 bg-gray-800">Original Image</h4>
                  <img 
                    src={resultUrls.original} 
                    alt="Original" 
                    className="w-full"
                  />
                </div>
                <div className="text-sm text-gray-400 text-center">
                  Full-quality image
                </div>
              </div>
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
                  setResultUrls(null);
                  setFile(null);
                }}
              >
                Generate Another Placeholder
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default ImagePlaceholders;