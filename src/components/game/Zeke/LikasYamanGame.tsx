// src/components/game/Zeke/LikasYamanGame.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { gameLevels, GameItem, Category, GameLevel } from './GameData';
import DraggableItem from './DraggableItem';
import SortingBin from './SortingBin';
import './Game.css';
import { useTheme } from '../../../context/ThemeContext';
import { CelebrationAnimation, GameCompleteCelebration, animationStyles } from '../Selina/GameConfigurations';
import GameLandingPage from '../GameLandingPage';

// Color palette for container and text
const COLORS = {
  light: {
    cardBg: '#fff',
    text: '#1A1B41',
    secondaryAccent: '#FFA500',
    feedback: {
      correct: 'bg-green-100 text-green-800',
      incorrect: 'bg-red-100 text-red-800',
      default: 'bg-blue-100 text-blue-800',
    },
  },
  dark: {
    cardBg: '#23244a',
    text: '#E8F9FF',
    secondaryAccent: '#FFA500',
    feedback: {
      correct: 'bg-green-900 text-green-200',
      incorrect: 'bg-red-900 text-red-200',
      default: 'bg-blue-900 text-blue-200',
    },
  },
};

// --- Sound Effect Placeholder Functions ---
const playSound = (soundType: 'correct' | 'incorrect' | 'levelComplete' | 'click') => {
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
    case 'levelComplete':
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

// Grand Celebration Component
const GrandCelebration: React.FC = () => {
  const emojis = ['🎉', '🎊', '✨', '🌟', '🎈', '🎆', '🏆', '👑', '🥇', '🥳', '💎', '🎶', '💐', '🪅'];
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-burst">
        <div className="text-9xl drop-shadow-2xl">🏆</div>
        <div className="text-4xl font-extrabold text-yellow-400 mt-4 animate-fadein">Congratulations! You are a Resource Master!</div>
      </div>
      {/* Massive floating emojis */}
      {[...Array(80)].map((_, i) => (
        <div
          key={`grand-emoji-${i}`}
          className="absolute animate-complete-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 0.5}s`,
            fontSize: `${2 + Math.random() * 4}rem`,
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        >
          {emojis[Math.floor(Math.random() * emojis.length)]}
        </div>
      ))}
      {/* Extra sparkles */}
      {[...Array(50)].map((_, i) => (
        <div
          key={`grand-sparkle-${i}`}
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

const LikasYamanGame: React.FC = () => {
  const { theme } = useTheme();
  const colors = COLORS[theme];

  const [hasGameStarted, setHasGameStarted] = useState(false);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [currentLevelData, setCurrentLevelData] = useState<GameLevel>(gameLevels[currentLevelIndex]);
  const [currentItems, setCurrentItems] = useState<GameItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [correctlyPlacedItems, setCorrectlyPlacedItems] = useState<Record<string, GameItem[]>>({});
  const [score, setScore] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [learnMoreText, setLearnMoreText] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [showCorrectCelebration, setShowCorrectCelebration] = useState(false);
  const [showLevelCelebration, setShowLevelCelebration] = useState(false);
  const [showGrandCelebration, setShowGrandCelebration] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  const handleStartGame = () => {
    playSound('click');
    setHasGameStarted(true);
  };

  useEffect(() => {
    setShowCelebration(false); // Hide overlay immediately on level change
    const levelData = gameLevels[currentLevelIndex];
    if (levelData) {
      setCurrentLevelData(levelData);
      setCurrentItems(levelData.items.sort(() => 0.5 - Math.random()));
      setCategories(levelData.categories);
      setCorrectlyPlacedItems(
        levelData.categories.reduce((acc, cat) => {
          acc[cat.key] = [];
          return acc;
        }, {} as Record<string, GameItem[]>)
      );
      setFeedbackMessage(levelData.instructions);
      setLearnMoreText('');
    }
  }, [currentLevelIndex]);

  // Add animation styles to document head once
  useEffect(() => {
    if (!document.getElementById('likas-yaman-animations')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'likas-yaman-animations';
      styleSheet.innerText = animationStyles;
      document.head.appendChild(styleSheet);
    }
  }, []);

  const handleDropItem = useCallback((droppedItem: GameItem, targetCategoryKey: Category['key']) => {
    setLearnMoreText('');

    if (correctlyPlacedItems[targetCategoryKey]?.find(i => i.id === droppedItem.id)) {
      setFeedbackMessage(`You already placed "${droppedItem.name}" there!`);
      return;
    }

    if (droppedItem.categoryKey === targetCategoryKey) {
      playSound('correct');
      setScore(prevScore => prevScore + 10);
      const categoryName = categories.find(c => c.key === targetCategoryKey)?.title || 'the correct category';
      setFeedbackMessage(`Correct! "${droppedItem.name}" is a ${categoryName}. ${droppedItem.careTip || ''}`);
      
      if (droppedItem.learnMore) {
        setLearnMoreText(`Fun Fact: ${droppedItem.learnMore}`);
      }
      
      setCorrectlyPlacedItems(prev => {
        const newPlacedItems = { ...prev };
        if (!newPlacedItems[targetCategoryKey]) {
          newPlacedItems[targetCategoryKey] = [];
        }
        newPlacedItems[targetCategoryKey] = [...newPlacedItems[targetCategoryKey], droppedItem];
        return newPlacedItems;
      });
      setShowCorrectCelebration(true);
      setTimeout(() => setShowCorrectCelebration(false), 1200);
    } else {
      playSound('incorrect');
      setScore(prevScore => Math.max(0, prevScore - 5));
      setFeedbackMessage(`Not quite! Try to figure out where "${droppedItem.name}" belongs.`);
    }
  }, [categories, correctlyPlacedItems]);

  useEffect(() => {
    if (currentItems.length > 0) {
      const allLevelItemsCorrectlyPlaced = currentItems.every(item =>
        Object.values(correctlyPlacedItems).flat().some(placedItem => placedItem.id === item.id)
      );
      if (allLevelItemsCorrectlyPlaced && !showCelebration) {
        playSound('levelComplete');
        setFeedbackMessage(`Awesome! You've mastered ${currentLevelData.title}!`);
        setLearnMoreText('');
        setShowLevelCelebration(true);
        setTimeout(() => setShowLevelCelebration(false), 2000);
        // If last level, show grand celebration and game complete modal
        if (currentLevelIndex === gameLevels.length - 1) {
          setTimeout(() => {
            setShowGrandCelebration(true);
            setGameComplete(true);
          }, 2000);
        }
        setShowCelebration(true);
      }
    }
  // eslint-disable-next-line
  }, [correctlyPlacedItems, currentItems, currentLevelData.title, currentLevelIndex]);

  const handleNextLevel = () => {
    playSound('click');
    if (currentLevelIndex < gameLevels.length - 1) {
      setCurrentLevelIndex(prevIndex => prevIndex + 1);
    } else {
      setFeedbackMessage('Congratulations! You\'ve completed all challenges and are a true Resource Expert!');
      setLearnMoreText('');
    }
  };

  const handlePlayAgain = () => {
    playSound('click');
    setCurrentLevelIndex(0);
    setScore(0);
    setShowCelebration(false);
    setShowCorrectCelebration(false);
    setShowLevelCelebration(false);
    setShowGrandCelebration(false);
    setGameComplete(false);
    setFeedbackMessage(gameLevels[0].instructions);
    setLearnMoreText('');
    setHasGameStarted(false);
  };

  const itemsToDrag = currentItems.filter(
    item => !Object.values(correctlyPlacedItems).flat().some(placedItem => placedItem.id === item.id)
  );

  if (!hasGameStarted) {
    return (
      <GameLandingPage
        title="Resource Ranger Challenge"
        subtitle="Test your knowledge about natural resources and their proper management!"
        description="Sort the items into their correct categories and become a Resource Master!"
        instruction="Drag and drop items into their correct categories to learn about natural resources."
        onStart={handleStartGame}
        gameIcon="/images/likas-yaman/game-icon.svg"
      />
    );
  }

  if (!currentLevelData) {
    return (
      <div className="flex items-center justify-center min-h-[300px] p-4">
        <p className="text-xl">Loading Game Adventure...</p>
      </div>
    );
  }

  return (
    <div
      className="p-10 rounded-3xl shadow-xl text-center max-w-6xl w-full mx-auto"
      style={{ background: colors.cardBg, color: colors.text }}
    >
      <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: colors.text }}>Resource Ranger Challenge</h1>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <h2 className="text-xl font-semibold" style={{ color: colors.text }}>{currentLevelData.title}</h2>
        <p className="text-xl font-bold text-orange-500">Score: {score}</p>
      </div>
      <p className={`p-4 rounded-lg text-center text-lg font-medium mb-2 ${
        feedbackMessage.includes('Correct') ? colors.feedback.correct :
        feedbackMessage.includes('Not quite') ? colors.feedback.incorrect :
        colors.feedback.default
      }`}>
        {feedbackMessage}
      </p>
      {learnMoreText && (
        <p className="p-4 bg-yellow-100 text-yellow-800 rounded-lg text-center text-lg mb-2">
          {learnMoreText}
        </p>
      )}
      {showCorrectCelebration && <CelebrationAnimation />}
      {showLevelCelebration && <GameCompleteCelebration />}
      {showGrandCelebration && <GrandCelebration />}
      {/* Modal for level cleared or game complete */}
      {showCelebration && !gameComplete && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            background: theme === 'dark' ? 'rgba(35,36,74,0.8)' : 'rgba(255,255,255,0.8)',
            transition: 'background 0.3s'
          }}
        >
          <div
            className="rounded-xl text-center max-w-xl mx-4 p-8 shadow-2xl"
            style={{
              background: colors.cardBg,
              color: colors.text,
              boxShadow: theme === 'dark' ? '0 4px 32px 0 rgba(0,0,0,0.7)' : '0 4px 32px 0 rgba(0,0,0,0.15)',
              border: theme === 'dark' ? '1.5px solid #35366a' : '1.5px solid #e5e5e5',
              transition: 'background 0.3s, color 0.3s'
            }}
          >
            <h2
              className="text-2xl font-bold mb-4"
              style={{ color: theme === 'dark' ? '#E8F9FF' : '#1A1B41', textShadow: theme === 'dark' ? '0 2px 8px #18192f' : 'none' }}
            >
              Level Cleared!
            </h2>
            {currentLevelIndex < gameLevels.length - 1 ? (
              <button
                onClick={handleNextLevel}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full text-lg transition-colors"
                style={{ boxShadow: theme === 'dark' ? '0 2px 8px #18192f' : undefined }}
              >
                Next Challenge &rarr;
              </button>
            ) : (
              <p className="text-xl font-semibold text-green-600">You're a Resource Pro!</p>
            )}
          </div>
        </div>
      )}
      {/* Modal for game complete */}
      {gameComplete && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[110]"
          style={{
            background: theme === 'dark' ? 'rgba(35,36,74,0.97)' : 'rgba(255,255,255,0.97)',
            transition: 'background 0.3s'
          }}
        >
          <div
            className="rounded-xl text-center max-w-md mx-4 p-10 shadow-2xl"
            style={{
              background: colors.cardBg,
              color: colors.text,
              boxShadow: theme === 'dark' ? '0 4px 32px 0 rgba(0,0,0,0.7)' : '0 4px 32px 0 rgba(0,0,0,0.15)',
              border: theme === 'dark' ? '1.5px solid #35366a' : '1.5px solid #e5e5e5',
              transition: 'background 0.3s, color 0.3s'
            }}
          >
            <h2
              className="text-3xl font-extrabold mb-4 text-yellow-400"
              style={{ textShadow: theme === 'dark' ? '0 2px 8px #18192f' : 'none' }}
            >
              Congratulations!
            </h2>
            <p className="text-2xl font-bold mb-2">You are a Resource Master!</p>
            <p className="text-xl mb-6">Total Score: <span className="font-extrabold text-orange-500">{score}</span></p>
            <button
              onClick={handlePlayAgain}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-xl transition-colors shadow-lg"
              style={{ boxShadow: theme === 'dark' ? '0 2px 8px #18192f' : undefined }}
            >
              Play Again
            </button>
          </div>
        </div>
      )}
      {/* Only show game content if no celebration/modals are active */}
      {!showCelebration && !gameComplete && (
        <div className="mt-6 space-y-6">
          <div className="p-6 rounded-lg shadow-md" style={{ background: colors.cardBg }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: colors.text }}>Sort These Items:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 justify-items-center">
              {itemsToDrag.map(item => (
                <div key={item.id} className="flex flex-col items-center gap-2">
                  <div
                    draggable
                    onDragStart={e => {
                      e.dataTransfer.setData('text/plain', JSON.stringify(item));
                      playSound('click');
                    }}
                    className="w-20 h-20 rounded-full flex items-center justify-center shadow text-lg font-bold cursor-move border-2 border-orange-400 hover:border-blue-400 transition-all select-none overflow-hidden"
                    style={{ backgroundColor: '#FFA500' }}
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-contain"
                        draggable={false}
                      />
                    ) : (
                      item.name[0]
                    )}
                  </div>
                  <span className={`mt-1 text-base font-medium text-center`} style={{ color: theme === 'dark' ? '#fff' : '#1A1B41' }}>{item.name}</span>
                </div>
              ))}
              {itemsToDrag.length === 0 && !showCelebration && currentItems.length > 0 && 
                <p className="text-center text-gray-600 italic">
                  All items for this level are sorted! Ready for the next?
                </p>
              }
            </div>
          </div>
          {categories.length === 3 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SortingBin
                key={categories[0].key}
                category={categories[0]}
                onDropItem={handleDropItem}
                droppedItemsHere={correctlyPlacedItems[categories[0].key] || []}
              />
              <SortingBin
                key={categories[1].key}
                category={categories[1]}
                onDropItem={handleDropItem}
                droppedItemsHere={correctlyPlacedItems[categories[1].key] || []}
              />
              <div className="col-span-2 flex justify-center">
                <div className="w-full sm:w-1/2">
                  <SortingBin
                    key={categories[2].key}
                    category={categories[2]}
                    onDropItem={handleDropItem}
                    droppedItemsHere={correctlyPlacedItems[categories[2].key] || []}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map(category => (
                <SortingBin
                  key={category.key}
                  category={category}
                  onDropItem={handleDropItem}
                  droppedItemsHere={correctlyPlacedItems[category.key] || []}
                />
              ))}
            </div>
          )}
        </div>
      )}
      {!showCelebration && itemsToDrag.length === 0 && currentItems.length > 0 && currentLevelIndex < gameLevels.length - 1 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleNextLevel}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full text-lg transition-colors"
          >
            Proceed to Next Challenge &rarr;
          </button>
        </div>
      )}
    </div>
  );
};

export default LikasYamanGame;