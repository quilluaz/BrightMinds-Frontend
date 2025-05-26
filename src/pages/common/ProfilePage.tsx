import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import { User as UserIcon, Mail, Check } from 'lucide-react'; // Renamed to avoid conflict with User type

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
  const { currentUser } = useAuth(); // currentUser is of updated User type
  const [selectedAvatarSeed, setSelectedAvatarSeed] = useState<string | null>(
    currentUser?.avatarUrl?.includes('dicebear.com') ? currentUser.avatarUrl.split('seed=')[1]?.split('&')[0] : null
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  // This function would ideally update the backend and then the AuthContext user
  const handleSaveChanges = () => {
    if (currentUser && selectedAvatarSeed) {
      const newAvatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedAvatarSeed}`;
      // Simulate API call to save new avatar
      console.log('Saving new avatar URL:', newAvatarUrl);
      // In a real app: await updateUserProfile({ avatarUrl: newAvatarUrl });
      // Then update context: login(currentUser.email, '********'); // Re-login or update user in context
      
      // For demo, just show success
      setTimeout(() => {
        setSaveSuccess(true);
        // Potentially update currentUser in context here if backend call was successful
        // For now, this is just a visual confirmation.
        setTimeout(() => setSaveSuccess(false), 3000);
      }, 1000);
    }
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4 text-primary-text dark:text-primary-text-dark">Loading Profile...</h2>
        <p className="text-gray-600 dark:text-gray-300">Please wait or log in to view your profile.</p>
      </div>
    );
  }

  const currentAvatarDisplay = selectedAvatarSeed
    ? `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedAvatarSeed}`
    : currentUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.email || currentUser.id}`;


  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-primary-text dark:text-primary-text-dark mb-8">My Profile</h1>
      
      <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow-sm p-8 border border-gray-100 dark:border-gray-700">
        <div className="mb-8 flex flex-col md:flex-row md:items-start">
          <div className="md:w-1/3 flex flex-col items-center mb-6 md:mb-0">
            <div className="w-32 h-32 mb-3 rounded-full overflow-hidden border-4 border-primary-interactive border-opacity-20 dark:border-primary-interactive-dark dark:border-opacity-30">
              <img
                src={currentAvatarDisplay}
                alt={currentUser.name}
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
                <UserIcon size={18} className="text-gray-500 dark:text-gray-400 mr-2" />
                <span>{currentUser.name}</span>
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
             <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
              </label>
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-gray-50 dark:bg-slate-700 text-primary-text dark:text-primary-text-dark">
                <UserIcon size={18} className="text-gray-500 dark:text-gray-400 mr-2" />
                <span className="capitalize">{currentUser.role.toLowerCase()}</span>
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
                  ${selectedAvatarSeed === avatar.seed 
                    ? 'border-primary-interactive dark:border-primary-interactive-dark bg-primary-interactive bg-opacity-10 dark:bg-primary-interactive-dark dark:bg-opacity-20 ring-2 ring-primary-interactive' 
                    : 'border-gray-200 dark:border-gray-600 hover:border-primary-interactive dark:hover:border-primary-interactive-dark bg-white dark:bg-slate-700'
                  }
                `}
                onClick={() => setSelectedAvatarSeed(avatar.seed)}
              >
                <div className="flex flex-col items-center">
                  <img
                    src={`https://api.dicebear.com/7.x/bottts/svg?seed=${avatar.seed}`}
                    alt={avatar.label}
                    className="w-16 h-16 mb-2"
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
                <span>Changes saved! (Visually)</span>
              </div>
            )}
            <Button
              variant="primary"
              onClick={handleSaveChanges}
              disabled={!selectedAvatarSeed || selectedAvatarSeed === (currentUser.avatarUrl?.split('seed=')[1]?.split('&')[0])}
            >
              Save Avatar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;