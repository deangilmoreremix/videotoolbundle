import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Video } from 'lucide-react';

function Navbar() {
  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Video className="w-8 h-8 text-red-500" />
            <span className="text-xl font-bold">VideoRemix</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <NavLink 
              to="/tools"
              className={({ isActive }) => 
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-red-500' : 'text-gray-300 hover:text-white'
                }`
              }
            >
              Tools
            </NavLink>
            <NavLink 
              to="/pricing"
              className={({ isActive }) => 
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-red-500' : 'text-gray-300 hover:text-white'
                }`
              }
            >
              Pricing
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;