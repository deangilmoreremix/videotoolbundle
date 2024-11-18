import React from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Upload, Play, Settings, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MediaPreviewLayoutProps {
  title: string;
  description: string;
  uploadSection?: React.ReactNode;
  previewSection?: React.ReactNode;
  settingsSection?: React.ReactNode;
  resultSection?: React.ReactNode;
  isProcessing?: boolean;
  progress?: number;
  className?: string;
}

const MediaPreviewLayout: React.FC<MediaPreviewLayoutProps> = ({
  title,
  description,
  uploadSection,
  previewSection,
  settingsSection,
  resultSection,
  isProcessing,
  progress = 0,
  className
}) => {
  return (
    <div className={cn("min-h-screen bg-gray-950", className)}>
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <Link 
          to="/tools" 
          className="inline-flex items-center text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tools
        </Link>

        <h1 className="text-4xl font-bold mb-2">{title}</h1>
        <p className="text-xl text-gray-400">{description}</p>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Upload & Preview */}
          <div className="lg:col-span-2 space-y-6">
            {uploadSection && (
              <div className="bg-gray-900 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Upload className="w-5 h-5 text-red-500" />
                  <h2 className="text-lg font-medium">Upload</h2>
                </div>
                {uploadSection}
              </div>
            )}

            {previewSection && (
              <div className="bg-gray-900 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Play className="w-5 h-5 text-red-500" />
                    <h2 className="text-lg font-medium">Preview</h2>
                  </div>
                  {isProcessing && progress > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500 transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-400">{progress}%</span>
                    </div>
                  )}
                </div>
                {previewSection}
              </div>
            )}
          </div>

          {/* Right Panel - Settings */}
          <div>
            {settingsSection && (
              <div className="bg-gray-900 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-5 h-5 text-red-500" />
                  <h2 className="text-lg font-medium">Settings</h2>
                </div>
                {settingsSection}
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        {resultSection && (
          <div className="mt-8">
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Results</h2>
              {resultSection}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaPreviewLayout;