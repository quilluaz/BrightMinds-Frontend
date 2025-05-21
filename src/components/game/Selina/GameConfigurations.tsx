import React from 'react';

// Sound Types
export type SoundType = 'correct' | 'incorrect' | 'click' | 'gameComplete';

// Sound Effects
export const playSound = (soundType: SoundType) => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (!audioContext) {
    console.warn("Web Audio API is not supported in this browser.");
    return;
  }

  switch (soundType) {
    case 'correct':
      const correctOscillator = audioContext.createOscillator();
      const correctGainNode = audioContext.createGain();
      correctOscillator.connect(correctGainNode);
      correctGainNode.connect(audioContext.destination);
      
      correctOscillator.type = 'sine';
      correctOscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      correctOscillator.frequency.exponentialRampToValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      correctOscillator.frequency.exponentialRampToValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
      
      correctGainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      correctGainNode.gain.exponentialRampToValueAtTime(0.2, audioContext.currentTime + 0.1);
      correctGainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.4);
      
      correctOscillator.start(audioContext.currentTime);
      correctOscillator.stop(audioContext.currentTime + 0.4);
      break;

    case 'incorrect':
      const incorrectOscillator = audioContext.createOscillator();
      const incorrectGainNode = audioContext.createGain();
      incorrectOscillator.connect(incorrectGainNode);
      incorrectGainNode.connect(audioContext.destination);
      
      incorrectOscillator.type = 'square';
      incorrectOscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      incorrectGainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.4);
      
      incorrectOscillator.start(audioContext.currentTime);
      incorrectOscillator.stop(audioContext.currentTime + 0.4);
      break;

    case 'click':
      const clickOscillator = audioContext.createOscillator();
      const clickGainNode = audioContext.createGain();
      clickOscillator.connect(clickGainNode);
      clickGainNode.connect(audioContext.destination);
      
      clickOscillator.type = 'triangle';
      clickOscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      clickGainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.1);
      
      clickOscillator.start(audioContext.currentTime);
      clickOscillator.stop(audioContext.currentTime + 0.1);
      break;

    case 'gameComplete':
      // Create a celebratory "woohoo" sound using multiple oscillators
      const oscillators = [];
      const gainNodes = [];
      
      // Create three oscillators for a richer sound
      for (let i = 0; i < 3; i++) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Set different frequencies for each oscillator
        const baseFreq = 440; // A4
        oscillator.frequency.setValueAtTime(baseFreq * (1 + i * 0.2), audioContext.currentTime);
        
        // Create a "woohoo" effect by modulating the frequency
        oscillator.frequency.exponentialRampToValueAtTime(
          baseFreq * (1.5 + i * 0.2),
          audioContext.currentTime + 0.1
        );
        oscillator.frequency.exponentialRampToValueAtTime(
          baseFreq * (1.2 + i * 0.2),
          audioContext.currentTime + 0.2
        );
        
        // Modulate the gain for a more natural sound
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.05);
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.15);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        
        oscillators.push(oscillator);
        gainNodes.push(gainNode);
      }
      
      // Add a "clap" effect
      const clapOscillator = audioContext.createOscillator();
      const clapGain = audioContext.createGain();
      clapOscillator.connect(clapGain);
      clapGain.connect(audioContext.destination);
      
      clapOscillator.type = 'sine';
      clapOscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
      clapOscillator.frequency.exponentialRampToValueAtTime(2000, audioContext.currentTime + 0.1);
      
      clapGain.gain.setValueAtTime(0, audioContext.currentTime);
      clapGain.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
      clapGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.15);
      
      clapOscillator.start(audioContext.currentTime);
      clapOscillator.stop(audioContext.currentTime + 0.15);
      break;
  }
};

// Animation Components
export const CelebrationAnimation: React.FC = () => {
  const emojis = ['🎉', '🎊'];
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Party Poppers */}
      {[...Array(8)].map((_, i) => (
        <div
          key={`popper-${i}`}
          className="absolute animate-party-popper"
          style={{
            left: `${15 + (i * 10)}%`,
            bottom: '0',
            animationDelay: `${i * 0.1}s`,
          }}
        >
          {emojis[Math.floor(Math.random() * emojis.length)]}
        </div>
      ))}
      
      {/* Floating Celebration Emojis */}
      {[...Array(20)].map((_, i) => (
        <div
          key={`emoji-${i}`}
          className="absolute animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 0.5}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        >
          {emojis[Math.floor(Math.random() * emojis.length)]}
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
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        >
          ✨
        </div>
      ))}

      {/* Stars */}
      {[...Array(15)].map((_, i) => (
        <div
          key={`star-${i}`}
          className="absolute animate-star"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 0.5}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        >
          ⭐
        </div>
      ))}
    </div>
  );
};

export const GameCompleteCelebration: React.FC = () => {
  const emojis = ['🎉', '🎊', '✨', '🌟', '🎈', '🎆', '🏆', '👑'];
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Center Burst */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-burst">
        <div className="text-8xl">🎉</div>
      </div>
      
      {/* Floating Emojis */}
      {[...Array(40)].map((_, i) => (
        <div
          key={`complete-emoji-${i}`}
          className="absolute animate-complete-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 0.5}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        >
          {emojis[Math.floor(Math.random() * emojis.length)]}
        </div>
      ))}
    </div>
  );
};

// Animation Styles
export const animationStyles = `
@keyframes party-popper {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateY(-30px) scale(1.3);
    opacity: 1;
  }
  100% {
    transform: translateY(-60px) scale(0.8);
    opacity: 0;
  }
}

@keyframes float {
  0% {
    transform: translateY(0) rotate(0deg) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateY(-40px) rotate(180deg) scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: translateY(-80px) rotate(360deg) scale(0.8);
    opacity: 0;
  }
}

@keyframes sparkle {
  0% {
    transform: translateY(0) rotate(0deg) scale(1);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  50% {
    transform: translateY(-30px) rotate(180deg) scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: translateY(-60px) rotate(360deg) scale(0.8);
    opacity: 0;
  }
}

@keyframes star {
  0% {
    transform: translateY(0) rotate(0deg) scale(1);
    opacity: 0;
  }
  25% {
    opacity: 1;
    transform: translateY(-20px) rotate(90deg) scale(1.2);
  }
  75% {
    opacity: 0.8;
    transform: translateY(-40px) rotate(270deg) scale(0.9);
  }
  100% {
    transform: translateY(-60px) rotate(360deg) scale(0.8);
    opacity: 0;
  }
}

@keyframes burst {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}

@keyframes complete-float {
  0% {
    transform: translateY(0) rotate(0deg) scale(1);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  50% {
    transform: translateY(-50px) rotate(180deg) scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: translateY(-100px) rotate(360deg) scale(0.8);
    opacity: 0;
  }
}

.animate-party-popper {
  animation: party-popper 1.5s ease-out forwards;
  font-size: 3.5rem;
}

.animate-float {
  animation: float 2s ease-out forwards;
  font-size: 2.5rem;
}

.animate-sparkle {
  animation: sparkle 1.5s ease-out forwards;
  font-size: 1.8rem;
}

.animate-star {
  animation: star 2s ease-in-out forwards;
  font-size: 2rem;
}

.animate-burst {
  animation: burst 1s ease-out forwards;
}

.animate-complete-float {
  animation: complete-float 2s ease-out forwards;
  font-size: 2.5rem;
}
`; 