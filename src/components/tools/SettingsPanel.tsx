import React from 'react';
import { cn } from '../../lib/utils';

interface SettingsPanelProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  title,
  children,
  className
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {title && (
        <h3 className="text-lg font-medium">{title}</h3>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export const SettingItem: React.FC<{
  label: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ label, description, children, className }) => {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="block">
        <span className="text-sm font-medium">{label}</span>
        {description && (
          <span className="block text-sm text-gray-400">{description}</span>
        )}
      </label>
      {children}
    </div>
  );
};

export const SettingSlider: React.FC<{
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  suffix?: string;
  className?: string;
}> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  suffix = '',
  className
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-sm text-gray-400">{value}{suffix}</span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-red-500"
      />
    </div>
  );
};

export default SettingsPanel;