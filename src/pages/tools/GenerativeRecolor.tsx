import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';

const GenerativeRecolor = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [colorSettings, setColorSettings] = useState({
    target: '',
    newColor: '#FF0000',
    preserveLighting: true
  });
  const { addToast } = useToast();

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const handleRecolor = async () => {
    if (!file || !colorSettings.target) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      const result = await uploadToCloudinary(file);
      setProgress(60);

      // Convert hex color to RGB
      const hex = colorSettings.newColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      // Apply recoloring transformation
      const processedUrl = result.secure_url.replace(
        '/upload/',
        `/upload/e_replace_color:${colorSettings.target};${r}_${g}_${b}${colorSettings.preserveLighting ? ':preserve_lighting' : ''}/`
      );
      
      setResultUrl(processedUrl);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Color replaced successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Color replacement failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  return (
    <ToolLayout
      title="Generative Recolor"
      description="Change colors in your images using AI-powered color replacement"
    >
      <div className="space-y-8">
        <FileUpload
          accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
          onUpload={handleUpload}
          maxSize={10 * 1024 * 1024} // 10MB limit
        />
        
        {file && status === 'idle' && (
          <div className="space-y-6">
            <div className="max-w-md mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Target Color Description</label>
                <textarea
                  value={colorSettings.target}
                  onChange={(e) => setColorSettings(prev => ({
                    ...prev,
                    target: e.target.value
                  }))}
                  placeholder="Describe the color you want to replace (e.g., 'red car', 'blue sky')"
                  className="w-full h-24 bg-gray-800 rounded-lg px-4 py-3 border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">New Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={colorSettings.newColor}
                    onChange={(e) => setColorSettings(prev => ({
                      ...prev,
                      newColor: e.target.value
                    }))}
                    className="h-10 w-20 bg-gray-800 rounded-lg border border-gray-700"
                  />
                  <input
                    type="text"
                    value={colorSettings.newColor}
                    onChange={(e) => setColorSettings(prev => ({
                      ...prev,
                      newColor: e.target.value
                    }))}
                    className="flex-1 bg-gray-800 rounded-lg px-4 py-2 border border-gray-700"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="preserveLighting"
                  checked={colorSettings.preserveLighting}
                  onChange={(e) => setColorSettings(prev => ({
                    ...prev,
                    preserveLighting: e.target.checked
                  }))}
                  className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                />
                <label htmlFor="preserveLighting" className="text-sm">
                  Preserve original lighting and shading
                </label>
              </div>
            </div>
            
            <div className="text-center">
              <p className="mb-4">Selected file: {file.name}</p>
              <Button 
                onClick={handleRecolor}
                disabled={!colorSettings.target.trim()}
              >
                Replace Color
              </Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Replacing colors with AI..."
          />
        )}
        
        {status === 'completed' && resultUrl && (
          <div className="text-center space-y-4">
            <p className="text-green-500 mb-4">Color replaced successfully!</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-800 rounded-lg overflow-hidden">
                <h4 className="text-sm font-medium p-2 bg-gray-800">Original</h4>
                <img 
                  src={URL.createObjectURL(file)} 
                  alt="Original" 
                  className="w-full"
                />
              </div>
              <div className="border border-gray-800 rounded-lg overflow-hidden">
                <h4 className="text-sm font-medium p-2 bg-gray-800">Recolored</h4>
                <img 
                  src={resultUrl} 
                  alt="Recolored" 
                  className="w-full"
                />
              </div>
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
                  setFile(null);
                  setColorSettings(prev => ({
                    ...prev,
                    target: ''
                  }));
                }}
              >
                Recolor Another Image
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default GenerativeRecolor;