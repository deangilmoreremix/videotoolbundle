import React from 'react';
import { Minimize2, MoveRight, ZoomIn } from 'lucide-react';

interface TransitionSelectProps {
  value: string;
  onChange: (transition: string) => void;
}

const transitions = [
  { id: 'fade', name: 'Fade', icon: Minimize2, description: 'Smooth opacity transition' },
  { id: 'slide', name: 'Slide', icon: MoveRight, description: 'Sliding motion effect' },
  { id: 'zoom', name: 'Zoom', icon: ZoomIn, description: 'Zoom in/out transition' }
];

const TransitionSelect: React.FC<TransitionSelectProps> = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {transitions.map(({ id, name, icon: Icon, description }) => (
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

export default TransitionSelect;