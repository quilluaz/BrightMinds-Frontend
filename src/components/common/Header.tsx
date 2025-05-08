import React from 'react';
import { BookOpenCheck, Menu, X, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import UserMenu from './UserMenu';

const Header: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  // Get time-based greeting
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white dark:bg-primary-card-dark shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <BookOpenCheck size={28} className="text-primary-interactive dark:text-primary-interactive-dark" />
          <span className="font-bold text-xl text-primary-text dark:text-primary-text-dark">BrightMinds</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className="text-primary-text dark:text-primary-text-dark hover:text-primary-interactive dark:hover:text-primary-interactive-dark transition-colors">
                Dashboard
              </Link>
              {currentUser?.role === 'teacher' && (
                <Link to="/teacher/classrooms" className="text-primary-text dark:text-primary-text-dark hover:text-primary-interactive dark:hover:text-primary-interactive-dark transition-colors">
                  My Classrooms
                </Link>
              )}
              {currentUser?.role === 'student' && (
                <Link to="/student/classrooms" className="text-primary-text dark:text-primary-text-dark hover:text-primary-interactive dark:hover:text-primary-interactive-dark transition-colors">
                  My Classrooms
                </Link>
              )}
            </>
          )}
          
          {!isAuthenticated && (
            <>
              <Link to="/login" className="text-primary-text dark:text-primary-text-dark hover:text-primary-interactive dark:hover:text-primary-interactive-dark transition-colors">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary dark:bg-primary-interactive-dark dark:text-white">
                Register
              </Link>
            </>
          )}
          
          {isAuthenticated && (
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-primary-text dark:text-primary-text-dark">
                {getGreeting()}, {currentUser?.name}!
              </span>
              <UserMenu />
            </div>
          )}
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun size={20} className="text-primary-text-dark" />
            ) : (
              <Moon size={20} className="text-primary-text" />
            )}
          </button>
        </nav>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun size={20} className="text-primary-text-dark" />
            ) : (
              <Moon size={20} className="text-primary-text" />
            )}
          </button>
          <button 
            className="text-primary-text dark:text-primary-text-dark focus:outline-none"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-primary-card-dark shadow-md py-4 px-6 animate-fade-in">
          <nav className="flex flex-col space-y-4">
            {isAuthenticated && (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-primary-text dark:text-primary-text-dark hover:text-primary-interactive dark:hover:text-primary-interactive-dark transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {currentUser?.role === 'teacher' && (
                  <Link 
                    to="/teacher/classrooms" 
                    className="text-primary-text dark:text-primary-text-dark hover:text-primary-interactive dark:hover:text-primary-interactive-dark transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Classrooms
                  </Link>
                )}
                {currentUser?.role === 'student' && (
                  <Link 
                    to="/student/classrooms" 
                    className="text-primary-text dark:text-primary-text-dark hover:text-primary-interactive dark:hover:text-primary-interactive-dark transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Classrooms
                  </Link>
                )}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span className="block text-sm font-medium mb-2 text-primary-text dark:text-primary-text-dark">
                    {getGreeting()}, {currentUser?.name}!
                  </span>
                  <div className="flex flex-col space-y-2">
                    <Link 
                      to="/profile" 
                      className="text-primary-text dark:text-primary-text-dark hover:text-primary-interactive dark:hover:text-primary-interactive-dark transition-colors py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link 
                      to="/logout" 
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Log Out
                    </Link>
                  </div>
                </div>
              </>
            )}
            
            {!isAuthenticated && (
              <>
                <Link 
                  to="/login" 
                  className="text-primary-text dark:text-primary-text-dark hover:text-primary-interactive dark:hover:text-primary-interactive-dark transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link 
                  to="/register" 
                  className="btn btn-primary dark:bg-primary-interactive-dark dark:text-white inline-block text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;