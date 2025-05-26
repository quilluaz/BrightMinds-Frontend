import { SoundType } from '../Selina/GameConfigurations';

// Sound effect function
export const playSound = (soundType: SoundType) => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (!audioContext) {
    console.warn("Web Audio API is not supported in this browser.");
    return;
  }

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

  switch (soundType) {
    case 'correct':
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.3);
      break;
    case 'incorrect':
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.4);
      break;
    case 'gameComplete':
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.5);
      break;
    case 'click':
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.1);
      break;
    default:
      return;
  }
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
};

// Celebration emojis
export const celebrationEmojis = [
  '🎉', '🎊', '✨', '🌟', '🎈', '🎆', '🏆', '👑', '🥇', '🥳',
  '💎', '🎶', '💐', '🪅', '🎨', '🎭', '🎪', '🎯', '🎲', '🎮'
];

// Celebration animation component
export const WordCelebration: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-burst">
        <div className="text-9xl drop-shadow-2xl">🎯</div>
        <div className="text-4xl font-extrabold text-yellow-400 mt-4 animate-fadein">Great Job! You got it!</div>
      </div>
      {/* Floating emojis */}
      {[...Array(50)].map((_, i) => (
        <div
          key={`emoji-${i}`}
          className="absolute animate-complete-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 0.5}s`,
            fontSize: `${2 + Math.random() * 4}rem`,
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        >
          {celebrationEmojis[Math.floor(Math.random() * celebrationEmojis.length)]}
        </div>
      ))}
      {/* Sparkles */}
      {[...Array(30)].map((_, i) => (
        <div
          key={`sparkle-${i}`}
          className="absolute animate-sparkle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 0.5}s`,
            fontSize: `${1.5 + Math.random()}rem`,
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        >
          ✨
        </div>
      ))}
    </div>
  );
};

// Game complete celebration component
export const WordGameCompleteCelebration: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-burst">
        <div className="text-9xl drop-shadow-2xl">🏆</div>
        <div className="text-4xl font-extrabold text-yellow-400 mt-4 animate-fadein">Congratulations! You're a Word Master!</div>
      </div>
      {/* Massive floating emojis */}
      {[...Array(80)].map((_, i) => (
        <div
          key={`complete-emoji-${i}`}
          className="absolute animate-complete-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 0.5}s`,
            fontSize: `${2 + Math.random() * 4}rem`,
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        >
          {celebrationEmojis[Math.floor(Math.random() * celebrationEmojis.length)]}
        </div>
      ))}
      {/* Extra sparkles */}
      {[...Array(50)].map((_, i) => (
        <div
          key={`complete-sparkle-${i}`}
          className="absolute animate-sparkle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 0.5}s`,
            fontSize: `${1.5 + Math.random()}rem`,
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        >
          ✨
        </div>
      ))}
    </div>
  );
};

// Animation styles
export const wordAnimationStyles = `
  @keyframes burst {
    0% { transform: scale(0); opacity: 0; }
    50% { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes fadein {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes complete-float {
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
  }

  @keyframes sparkle {
    0% { transform: scale(0) rotate(0deg); opacity: 0; }
    50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
    100% { transform: scale(0) rotate(360deg); opacity: 0; }
  }

  .animate-burst {
    animation: burst 0.8s ease-out forwards;
  }

  .animate-fadein {
    animation: fadein 0.5s ease-in forwards;
  }

  .animate-complete-float {
    animation: complete-float 3s ease-out forwards;
  }

  .animate-sparkle {
    animation: sparkle 1.5s ease-in-out infinite;
  }
`; 