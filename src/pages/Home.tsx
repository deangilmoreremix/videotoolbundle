import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-6">
          Transform Your Videos with AI-Powered Tools
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          Access over 30 professional video and image editing tools powered by advanced AI technology.
        </p>
        <Link 
          to="/tools"
          className="inline-flex items-center px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Explore Tools
          <ArrowRight className="ml-2 w-5 h-5" />
        </Link>
      </div>
    </div>
  );
};

export default Home;