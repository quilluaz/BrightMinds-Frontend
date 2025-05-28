import React, { useState, useEffect } from "react";
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
import GameLandingPage from "../GameLandingPage";
import BackgroundMusic from "../BackgroundMusic";
import { useNavigate } from "react-router-dom";

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

interface LevelConfiguration {
  level: number;
  pairs: MatchingPair[];
}

interface GameTemplate {
  activityName: string;
  maxScore: number;
  maxExp: number;
  levels: LevelConfiguration[];
}

interface BlankMatchingGameProps {
  isPracticeMode: boolean;
  gameData: GameTemplate;
  assignedGameData?: AssignedGameDTO;
  onGameComplete: (score: number, timeTakenSeconds?: number, expReward?: number) => void;
  classroomId?: string;
  assignedGameId?: string;
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
  const colors = COLORS[theme as ThemeType];
  const navigate = useNavigate();

  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [currentLevelData, setCurrentLevelData] = useState<LevelConfiguration | undefined>(
    gameData.levels.find((l: LevelConfiguration) => l.level === currentLevel)
  );
  const [score, setScore] = useState<number>(0);
  const [cards, setCards] = useState<MatchingCardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<MatchingCardType[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<number[]>([]);
  const [isBoardDisabled, setIsBoardDisabled] = useState<boolean>(false);
  const [hasGameStarted, setHasGameStarted] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [showLevelComplete, setShowLevelComplete] = useState<boolean>(false);
  const [showGameComplete, setShowGameComplete] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeTaken, setTimeTaken] = useState<number>(0);

  useEffect(() => {
    const levelData = gameData.levels.find(
      (l: LevelConfiguration) => l.level === currentLevel
    );
    setCurrentLevelData(levelData);

    if (levelData) {
      const preparedCards: MatchingCardType[] = [];
      levelData.pairs.forEach((pair: MatchingPair) => {
        preparedCards.push({
          id: `pair-${pair.id}-word-${levelData.level}`,
          pairId: pair.id,
          type: "word",
          content: pair.word,
          imageUrl: pair.imageUrl,
          isFaceUp: false,
          isMatched: false,
        });
        preparedCards.push({
          id: `pair-${pair.id}-image-${levelData.level}`,
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
    setCurrentLevel(1);
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
              playSound("gameComplete");
              setShowLevelComplete(true);
            } else {
              playSound("gameComplete");
              setShowGameComplete(true);
              handleGameComplete(score);
            }
          }, 1000);
        }
      } else {
        playSound("incorrect");
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

  const handleNextLevel = (): void => {
    setCurrentLevel((prev) => prev + 1);
    setShowLevelComplete(false);
  };

  const handleGameComplete = (finalScore: number): void => {
    const endTime = Date.now();
    const timeTakenSeconds = startTime ? Math.round((endTime - startTime) / 1000) : 0;
    setTimeTaken(timeTakenSeconds);
    onGameComplete(finalScore, timeTakenSeconds, gameData.maxExp);
  };

  const handlePlayAgain = (): void => {
    setCurrentLevel(1);
    setScore(0);
    setCards([]);
    setFlippedCards([]);
    setMatchedPairIds([]);
    setIsBoardDisabled(false);
    setShowLevelComplete(false);
    setShowGameComplete(false);
    setStartTime(Date.now());
  };

  if (!hasGameStarted) {
    return (
      <div className={`min-h-screen ${colors.cardBg} flex items-center justify-center`}>
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
          <h1 className={`text-3xl font-bold mb-4 ${colors.text}`}>
            {gameData.activityName}
          </h1>
          <p className={`mb-6 ${colors.text}`}>
            Match the words with their corresponding pictures!
          </p>
          <button
            onClick={handleStartGame}
            className={`${colors.secondaryAccent} text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity`}
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${colors.cardBg} py-8 px-4`}>
      <BackgroundMusic musicFile="/assets/audio/background-music.mp3" />
      {showGameComplete && <GameCompleteCelebration />}
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold text-center mb-2 ${colors.text}`}>
            {gameData.activityName}
          </h1>
          <p className={`text-center ${colors.text}`}>
            Level {currentLevel} of {gameData.levels.length}
          </p>
        </div>

        <MatchingGameBoard
          cards={cards}
          handleCardClick={handleCardClick}
          isBoardDisabled={isBoardDisabled}
        />

        {showLevelComplete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <h2 className={`text-2xl font-bold mb-4 ${colors.text}`}>
                Level Complete!
              </h2>
              <p className={`mb-6 ${colors.text}`}>
                Great job! Ready for the next level?
              </p>
              <button
                onClick={handleNextLevel}
                className={`${colors.secondaryAccent} text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity`}
              >
                Next Level
              </button>
            </div>
          </div>
        )}

        {showGameComplete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <h2 className={`text-2xl font-bold mb-4 ${colors.text}`}>
                Game Complete!
              </h2>
              <p className={`text-xl mb-4 ${colors.text}`}>
                Your score: {score}
              </p>
              <p className={`mb-6 ${colors.text}`}>
                Time taken: {timeTaken} seconds
              </p>
              <button
                onClick={handlePlayAgain}
                className={`${colors.secondaryAccent} text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity`}
              >
                Play Again
              </button>
            </div>
          </div>
        )}

        {showCelebration && <CelebrationAnimation />}
      </div>
    </div>
  );
};

export default BlankMatchingGame; 