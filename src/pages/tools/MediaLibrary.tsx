import React, { useState } from 'react';
import ToolLayout from '../../components/tools/ToolLayout';
import FileUpload from '../../components/tools/FileUpload';
import ProcessingStatus from '../../components/tools/ProcessingStatus';
import { Button } from '../../components/ui/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../hooks/useToast';
import { Grid, List, Folder, Image, Video, File, Search, Filter } from 'lucide-react';

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video' | 'document';
  name: string;
  size: number;
  created: Date;
  tags: string[];
}

interface FolderItem {
  id: string;
  name: string;
  itemCount: number;
}

const MediaLibrary = () => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([
    { id: 'images', name: 'Images', itemCount: 0 },
    { id: 'videos', name: 'Videos', itemCount: 0 },
    { id: 'documents', name: 'Documents', itemCount: 0 }
  ]);
  const { addToast } = useToast();

  const handleUpload = async (file: File) => {
    try {
      setStatus('uploading');
      setProgress(20);

      const result = await uploadToCloudinary(file);
      setProgress(60);

      const newItem: MediaItem = {
        id: result.public_id,
        url: result.secure_url,
        type: file.type.startsWith('image/') ? 'image' : 
              file.type.startsWith('video/') ? 'video' : 'document',
        name: file.name,
        size: file.size,
        created: new Date(),
        tags: []
      };

      setMediaItems(prev => [...prev, newItem]);
      setProgress(100);
      setStatus('idle');

      addToast({
        title: 'File uploaded successfully',
        type: 'success'
      });
    } catch (error) {
      setStatus('error');
      addToast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error'
      });
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const filteredItems = mediaItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFolder = !selectedFolder || 
                         (selectedFolder === 'images' && item.type === 'image') ||
                         (selectedFolder === 'videos' && item.type === 'video') ||
                         (selectedFolder === 'documents' && item.type === 'document');
    return matchesSearch && matchesFolder;
  });

  return (
    <ToolLayout
      title="Media Library"
      description="Organize and manage your media assets"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded-lg transition-colors ${
                view === 'grid' ? 'bg-red-500' : 'hover:bg-gray-800'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-lg transition-colors ${
                view === 'list' ? 'bg-red-500' : 'hover:bg-gray-800'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search media..."
                className="pl-10 pr-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
            </div>
            <Button>
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <div className="col-span-1 space-y-4">
            <FileUpload
              accept={{
                'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
                'video/*': ['.mp4', '.mov', '.avi'],
                'application/pdf': ['.pdf']
              }}
              onUpload={handleUpload}
              maxSize={100 * 1024 * 1024} // 100MB limit
            />

            <div className="space-y-2">
              <h3 className="font-medium">Folders</h3>
              {folders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id === selectedFolder ? null : folder.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    folder.id === selectedFolder 
                      ? 'bg-red-500' 
                      : 'hover:bg-gray-800'
                  }`}
                >
                  <Folder className="w-5 h-5" />
                  <span>{folder.name}</span>
                  <span className="ml-auto text-sm text-gray-400">
                    {mediaItems.filter(item => 
                      (folder.id === 'images' && item.type === 'image') ||
                      (folder.id === 'videos' && item.type === 'video') ||
                      (folder.id === 'documents' && item.type === 'document')
                    ).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-3">
            {status === 'uploading' && (
              <ProcessingStatus 
                status="processing"
                progress={progress}
                message="Uploading file..."
              />
            )}

            {filteredItems.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No media items found
              </div>
            ) : view === 'grid' ? (
              <div className="grid grid-cols-3 gap-4">
                {filteredItems.map(item => (
                  <div key={item.id} className="border border-gray-800 rounded-lg overflow-hidden">
                    <div className="aspect-video bg-gray-900 flex items-center justify-center">
                      {item.type === 'image' && (
                        <img 
                          src={item.url} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {item.type === 'video' && (
                        <video 
                          src={item.url}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {item.type === 'document' && (
                        <File className="w-12 h-12 text-gray-600" />
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-sm text-gray-400">{formatBytes(item.size)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-gray-800 rounded-lg divide-y divide-gray-800">
                <div className="grid grid-cols-12 gap-4 p-3 font-medium text-sm text-gray-400">
                  <div className="col-span-5">Name</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-2">Size</div>
                  <div className="col-span-3">Created</div>
                </div>
                {filteredItems.map(item => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 p-3">
                    <div className="col-span-5 flex items-center gap-3">
                      {item.type === 'image' && <Image className="w-5 h-5" />}
                      {item.type === 'video' && <Video className="w-5 h-5" />}
                      {item.type === 'document' && <File className="w-5 h-5" />}
                      <span className="truncate">{item.name}</span>
                    </div>
                    <div className="col-span-2 capitalize">{item.type}</div>
                    <div className="col-span-2">{formatBytes(item.size)}</div>
                    <div className="col-span-3">{formatDate(item.created)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default MediaLibrary;