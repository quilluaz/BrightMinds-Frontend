import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface BackgroundMusicProps {
  musicFile: string;
  volume?: number;
  loop?: boolean;
}

// Global audio instance to ensure consistent state across components
let globalAudio: HTMLAudioElement | null = null;
let globalVolume = 0.15;

const BackgroundMusic: React.FC<BackgroundMusicProps> = ({
  musicFile,
  volume = 0.15,
  loop = true
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    // Update global volume
    globalVolume = volume;

    // Create or update audio element
    if (!globalAudio) {
      globalAudio = new Audio(musicFile);
      globalAudio.loop = loop;
      globalAudio.volume = volume;
    } else if (globalAudio.src !== window.location.origin + musicFile) {
      // If music file changed, update the audio source
      globalAudio.src = musicFile;
      globalAudio.loop = loop;
      globalAudio.volume = volume;
    }

    // Function to start playing
    const startPlaying = async () => {
      if (!globalAudio) return;
      
      try {
        globalAudio.volume = globalVolume;
        await globalAudio.play();
        setIsPlaying(true);
      } catch (error) {
        console.warn('Audio playback failed:', error);
        // If autoplay fails, we'll try to play on first user interaction
        document.addEventListener('click', () => {
          if (!isPlaying && globalAudio) {
            globalAudio.play().then(() => setIsPlaying(true));
          }
        }, { once: true });
      }
    };

    // Start playing when component mounts
    startPlaying();

    // Cleanup when component unmounts
    return () => {
      if (globalAudio) {
        globalAudio.pause();
        globalAudio = null;
      }
    };
  }, [musicFile, volume, loop]);

  // Handle mute/unmute
  const toggleMute = () => {
    if (!globalAudio) return;

    if (isPlaying) {
      globalAudio.pause();
      setIsPlaying(false);
    } else {
      globalAudio.volume = globalVolume;
      globalAudio.play().then(() => setIsPlaying(true));
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggleMute}
        className={`p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${
          theme === 'dark' ? 'bg-[#2A2B51] text-white' : 'bg-white text-[#1A1B41]'
        }`}
        aria-label={isPlaying ? 'Mute background music' : 'Unmute background music'}
      >
        {isPlaying ? '🔊' : '🔇'}
      </button>
    </div>
  );
};

export default BackgroundMusic; 