import React from 'react';
import { Link } from 'react-router-dom';
import {
  Video, FileVideo, Wand2, RotateCw, FastForward, Scissors, Layers,
  Image, Palette, Box, Crop, Zap, Sparkles, Film, Music, Cog,
  Upload, Download, Play, Eye, Camera, Maximize, MinusCircle,
  Type, Layout, Monitor, Tv, Sliders, Repeat, Split,
  ImagePlus, VideoIcon, PlayCircle, Settings
} from 'lucide-react';

const tools = [
  {
    category: "Video Tools",
    icon: <Video className="w-6 h-6 text-red-500" />,
    tools: [
      { 
        name: "Video to GIF", 
        path: "/tools/video-to-gif", 
        description: "Convert videos to high-quality GIFs",
        icon: <FileVideo className="w-5 h-5" />
      },
      { 
        name: "GIF Converter", 
        path: "/tools/gif-converter", 
        description: "Convert and optimize GIF files",
        icon: <Wand2 className="w-5 h-5" />
      },
      { 
        name: "Video Compressor", 
        path: "/tools/video-compressor", 
        description: "Compress videos while maintaining quality",
        icon: <FileVideo className="w-5 h-5" />
      },
      { 
        name: "Reverse Video", 
        path: "/tools/reverse-video", 
        description: "Create reverse playback videos",
        icon: <RotateCw className="w-5 h-5" />
      },
      { 
        name: "Speed Video", 
        path: "/tools/speed-video", 
        description: "Adjust video playback speed",
        icon: <FastForward className="w-5 h-5" />
      },
      { 
        name: "Video Trim", 
        path: "/tools/video-trim", 
        description: "Cut and trim your videos",
        icon: <Scissors className="w-5 h-5" />
      },
      { 
        name: "Video Merge", 
        path: "/tools/video-merge", 
        description: "Combine multiple videos",
        icon: <Layers className="w-5 h-5" />
      },
      {
        name: "Video Player Studio",
        path: "/tools/video-player",
        description: "Create custom video players",
        icon: <Play className="w-5 h-5" />
      },
      {
        name: "Scene Detection",
        path: "/tools/scene-detection",
        description: "Detect and extract video scenes",
        icon: <Split className="w-5 h-5" />
      },
      {
        name: "Video Smart Crop",
        path: "/tools/video-smart-crop",
        description: "Intelligent video cropping",
        icon: <Crop className="w-5 h-5" />
      },
      {
        name: "Video Overlays",
        path: "/tools/video-overlays",
        description: "Add overlays and watermarks",
        icon: <Layers className="w-5 h-5" />
      },
      {
        name: "Dynamic Transcoding",
        path: "/tools/dynamic-transcoding",
        description: "Convert videos for different platforms",
        icon: <Monitor className="w-5 h-5" />
      },
      {
        name: "Auto Thumbnailing",
        path: "/tools/auto-thumbnailing",
        description: "Generate video thumbnails",
        icon: <Image className="w-5 h-5" />
      },
      {
        name: "Video Transforms",
        path: "/tools/video-transforms",
        description: "Apply visual transformations",
        icon: <Settings className="w-5 h-5" />
      },
      {
        name: "Remove Video Background",
        path: "/tools/remove-video-bg",
        description: "Remove video backgrounds",
        icon: <MinusCircle className="w-5 h-5" />
      },
      {
        name: "Image to Video",
        path: "/tools/image-to-video",
        description: "Convert images to video",
        icon: <ImagePlus className="w-5 h-5" />
      },
      {
        name: "Video Generation",
        path: "/tools/video-generation",
        description: "Generate videos from scratch",
        icon: <VideoIcon className="w-5 h-5" />
      },
      {
        name: "Auto Previews",
        path: "/tools/auto-previews",
        description: "Generate automatic video previews",
        icon: <PlayCircle className="w-5 h-5" />
      }
    ]
  },
  {
    category: "Image Tools",
    icon: <Image className="w-6 h-6 text-red-500" />,
    tools: [
      {
        name: "Background Removal",
        path: "/tools/background-removal",
        description: "Remove image backgrounds automatically",
        icon: <MinusCircle className="w-5 h-5" />
      },
      {
        name: "Smart Crop",
        path: "/tools/smart-crop",
        description: "Intelligent content-aware cropping",
        icon: <Crop className="w-5 h-5" />
      },
      {
        name: "Color Enhancement",
        path: "/tools/color-enhancement",
        description: "Enhance and adjust image colors",
        icon: <Palette className="w-5 h-5" />
      },
      {
        name: "Image Upscaler",
        path: "/tools/image-upscaler",
        description: "Upscale images using AI",
        icon: <Maximize className="w-5 h-5" />
      },
      {
        name: "Image Restore",
        path: "/tools/image-restore",
        description: "Restore old or damaged photos",
        icon: <Wand2 className="w-5 h-5" />
      },
      {
        name: "Round Corners",
        path: "/tools/round-corners",
        description: "Add rounded corners to images",
        icon: <Box className="w-5 h-5" />
      }
    ]
  },
  {
    category: "AI Enhancement",
    icon: <Sparkles className="w-6 h-6 text-red-500" />,
    tools: [
      {
        name: "AI Transcription",
        path: "/tools/ai-transcription",
        description: "Convert speech to text with AI",
        icon: <Type className="w-5 h-5" />
      },
      {
        name: "Video Noise Reduction",
        path: "/tools/video-noise-reduction",
        description: "Remove video noise using AI",
        icon: <Wand2 className="w-5 h-5" />
      },
      {
        name: "Video Stabilization",
        path: "/tools/video-stabilization",
        description: "Stabilize shaky video footage",
        icon: <Camera className="w-5 h-5" />
      },
      {
        name: "Content-Aware Encoding",
        path: "/tools/content-aware-encoding",
        description: "Smart video compression",
        icon: <Cog className="w-5 h-5" />
      }
    ]
  }
];

function Tools() {
  return (
    <div className="space-y-12">
      {tools.map((category) => (
        <div key={category.category} className="space-y-6">
          <div className="flex items-center gap-2">
            {category.icon}
            <h2 className="text-2xl font-bold">{category.category}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {category.tools.map((tool) => (
              <Link
                key={tool.path}
                to={tool.path}
                className="block p-6 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors border border-gray-800 hover:border-red-500 group"
              >
                <div className="flex items-center gap-2 mb-2">
                  {tool.icon}
                  <h3 className="text-lg font-semibold group-hover:text-red-500">
                    {tool.name}
                  </h3>
                </div>
                <p className="text-gray-400 text-sm">{tool.description}</p>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Tools;