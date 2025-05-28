import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DraggableItem from "./DraggableItem";
import SortingBin from "./SortingBin";
import "./Game.css";
import { useTheme } from "../../../context/ThemeContext";
import {
  CelebrationAnimation,
  GameCompleteCelebration,
  animationStyles,
} from "../Selina/GameConfigurations";
import GameLandingPage from "../GameLandingPage";
import BackgroundMusic from "../BackgroundMusic";
import { AssignedGameDTO } from "../../../types";
import { GameItem, Category, GameLevel } from "./GameData";

// Color palette for container and text
const COLORS = {
  light: {
    cardBg: "#fff",
    text: "#1A1B41",
    secondaryAccent: "#FFA500",
    feedback: {
      correct: "bg-green-100 text-green-800",
      incorrect: "bg-red-100 text-red-800",
      default: "bg-blue-100 text-blue-800",
    },
  },
  dark: {
    cardBg: "#23244a",
    text: "#E8F9FF",
    secondaryAccent: "#FFA500",
    feedback: {
      correct: "bg-green-900 text-green-200",
      incorrect: "bg-red-900 text-red-200",
      default: "bg-blue-900 text-blue-200",
    },
  },
} as const;

type ThemeType = keyof typeof COLORS;

// Sound effect functions
const playSound = (
  soundType: "correct" | "incorrect" | "levelComplete" | "click"
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
      gainNode.gain.exponentialRampToValueAtTime(
        0.00001,
        audioContext.currentTime + 0.3
      );
      break;
    case "incorrect":
      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.00001,
        audioContext.currentTime + 0.4
      );
      break;
    case "levelComplete":
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.00001,
        audioContext.currentTime + 0.5
      );
      break;
    case "click":
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.00001,
        audioContext.currentTime + 0.1
      );
      break;
    default:
      return;
  }
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
};

