// src/components/game/Zeke/BlankSortingGame.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DraggableItem from "./DraggableItem"; // Ensure this is the updated version
import SortingBin from "./SortingBin";
import "./Game.css"; // Should contain styles for .sorting-bin etc.
import { useTheme } from "../../../context/ThemeContext";
import {
  CelebrationAnimation,
  GameCompleteCelebration as LevelCompleteVisual,
  animationStyles,
} from "../Selina/GameConfigurations";
import GameLandingPage from "../GameLandingPage";
import BackgroundMusic from "../BackgroundMusic";
import { AssignedGameDTO } from "../../../types";
import { GameItem, Category, GameLevel } from "./GameData";

// Color palette (consistent with LikasYamanGame.tsx)
const COLORS = {
  light: {
    cardBg: "#fff",
    text: "#1A1B41",
    secondaryAccent: "#FFA500", 
    interactiveElements: "#7A89C2", 
    feedback: {
      correct: "bg-green-100 text-green-800 border border-green-300",
      incorrect: "bg-red-100 text-red-800 border border-red-300",
      default: "bg-blue-100 text-blue-800 border border-blue-300",
    },
    itemsAreaBg: "#f0f9ff", // Light blue for items pool (light theme)
  },
  dark: {
    cardBg: "#23244a", 
    text: "#E8F9FF", 
    secondaryAccent: "#FFA500",
    interactiveElements: "#9BA8E5",
    feedback: {
      correct: "bg-green-700 bg-opacity-30 text-green-300 border border-green-600",
      incorrect: "bg-red-700 bg-opacity-30 text-red-300 border border-red-600",
      default: "bg-blue-700 bg-opacity-30 text-blue-300 border border-blue-600",
    },
    itemsAreaBg: "#1e293b", // Dark slate for items pool (dark theme)
  },
} as const;

type ThemeType = keyof typeof COLORS;

// Sound effect functions (ensure this is defined or imported correctly)
const playSound = (
  soundType: "correct" | "incorrect" | "levelComplete" | "click" | "gameEnd"
): void => {
  const audioContext = new (window.AudioContext ||
    (window as any).webkitAudioContext)();
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
    case "correct":
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.3);
      break;
    case "incorrect":
      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.4);
      break;
    case "levelComplete":
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.4);
      break;
    case "gameEnd":
      const freqs = [440, 554, 659, 880]; 
      freqs.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gn = audioContext.createGain();
        osc.connect(gn);
        gn.connect(audioContext.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.1);
        gn.gain.setValueAtTime(0.1, audioContext.currentTime + i * 0.1);
        gn.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + i * 0.1 + 0.2);
        osc.start(audioContext.currentTime + i * 0.1);
        osc.stop(audioContext.currentTime + i * 0.1 + 0.2);
      });
      return;
    case "click":
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.1);
      break;
    default: return;
  }
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
};

