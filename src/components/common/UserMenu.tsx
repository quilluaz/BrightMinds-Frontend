import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const UserMenu: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        className="flex items-center focus:outline-none"
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-label="User menu"
      >
        {currentUser?.avatarUrl ? (
          <img 
            src={currentUser.avatarUrl} 
            alt={currentUser.name} 
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary-interactive flex items-center justify-center text-white">
            <User size={16} />
          </div>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10 animate-fade-in">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium">{currentUser?.name}</p>
            <p className="text-xs text-gray-500">{currentUser?.email}</p>
          </div>
          
          <Link 
            to="/profile" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            onClick={() => setIsOpen(false)}
          >
            <Settings size={16} className="mr-2" />
            My Profile
          </Link>
          
          <button 
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
            onClick={handleLogout}
          >
            <LogOut size={16} className="mr-2" />
            Log Out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;