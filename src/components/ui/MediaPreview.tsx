import React from 'react';
import { File, Image, Video, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

interface MediaPreviewProps {
  file: File;
  onRemove?: () => void;
  className?: string;
  showControls?: boolean;
  actions?: React.ReactNode;
}

const MediaPreview: React.FC<MediaPreviewProps> = ({
  file,
  onRemove,
  className,
  showControls = true,
  actions
}) => {
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  const previewUrl = URL.createObjectURL(file);

  React.useEffect(() => {
    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className={cn(
      'relative group border border-gray-800 rounded-lg overflow-hidden bg-gray-900',
      className
    )}>
      <div className="aspect-video relative">
        {isImage && (
          <img
            src={previewUrl}
            alt={file.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {isVideo && (
          <video
            src={previewUrl}
            className="absolute inset-0 w-full h-full object-cover"
            controls={showControls}
          />
        )}
        {!isImage && !isVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <File className="w-12 h-12 text-gray-600" />
          </div>
        )}

        {actions && (
          <div className="absolute top-2 right-2 flex gap-2">
            {actions}
          </div>
        )}
      </div>

      <div className="p-3 bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            {isImage && <Image className="w-4 h-4 text-gray-400" />}
            {isVideo && <Video className="w-4 h-4 text-gray-400" />}
            {!isImage && !isVideo && <File className="w-4 h-4 text-gray-400" />}
            <span className="text-sm truncate">{file.name}</span>
          </div>
          {onRemove && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRemove}
              className="p-1 hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {(file.size / (1024 * 1024)).toFixed(2)} MB
        </div>
      </div>
    </div>
  );
};

export default MediaPreview;