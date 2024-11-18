import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';
import { Globe, Gauge, BarChart } from 'lucide-react';

interface CdnSettings {
  autoSwitch: boolean;
  monitorPerformance: boolean;
  fallbackEnabled: boolean;
  customDomains: string[];
}

interface CdnMetrics {
  latency: number;
  availability: number;
  throughput: number;
}

const MultiCdn = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrls, setResultUrls] = useState<Record<string, string>>({});
  const [settings, setSettings] = useState<CdnSettings>({
    autoSwitch: true,
    monitorPerformance: true,
    fallbackEnabled: true,
    customDomains: []
  });
  const { addToast } = useToast();

  const cdnProviders = {
    cloudinary: { name: 'Cloudinary CDN', region: 'Global' },
    akamai: { name: 'Akamai', region: 'Global Edge' },
    fastly: { name: 'Fastly', region: 'Global Edge' }
  };

  const mockMetrics: Record<string, CdnMetrics> = {
    cloudinary: { latency: 45, availability: 99.99, throughput: 150 },
    akamai: { latency: 48, availability: 99.98, throughput: 145 },
    fastly: { latency: 47, availability: 99.97, throughput: 148 }
  };

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const handleDeploy = async () => {
    if (!file) return;
    
    try {
      setStatus('processing');
      setProgress(20);

      const result = await uploadToCloudinary(file);
      setProgress(50);

      // Generate URLs for different CDN providers
      const urls: Record<string, string> = {};
      Object.keys(cdnProviders).forEach(provider => {
        urls[provider] = result.secure_url.replace(
          'res.cloudinary.com',
          `${provider}-cdn.example.com`
        );
      });

      setResultUrls(urls);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Asset deployed to multiple CDNs',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Deployment failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  const generateCode = () => {
    return `
<!-- Multi-CDN Implementation -->
<script>
const cdnConfig = {
  providers: ${JSON.stringify(resultUrls, null, 2)},
  settings: ${JSON.stringify(settings, null, 2)}
};

class MultiCdnManager {
  constructor(config) {
    this.config = config;
    this.metrics = {};
    this.currentProvider = 'cloudinary';
    
    if (config.settings.monitorPerformance) {
      this.startMonitoring();
    }
  }

  async measureLatency(url) {
    const start = performance.now();
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const end = performance.now();
      return response.ok ? end - start : Infinity;
    } catch {
      return Infinity;
    }
  }

  async startMonitoring() {
    setInterval(async () => {
      for (const [provider, url] of Object.entries(this.config.providers)) {
        const latency = await this.measureLatency(url);
        this.metrics[provider] = {
          latency,
          timestamp: Date.now()
        };
      }
      
      if (this.config.settings.autoSwitch) {
        this.optimizeProvider();
      }
    }, 60000); // Check every minute
  }

  optimizeProvider() {
    const bestProvider = Object.entries(this.metrics)
      .reduce((best, [provider, metrics]) => {
        return metrics.latency < (best.metrics?.latency ?? Infinity)
          ? { provider, metrics }
          : best;
      }, {}).provider;
      
    if (bestProvider && bestProvider !== this.currentProvider) {
      this.switchProvider(bestProvider);
    }
  }

  switchProvider(provider) {
    this.currentProvider = provider;
    document.querySelectorAll('[data-multi-cdn]').forEach(element => {
      const path = element.getAttribute('data-path');
      element.src = this.config.providers[provider] + path;
    });
  }

  getOptimalUrl(path) {
    return this.config.providers[this.currentProvider] + path;
  }
}

// Initialize Multi-CDN system
const cdnManager = new MultiCdnManager(cdnConfig);

// Example usage
document.querySelectorAll('[data-multi-cdn]').forEach(element => {
  const path = element.getAttribute('data-path');
  element.src = cdnManager.getOptimalUrl(path);
});
</script>

<!-- Example Usage -->
<img 
  data-multi-cdn
  data-path="/assets/example.jpg"
  src="${resultUrls.cloudinary}"
  alt="Multi-CDN delivered asset"
/>`;
  };

  return (
    <ToolLayout
      title="Multi CDN"
      description="Optimize content delivery using multiple CDN providers"
    >
      <div className="space-y-8">
        <FileUpload
          accept={{
            'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
            'video/*': ['.mp4', '.mov', '.webm'],
            'application/*': ['.pdf', '.zip']
          }}
          onUpload={handleUpload}
          maxSize={100 * 1024 * 1024} // 100MB limit
        />
        
        {file && status === 'idle' && (
          <div className="space-y-6">
            <div className="max-w-xl mx-auto space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  CDN Settings
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.autoSwitch}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        autoSwitch: e.target.checked
                      }))}
                      className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                    />
                    <span className="text-sm">Enable automatic CDN switching</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.monitorPerformance}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        monitorPerformance: e.target.checked
                      }))}
                      className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                    />
                    <span className="text-sm">Monitor CDN performance</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.fallbackEnabled}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        fallbackEnabled: e.target.checked
                      }))}
                      className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                    />
                    <span className="text-sm">Enable fallback CDNs</span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  CDN Providers
                </h3>
                <div className="space-y-4">
                  {Object.entries(cdnProviders).map(([key, provider]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{provider.name}</h4>
                        <p className="text-sm text-gray-400">{provider.region}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Gauge className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{mockMetrics[key].latency}ms</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BarChart className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">{mockMetrics[key].availability}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <Button onClick={handleDeploy}>Deploy to CDNs</Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Deploying to multiple CDNs..."
          />
        )}
        
        {status === 'completed' && Object.keys(resultUrls).length > 0 && (
          <div className="space-y-6">
            <div className="grid gap-6">
              {Object.entries(resultUrls).map(([provider, url]) => (
                <div key={provider} className="border border-gray-800 rounded-lg overflow-hidden">
                  <div className="bg-gray-800 p-3">
                    <h4 className="font-medium">{cdnProviders[provider].name}</h4>
                    <p className="text-sm text-gray-400 truncate">{url}</p>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{mockMetrics[provider].latency}ms</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BarChart className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">{mockMetrics[provider].availability}%</span>
                      </div>
                    </div>
                    <Button size="sm" as="a" href={url} target="_blank">
                      Test URL
                    </Button>
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
                Deploy Another Asset
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default MultiCdn;