const GrandGameCelebration: React.FC = () => { /* ... (same as before) ... */ 
    const emojis = ["🎉","🎊","✨","🌟","🎈","🎆","🏆","👑","🥇","🥳","🌍","♻️","🌳",];
    return (
      <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-burst">
          <div className="text-9xl drop-shadow-2xl">🏆</div>
          <div className="text-4xl font-extrabold text-yellow-400 mt-4 animate-fadein">
            Sorting Master!
          </div>
        </div>
        {[...Array(80)].map((_, i) => (
          <div
            key={`grand-s-emoji-${i}`}
            className="absolute animate-complete-float" 
            style={{
              left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 0.5}s`, fontSize: `${2 + Math.random() * 4}rem`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}>
            {emojis[Math.floor(Math.random() * emojis.length)]}
          </div>
        ))}
      </div>
    );
};

interface GameTemplate {
  activityName: string;
  maxScore: number;
  maxExp: number;
  levels: GameLevel[];
}

interface BlankSortingGameProps {
  isPracticeMode: boolean;
  gameData: GameTemplate;
  assignedGameData?: AssignedGameDTO;
  onGameComplete: (
    score: number,
    timeTakenSeconds?: number,
    expReward?: number
  ) => void;
  classroomId?: string;
  assignedGameId?: string;
}

const BlankSortingGame: React.FC<BlankSortingGameProps> = ({
  isPracticeMode,
  gameData,
  onGameComplete,
  classroomId,
}) => {
  const { theme } = useTheme();
  const colors = COLORS[theme as ThemeType];
  const navigate = useNavigate();

  const [hasGameStarted, setHasGameStarted] = useState<boolean>(!isPracticeMode);
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [currentLevelData, setCurrentLevelData] = useState<GameLevel | undefined>(gameData.levels[0]);
  const [currentItems, setCurrentItems] = useState<GameItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [correctlyPlacedItems, setCorrectlyPlacedItems] = useState<Record<string, GameItem[]>>({});
  const [score, setScore] = useState<number>(0);
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [learnMoreText, setLearnMoreText] = useState<string>("");
  
  const [showCorrectItemCelebration, setShowCorrectItemCelebration] = useState<boolean>(false);
  const [showLevelCompleteModal, setShowLevelCompleteModal] = useState<boolean>(false);
  const [showGameCompleteModal, setShowGameCompleteModal] = useState<boolean>(false);
  const [gameIsFullyComplete, setGameIsFullyComplete] = useState<boolean>(false);

  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeTaken, setTimeTaken] = useState<number>(0);
  
    // Initialize Level Data
    useEffect(() => {
        const levelConfig = gameData.levels[currentLevelIndex];
        if (levelConfig) {
            setCurrentLevelData(levelConfig);
            setCurrentItems(levelConfig.items.sort(() => 0.5 - Math.random()));
            setCategories(levelConfig.categories);
            
            const initialPlaced: Record<string, GameItem[]> = {};
            levelConfig.categories.forEach(cat => { initialPlaced[cat.key] = []; });
            setCorrectlyPlacedItems(initialPlaced);

            setFeedbackMessage(levelConfig.instructions || "Sort the items into the correct bins!");
            setLearnMoreText("");
            setShowCorrectItemCelebration(false);
            setShowLevelCompleteModal(false);
        }
    }, [currentLevelIndex, gameData.levels]);

    // Start Timer
    useEffect(() => {
        if (hasGameStarted && !startTime && !gameIsFullyComplete) {
        setStartTime(Date.now());
        }
    }, [hasGameStarted, startTime, gameIsFullyComplete, currentLevelIndex]);

    // Inject Animation Styles
    useEffect(() => {
        if (!document.getElementById("blank-sorting-game-animations")) {
        const styleSheet = document.createElement("style");
        styleSheet.id = "blank-sorting-game-animations";
        styleSheet.innerText = animationStyles; 
        document.head.appendChild(styleSheet);
        }
    }, []);

    const handleStartGame = (): void => {
        playSound("click");
        setCurrentLevelIndex(0);
        setScore(0);
        setHasGameStarted(true);
        setShowGameCompleteModal(false);
        setGameIsFullyComplete(false);
        setStartTime(Date.now());
        setTimeTaken(0);
      };

    const handleGameCompletionSubmit = useCallback(() => {
        const endTime = Date.now();
        const timeTakenSeconds = startTime ? Math.round((endTime - startTime) / 1000) : 0;
        setTimeTaken(timeTakenSeconds);
        if (!isPracticeMode) {
            onGameComplete(score, timeTakenSeconds, gameData.maxExp);
        }
    }, [onGameComplete, score, startTime, gameData.maxExp, isPracticeMode]);

    // Check for Level/Game Completion
    useEffect(() => {
        if (!currentLevelData || currentItems.length === 0 || gameIsFullyComplete || showLevelCompleteModal) return;

        const allItemsCorrectlyPlacedInBins = currentItems.every(item =>
            correctlyPlacedItems[item.categoryKey]?.some(placedItem => placedItem.id === item.id)
        );
        const totalCorrectlyPlacedCount = Object.values(correctlyPlacedItems).flat().length;

        if (allItemsCorrectlyPlacedInBins && totalCorrectlyPlacedCount === currentItems.length) {
            playSound("levelComplete");
            
            if (currentLevelIndex < gameData.levels.length - 1) {
                setFeedbackMessage(`Level ${currentLevelIndex + 1} Cleared: ${currentLevelData.title}!`);
                setShowLevelCompleteModal(true);
            } else {
                setFeedbackMessage("All Levels Cleared! Game Over!");
                setGameIsFullyComplete(true);
                handleGameCompletionSubmit();
                setShowGameCompleteModal(true);
                playSound("gameEnd");
            }
        }
    }, [correctlyPlacedItems, currentItems, currentLevelIndex, gameData.levels.length, gameIsFullyComplete, currentLevelData, showLevelCompleteModal, handleGameCompletionSubmit]);

    const handleItemDrop = useCallback((itemId: string, targetCategoryKey: string) => {
        const item = currentItems.find((i) => i.id === itemId);

        if (!item || gameIsFullyComplete || showLevelCompleteModal) return;

        if (correctlyPlacedItems[targetCategoryKey]?.some(pi => pi.id === item.id)) {
            setFeedbackMessage("This item is already correctly placed here!");
            return;
        }
        
        const isCorrect = item.categoryKey === targetCategoryKey;

        if (isCorrect) {
            playSound("correct");
            setShowCorrectItemCelebration(true);
            setTimeout(() => setShowCorrectItemCelebration(false), 1200);

            setScore((prevScore) => prevScore + 10);
            setFeedbackMessage(`Correct! "${item.name}" is in the right place. ${item.careTip || ""}`);
            setLearnMoreText(item.learnMore || "");

            setCorrectlyPlacedItems((prev) => ({
                ...prev,
                [targetCategoryKey]: [...(prev[targetCategoryKey] || []), item],
            }));
        } else {
            playSound("incorrect");
            setFeedbackMessage(`Oops! "${item.name}" doesn't belong here. Try again!`);
            setLearnMoreText("");
            setScore((prevScore) => Math.max(0, prevScore - 5));
        }
    }, [currentItems, correctlyPlacedItems, gameIsFullyComplete, showLevelCompleteModal]);


    const handleProceedToNextLevel = () => {
        playSound("click");
        setShowLevelCompleteModal(false);
        setCurrentLevelIndex(prev => prev + 1);
    };

    const handleRestartOrExitGame = () => {
        playSound("click");
        setShowGameCompleteModal(false);
        setGameIsFullyComplete(false); 

        if (isPracticeMode) {
            setHasGameStarted(false); 
            setCurrentLevelIndex(0); 
            setScore(0);
            setStartTime(null);
            setTimeTaken(0);
        } else {
            if (classroomId) navigate(`/student/classrooms/${classroomId}`);
            else navigate("/student/dashboard");
        }
    };
  
    const itemsToDrag = currentItems.filter(item => 
        !Object.values(correctlyPlacedItems).flat().some(placedItem => placedItem.id === item.id)
    );

    // ---- JSX Rendering ----
    if (!hasGameStarted && isPracticeMode) {
        return (
          <>
            <BackgroundMusic musicFile="/audio/Sneaky Business (Biz Baz Studio) - Comedy Background Music (HD).mp3" volume={0.15} />
            <GameLandingPage
              title={gameData.activityName || "Sorting Adventure"}
              subtitle="Test your knowledge by sorting items!"
              description={currentLevelData?.instructions || "Drag items to their correct categories to learn."}
              instruction="Click Start to begin the challenge!"
              onStart={handleStartGame}
              gameIcon="/images/likas-yaman/game-icon.svg" // Match LikasYamanGame
            />
          </>
        );
    }

    if (!currentLevelData || (hasGameStarted && currentItems.length === 0 && gameData.levels.length > 0 && !gameIsFullyComplete)) {
        return <div className={`flex items-center justify-center min-h-screen p-4 text-xl`} style={{ color: colors.text, backgroundColor: colors.cardBg }}>Loading Level Data...</div>;
    }

    if (showLevelCompleteModal) {
        return (
          <>
            <BackgroundMusic musicFile="/audio/Sneaky Business (Biz Baz Studio) - Comedy Background Music (HD).mp3" volume={0.15} />
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[150] p-4 backdrop-blur-sm">
              <LevelCompleteVisual /> {/* Visual effect */}
              <div 
                className="rounded-xl text-center max-w-lg mx-auto p-6 md:p-10 shadow-2xl"
                style={{ background: colors.cardBg, color: colors.text, border: `3px solid ${colors.secondaryAccent}`}}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: colors.secondaryAccent }}>
                  Level {currentLevelIndex + 1} Cleared!
                </h2>
                <p className="text-lg md:text-xl mb-6" style={{ color: colors.text }}>
                  Fantastic work on {currentLevelData?.title || "this level"}!
                </p>
                <p className="text-xl md:text-2xl mb-8 font-semibold" style={{color: colors.text}}>Current Score: {score}</p>
                <button
                  onClick={handleProceedToNextLevel}
                  className="px-8 py-3 text-lg md:text-xl font-bold rounded-full text-white transition-transform hover:scale-105 active:scale-95 shadow-lg"
                  style={{ backgroundColor: colors.interactiveElements }}
                >
                  Next Challenge &rarr;
                </button>
              </div>
            </div>
          </>
        );
    }
    
    if (showGameCompleteModal) { // This implies gameIsFullyComplete is true
        return (
          <>
            <BackgroundMusic musicFile="/audio/Sneaky Business (Biz Baz Studio) - Comedy Background Music (HD).mp3" volume={0.15} />
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[150] p-4 backdrop-blur-md">
              <GrandGameCelebration />
              <div 
                className="rounded-xl text-center max-w-lg mx-auto p-6 md:p-10 shadow-2xl"
                style={{ background: colors.cardBg, color: colors.text, border: `3px solid ${colors.secondaryAccent}`}}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: colors.secondaryAccent }}>
                  Congratulations!
                </h2>
                <p className="text-xl md:text-2xl mb-4" style={{color: colors.text}}>You've mastered the {gameData.activityName || "Sorting Challenge"}!</p>
                <p className="text-2xl md:text-3xl mb-3 font-bold" style={{color: colors.text}}>Final Score: {score}</p>
                <p className="text-md md:text-lg mb-8" style={{color: colors.text, opacity: 0.8}}>Time Taken: {timeTaken} seconds</p>
                <button
                  onClick={handleRestartOrExitGame}
                  className="px-8 py-3 text-lg md:text-xl font-bold rounded-full text-white transition-transform hover:scale-105 active:scale-95 shadow-lg"
                  style={{ backgroundColor: colors.interactiveElements }}
                >
                  {isPracticeMode ? "Play Again" : "Finish"}
                </button>
              </div>
            </div>
          </>
        );
    }

    // Main Game UI - adopting structure from LikasYamanGame
    return (
        <div className={`min-h-screen flex flex-col items-center justify-start pt-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-blue-50'}`}>
        <BackgroundMusic musicFile="/audio/Sneaky Business (Biz Baz Studio) - Comedy Background Music (HD).mp3" volume={0.15} />
        {showCorrectItemCelebration && <CelebrationAnimation />}
        
        {/* Main game content card */}
        <div 
            className="w-full max-w-5xl p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl mx-4 my-4 md:my-8"
            style={{ background: colors.cardBg, color: colors.text, border: `1px solid ${theme === 'dark' ? colors.borderColor : '#e0e7ff'}`}}
        >
            {/* Header: Game Title, Level Info, Score */}
            <div className="text-center mb-4 md:mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-1">
                {gameData.activityName}
            </h1>
            <div className="flex flex-col sm:flex-row justify-around items-center mt-1">
                <p className="text-md md:text-lg text-gray-700 dark:text-gray-300 mb-1 sm:mb-0">
                Level {currentLevelIndex + 1}: {currentLevelData?.title}
                </p>
                <p className="text-lg md:text-xl font-semibold" style={{color: colors.secondaryAccent}}>Score: {score}</p>
            </div>
            </div>

            {/* Feedback Messages */}
            <div 
                className={`p-3 rounded-lg text-center text-sm md:text-base font-medium mb-4 border min-h-[50px] flex items-center justify-center
                ${feedbackMessage.includes("Correct!") || feedbackMessage.includes("Awesome!") ? colors.feedback.correct : 
                feedbackMessage.includes("Oops!") || feedbackMessage.includes("Not quite!") || feedbackMessage.includes("already placed") ? colors.feedback.incorrect : 
                colors.feedback.default}`}
            >
                {feedbackMessage}
            </div>
            {learnMoreText && (
                <div className={`p-3 rounded-lg text-center text-sm md:text-base mb-6 border ${colors.feedback.default} italic`}>
                <strong>Fun Fact:</strong> {learnMoreText}
                </div>
            )}

            {/* Section 1: Items to Sort (Always Above) */}
            <div 
            className="rounded-xl shadow-md p-4 md:p-6 mb-6 md:mb-8 min-h-[160px] md:min-h-[200px]" // Ensure enough height
            style={{ background: theme === 'dark' ? colors.itemsAreaBg : colors.itemsAreaBg }} // Consistent background for items area
            >
            <h3 className="text-lg md:text-xl font-semibold mb-4" style={{ color: colors.text }}>
                Sort These Items ({itemsToDrag.length} left):
            </h3>
            {itemsToDrag.length > 0 ? (
                // This grid layout matches LikasYamanGame's items pool
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 justify-items-center">
                {itemsToDrag.map((item: GameItem) => (
                    <DraggableItem
                    key={item.id}
                    item={item}
                    isPlaced={false} 
                    onDragStartCustom={() => playSound("click")}
                    />
                ))}
                </div>
            ) : (
                <p className="text-center italic py-4" style={{ color: colors.text, opacity: 0.7 }}>
                {currentItems.length > 0 ? "All items for this level are sorted! Well done!" : "Loading items..."}
                </p>
            )}
            </div>

            {/* Section 2: Sorting Bins (Always Below) */}
            <div className="mt-6 space-y-6"> {/* Added margin-top to ensure clear separation */}
                {categories.length === 3 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    {[categories[0], categories[1]].map((category) => (
                        <SortingBin
                        key={category.key}
                        category={category}
                        onDropItem={(item) => handleItemDrop(item.id, category.key)}
                        droppedItemsHere={correctlyPlacedItems[category.key] || []}
                        />
                    ))}
                    <div className="sm:col-span-2 flex justify-center">
                        <div className="w-full sm:w-2/3 md:w-1/2">
                        <SortingBin
                            key={categories[2].key}
                            category={categories[2]}
                            onDropItem={(item) => handleItemDrop(item.id, category.key)}
                            droppedItemsHere={correctlyPlacedItems[categories[2].key] || []}
                        />
                        </div>
                    </div>
                    </div>
                ) : (
                    <div className={`grid grid-cols-1 ${categories.length === 2 || categories.length === 4 ? 'sm:grid-cols-2' : 'sm:grid-cols-1'} gap-4 md:gap-6`}>
                    {categories.map((category: Category) => (
                        <div key={category.key} className={`${categories.length % 2 !== 0 && categories.length > 1 && categories.indexOf(category) === categories.length -1 ? "sm:col-span-full flex justify-center" : "" }`}>
                           <div className={`${categories.length % 2 !== 0 && categories.length > 1 && categories.indexOf(category) === categories.length -1 ? "w-full sm:w-2/3 md:w-1/2" : "w-full" }`}>
                                <SortingBin
                                category={category}
                                onDropItem={(item) => handleItemDrop(item.id, category.key)}
                                droppedItemsHere={correctlyPlacedItems[category.key] || []}
                                />
                            </div>
                        </div>
                    ))}
                    </div>
                )}
            </div>
        </div>
        </div>
    );
};

export default BlankSortingGame;