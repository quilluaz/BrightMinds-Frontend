// src/components/game/Zeke/LikasYamanGame.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { gameLevels, GameItem, Category, GameLevel } from './GameData';
import DraggableItem from './DraggableItem';
import SortingBin from './SortingBin';
import './Game.css'; 

// --- Sound Effect Placeholder Functions ---
// In a real app, you'd use Web Audio API or a library like Howler.js here.
// For simplicity, we'll just log to the console.

const playSound = (soundType: 'correct' | 'incorrect' | 'levelComplete' | 'click') => {
  // Simple tones with Web Audio API
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (!audioContext) {
    console.warn("Web Audio API is not supported in this browser.");
    return;
  }

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime); // Volume

  switch (soundType) {
    case 'correct':
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime); // Higher pitch for correct
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.3);
      console.log("Playing sound: Correct!");
      break;
    case 'incorrect':
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime); // Lower pitch for incorrect
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.4);
      console.log("Playing sound: Incorrect!");
      break;
    case 'levelComplete':
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.5);
      // You could play a sequence of notes for a more "complete" sound
      console.log("Playing sound: Level Complete!");
      break;
    case 'click':
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.1);
        console.log("Playing sound: Click!");
        break;
    default:
      return; // No sound for other types
  }
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5); // Sound duration
};


// --- Main Game Component ---
const LikasYamanGame: React.FC = () => {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [currentLevelData, setCurrentLevelData] = useState<GameLevel>(gameLevels[currentLevelIndex]); 
  
  const [currentItems, setCurrentItems] = useState<GameItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [correctlyPlacedItems, setCorrectlyPlacedItems] = useState<Record<string, GameItem[]>>({});
  const [score, setScore] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [learnMoreText, setLearnMoreText] = useState(''); // State for learn more snippet
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
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
      setLearnMoreText(''); // Clear learn more text on level change
      setShowCelebration(false);
    }
  }, [currentLevelIndex]);

  const handleDropItem = useCallback((droppedItem: GameItem, targetCategoryKey: Category['key']) => {
    setLearnMoreText(''); // Clear previous learn more text

    if (correctlyPlacedItems[targetCategoryKey]?.find(i => i.id === droppedItem.id)) {
        setFeedbackMessage(`You already placed "${droppedItem.name}" there!`);
        return;
    }

    if (droppedItem.categoryKey === targetCategoryKey) {
      playSound('correct');
      setScore(prevScore => prevScore + 10);
      const categoryName = categories.find(c => c.key === targetCategoryKey)?.title || 'the correct category';
      setFeedbackMessage(`Correct! "${droppedItem.name}" is a ${categoryName}. ${droppedItem.careTip || ''}`);
      
      // Set "Learn More" text if available
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

    } else {
      playSound('incorrect');
      setScore(prevScore => Math.max(0, prevScore - 5));
      setFeedbackMessage(`Not quite! Try to figure out where "${droppedItem.name}" belongs.`);
    }
  }, [categories, correctlyPlacedItems]); // Added dependencies

  useEffect(() => {
    if (currentItems.length > 0) { 
      const allLevelItemsCorrectlyPlaced = currentItems.every(item =>
        Object.values(correctlyPlacedItems).flat().some(placedItem => placedItem.id === item.id)
      );

      if (allLevelItemsCorrectlyPlaced) {
        playSound('levelComplete');
        setFeedbackMessage(`Awesome! You've mastered ${currentLevelData.title}!`);
        setLearnMoreText(''); // Clear learn more on level completion
        setShowCelebration(true);
      }
    }
  }, [correctlyPlacedItems, currentItems, currentLevelData.title]); // Removed currentLevelData as it's derived


  const handleNextLevel = () => {
    playSound('click');
    if (currentLevelIndex < gameLevels.length - 1) {
      setCurrentLevelIndex(prevIndex => prevIndex + 1);
    } else {
      setFeedbackMessage('Congratulations! You\'ve completed all challenges and are a true Resource Expert!');
      setLearnMoreText(''); // Clear learn more on game completion
    }
    setShowCelebration(false); 
  };
  
  const itemsToDrag = currentItems.filter(
    item => !Object.values(correctlyPlacedItems).flat().some(placedItem => placedItem.id === item.id)
  );

  if (!currentLevelData) {
    return <div className="game-container loading-container"><p>Loading Game Adventure...</p></div>;
  }

  return (
    <div className="game-container">
      <header className="game-header">
        <h1>Resource Ranger Challenge</h1>
        <div className="score-level-info">
          <h2>{currentLevelData.title}</h2>
          <p className="score">Score: {score}</p>
        </div>
      </header>

      <p className="feedback-message">{feedbackMessage}</p>
      {/* Display "Learn More" text if it exists */}
      {learnMoreText && <p className="learn-more-message">{learnMoreText}</p>}


      {showCelebration ? (
        <div className="celebration-popup">
          <span role="img" aria-label="Party Popper" style={{fontSize: '3em', display:'block'}}>🎉</span>
          Level Cleared!
          {currentLevelIndex < gameLevels.length - 1 ? (
            <button onClick={handleNextLevel} className="next-level-button">
              Next Challenge &rarr;
            </button>
          ) : (
            <p className="all-levels-complete-message">You're a Resource Pro!</p>
          )}
        </div>
      ) : (
        <>
          <div className="items-area">
            <h3>Sort These Items:</h3>
            <div className="draggable-items-pool">
              {itemsToDrag.map(item => (
                <DraggableItem key={item.id} item={item} isPlaced={false} onDragStartCustom={() => playSound('click')} />
              ))}
              {itemsToDrag.length === 0 && !showCelebration && currentItems.length > 0 && 
                <p className="all-sorted-message">All items for this level are sorted! Ready for the next?</p>}
            </div>
          </div>

          <div className="sorting-bins-area">
            {categories.map(category => (
              <SortingBin
                key={category.key}
                category={category}
                onDropItem={handleDropItem}
                droppedItemsHere={correctlyPlacedItems[category.key] || []}
              />
            ))}
          </div>
        </>
      )}
       {!showCelebration && itemsToDrag.length === 0 && currentItems.length > 0 && currentLevelIndex < gameLevels.length - 1 && (
         <button onClick={handleNextLevel} className="next-level-button manual-next">
           Proceed to Next Challenge &rarr;
         </button>
       )}
    </div>
  );
};

export default LikasYamanGame;