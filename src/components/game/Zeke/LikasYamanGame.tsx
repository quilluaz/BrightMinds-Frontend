import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { gameLevels, GameItem, Category, GameLevel } from "./GameData";
import DraggableItem from "./DraggableItem"; // Keep if your UI uses it
import SortingBin from "./SortingBin"; // Keep if your UI uses it
import "./Game.css";
import { useTheme } from "../../../context/ThemeContext";
import {
  CelebrationAnimation,
  GameCompleteCelebration,
  animationStyles,
} from "../Selina/GameConfigurations"; // Assuming Selina's config is general enough
import GameLandingPage from "../GameLandingPage";
import BackgroundMusic from "../BackgroundMusic";
import { AssignedGameDTO } from "../../../types"; // For assignedGameData prop

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
};

// --- Sound Effect Placeholder Functions ---
const playSound = (
  soundType: "correct" | "incorrect" | "levelComplete" | "click"
) => {
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
    "🎉",
    "🎊",
    "✨",
    "🌟",
    "🎈",
    "🎆",
    "🏆",
    "👑",
    "🥇",
    "🥳",
    "💎",
    "🎶",
    "💐",
    "🪅",
  ];
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-burst">
        <div className="text-9xl drop-shadow-2xl">🏆</div>
        <div className="text-4xl font-extrabold text-yellow-400 mt-4 animate-fadein">
          Congratulations! You are a Resource Master!
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

interface LikasYamanGameProps {
  isPracticeMode: boolean;
  assignedGameData?: AssignedGameDTO; // Data if game is assigned
  onGameComplete: (
    score: number,
    timeTakenSeconds?: number,
    expReward?: number
  ) => void; // Callback
  classroomId?: string; // Optional: for navigation or context
  assignedGameId?: string; // Optional
}

