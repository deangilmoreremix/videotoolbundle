import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '../ui/Button';

interface PricingCardProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
}

const PricingCard = ({ name, price, description, features, popular }: PricingCardProps) => {
  return (
    <div
      className={`bg-gray-900 rounded-xl p-8 border ${
        popular ? 'border-red-500' : 'border-gray-800'
      } relative`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">{name}</h2>
        <div className="text-4xl font-bold mb-2">{price}</div>
        <p className="text-gray-400">{description}</p>
      </div>

      <ul className="space-y-4 mb-8">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2">
            <Check className="w-5 h-5 text-red-500" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        variant={popular ? 'default' : 'outline'}
        className="w-full"
      >
        Get Started
      </Button>
    </div>
  );
};

export default PricingCard;