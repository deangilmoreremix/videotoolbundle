import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';
import { Globe, Smartphone, Laptop, Tablet, Wifi, WifiOff } from 'lucide-react';

interface DeliverySettings {
  deviceDetection: boolean;
  networkOptimization: boolean;
  formatOptimization: boolean;
  qualityOptimization: boolean;
}

interface DevicePreset {
  name: string;
  icon: React.ReactNode;
  width: number;
  format: string;
  quality: number;
}

const DynamicDelivery = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrls, setResultUrls] = useState<Record<string, string>>({});
  const [settings, setSettings] = useState<DeliverySettings>({
    deviceDetection: true,
    networkOptimization: true,
    formatOptimization: true,
    qualityOptimization: true
  });
  const { addToast } = useToast();

  const devicePresets: Record<string, DevicePreset> = {
    mobile: {
      name: 'Mobile',
      icon: <Smartphone className="w-5 h-5" />,
      width: 640,
      format: 'webp',
      quality: 60
    },
    tablet: {
      name: 'Tablet',
      icon: <Tablet className="w-5 h-5" />,
      width: 1024,
      format: 'webp',
      quality: 70
    },
    desktop: {
      name: 'Desktop',
      icon: <Laptop className="w-5 h-5" />,
      width: 1920,
      format: 'webp',
      quality: 80
    }
  };

  const networkPresets = {
    '4g': { quality: 80, format: 'webp' },
    '3g': { quality: 60, format: 'webp' },
    '2g': { quality: 40, format: 'jpg' }
  };

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const handleOptimize = async () => {
    if (!file) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      const result = await uploadToCloudinary(file);
      setProgress(40);

      // Generate optimized versions for different scenarios
      const optimizedUrls: Record<string, string> = {};
      let currentProgress = 40;
      const progressStep = 50 / (Object.keys(devicePresets).length * 2); // For both network conditions

      // Generate device-specific versions
      for (const [key, preset] of Object.entries(devicePresets)) {
        // High bandwidth version
        const highBwUrl = result.secure_url.replace(
          '/upload/',
          `/upload/w_${preset.width},f_${preset.format},q_${preset.quality}/`
        );
        optimizedUrls[`${key}_high`] = highBwUrl;

        // Low bandwidth version
        const lowBwUrl = result.secure_url.replace(
          '/upload/',
          `/upload/w_${preset.width},f_jpg,q_${Math.max(preset.quality - 20, 30)}/`
        );
        optimizedUrls[`${key}_low`] = lowBwUrl;

        currentProgress += progressStep;
        setProgress(Math.round(currentProgress));
      }

      setResultUrls(optimizedUrls);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Dynamic delivery versions generated',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Optimization failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  const generateCode = () => {
    return `
<!-- Dynamic Delivery Implementation -->
<script>
const deliveryConfig = {
  deviceDetection: ${settings.deviceDetection},
  networkOptimization: ${settings.networkOptimization},
  formatOptimization: ${settings.formatOptimization},
  qualityOptimization: ${settings.qualityOptimization}
};

class DynamicDelivery {
  constructor(config) {
    this.config = config;
    this.deviceType = this.detectDevice();
    this.connection = this.detectConnection();
    this.supportedFormats = this.detectFormats();
  }

  detectDevice() {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  detectConnection() {
    if (!navigator.connection) return 'high';
    const { effectiveType, downlink } = navigator.connection;
    if (downlink >= 5) return 'high';
    if (downlink >= 2) return 'medium';
    return 'low';
  }

  detectFormats() {
    const formats = [];
    const canvas = document.createElement('canvas');
    if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
      formats.push('webp');
    }
    if (canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0) {
      formats.push('avif');
    }
    formats.push('jpg');
    return formats;
  }

  getOptimalUrl(urls) {
    const bandwidth = this.connection === 'high' ? 'high' : 'low';
    return urls[\`\${this.deviceType}_\${bandwidth}\`] || urls.desktop_high;
  }
}

// Initialize delivery system
const delivery = new DynamicDelivery(deliveryConfig);

// Example usage
document.querySelectorAll('[data-dynamic-delivery]').forEach(img => {
  const urls = JSON.parse(img.dataset.urls);
  img.src = delivery.getOptimalUrl(urls);
});
</script>

<!-- Example Usage -->
<img 
  data-dynamic-delivery
  data-urls='${JSON.stringify(resultUrls)}'
  alt="Dynamically delivered image"
/>`;
  };

  return (
    <ToolLayout
      title="Dynamic Delivery"
      description="Optimize content delivery based on device and network conditions"
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
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Optimization Settings
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.deviceDetection}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        deviceDetection: e.target.checked
                      }))}
                      className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                    />
                    <span className="text-sm">Enable device-based optimization</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.networkOptimization}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        networkOptimization: e.target.checked
                      }))}
                      className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                    />
                    <span className="text-sm">Enable network-based optimization</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.formatOptimization}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        formatOptimization: e.target.checked
                      }))}
                      className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                    />
                    <span className="text-sm">Enable format optimization</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.qualityOptimization}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        qualityOptimization: e.target.checked
                      }))}
                      className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                    />
                    <span className="text-sm">Enable quality optimization</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <Button onClick={handleOptimize}>Generate Delivery Versions</Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Generating optimized versions..."
          />
        )}
        
        {status === 'completed' && Object.keys(resultUrls).length > 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(devicePresets).map(([key, preset]) => (
                <div key={key} className="space-y-4">
                  <div className="flex items-center gap-2 text-lg font-medium">
                    {preset.icon}
                    <span>{preset.name}</span>
                  </div>

                  <div className="space-y-4">
                    <div className="border border-gray-800 rounded-lg overflow-hidden">
                      <div className="bg-gray-800 p-2 flex items-center gap-2">
                        <Wifi className="w-4 h-4 text-green-500" />
                        <span className="text-sm">High Bandwidth</span>
                      </div>
                      <img 
                        src={resultUrls[`${key}_high`]} 
                        alt={`${preset.name} High Bandwidth`}
                        className="w-full"
                      />
                    </div>

                    <div className="border border-gray-800 rounded-lg overflow-hidden">
                      <div className="bg-gray-800 p-2 flex items-center gap-2">
                        <WifiOff className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm">Low Bandwidth</span>
                      </div>
                      <img 
                        src={resultUrls[`${key}_low`]} 
                        alt={`${preset.name} Low Bandwidth`}
                        className="w-full"
                      />
                    </div>
                  </div>
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
                  setResultUrls({});
                  setFile(null);
                }}
              >
                Generate More Versions
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default DynamicDelivery;