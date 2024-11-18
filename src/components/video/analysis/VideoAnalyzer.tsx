import React, { useState } from 'react';
import { AlertTriangle, Eye, Type, Tag } from 'lucide-react';
import { Button } from '../../ui/Button';
import { cn } from '../../../lib/utils';
import { uploadToCloudinary } from '../../../lib/cloudinary';

interface VideoAnalysisResult {
  content: {
    nsfw: boolean;
    violence: boolean;
    brands: string[];
    celebrities: string[];
  };
  scenes: {
    timestamp: number;
    description: string;
    confidence: number;
    tags: string[];
  }[];
  captions: {
    text: string;
    timestamp: number;
    duration: number;
  }[];
}

interface VideoAnalyzerProps {
  file: File;
  onAnalysisComplete?: (result: VideoAnalysisResult) => void;
  className?: string;
}

const VideoAnalyzer: React.FC<VideoAnalyzerProps> = ({
  file,
  onAnalysisComplete,
  className
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<VideoAnalysisResult | null>(null);

  const analyze = async () => {
    try {
      setAnalyzing(true);
      setProgress(10);

      // Upload video to Cloudinary with analysis transformations
      const uploadResult = await uploadToCloudinary(file, {
        resource_type: 'video',
        eager: [
          { streaming_profile: 'hd', format: 'mp4' },
          { raw_transformation: 'w_500,h_500,c_pad,e_adv_face,e_adv_eyes' }
        ],
        eager_async: true,
        eager_notification_url: 'your-notification-url',
        moderation: 'aws_rek',
        categorization: 'aws_rek_tagging'
      });

      setProgress(50);

      // Simulate AI analysis results
      const analysisResult: VideoAnalysisResult = {
        content: {
          nsfw: false,
          violence: false,
          brands: ['Nike', 'Apple'],
          celebrities: ['John Doe', 'Jane Smith']
        },
        scenes: [
          {
            timestamp: 0,
            description: 'Opening scene with landscape view',
            confidence: 0.95,
            tags: ['outdoor', 'nature', 'sunny']
          },
          {
            timestamp: 15,
            description: 'People walking in the street',
            confidence: 0.88,
            tags: ['urban', 'people', 'walking']
          }
        ],
        captions: [
          {
            text: 'Welcome to our presentation',
            timestamp: 0,
            duration: 3
          },
          {
            text: 'Let\'s explore the features',
            timestamp: 3,
            duration: 4
          }
        ]
      };

      setProgress(100);
      setResult(analysisResult);
      onAnalysisComplete?.(analysisResult);

    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Video Analysis</h3>
        <Button
          onClick={analyze}
          disabled={analyzing}
        >
          {analyzing ? 'Analyzing...' : 'Analyze Video'}
        </Button>
      </div>

      {analyzing && (
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-5 h-5 animate-pulse" />
            <span>Analyzing video content...</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Content Warnings */}
          {(result.content.nsfw || result.content.violence) && (
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Content Warning</span>
              </div>
              <ul className="mt-2 space-y-1">
                {result.content.nsfw && (
                  <li>This video may contain inappropriate content</li>
                )}
                {result.content.violence && (
                  <li>This video may contain violent content</li>
                )}
              </ul>
            </div>
          )}

          {/* Scene Analysis */}
          <div className="border border-gray-800 rounded-lg overflow-hidden">
            <div className="bg-gray-800 p-3">
              <h4 className="font-medium">Scene Analysis</h4>
            </div>
            <div className="divide-y divide-gray-800">
              {result.scenes.map((scene, index) => (
                <div key={index} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">
                      {new Date(scene.timestamp * 1000).toISOString().substr(14, 5)}
                    </span>
                    <span className="text-sm text-gray-400">
                      {Math.round(scene.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p className="mb-2">{scene.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {scene.tags.map((tag, i) => (
                      <span 
                        key={i}
                        className="px-2 py-1 bg-gray-800 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Captions */}
          <div className="border border-gray-800 rounded-lg overflow-hidden">
            <div className="bg-gray-800 p-3">
              <h4 className="font-medium">Generated Captions</h4>
            </div>
            <div className="divide-y divide-gray-800">
              {result.captions.map((caption, index) => (
                <div key={index} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Type className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">
                      {new Date(caption.timestamp * 1000).toISOString().substr(14, 5)} - 
                      {new Date((caption.timestamp + caption.duration) * 1000).toISOString().substr(14, 5)}
                    </span>
                  </div>
                  <p>{caption.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Detected Entities */}
          <div className="grid grid-cols-2 gap-4">
            {/* Brands */}
            <div className="border border-gray-800 rounded-lg overflow-hidden">
              <div className="bg-gray-800 p-3">
                <h4 className="font-medium">Detected Brands</h4>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {result.content.brands.map((brand, index) => (
                    <span 
                      key={index}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-800 rounded-full text-sm"
                    >
                      <Tag className="w-3 h-3" />
                      {brand}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Celebrities */}
            <div className="border border-gray-800 rounded-lg overflow-hidden">
              <div className="bg-gray-800 p-3">
                <h4 className="font-medium">Detected Celebrities</h4>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {result.content.celebrities.map((celebrity, index) => (
                    <span 
                      key={index}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-800 rounded-full text-sm"
                    >
                      <Tag className="w-3 h-3" />
                      {celebrity}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoAnalyzer;