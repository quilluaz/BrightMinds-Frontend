import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import { User as UserIcon, Mail, Check, Palette } from 'lucide-react';

// Using the original preset seed values
const AVATAR_OPTIONS = [
  { seed: 'robot1', label: 'Robot 1' },
  { seed: 'robot2', label: 'Robot 2' },
  { seed: 'robot3', label: 'Robot 3' },
  { seed: 'cat1', label: 'Cat 1' },
  { seed: 'cat2', label: 'Cat 2' },
  { seed: 'dog1', label: 'Dog 1' },
  { seed: 'dog2', label: 'Dog 2' },
  { seed: 'fox1', label: 'Fox 1' }
];

const getSeedFromDiceBearUrl = (url: string | undefined): string | null => {
  if (url && url.includes('dicebear.com') && url.includes('seed=')) {
    const match = url.match(/seed=([^&]+)/);
    return match && match[1] ? match[1] : null;
  }
  return null;
};

const ProfilePage: React.FC = () => {
  const { currentUser, setCurrentUser } = useAuth(); 

  const [selectedAvatarSeed, setSelectedAvatarSeed] = useState<string | null>(() => {
    const initialSeed = getSeedFromDiceBearUrl(currentUser?.avatarUrl);
    if (initialSeed && AVATAR_OPTIONS.some(opt => opt.seed === initialSeed)) {
      return initialSeed;
    }
    return currentUser?.firstName || currentUser?.email?.split('@')[0] || AVATAR_OPTIONS[0]?.seed || 'defaultUser';
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (currentUser?.avatarUrl) {
      const seedFromUrl = getSeedFromDiceBearUrl(currentUser.avatarUrl);
      if (seedFromUrl && AVATAR_OPTIONS.some(opt => opt.seed === seedFromUrl)) {
        setSelectedAvatarSeed(seedFromUrl);
      }
    } else if (currentUser) {
        const defaultSeed = currentUser.firstName || currentUser.email?.split('@')[0] || AVATAR_OPTIONS[0]?.seed || 'defaultUser';
        const matchingOption = AVATAR_OPTIONS.find(opt => opt.seed === defaultSeed);
        if (matchingOption) {
            setSelectedAvatarSeed(matchingOption.seed);
        } else if (!AVATAR_OPTIONS.some(opt => opt.seed === selectedAvatarSeed) && AVATAR_OPTIONS.length > 0) {
            setSelectedAvatarSeed(AVATAR_OPTIONS[0].seed);
        }
    }
  }, [currentUser?.avatarUrl, currentUser?.firstName, currentUser?.email]);


  const handleSaveChanges = () => {
    if (currentUser && selectedAvatarSeed) {
      const newAvatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(selectedAvatarSeed)}`;
      
      if (setCurrentUser) {
          setCurrentUser({ ...currentUser, avatarUrl: newAvatarUrl });
      } else {
          console.warn("AuthContext does not provide setCurrentUser. Avatar change is local only.");
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
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
  
  let avatarUrlToDisplay: string;
  if (selectedAvatarSeed) {
    avatarUrlToDisplay = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(selectedAvatarSeed)}`;
  } else if (currentUser.avatarUrl) {
    avatarUrlToDisplay = currentUser.avatarUrl;
  } else {
    const defaultDisplaySeed = currentUser.firstName || currentUser.email?.split('@')[0] || 'defaultUser';
    avatarUrlToDisplay = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(defaultDisplaySeed)}`;
  }


  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-primary-text dark:text-primary-text-dark mb-8">My Profile</h1>
      
      <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow-sm p-6 sm:p-8 border border-gray-100 dark:border-gray-700">
        <div className="mb-8 flex flex-col md:flex-row md:items-start gap-6 md:gap-8">
          <div className="flex-shrink-0 flex flex-col items-center md:items-start w-full md:w-auto">
            <div className="w-32 h-32 sm:w-36 sm:h-36 mb-3 rounded-full overflow-hidden border-4 border-primary-interactive border-opacity-20 dark:border-primary-interactive-dark dark:border-opacity-30 bg-gray-100 dark:bg-slate-700">
              <img
                src={avatarUrlToDisplay}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center md:text-left">Profile Picture</p>
          </div>
          
          <div className="flex-grow">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-gray-50 dark:bg-slate-700 text-primary-text dark:text-primary-text-dark">
                <UserIcon size={18} className="text-gray-500 dark:text-gray-400 mr-2.5" />
                <span>{currentUser.name}</span>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-gray-50 dark:bg-slate-700 text-primary-text dark:text-primary-text-dark">
                <Mail size={18} className="text-gray-500 dark:text-gray-400 mr-2.5" />
                <span>{currentUser.email}</span>
              </div>
            </div>

            {currentUser.role && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-gray-50 dark:bg-slate-700 text-primary-text dark:text-primary-text-dark">
                  <Palette size={18} className="text-gray-500 dark:text-gray-400 mr-2.5" />
                  <span className="capitalize">{currentUser.role.toLowerCase()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-semibold mb-4 text-primary-text dark:text-primary-text-dark">Choose Your Avatar</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {AVATAR_OPTIONS.map((avatar) => ( // avatar.seed is the dicebear seed like 'robot1'
              <button
                key={avatar.seed}
                className={`p-2 rounded-lg border-2 transition-all text-center ${
                  selectedAvatarSeed === avatar.seed 
                    ? 'border-primary-interactive dark:border-primary-interactive-dark bg-primary-interactive bg-opacity-10 dark:bg-primary-interactive-dark dark:bg-opacity-20 ring-2 ring-primary-interactive dark:ring-primary-interactive-dark' 
                    : 'border-gray-200 dark:border-gray-600 hover:border-primary-interactive dark:hover:border-primary-interactive-dark bg-white dark:bg-slate-700'
                }`}
                onClick={() => setSelectedAvatarSeed(avatar.seed)}
              >
                <div className="flex flex-col items-center">
                  <img
                    src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(avatar.seed)}`}
                    alt={avatar.label}
                    className="w-16 h-16 mb-2 rounded"
                  />
                  <span className="text-xs sm:text-sm text-primary-text dark:text-primary-text-dark">{avatar.label}</span>
                </div>
              </button>
            ))}
          </div>
          
          <div className="flex justify-end items-center">
            {saveSuccess && (
              <div className="mr-4 flex items-center text-green-600 dark:text-green-400 transition-opacity duration-300">
                <Check size={18} className="mr-1" />
                <span>Avatar updated! (Locally)</span>
              </div>
            )}
            <Button
              variant="primary"
              onClick={handleSaveChanges}
              disabled={!selectedAvatarSeed || (currentUser.avatarUrl === `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(selectedAvatarSeed)}`)}
            >
              Save Avatar
            </Button>
          </div>
           <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-right">
            Avatar changes are currently local. Backend integration is needed to persist them.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;