import React from 'react';
import { Film, Zap, Waves, Clock } from 'lucide-react';

interface VideoStyleSelectProps {
  value: string;
  onChange: (style: string) => void;
}

const styles = [
  { id: 'cinematic', name: 'Cinematic', icon: Film, description: 'Professional movie-like style' },
  { id: 'dynamic', name: 'Dynamic', icon: Zap, description: 'Energetic and fast-paced' },
  { id: 'smooth', name: 'Smooth', icon: Waves, description: 'Fluid transitions and motion' },
  { id: 'timelapse', name: 'Timelapse', icon: Clock, description: 'Accelerated passage of time' }
];

const VideoStyleSelect: React.FC<VideoStyleSelectProps> = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {styles.map(({ id, name, icon: Icon, description }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`p-4 rounded-lg border-2 transition-colors ${
            value === id 
              ? 'border-red-500 bg-red-500/10' 
              : 'border-gray-700 hover:border-red-500'
          }`}
        >
          <Icon className="w-6 h-6 mb-2" />
          <div className="text-lg font-bold mb-1">{name}</div>
          <p className="text-sm text-gray-400">{description}</p>
        </button>
      ))}
    </div>
  );
};

export default VideoStyleSelect;