const LikasYamanGame: React.FC<LikasYamanGameProps> = ({
  isPracticeMode,
  assignedGameData,
  onGameComplete,
  classroomId,
  assignedGameId,
}) => {
  const { theme } = useTheme();
  const colors = COLORS[theme];
  const navigate = useNavigate();

  // Determine active game levels: from assigned data or default
  // For this specific request, we keep it simple and use local `gameLevels`.
  // A more robust solution would parse `assignedGameData.game.gameData` if it's structured for this game.
  const activeGameLevels = gameLevels; // Using default for now.

  const [hasGameStarted, setHasGameStarted] = useState(
    isPracticeMode ? false : true
  );
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [currentLevelData, setCurrentLevelData] = useState<GameLevel>(
    activeGameLevels[currentLevelIndex]
  );
  const [currentItems, setCurrentItems] = useState<GameItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [correctlyPlacedItems, setCorrectlyPlacedItems] = useState<
    Record<string, GameItem[]>
  >({});
  const [score, setScore] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [learnMoreText, setLearnMoreText] = useState("");
  const [showCelebration, setShowCelebration] = useState(false); // Item correct
  const [showCorrectCelebration, setShowCorrectCelebration] = useState(false); // Item correct - can consolidate
  const [showLevelCelebration, setShowLevelCelebration] = useState(false); // Level complete
  const [showGrandCelebration, setShowGrandCelebration] = useState(false); // All levels complete
  const [gameComplete, setGameComplete] = useState(false); // Entire game (all levels) done

  const handleStartGame = () => {
    playSound("click");
    setHasGameStarted(true);
    // Initialization of level 0 will happen in useEffect based on hasGameStarted
  };

  const initializeLevel = useCallback(
    (levelIdx: number) => {
      setShowCelebration(false);
      setShowCorrectCelebration(false);
      setShowLevelCelebration(false);

      const levelData = activeGameLevels[levelIdx];
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
        setLearnMoreText("");
        setGameComplete(false); // Ensure game is not marked complete at start of a new level
      }
    },
    [activeGameLevels]
  );

  useEffect(() => {
    if (hasGameStarted || !isPracticeMode) {
      initializeLevel(currentLevelIndex);
    }
  }, [currentLevelIndex, hasGameStarted, isPracticeMode, initializeLevel]);

  useEffect(() => {
    if (!document.getElementById("likas-yaman-animations")) {
      const styleSheet = document.createElement("style");
      styleSheet.id = "likas-yaman-animations";
      styleSheet.innerText = animationStyles;
      document.head.appendChild(styleSheet);
    }
  }, []);

  const handleDropItem = useCallback(
    (droppedItem: GameItem, targetCategoryKey: Category["key"]) => {
      setLearnMoreText("");

      if (
        correctlyPlacedItems[targetCategoryKey]?.find(
          (i) => i.id === droppedItem.id
        )
      ) {
        setFeedbackMessage(`You already placed "${droppedItem.name}" there!`);
        return;
      }

      if (droppedItem.categoryKey === targetCategoryKey) {
        playSound("correct");
        setScore((prevScore) => prevScore + 10); // Award points for correct placement
        const categoryName =
          categories.find((c) => c.key === targetCategoryKey)?.title ||
          "the correct category";
        setFeedbackMessage(
          `Correct! "${droppedItem.name}" is a ${categoryName}. ${
            droppedItem.careTip || ""
          }`
        );

        if (droppedItem.learnMore) {
          setLearnMoreText(`Fun Fact: ${droppedItem.learnMore}`);
        }

        setCorrectlyPlacedItems((prev) => {
          const newPlacedItems = { ...prev };
          if (!newPlacedItems[targetCategoryKey]) {
            newPlacedItems[targetCategoryKey] = [];
          }
          newPlacedItems[targetCategoryKey] = [
            ...newPlacedItems[targetCategoryKey],
            droppedItem,
          ];
          return newPlacedItems;
        });
        setShowCorrectCelebration(true);
        setTimeout(() => setShowCorrectCelebration(false), 1200);
      } else {
        playSound("incorrect");
        setScore((prevScore) => Math.max(0, prevScore - 5)); // Penalize for incorrect placement
        setFeedbackMessage(
          `Not quite! Try to figure out where "${droppedItem.name}" belongs.`
        );
      }
    },
    [categories, correctlyPlacedItems]
  );

  useEffect(() => {
    // Check if all items for the current level are placed
    if (
      currentItems.length > 0 &&
      Object.values(correctlyPlacedItems).some((arr) => arr.length > 0)
    ) {
      const allLevelItemsCorrectlyPlaced = currentItems.every((item) =>
        Object.values(correctlyPlacedItems)
          .flat()
          .some((placedItem) => placedItem.id === item.id)
      );

      if (
        allLevelItemsCorrectlyPlaced &&
        !showLevelCelebration &&
        !gameComplete
      ) {
        playSound("levelComplete");
        setFeedbackMessage(
          `Awesome! You've mastered ${currentLevelData.title}!`
        );
        setLearnMoreText("");
        setShowLevelCelebration(true); // Trigger level complete visual/modal

        // IMPORTANT: This timeout is for visual delay. The actual game logic (score submission) happens after this.
        setTimeout(() => {
          // setShowLevelCelebration(false); // Hide the level celebration modal after its duration
          if (currentLevelIndex === activeGameLevels.length - 1) {
            // Last level
            setShowGrandCelebration(true);
            setGameComplete(true); // Mark the entire game as complete
            if (!isPracticeMode) {
              // Score already includes points for the last correct moves.
              // No need to add +10 again here if score state is accurately updated on each correct move.
              onGameComplete(score);
            }
          } else {
            // If not the last level, the level complete modal will have a "Next Level" button.
            // No automatic progression here, user clicks to proceed.
          }
        }, 2000); // Duration of level complete celebration display
      }
    }
  }, [
    correctlyPlacedItems,
    currentItems,
    currentLevelData.title,
    currentLevelIndex,
    score,
    isPracticeMode,
    onGameComplete,
    showLevelCelebration,
    gameComplete,
    activeGameLevels.length,
  ]);

  const handleNextLevel = () => {
    playSound("click");
    setShowLevelCelebration(false); // Close the level complete modal
    if (currentLevelIndex < activeGameLevels.length - 1) {
      setCurrentLevelIndex((prevIndex) => prevIndex + 1);
      // Level re-initialization will be handled by the useEffect watching currentLevelIndex
    }
  };

  const handlePlayAgain = () => {
    // This is for the "Play Again" button on the final game complete screen
    playSound("click");
    if (isPracticeMode) {
      setHasGameStarted(false); // Go back to landing page for practice mode
      // Reset all states for a clean slate if they start again from landing
      setCurrentLevelIndex(0);
      setScore(0);
      setShowGrandCelebration(false);
      setGameComplete(false);
      // Feedback and learnMore will be reset by initializeLevel if game starts
    } else {
      // For assigned games, "Finish" button is more appropriate, which is handled by onGameComplete
      // This function might not be directly called if onGameComplete navigates away.
      // If it IS called, it means the user chose to "finish" after seeing the score.
      if (classroomId) {
        navigate(`/student/classrooms/${classroomId}`);
      } else {
        navigate("/student/dashboard"); // Fallback
      }
    }
  };

  const itemsToDrag = currentItems.filter(
    (item) =>
      !Object.values(correctlyPlacedItems)
        .flat()
        .some((placedItem) => placedItem.id === item.id)
  );

  if (!hasGameStarted && isPracticeMode) {
    return (
      <>
        <BackgroundMusic
          musicFile="/audio/Sneaky Business (Biz Baz Studio) - Comedy Background Music (HD).mp3"
          volume={0.15}
        />
        <GameLandingPage
          title="Resource Ranger Challenge"
          subtitle="Test your knowledge about natural resources and their proper management!"
          description="Sort the items into their correct categories and become a Resource Master!"
          instruction="Drag and drop items into their correct categories to learn about natural resources."
          onStart={handleStartGame}
          gameIcon="/images/likas-yaman/game-icon.svg"
        />
      </>
    );
  }

  if (
    !currentLevelData ||
    (hasGameStarted && currentItems.length === 0 && activeGameLevels.length > 0)
  ) {
    // Added check for currentItems if game started
    return (
      <>
        <BackgroundMusic
          musicFile="/audio/Sneaky Business (Biz Baz Studio) - Comedy Background Music (HD).mp3"
          volume={0.15}
        />
        <div
          className="flex items-center justify-center min-h-screen p-4"
          style={{ color: colors.text }}>
          Loading Game Adventure...
        </div>
      </>
    );
  }

  // Modal for Level Cleared (but not game complete yet)
  if (
    showLevelCelebration &&
    !gameComplete &&
    currentLevelIndex < activeGameLevels.length - 1
  ) {
    return (
      <>
        <BackgroundMusic
          musicFile="/audio/Sneaky Business (Biz Baz Studio) - Comedy Background Music (HD).mp3"
          volume={0.15}
        />
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            background:
              theme === "dark" ? "rgba(35,36,74,0.8)" : "rgba(255,255,255,0.8)",
            transition: "background 0.3s",
          }}>
          <GameCompleteCelebration /> {/* Using for level complete visual */}
          <div
            className="rounded-xl text-center max-w-xl mx-4 p-8 shadow-2xl"
            style={{
              background: colors.cardBg,
              color: colors.text,
              boxShadow:
                theme === "dark"
                  ? "0 4px 32px 0 rgba(0,0,0,0.7)"
                  : "0 4px 32px 0 rgba(0,0,0,0.15)",
              border:
                theme === "dark"
                  ? "1.5px solid #35366a"
                  : "1.5px solid #e5e5e5",
              transition: "background 0.3s, color 0.3s",
            }}>
            <h2
              className="text-3xl font-bold mb-4"
              style={{ color: colors.secondaryAccent }}>
              Level {currentLevelData.level} Cleared!
            </h2>
            <p className="text-xl mb-6" style={{ color: colors.text }}>
              Current Score: {score}
            </p>
            <button
              onClick={handleNextLevel}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full text-lg transition-colors"
              style={{
                boxShadow: theme === "dark" ? "0 2px 8px #18192f" : undefined,
              }}>
              Next Challenge &rarr;
            </button>
          </div>
        </div>
      </>
    );
  }

  // Modal for Game Complete (All Levels Done)
  if (gameComplete) {
    // This implies showGrandCelebration might also be true
    return (
      <>
        <BackgroundMusic
          musicFile="/audio/Sneaky Business (Biz Baz Studio) - Comedy Background Music (HD).mp3"
          volume={0.15}
        />
        <div
          className="fixed inset-0 flex items-center justify-center z-[110]"
          style={{
            background:
              theme === "dark"
                ? "rgba(35,36,74,0.97)"
                : "rgba(255,255,255,0.97)",
            transition: "background 0.3s",
          }}>
          {showGrandCelebration && <GrandCelebration />}
          <div
            className="rounded-xl text-center max-w-md mx-4 p-10 shadow-2xl"
            style={{
              background: colors.cardBg,
              color: colors.text,
              boxShadow:
                theme === "dark"
                  ? "0 4px 32px 0 rgba(0,0,0,0.7)"
                  : "0 4px 32px 0 rgba(0,0,0,0.15)",
              border:
                theme === "dark"
                  ? "1.5px solid #35366a"
                  : "1.5px solid #e5e5e5",
              transition: "background 0.3s, color 0.3s",
            }}>
            <h2
              className="text-3xl font-extrabold mb-4"
              style={{ color: colors.secondaryAccent }}>
              Congratulations!
            </h2>
            <p className="text-2xl font-bold mb-2">
              You are a Resource Master!
            </p>
            <p className="text-xl mb-6">
              Total Score:{" "}
              <span className="font-extrabold text-orange-500">{score}</span>
            </p>
            <button
              onClick={handlePlayAgain} // This will call onGameComplete for assigned or navigate
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-xl transition-colors shadow-lg"
              style={{
                boxShadow: theme === "dark" ? "0 2px 8px #18192f" : undefined,
              }}>
              {isPracticeMode ? "Play Again" : "Finish"}
            </button>
          </div>
        </div>
      </>
    );
  }

  // Main Game UI
  return (
    <>
      <BackgroundMusic
        musicFile="/audio/Sneaky Business (Biz Baz Studio) - Comedy Background Music (HD).mp3"
        volume={0.15}
      />
      <div
        className="p-6 md:p-10 rounded-3xl shadow-xl text-center max-w-6xl w-full mx-auto my-4 md:my-8"
        style={{ background: colors.cardBg, color: colors.text }}>
        <h1
          className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2"
          style={{ color: colors.text }}>
          Resource Ranger Challenge
        </h1>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
          <h2
            className="text-lg md:text-xl font-semibold"
            style={{ color: colors.text }}>
            {currentLevelData.title}
          </h2>
          <p
            className="text-lg md:text-xl font-bold"
            style={{ color: colors.secondaryAccent }}>
            Score: {score}
          </p>
        </div>
        <p
          className={`p-3 md:p-4 rounded-lg text-center text-md md:text-lg font-medium mb-2 ${
            feedbackMessage.includes("Correct")
              ? colors.feedback.correct
              : feedbackMessage.includes("Not quite")
              ? colors.feedback.incorrect
              : colors.feedback.default
          }`}>
          {feedbackMessage}
        </p>
        {learnMoreText && (
          <p className="p-3 md:p-4 bg-yellow-100 text-yellow-800 rounded-lg text-center text-md md:text-lg mb-2">
            {learnMoreText}
          </p>
        )}
        {showCorrectCelebration && <CelebrationAnimation />}

        <div className="mt-6 space-y-6">
          <div
            className="p-4 md:p-6 rounded-lg shadow-md"
            style={{ background: theme === "dark" ? "#1A1B41" : "#E8F9FF" }}>
            <h3
              className="text-lg md:text-xl font-semibold mb-4"
              style={{ color: colors.text }}>
              Sort These Items ({itemsToDrag.length} left):
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 justify-items-center">
              {itemsToDrag.map((item) => (
                <div key={item.id} className="flex flex-col items-center gap-2">
                  <div
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData(
                        "text/plain",
                        JSON.stringify(item)
                      );
                      playSound("click");
                    }}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow text-lg font-bold cursor-move border-2 border-orange-400 hover:border-blue-400 transition-all select-none overflow-hidden"
                    style={{ backgroundColor: "#FFA500" }}>
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 md:w-16 md:h-16 object-contain"
                        draggable={false}
                      />
                    ) : (
                      item.name[0]
                    )}
                  </div>
                  <span
                    className={`mt-1 text-sm md:text-base font-medium text-center`}
                    style={{ color: colors.text }}>
                    {item.name}
                  </span>
                </div>
              ))}
              {itemsToDrag.length === 0 &&
                currentItems.length > 0 &&
                !showLevelCelebration &&
                !gameComplete && (
                  <p
                    className="text-center italic col-span-full py-4"
                    style={{ color: colors.text, opacity: 0.7 }}>
                    All items for this level are sorted! Processing...
                  </p>
                )}
            </div>
          </div>
          {categories.length === 3 ? ( // Specific layout for 3 categories
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Bins 1 and 2 */}
              {[categories[0], categories[1]].map((category) => (
                <SortingBin // Using the SortingBin component
                  key={category.key}
                  category={category}
                  onDropItem={handleDropItem}
                  droppedItemsHere={correctlyPlacedItems[category.key] || []}
                />
              ))}
              {/* Bin 3 centered below */}
              <div className="sm:col-span-2 flex justify-center">
                <div className="w-full sm:w-1/2">
                  <SortingBin
                    key={categories[2].key}
                    category={categories[2]}
                    onDropItem={handleDropItem}
                    droppedItemsHere={
                      correctlyPlacedItems[categories[2].key] || []
                    }
                  />
                </div>
              </div>
            </div>
          ) : (
            // Default layout for 2 or 4 categories
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((category) => (
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
      </div>
    </>
  );
};

export default LikasYamanGame;
