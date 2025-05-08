import React from 'react';
import { Heart, Mail, BookOpenCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white shadow-inner mt-auto">
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center space-x-2">
              <BookOpenCheck size={20} className="text-primary-interactive" />
              <span className="font-bold text-primary-text">BrightMinds</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Making learning Tagalog and Araling Panlipunan fun for Grade 3 students
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6 items-center">
            <Link to="/about" className="text-sm text-primary-text hover:text-primary-interactive transition-colors">
              About Us
            </Link>
            <Link to="/contact" className="text-sm text-primary-text hover:text-primary-interactive transition-colors">
              Contact
            </Link>
            <Link to="/privacy" className="text-sm text-primary-text hover:text-primary-interactive transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} BrightMinds. All rights reserved.
          </p>
          
          <div className="flex items-center mt-2 md:mt-0 space-x-2">
            <a href="mailto:contact@brightminds.com" className="text-primary-interactive hover:text-primary-text transition-colors">
              <Mail size={18} />
            </a>
            <span className="text-sm text-gray-600 flex items-center">
              Made with <Heart size={14} className="text-red-500 mx-1" /> in the Philippines
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;