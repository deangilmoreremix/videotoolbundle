import React from 'react';
import { ArrowLeft, Upload, Settings, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface ToolInterfaceProps {
  title: string;
  description: string;
  previewPanel?: React.ReactNode;
  settingsPanel?: React.ReactNode;
  uploadPanel?: React.ReactNode;
  resultPanel?: React.ReactNode;
  isProcessing?: boolean;
  progress?: number;
  className?: string;
}

const ToolInterface: React.FC<ToolInterfaceProps> = ({
  title,
  description,
  previewPanel,
  settingsPanel,
  uploadPanel,
  resultPanel,
  isProcessing,
  progress = 0,
  className
}) => {
  return (
    <div className={cn("space-y-8", className)}>
      {/* Header */}
      <div className="space-y-4">
        <Link 
          to="/tools" 
          className="inline-flex items-center text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tools
        </Link>
        <h1 className="text-4xl font-bold text-white">{title}</h1>
        <p className="text-xl text-gray-400">{description}</p>
      </div>

      {/* Main Interface */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Panel - Upload & Preview */}
        <div className="col-span-2 space-y-6">
          {uploadPanel && (
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Upload className="w-5 h-5" />
                <h2 className="text-lg font-medium">Upload</h2>
              </div>
              {uploadPanel}
            </div>
          )}

          {previewPanel && (
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  <h2 className="text-lg font-medium">Preview</h2>
                </div>
                {isProcessing && (
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
              {previewPanel}
            </div>
          )}
        </div>

        {/* Right Panel - Settings */}
        <div className="space-y-6">
          {settingsPanel && (
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5" />
                <h2 className="text-lg font-medium">Settings</h2>
              </div>
              {settingsPanel}
            </div>
          )}
        </div>
      </div>

      {/* Results Panel */}
      {resultPanel && (
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Results</h2>
          {resultPanel}
        </div>
      )}
    </div>
  );
};

export default ToolInterface;