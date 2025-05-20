import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext'; 
import logoForLightTheme from '../../assets/logos/LogoIconSideDark.svg';
import logoForDarkTheme from '../../assets/logos/LogoIconSideLight.svg';

const Footer: React.FC = () => {
  const { theme } = useTheme(); 
  const currentLogo = theme === 'light' ? logoForLightTheme : logoForDarkTheme;

  return (
    <footer className="bg-primary-card dark:bg-primary-card-dark shadow-inner mt-auto">
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo and Brand Section */}
          <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
            <div className="flex items-center space-x-2">
              <img 
                src={currentLogo} 
                alt="BrightMinds Logo" 
                className="h-7 w-auto"
              />
            </div>
          </div>
          
          {/* Navigation Links Section */}
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6 items-center mt-4 md:mt-0">
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
        
        {/* Copyright and Credits Section */}
        <div className="mt-6 pt-4 border-t border-gray-300 dark:border-gray-600 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center md:text-left mb-2 md:mb-0">
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