// Grand Celebration Component
const GrandCelebration: React.FC = () => {
  const emojis = [
    "🎉", "🎊", "✨", "🌟", "🎈", "🎆", "🏆", "👑", "🥇", "🥳",
    "💎", "🎶", "💐", "🪅"
  ] as const;
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-burst">
        <div className="text-9xl drop-shadow-2xl">🏆</div>
        <div className="text-4xl font-extrabold text-yellow-400 mt-4 animate-fadein">
          Congratulations! You've Completed the Game!
        </div>
      </div>
      {[...Array(80)].map((_, i) => (
        <div
          key={`grand-emoji-${i}`}
          className="absolute animate-complete-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 0.5}s`,
            fontSize: `${2 + Math.random() * 4}rem`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}>
          {emojis[Math.floor(Math.random() * emojis.length)]}
        </div>
      ))}
      {[...Array(50)].map((_, i) => (
        <div
          key={`grand-sparkle-${i}`}
          className="absolute animate-sparkle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 0.5}s`,
            fontSize: `${1.5 + Math.random()}rem`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}>
          ✨
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
  assignedGameData,
  onGameComplete,
  classroomId,
  assignedGameId,
}) => {
  const { theme } = useTheme();
  const colors = COLORS[theme as ThemeType];
  const navigate = useNavigate();

  const [hasGameStarted, setHasGameStarted] = useState<boolean>(
    isPracticeMode ? false : true
  );
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [currentLevelData, setCurrentLevelData] = useState<GameLevel>(
    gameData.levels[currentLevelIndex]
  );
  const [currentItems, setCurrentItems] = useState<GameItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [correctlyPlacedItems, setCorrectlyPlacedItems] = useState<
    Record<string, GameItem[]>
  >({});
  const [score, setScore] = useState<number>(0);
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [learnMoreText, setLearnMoreText] = useState<string>("");
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [showCorrectCelebration, setShowCorrectCelebration] = useState<boolean>(false);
  const [showGrandCelebration, setShowGrandCelebration] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeTaken, setTimeTaken] = useState<number>(0);

  useEffect(() => {
    if (hasGameStarted && !startTime) {
      setStartTime(Date.now());
    }
  }, [hasGameStarted, startTime]);

  useEffect(() => {
    if (currentLevelData) {
      setCurrentItems(currentLevelData.items);
      setCategories(currentLevelData.categories);
      setCorrectlyPlacedItems({});
    }
  }, [currentLevelData]);

  const handleStartGame = (): void => {
    setHasGameStarted(true);
    setStartTime(Date.now());
  };

  const handleItemDrop = (itemId: string, categoryKey: string): void => {
    const item = currentItems.find((i: GameItem) => i.id === itemId);
    if (!item) return;

    const isCorrect = item.categoryKey === categoryKey;
    const category = categories.find((c: Category) => c.key === categoryKey);

    if (isCorrect) {
      playSound("correct");
      setShowCorrectCelebration(true);
      setFeedbackMessage("Correct!");
      setLearnMoreText(item.learnMore || "");

      setCorrectlyPlacedItems((prev: Record<string, GameItem[]>) => ({
        ...prev,
        [categoryKey]: [...(prev[categoryKey] || []), item],
      }));

      // Check if all items are correctly placed
      const allCorrect = currentItems.every((i: GameItem) =>
        correctlyPlacedItems[i.categoryKey]?.some((ci: GameItem) => ci.id === i.id)
      );

      if (allCorrect) {
        playSound("levelComplete");
        setShowCelebration(true);
        setTimeout(() => {
          if (currentLevelIndex < gameData.levels.length - 1) {
            handleNextLevel();
          } else {
            handleGameComplete();
          }
        }, 2000);
      }
    } else {
      playSound("incorrect");
      setFeedbackMessage("Try again!");
      setLearnMoreText("");
    }
  };

  const handleNextLevel = (): void => {
    const nextLevelIndex = currentLevelIndex + 1;
    if (nextLevelIndex < gameData.levels.length) {
      setCurrentLevelIndex(nextLevelIndex);
      setCurrentLevelData(gameData.levels[nextLevelIndex]);
      setShowCelebration(false);
      setShowCorrectCelebration(false);
    } else {
      handleGameComplete();
    }
  };

  const handleGameComplete = (): void => {
    const endTime = Date.now();
    const timeTakenSeconds = startTime
      ? Math.round((endTime - startTime) / 1000)
      : 0;
    setTimeTaken(timeTakenSeconds);
    setShowGrandCelebration(true);
    onGameComplete(score, timeTakenSeconds, gameData.maxExp);
  };

  const handlePlayAgain = (): void => {
    setCurrentLevelIndex(0);
    setCurrentLevelData(gameData.levels[0]);
    setScore(0);
    setShowCelebration(false);
    setShowCorrectCelebration(false);
    setShowGrandCelebration(false);
    setStartTime(Date.now());
  };

  if (!hasGameStarted) {
    return (
      <GameLandingPage
        title={gameData.activityName}
        subtitle="Test your knowledge!"
        description="Sort the items into their correct categories!"
        instruction={currentLevelData.instructions}
        onStart={handleStartGame}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <BackgroundMusic musicFile="/assets/audio/background-music.mp3" />
      {showGrandCelebration && <GrandCelebration />}
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">
            {gameData.activityName}
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300">
            Level {currentLevelIndex + 1}: {currentLevelData.title}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Items to sort */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Items to Sort</h2>
            <div className="grid grid-cols-2 gap-4">
              {currentItems.map((item: GameItem) => (
                <DraggableItem
                  key={item.id}
                  item={item}
                  isPlaced={Object.values(correctlyPlacedItems).some((items: GameItem[]) =>
                    items.some((i: GameItem) => i.id === item.id)
                  )}
                  onDragStartCustom={() => playSound("click")}
                />
              ))}
            </div>
          </div>

          {/* Sorting bins */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Categories</h2>
            <div className="grid grid-cols-1 gap-4">
              {categories.map((category: Category) => (
                <SortingBin
                  key={category.key}
                  category={category}
                  onDropItem={(item: GameItem) => handleItemDrop(item.id, category.key)}
                  droppedItemsHere={correctlyPlacedItems[category.key] || []}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Feedback and learn more section */}
        {(feedbackMessage || learnMoreText) && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            {feedbackMessage && (
              <p className={`text-lg font-semibold ${colors.feedback.default}`}>
                {feedbackMessage}
              </p>
            )}
            {learnMoreText && (
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                {learnMoreText}
              </p>
            )}
          </div>
        )}

        {/* Game controls */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={handlePlayAgain}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Play Again
          </button>
        </div>
      </div>

      {showCelebration && <CelebrationAnimation />}
      {showCorrectCelebration && <GameCompleteCelebration />}
    </div>
  );
};

export default BlankSortingGame; 