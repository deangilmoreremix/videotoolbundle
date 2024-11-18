import React from 'react';
import { Link } from 'react-router-dom';

interface ToolCardProps {
  name: string;
  description: string;
  slug: string;
}

const ToolCard = ({ name, description, slug }: ToolCardProps) => {
  return (
    <Link
      to={`/tools/${slug}`}
      className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-red-500 transition-colors group"
    >
      <h3 className="text-lg font-semibold mb-2 group-hover:text-red-400">
        {name}
      </h3>
      <p className="text-gray-400">{description}</p>
    </Link>
  );
};

export default ToolCard;