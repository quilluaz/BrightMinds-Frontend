import React from 'react';
import { Heart, Mail, BookOpenCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary-card dark:bg-primary-card-dark shadow-inner mt-auto">
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center space-x-2">
              <BookOpenCheck size={20} className="text-primary-interactive dark:text-primary-interactive-dark" />
              <span className="font-bold text-primary-text dark:text-primary-text-dark">BrightMinds</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Making learning Tagalog and Araling Panlipunan fun for Grade 3 students
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6 items-center">
            <Link 
              to="/about" 
              className="text-sm text-primary-text hover:text-primary-interactive dark:text-primary-text-dark dark:hover:text-primary-interactive-dark transition-colors"
            >
              About Us
            </Link>
            <Link 
              to="/contact" 
              className="text-sm text-primary-text hover:text-primary-interactive dark:text-primary-text-dark dark:hover:text-primary-interactive-dark transition-colors"
            >
              Contact
            </Link>
            <Link 
              to="/privacy" 
              className="text-sm text-primary-text hover:text-primary-interactive dark:text-primary-text-dark dark:hover:text-primary-interactive-dark transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-300 dark:border-gray-600 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            &copy; {new Date().getFullYear()} BrightMinds. All rights reserved.
          </p>
          
          <div className="flex items-center mt-2 md:mt-0 space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
              CIT-U Group J.I.S.A.Z. 
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;