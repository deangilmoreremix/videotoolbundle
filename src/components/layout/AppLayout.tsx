import React from 'react';
import { Link } from 'react-router-dom';
import { Video } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, className }) => {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <Video className="w-8 h-8 text-red-500" />
              <span className="text-xl font-bold text-white">VideoRemix</span>
            </Link>
            
            <nav className="flex items-center gap-6">
              <Link 
                to="/tools"
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Tools
              </Link>
              <Link 
                to="/pricing"
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Pricing
              </Link>
              <Link 
                to="/docs"
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Documentation
              </Link>
              <a 
                href="https://github.com/your-repo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                GitHub
              </a>
            </nav>

            <div className="flex items-center gap-4">
              <button className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Sign In
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors">
                Sign Up Free
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={cn("container mx-auto px-4 py-8", className)}>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/features" className="text-gray-400 hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="text-gray-400 hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/tools" className="text-gray-400 hover:text-white">
                    Tools
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/docs" className="text-gray-400 hover:text-white">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link to="/api" className="text-gray-400 hover:text-white">
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="text-gray-400 hover:text-white">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-400 hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/careers" className="text-gray-400 hover:text-white">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/privacy" className="text-gray-400 hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-gray-400 hover:text-white">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>© {new Date().getFullYear()} VideoRemix. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;