import React from 'react';
import { LucideIcon } from 'lucide-react';
import ToolCard from './ToolCard';

interface Tool {
  name: string;
  description: string;
  slug: string;
}

interface ToolCategoryProps {
  title: string;
  icon: LucideIcon;
  tools: Tool[];
}

const ToolCategory = ({ title, icon: Icon, tools }: ToolCategoryProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Icon className="w-6 h-6 text-red-500" />
        <h2 className="text-2xl font-semibold">{title}</h2>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <ToolCard key={tool.slug} {...tool} />
        ))}
      </div>
    </div>
  );
};

export default ToolCategory;