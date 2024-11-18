import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';
import { Play, Pause, Settings, Layout, Palette } from 'lucide-react';

interface PlayerSettings {
  theme: 'default' | 'minimal' | 'custom';
  primaryColor: string;
  controls: {
    playPause: boolean;
    progress: boolean;
    volume: boolean;
    fullscreen: boolean;
    quality: boolean;
    speed: boolean;
  };
  autoplay: boolean;
  loop: boolean;
  responsive: boolean;
  preload: 'auto' | 'metadata' | 'none';
}

const VideoPlayer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [settings, setSettings] = useState<PlayerSettings>({
    theme: 'default',
    primaryColor: '#FF0000',
    controls: {
      playPause: true,
      progress: true,
      volume: true,
      fullscreen: true,
      quality: true,
      speed: true
    },
    autoplay: false,
    loop: false,
    responsive: true,
    preload: 'metadata'
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

      // Apply video player transformations
      const processedUrl = result.secure_url;
      setResultUrl(processedUrl);
      setProgress(100);
      setStatus('completed');

      addToast({
        title: 'Video player generated successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Player generation failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  const generateCode = () => {
    const code = `
<!-- Video Player -->
<div class="video-player${settings.theme !== 'default' ? ` theme-${settings.theme}` : ''}"${settings.responsive ? ' style="aspect-ratio: 16/9;"' : ''}>
  <video
    src="${resultUrl}"
    ${settings.autoplay ? 'autoplay' : ''}
    ${settings.loop ? 'loop' : ''}
    ${settings.controls.playPause ? 'controls' : ''}
    preload="${settings.preload}"
    class="video-element"
  ></video>
  
  <div class="video-controls">
    ${settings.controls.playPause ? `
    <button class="play-pause">
      <svg class="play" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z"/>
      </svg>
      <svg class="pause" viewBox="0 0 24 24">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
      </svg>
    </button>` : ''}
    
    ${settings.controls.progress ? `
    <div class="progress">
      <div class="progress-bar"></div>
      <div class="progress-handle"></div>
    </div>` : ''}
    
    <div class="controls-right">
      ${settings.controls.volume ? `
      <div class="volume-control">
        <button class="volume-button">
          <svg viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
          </svg>
        </button>
        <div class="volume-slider">
          <div class="volume-bar"></div>
          <div class="volume-handle"></div>
        </div>
      </div>` : ''}
      
      ${settings.controls.quality ? `
      <button class="quality-button">
        <svg viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 6h-4v2h4v2h-4v2h4v2H9V7h6v2z"/>
        </svg>
      </button>` : ''}
      
      ${settings.controls.speed ? `
      <button class="speed-button">
        <svg viewBox="0 0 24 24">
          <path d="M20.38 8.57l-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.27-10.44z"/>
        </svg>
      </button>` : ''}
      
      ${settings.controls.fullscreen ? `
      <button class="fullscreen-button">
        <svg class="enter" viewBox="0 0 24 24">
          <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
        </svg>
        <svg class="exit" viewBox="0 0 24 24">
          <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
        </svg>
      </button>` : ''}
    </div>
  </div>
</div>

<style>
:root {
  --player-primary: ${settings.primaryColor};
  --player-bg: rgba(0, 0, 0, 0.8);
}

.video-player {
  position: relative;
  background: #000;
  ${settings.responsive ? `
  width: 100%;
  height: 0;
  padding-bottom: 56.25%;` : ''}
  overflow: hidden;
}

.video-element {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.video-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: linear-gradient(transparent, var(--player-bg));
  display: flex;
  align-items: center;
  gap: 16px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.video-player:hover .video-controls {
  opacity: 1;
}

.video-controls button {
  background: none;
  border: none;
  padding: 8px;
  color: white;
  cursor: pointer;
  transition: color 0.2s ease;
}

.video-controls button:hover {
  color: var(--player-primary);
}

.video-controls svg {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.progress {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  cursor: pointer;
  position: relative;
}

.progress-bar {
  height: 100%;
  background: var(--player-primary);
  border-radius: 2px;
  transform-origin: left;
  transform: scaleX(0);
}

.progress-handle {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--player-primary);
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.progress:hover .progress-handle {
  opacity: 1;
}

.controls-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.volume-slider {
  width: 0;
  overflow: hidden;
  transition: width 0.3s ease;
}

.volume-control:hover .volume-slider {
  width: 100px;
}

.theme-minimal .video-controls {
  background: none;
  padding: 8px;
}

.theme-minimal .progress {
  height: 2px;
}

.theme-minimal .video-controls button {
  padding: 4px;
}

.theme-minimal .video-controls svg {
  width: 20px;
  height: 20px;
}
</style>

<script>
class VideoPlayer {
  constructor(element) {
    this.player = element;
    this.video = element.querySelector('video');
    this.controls = element.querySelector('.video-controls');
    this.progress = element.querySelector('.progress');
    this.progressBar = element.querySelector('.progress-bar');
    this.progressHandle = element.querySelector('.progress-handle');
    
    this.init();
  }
  
  init() {
    // Play/Pause
    this.video.addEventListener('click', () => this.togglePlay());
    this.video.addEventListener('play', () => this.updatePlayButton());
    this.video.addEventListener('pause', () => this.updatePlayButton());
    
    // Progress
    this.video.addEventListener('timeupdate', () => this.updateProgress());
    this.progress.addEventListener('click', (e) => this.scrub(e));
    
    // Volume
    const volumeSlider = this.player.querySelector('.volume-slider');
    if (volumeSlider) {
      volumeSlider.addEventListener('click', (e) => this.updateVolume(e));
    }
    
    // Fullscreen
    const fullscreenButton = this.player.querySelector('.fullscreen-button');
    if (fullscreenButton) {
      fullscreenButton.addEventListener('click', () => this.toggleFullscreen());
    }
  }
  
  togglePlay() {
    if (this.video.paused) {
      this.video.play();
    } else {
      this.video.pause();
    }
  }
  
  updatePlayButton() {
    const playButton = this.player.querySelector('.play-pause');
    if (playButton) {
      playButton.classList.toggle('playing', !this.video.paused);
    }
  }
  
  updateProgress() {
    const progress = (this.video.currentTime / this.video.duration) * 100;
    this.progressBar.style.transform = \`scaleX(\${progress / 100})\`;
    this.progressHandle.style.left = \`\${progress}%\`;
  }
  
  scrub(e) {
    const scrubTime = (e.offsetX / this.progress.offsetWidth) * this.video.duration;
    this.video.currentTime = scrubTime;
  }
  
  updateVolume(e) {
    const volume = e.offsetX / e.target.offsetWidth;
    this.video.volume = volume;
    this.player.querySelector('.volume-bar').style.transform = \`scaleX(\${volume})\`;
  }
  
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.player.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
}

// Initialize all video players
document.querySelectorAll('.video-player').forEach(player => {
  new VideoPlayer(player);
});
</script>`;

    return code;
  };

  return (
    <ToolLayout
      title="Video Player Studio"
      description="Create customizable video players with advanced features"
    >
      <div className="space-y-8">
        <FileUpload
          accept={{ 'video/*': ['.mp4', '.mov', '.avi', '.webm'] }}
          onUpload={handleUpload}
          maxSize={200 * 1024 * 1024} // 200MB limit
        />
        
        {file && status === 'idle' && (
          <div className="space-y-6">
            <div className="max-w-xl mx-auto space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Layout className="w-5 h-5" />
                  Player Theme
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {(['default', 'minimal', 'custom'] as const).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => setSettings(prev => ({ ...prev, theme }))}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        settings.theme === theme 
                          ? 'border-red-500 bg-red-500/10' 
                          : 'border-gray-700 hover:border-red-500'
                      }`}
                    >
                      <div className="text-lg font-bold mb-1 capitalize">{theme}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Controls
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(settings.controls).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          controls: {
                            ...prev.controls,
                            [key]: e.target.checked
                          }
                        }))}
                        className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                      />
                      <span className="text-sm capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Appearance
                </h3>
                {settings.theme === 'custom' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Primary Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={settings.primaryColor}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            primaryColor: e.target.value
                          }))}
                          className="h-10 w-20 bg-gray-800 rounded-lg border border-gray-700"
                        />
                        <input
                          type="text"
                          value={settings.primaryColor}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            primaryColor: e.target.value
                          }))}
                          className="flex-1 bg-gray-800 rounded-lg px-4 py-2 border border-gray-700"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.autoplay}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      autoplay: e.target.checked
                    }))}
                    className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                  />
                  <span className="text-sm">Enable autoplay</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.loop}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      loop: e.target.checked
                    }))}
                    className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                  />
                  <span className="text-sm">Enable loop</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.responsive}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      responsive: e.target.checked
                    }))}
                    className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                  />
                  <span className="text-sm">Make player responsive</span>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <Button onClick={handleGenerate}>Generate Player</Button>
            </div>
          </div>
        )}
        
        {status === 'processing' && (
          <ProcessingStatus 
            status="processing" 
            progress={progress}
            message="Generating video player..."
          />
        )}
        
        {status === 'completed' && resultUrl && (
          <div className="space-y-6">
            <div className="max-w-3xl mx-auto">
              <div className={`relative bg-black rounded-lg overflow-hidden ${
                settings.responsive ? 'aspect-video' : ''
              }`}>
                <video
                  src={resultUrl}
                  controls={settings.controls.playPause}
                  autoPlay={settings.autoplay}
                  loop={settings.loop}
                  preload={settings.preload}
                  className="w-full h-full"
                />
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
                  setResultUrl('');
                  setFile(null);
                }}
              >
                Create Another Player
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default VideoPlayer;