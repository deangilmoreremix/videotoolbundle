import React from 'react';
import { X, ArrowUp, ArrowDown } from 'lucide-react';

interface MediaPreviewProps {
  files: File[];
  onRemove: (index: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

const MediaPreview: React.FC<MediaPreviewProps> = ({ files, onRemove, onReorder }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {files.map((file, index) => (
        <div 
          key={index}
          className="relative group border border-gray-800 rounded-lg overflow-hidden"
        >
          {file.type.startsWith('video/') ? (
            <video 
              src={URL.createObjectURL(file)}
              className="w-full h-32 object-cover"
            />
          ) : (
            <img 
              src={URL.createObjectURL(file)}
              alt={`Media ${index + 1}`}
              className="w-full h-32 object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={() => onReorder(index, index - 1)}
                disabled={index === 0}
                className="p-1 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => onReorder(index, index + 1)}
                disabled={index === files.length - 1}
                className="p-1 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => onRemove(index)}
                className="p-1 bg-gray-800 rounded hover:bg-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MediaPreview;