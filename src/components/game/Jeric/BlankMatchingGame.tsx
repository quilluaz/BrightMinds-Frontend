import React, { useState, useEffect, useCallback } from "react";
import MatchingGameBoard from "./MatchingGameBoard";
import {
  MatchingPair,
  MatchingCard as MatchingCardType,
  AssignedGameDTO,
} from "../../../types";
import shuffleArray from "../../../utils/shuffleArray";
import {
  playSound,
  CelebrationAnimation,
  GameCompleteCelebration,
  animationStyles,
} from "./GameConfigurations";
import { useTheme } from "../../../context/ThemeContext";
// Removed GameLandingPage import as we are creating the UI inline
import BackgroundMusic from "../BackgroundMusic";
import { useNavigate } from "react-router-dom";

// Color palette for container and text (remains the same)
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
    cardBg: "#23244a", // Card background for dark theme
    text: "#E8F9FF", // Text color for dark theme (on dark cardBg)
    secondaryAccent: "#FFA500",
    feedback: {
      correct: "bg-green-900 text-green-200",
      incorrect: "bg-red-900 text-red-200",
      default: "bg-blue-900 text-blue-200",
    },
  },
} as const;

type ThemeType = keyof typeof COLORS;

interface LevelConfiguration {
  level: number;
  title: string; // Added title to LevelConfiguration if it's used per level
  pairs: MatchingPair[];
}

// This GameTemplate must match what AttemptGamePage provides
interface GameTemplate {
  activityName: string;
  maxScore: number;
  maxExp: number;
  levels: LevelConfiguration[];
}

interface BlankMatchingGameProps {
  isPracticeMode: boolean;
  gameData: GameTemplate; // This will contain activityName, levels etc.
  assignedGameData?: AssignedGameDTO;
  onGameComplete: (
    score: number,
    timeTakenSeconds?: number,
    expReward?: number
  ) => void;
  classroomId?: string;
  assignedGameId?: string;
  gameCompleted?: boolean;
}

