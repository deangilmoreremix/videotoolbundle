import React from 'react';
import PricingCard from '../components/pricing/PricingCard';

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for trying out our tools',
    features: [
      'Access to 5 basic tools',
      '720p video processing',
      'Standard processing speed',
      '5 projects per month',
      'Community support'
    ]
  },
  {
    name: 'Pro',
    price: '$29',
    description: 'For professionals and content creators',
    features: [
      'Access to all 30+ tools',
      '4K video processing',
      'Priority processing',
      'Unlimited projects',
      'Priority support',
      'API access',
      'No watermarks'
    ],
    popular: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For teams and organizations',
    features: [
      'Everything in Pro',
      'Custom tool development',
      '8K video processing',
      'Dedicated support',
      'SLA guarantee',
      'Custom integration',
      'Team management'
    ]
  }
];

const Pricing = () => {
  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Choose the perfect plan for your needs. All plans include updates and basic support.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <PricingCard key={plan.name} {...plan} />
        ))}
      </div>
    </div>
  );
};

export default Pricing;