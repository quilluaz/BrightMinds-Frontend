import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import { User, Mail, Check } from 'lucide-react'; // Assuming lucide-react icons adapt to text color or have dark variants if needed

const AVATAR_OPTIONS = [
  { seed: 'robot1', label: 'Profile 1' },
  { seed: 'robot2', label: 'Profile 2' },
  { seed: 'robot3', label: 'Profile 3' },
  { seed: 'cat1', label: 'Profile 4' },
  { seed: 'cat2', label: 'Profile 5' },
  { seed: 'dog1', label: 'Profile 6' },
  { seed: 'dog2', label: 'Profile 7' },
  { seed: 'fox1', label: 'Profile 8' }
];

const ProfilePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const handleSaveChanges = () => {
    setTimeout(() => {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };
  
  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4 text-primary-text dark:text-primary-text-dark">Access Denied</h2>
        <p className="text-gray-600 dark:text-gray-300">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-primary-text dark:text-primary-text-dark mb-8">My Profile</h1>
      
      <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow-sm p-8 border border-gray-100 dark:border-gray-700">
        <div className="mb-8 flex flex-col md:flex-row md:items-start">
          <div className="md:w-1/3 flex flex-col items-center mb-6 md:mb-0">
            <div className="w-32 h-32 mb-3 rounded-full overflow-hidden border-4 border-primary-interactive border-opacity-20 dark:border-primary-interactive-dark dark:border-opacity-30">
              <img
                src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.email}`}
                alt={currentUser.displayName}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Profile Picture</p>
          </div>
          
          <div className="md:w-2/3">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-gray-50 dark:bg-slate-700 text-primary-text dark:text-primary-text-dark">
                <User size={18} className="text-gray-500 dark:text-gray-400 mr-2" />
                <span>{currentUser.displayName}</span>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-gray-50 dark:bg-slate-700 text-primary-text dark:text-primary-text-dark">
                <Mail size={18} className="text-gray-500 dark:text-gray-400 mr-2" />
                <span>{currentUser.email}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-semibold mb-4 text-primary-text dark:text-primary-text-dark">Choose Your Avatar</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {AVATAR_OPTIONS.map((avatar) => (
              <button
                key={avatar.seed}
                className={`
                  p-2 rounded-lg border transition-all
                  ${selectedAvatar === avatar.seed 
                    ? 'border-primary-interactive dark:border-primary-interactive-dark bg-primary-interactive bg-opacity-10 dark:bg-primary-interactive-dark dark:bg-opacity-20' 
                    : 'border-gray-200 dark:border-gray-600 hover:border-primary-interactive dark:hover:border-primary-interactive-dark bg-white dark:bg-slate-700'
                  }
                `}
                onClick={() => setSelectedAvatar(avatar.seed)}
              >
                <div className="flex flex-col items-center">
                  <img
                    src={`https://api.dicebear.com/7.x/bottts/svg?seed=${avatar.seed}`}
                    alt={avatar.label}
                    className="w-16 h-16 mb-2" // Avatars are SVGs, colors might need to be considered if they don't adapt.
                  />
                  <span className="text-sm text-primary-text dark:text-primary-text-dark">{avatar.label}</span>
                </div>
              </button>
            ))}
          </div>
          
          <div className="flex justify-end items-center">
            {saveSuccess && (
              <div className="mr-4 flex items-center text-green-600 dark:text-green-400">
                <Check size={18} className="mr-1" />
                <span>Changes saved!</span>
              </div>
            )}
            <Button
              variant="primary"
              onClick={handleSaveChanges}
              disabled={!selectedAvatar}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;