const BlankMatchingGame: React.FC<BlankMatchingGameProps> = ({
  isPracticeMode,
  gameData,
  assignedGameData,
  onGameComplete,
  classroomId,
  assignedGameId,
}) => {
  const { theme } = useTheme();
  const colors = COLORS[theme as ThemeType]; // colors.cardBg and colors.text will be used
  const navigate = useNavigate();

  // For assigned games (isPracticeMode = false), start the game directly.
  // For practice mode, hasGameStarted is false initially to show the landing/confirmation.
  const [hasGameStarted, setHasGameStarted] = useState<boolean>(
    !isPracticeMode
  );

  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [currentLevelData, setCurrentLevelData] = useState<
    LevelConfiguration | undefined
  >(gameData.levels.find((l: LevelConfiguration) => l.level === currentLevel));
  const [score, setScore] = useState<number>(0);
  const [cards, setCards] = useState<MatchingCardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<MatchingCardType[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<number[]>([]);
  const [isBoardDisabled, setIsBoardDisabled] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [showLevelComplete, setShowLevelComplete] = useState<boolean>(false);
  const [showGameComplete, setShowGameComplete] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeTaken, setTimeTaken] = useState<number>(0);

  useEffect(() => {
    const levelConfig = gameData.levels.find(
      (l: LevelConfiguration) => l.level === currentLevel
    );
    setCurrentLevelData(levelConfig);

    if (levelConfig) {
      const preparedCards: MatchingCardType[] = [];
      levelConfig.pairs.forEach((pair: MatchingPair) => {
        preparedCards.push({
          id: `pair-${pair.id}-word-${levelConfig.level}`,
          pairId: pair.id,
          type: "word",
          content: pair.word,
          imageUrl: pair.imageUrl,
          isFaceUp: false,
          isMatched: false,
        });
        preparedCards.push({
          id: `pair-${pair.id}-image-${levelConfig.level}`,
          pairId: pair.id,
          type: "picture",
          content: pair.english,
          imageUrl: pair.imageUrl,
          isFaceUp: false,
          isMatched: false,
        });
      });
      setCards(shuffleArray(preparedCards));
      setFlippedCards([]);
      setMatchedPairIds([]);
      setIsBoardDisabled(false);
      setShowLevelComplete(false);
      setShowGameComplete(false);
    }
  }, [currentLevel, gameData.levels]);

  useEffect(() => {
    if (!document.getElementById("matching-game-animations")) {
      const styleSheet = document.createElement("style");
      styleSheet.id = "matching-game-animations";
      styleSheet.innerText = animationStyles;
      document.head.appendChild(styleSheet);
    }
  }, []);

  const handleStartGame = (): void => {
    playSound("click");
    setCurrentLevel(1); // Reset to level 1 if starting/restarting practice
    setScore(0); // Reset score
    setHasGameStarted(true);
    setShowLevelComplete(false);
    setShowGameComplete(false);
    setStartTime(Date.now());
  };

  const handleCardClick = (clickedCardId: string): void => {
    if (isBoardDisabled || flippedCards.length >= 2 || !currentLevelData) {
      return;
    }
    const cardToFlip = cards.find((c) => c.id === clickedCardId);
    if (!cardToFlip || cardToFlip.isFaceUp || cardToFlip.isMatched) {
      return;
    }
    playSound("flip");
    const newCards = cards.map((card) =>
      card.id === clickedCardId ? { ...card, isFaceUp: true } : card
    );
    setCards(newCards);
    const newlyFlippedCard = newCards.find((c) => c.id === clickedCardId)!;
    const currentFlipped = [...flippedCards, newlyFlippedCard];
    setFlippedCards(currentFlipped);

    if (currentFlipped.length === 2) {
      setIsBoardDisabled(true);
      const [firstCard, secondCard] = currentFlipped;
      if (firstCard.pairId === secondCard.pairId) {
        playSound("match");
        const newMatchedPairIds = [...matchedPairIds, firstCard.pairId];
        setMatchedPairIds(newMatchedPairIds);
        setScore((prevScore) => prevScore + 10);
        setCards((prevCards) =>
          prevCards.map((card) =>
            card.pairId === firstCard.pairId
              ? { ...card, isMatched: true, isFaceUp: true }
              : card
          )
        );
        setFlippedCards([]);
        setIsBoardDisabled(false);
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 1200);
        if (newMatchedPairIds.length === currentLevelData.pairs.length) {
          setTimeout(() => {
            if (currentLevel < gameData.levels.length) {
              playSound("levelComplete");
              setShowLevelComplete(true);
            } else {
              playSound("gameComplete");
              setShowGameComplete(true);
              // Score is already updated from the last match
              handleGameCompletion(score + 10); // Pass the latest score
            }
          }, 1000);
        }
      } else {
        playSound("incorrect");
        setScore((prevScore) => Math.max(0, prevScore - 5)); // Penalty
        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((card) =>
              card.id === firstCard.id || card.id === secondCard.id
                ? { ...card, isFaceUp: false }
                : card
            )
          );
          setFlippedCards([]);
          setIsBoardDisabled(false);
        }, 1000);
      }
    }
  };

  const handleGameCompletion = (finalScore: number) => {
    // Renamed to avoid conflict
    const endTime = Date.now();
    const timeTakenSeconds = startTime
      ? Math.round((endTime - startTime) / 1000)
      : 0;
    setTimeTaken(timeTakenSeconds); // Store time taken
    onGameComplete(finalScore, timeTakenSeconds, gameData.maxExp);
    // Remove automatic navigation - let the parent component handle it
  };

  const handleNextLevel = (): void => {
    playSound("click");
    if (currentLevel < gameData.levels.length) {
      setCurrentLevel((prevLevel) => prevLevel + 1);
      setShowLevelComplete(false); // Hide level complete modal and load next
    }
  };

  const handlePlayAgainOrFinish = () => {
    playSound("click");
    if (isPracticeMode) {
      // Reset for practice mode
      setCurrentLevel(1);
      setScore(0);
      setHasGameStarted(false); // This will show the landing page again
      setShowGameComplete(false);
      setShowLevelComplete(false);
      setStartTime(null);
      setTimeTaken(0);
    } else {
      // For assigned games, 'Finish' navigates away. onGameComplete has already been called.
      if (classroomId) {
        navigate(`/student/classrooms/${classroomId}`);
      } else {
        navigate("/student/dashboard"); // Fallback
      }
    }
  };

  // THIS IS THE PRE-GAME UI THAT WAS "BROKEN"
  if (!hasGameStarted && isPracticeMode) {
    // Only show landing for practice mode
    return (
      <>
        <BackgroundMusic musicFile="/audio/matching-game.mp3" volume={0.15} />
        <div
          className="bg-pattern min-h-screen flex flex-col items-center justify-center p-6"
          // The default text color for the page should contrast with the pattern
          style={{ color: theme === "dark" ? "#E2E8F0" : "#1A1B41" }}>
          <div
            className="p-10 rounded-3xl shadow-xl text-center max-w-xl w-full"
            // Card background from COLORS, text color from COLORS
            style={{ backgroundColor: colors.cardBg, color: colors.text }}>
            <div className="mb-8 flex justify-center">
              <img
                src="/images/matching-game/game-icon.svg"
                alt={gameData.activityName || "Matching Game"}
                className="w-32 h-32 object-contain"
              />
            </div>
            <h1
              className="text-5xl sm:text-6xl font-bold mb-4"
              style={{ color: colors.text }}>
              Welcome to
            </h1>
            <h2
              className="text-4xl sm:text-5xl font-bold mb-8"
              style={{ color: colors.secondaryAccent }}>
              {gameData.activityName || "Matching Game"}
            </h2>
            <p
              className="text-xl sm:text-xl mb-3 opacity-90"
              style={{ color: colors.text }}>
              Test your memory and matching skills!
            </p>
            <p
              className="text-xl sm:text-2xl mb-12 opacity-90"
              style={{ color: colors.text }}>
              Match the cards to find pairs and complete the game.
            </p>
            <p
              className="text-lg mb-8 italic opacity-80"
              style={{
                color:
                  colors.interactiveElements ||
                  (theme === "dark" ? "#9BA8E5" : "#7A89C2"),
              }}>
              Click on cards to flip them and find matching pairs.
            </p>
            <button
              onClick={handleStartGame}
              className="font-bold py-4 px-12 rounded-full text-2xl sm:text-3xl transition duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50 shadow-lg"
              style={{
                backgroundColor: colors.secondaryAccent,
                color: theme === "dark" ? "#1A1B41" : "#FFFFFF", // Ensure button text contrasts with its orange bg
                // @ts-ignore Custom property for focus ring or use Tailwind focus classes
                focusRingColor:
                  colors.primaryAccent ||
                  (theme === "dark" ? "#DBD053" : "#FFA500"),
              }}>
              Start Game
            </button>
          </div>
        </div>
      </>
    );
  }

  if (showLevelComplete) {
    const nextLevelConfig = gameData.levels.find(
      (l) => l.level === currentLevel + 1
    );
    return (
      <div
        className={`bg-pattern min-h-screen flex flex-col items-center justify-center p-6`}
        style={{ color: colors.text }}>
        <GameCompleteCelebration />
        <div
          className={`p-10 rounded-3xl shadow-xl text-center max-w-md w-full`}
          style={{ backgroundColor: colors.cardBg }}>
          <h2
            className="text-5xl font-bold mb-6"
            style={{ color: colors.secondaryAccent }}>
            Level {currentLevelData?.level} Complete!
          </h2>
          <p className="text-3xl mb-10" style={{ color: colors.text }}>
            Great job matching all{" "}
            {currentLevelData?.title || `level ${currentLevelData?.level}`}{" "}
            pairs!
          </p>
          {nextLevelConfig && (
            <button
              onClick={handleNextLevel}
              className="text-white font-bold py-4 px-10 rounded-full text-2xl transition duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 shadow-lg"
              style={{
                backgroundColor: colors.secondaryAccent,
                color: theme === "dark" ? "#1A1B41" : "#FFFFFF",
                /* @ts-ignore */ focusRingColor: colors.primaryAccent,
              }}>
              Next Level:{" "}
              {nextLevelConfig.title || `Level ${nextLevelConfig.level}`}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (showGameComplete) {
    return (
      <div
        className={`bg-pattern min-h-screen flex flex-col items-center justify-center p-6`}
        style={{ color: colors.text }}>
        <GameCompleteCelebration />{" "}
        {/* Or your GrandCelebration if preferred */}
        <div
          className={`p-10 rounded-3xl shadow-xl text-center max-w-md w-full`}
          style={{ backgroundColor: colors.cardBg }}>
          <h2
            className="text-5xl font-bold mb-6"
            style={{ color: colors.secondaryAccent }}>
            Congratulations!
          </h2>
          <p className="text-3xl mb-2" style={{ color: colors.text }}>
            You've matched all pairs in all levels!
          </p>
          <p className="text-2xl mb-10" style={{ color: colors.text }}>
            Final Score: <span className="font-bold">{score}</span>
          </p>
          <button
            onClick={handlePlayAgainOrFinish}
            className="text-white font-bold py-4 px-10 rounded-full text-2xl transition duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 shadow-lg"
            style={{
              backgroundColor: colors.secondaryAccent,
              color: theme === "dark" ? "#1A1B41" : "#FFFFFF",
              /* @ts-ignore */ focusRingColor: colors.primaryAccent,
            }}>
            {isPracticeMode ? "Play Again" : "Finish"}
          </button>
        </div>
      </div>
    );
  }

  if (!currentLevelData || cards.length === 0) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ color: colors.text }}>
        Loading Level {currentLevel}...
      </div>
    );
  }

  return (
    <>
      <BackgroundMusic musicFile="/audio/matching-game.mp3" volume={0.15} />
      <div
        className="container mx-auto px-4 py-8"
        style={{ color: colors.text }}>
        {showCelebration && <CelebrationAnimation />}
        <h1 className="text-3xl font-bold text-center mb-2">
          Level {currentLevelData.level}:{" "}
          {currentLevelData.title || gameData.activityName}
        </h1>
        <p className="text-xl text-center mb-6" style={{ opacity: 0.8 }}>
          Match the pairs! Your Score:{" "}
          <span style={{ color: colors.secondaryAccent, fontWeight: "bold" }}>
            {score}
          </span>
        </p>
        <MatchingGameBoard
          cards={cards}
          handleCardClick={handleCardClick}
          isBoardDisabled={isBoardDisabled}
        />
      </div>
    </>
  );
};

export default BlankMatchingGame;
