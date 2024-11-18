import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast';
import { Upload, Settings, Code } from 'lucide-react';

interface WidgetSettings {
  maxFileSize: number;
  allowedTypes: string[];
  multipleFiles: boolean;
  showPreview: boolean;
  autoUpload: boolean;
  customStyles: boolean;
}

const UploadWidget = () => {
  const [settings, setSettings] = useState<WidgetSettings>({
    maxFileSize: 10,
    allowedTypes: ['image/*', 'video/*', 'application/pdf'],
    multipleFiles: true,
    showPreview: true,
    autoUpload: true,
    customStyles: false
  });
  const { addToast } = useToast();

  const generateCode = () => {
    const code = `
<!-- Upload Widget -->
<div class="upload-widget" id="uploadWidget">
  <div class="upload-area">
    <input 
      type="file" 
      ${settings.multipleFiles ? 'multiple' : ''} 
      accept="${settings.allowedTypes.join(',')}"
      ${settings.autoUpload ? 'data-auto-upload="true"' : ''}
      max-size="${settings.maxFileSize * 1024 * 1024}"
    />
    <div class="upload-content">
      <svg class="upload-icon" viewBox="0 0 24 24">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5l5-5l5 5m-5-5v12"/>
      </svg>
      <p class="upload-text">
        Drag & drop files here<br>
        <span>or click to browse</span>
      </p>
    </div>
  </div>
  ${settings.showPreview ? `
  <div class="upload-preview">
    <h3>Selected Files</h3>
    <div class="preview-list"></div>
  </div>` : ''}
</div>

<style>
.upload-widget {
  font-family: system-ui, -apple-system, sans-serif;
  max-width: 600px;
  margin: 0 auto;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
}

.upload-area:hover {
  border-color: #666;
}

.upload-area input[type="file"] {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.upload-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
}

.upload-text {
  margin: 0;
  font-size: 1.125rem;
}

.upload-text span {
  color: #666;
  font-size: 0.875rem;
}

.upload-preview {
  margin-top: 2rem;
}

.preview-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.preview-item {
  position: relative;
  border-radius: 4px;
  overflow: hidden;
}

.preview-item img {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.preview-item .remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
}
</style>

<script>
class UploadWidget {
  constructor(element) {
    this.widget = element;
    this.input = element.querySelector('input[type="file"]');
    this.previewList = element.querySelector('.preview-list');
    this.files = new Set();
    
    this.init();
  }
  
  init() {
    this.input.addEventListener('change', e => this.handleFiles(e.target.files));
    this.widget.addEventListener('dragover', e => {
      e.preventDefault();
      this.widget.querySelector('.upload-area').classList.add('dragover');
    });
    this.widget.addEventListener('dragleave', () => {
      this.widget.querySelector('.upload-area').classList.remove('dragover');
    });
    this.widget.addEventListener('drop', e => {
      e.preventDefault();
      this.widget.querySelector('.upload-area').classList.remove('dragover');
      this.handleFiles(e.dataTransfer.files);
    });
  }
  
  handleFiles(fileList) {
    Array.from(fileList).forEach(file => {
      if (file.size > this.input.getAttribute('max-size')) {
        alert('File too large');
        return;
      }
      
      this.files.add(file);
      if (this.previewList) {
        this.addPreview(file);
      }
      
      if (this.input.dataset.autoUpload) {
        this.uploadFile(file);
      }
    });
  }
  
  addPreview(file) {
    const reader = new FileReader();
    const item = document.createElement('div');
    item.className = 'preview-item';
    
    reader.onload = e => {
      if (file.type.startsWith('image/')) {
        item.innerHTML = \`
          <img src="\${e.target.result}" alt="\${file.name}" />
          <div class="remove">&times;</div>
        \`;
      } else {
        item.innerHTML = \`
          <div class="file-icon">\${file.name}</div>
          <div class="remove">&times;</div>
        \`;
      }
      
      item.querySelector('.remove').onclick = () => {
        this.files.delete(file);
        item.remove();
      };
    };
    
    reader.readAsDataURL(file);
    this.previewList.appendChild(item);
  }
  
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const result = await response.json();
      console.log('Upload success:', result);
    } catch (error) {
      console.error('Upload error:', error);
    }
  }
}

// Initialize widget
new UploadWidget(document.getElementById('uploadWidget'));
</script>`;

    return code;
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generateCode());
    addToast({
      title: 'Code copied to clipboard',
      type: 'success'
    });
  };

  return (
    <ToolLayout
      title="Upload Widget"
      description="Create customizable file upload widgets for your applications"
    >
      <div className="space-y-8">
        <div className="max-w-xl mx-auto space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Widget Settings
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Max File Size (MB): {settings.maxFileSize}
                </label>
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={settings.maxFileSize}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    maxFileSize: Number(e.target.value)
                  }))}
                  className="w-full accent-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Allowed File Types</label>
                <div className="space-y-2">
                  {['image/*', 'video/*', 'application/pdf'].map(type => (
                    <label key={type} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.allowedTypes.includes(type)}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          allowedTypes: e.target.checked
                            ? [...prev.allowedTypes, type]
                            : prev.allowedTypes.filter(t => t !== type)
                        }))}
                        className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                      />
                      <span className="text-sm">
                        {type === 'image/*' && 'Images'}
                        {type === 'video/*' && 'Videos'}
                        {type === 'application/pdf' && 'PDF Documents'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.multipleFiles}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      multipleFiles: e.target.checked
                    }))}
                    className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                  />
                  <span className="text-sm">Allow multiple files</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.showPreview}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      showPreview: e.target.checked
                    }))}
                    className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                  />
                  <span className="text-sm">Show file previews</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.autoUpload}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      autoUpload: e.target.checked
                    }))}
                    className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                  />
                  <span className="text-sm">Auto-upload files</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.customStyles}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      customStyles: e.target.checked
                    }))}
                    className="rounded border-gray-700 text-red-500 focus:ring-red-500"
                  />
                  <span className="text-sm">Use custom styles</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Preview
            </h3>
            
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-red-500 transition-colors">
              <input
                type="file"
                className="hidden"
                multiple={settings.multipleFiles}
                accept={settings.allowedTypes.join(',')}
              />
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">
                Drag & drop files here
                <br />
                <span className="text-sm text-gray-400">or click to browse</span>
              </p>
              <p className="mt-2 text-sm text-gray-400">
                Maximum file size: {settings.maxFileSize}MB
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Code className="w-5 h-5" />
              Implementation Code
            </h3>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-400">Copy and paste this code into your project</p>
                <Button size="sm" onClick={copyCode}>
                  Copy Code
                </Button>
              </div>
              <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{generateCode()}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default UploadWidget;