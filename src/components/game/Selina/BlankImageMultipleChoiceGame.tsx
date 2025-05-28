import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { playSound, SoundType, CelebrationAnimation, GameCompleteCelebration, animationStyles } from './GameConfigurations';
import BackgroundMusic from '../BackgroundMusic';
import { AssignedGameDTO } from '../../../types';
import { useNavigate } from 'react-router-dom';

// Color Palette
const COLORS = {
  light: {
    primaryBackground: '#E8F9FF',
    primaryText: '#1A1B41',
    interactiveElements: '#7A89C2',
    primaryAccent: '#DBD053',
    secondaryAccent: '#FFA500',
    neutralBackground: '#FFFFFF',
    cardBackground: '#FFFFFF',
    borderColor: 'transparent',
    hoverBg: 'bg-slate-200',
  },
  dark: {
    primaryBackground: '#1A1B41',
    primaryText: '#E8F9FF',
    interactiveElements: '#9BA8E5',
    primaryAccent: '#DBD053',
    secondaryAccent: '#FFA500',
    neutralBackground: '#2A2B51',
    cardBackground: '#2A2B51',
    borderColor: '#3A3B61',
    hoverBg: 'bg-slate-700',
  },
} as const;

type ThemeType = keyof typeof COLORS;

interface Choice {
  id: string;
  imagePlaceholderText: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  questionText: string;
  choices: Choice[];
}

interface GameTemplate {
  activityName: string;
  maxScore: number;
  maxExp: number;
  questions: Question[];
}

interface BlankImageMultipleChoiceGameProps {
  isPracticeMode: boolean;
  gameData: GameTemplate;
  assignedGameData?: AssignedGameDTO;
  onGameComplete: (score: number, timeTakenSeconds?: number, expReward?: number) => void;
  classroomId?: string;
  assignedGameId?: string;
}

const BlankImageMultipleChoiceGame: React.FC<BlankImageMultipleChoiceGameProps> = ({
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

  const [hasGameStarted, setHasGameStarted] = useState<boolean>(isPracticeMode ? false : true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean>(false);
  const [showScore, setShowScore] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [showGameCompleteCelebration, setShowGameCompleteCelebration] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeTaken, setTimeTaken] = useState<number>(0);

  const currentQuestion = gameData.questions[currentQuestionIndex];

  useEffect(() => {
    if (hasGameStarted && !startTime) {
      setStartTime(Date.now());
    }
  }, [hasGameStarted, startTime]);

  const handleStartGame = (): void => {
    playSound('click');
    setHasGameStarted(true);
    setStartTime(Date.now());
  };

  const handleAnswerSelection = (choiceId: string): void => {
    if (showFeedback) return;

    playSound('click');

    const choice = currentQuestion.choices.find((c: Choice) => c.id === choiceId);
    if (choice) {
      setSelectedAnswer(choiceId);
      const correct = choice.isCorrect;
      setIsAnswerCorrect(correct);
      let newScore = score;

      if (correct) {
        playSound('correct');
        newScore += 1;
        setScore(newScore);
        setShowCelebration(true);
      } else {
        playSound('incorrect');
      }

      setShowFeedback(true);

      setTimeout(() => {
        setShowFeedback(false);
        setSelectedAnswer(null);
        setShowCelebration(false);

        if (currentQuestionIndex < gameData.questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
          handleGameComplete(newScore);
        }
      }, 2000);
    }
  };

  const handleGameComplete = (finalScore: number): void => {
    const endTime = Date.now();
    const timeTakenSeconds = startTime ? Math.round((endTime - startTime) / 1000) : 0;
    setTimeTaken(timeTakenSeconds);
    setShowGameCompleteCelebration(true);
    onGameComplete(finalScore, timeTakenSeconds, gameData.maxExp);
  };

  const restartGame = (): void => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setShowScore(false);
    setShowCelebration(false);
    setShowGameCompleteCelebration(false);
    setStartTime(Date.now());
  };

  const isImagePath = (text: string): boolean => {
    return text.startsWith('/') || text.startsWith('http');
  };

  if (!hasGameStarted) {
    return (
      <div className={`min-h-screen ${colors.primaryBackground} flex items-center justify-center`}>
        <div className={`${colors.cardBackground} p-8 rounded-lg shadow-lg max-w-2xl w-full`}>
          <h1 className={`text-3xl font-bold mb-4 ${colors.primaryText}`}>
            {gameData.activityName}
          </h1>
          <p className={`mb-6 ${colors.primaryText}`}>
            Test your knowledge with multiple choice questions!
          </p>
          <button
            onClick={handleStartGame}
            className={`${colors.interactiveElements} text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity`}
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${colors.primaryBackground} py-8 px-4`}>
      <BackgroundMusic musicFile="/assets/audio/background-music.mp3" />
      {showGameCompleteCelebration && <GameCompleteCelebration />}
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold text-center mb-2 ${colors.primaryText}`}>
            {gameData.activityName}
          </h1>
          <p className={`text-center ${colors.primaryText}`}>
            Question {currentQuestionIndex + 1} of {gameData.questions.length}
          </p>
        </div>

        <div className={`${colors.cardBackground} rounded-lg shadow-lg p-6 mb-8`}>
          <h2 className={`text-xl font-semibold mb-4 ${colors.primaryText}`}>
            {currentQuestion.questionText}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.choices.map((choice: Choice) => (
              <button
                key={choice.id}
                onClick={() => handleAnswerSelection(choice.id)}
                disabled={showFeedback}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedAnswer === choice.id
                    ? isAnswerCorrect
                      ? 'border-green-500 bg-green-100'
                      : 'border-red-500 bg-red-100'
                    : `${colors.borderColor} ${colors.hoverBg}`
                }`}
              >
                {isImagePath(choice.imagePlaceholderText) ? (
                  <img
                    src={choice.imagePlaceholderText}
                    alt={`Choice ${choice.id}`}
                    className="w-full h-48 object-cover rounded"
                  />
                ) : (
                  <p className={`${colors.primaryText}`}>{choice.imagePlaceholderText}</p>
                )}
              </button>
            ))}
          </div>
        </div>

        {showScore && (
          <div className={`${colors.cardBackground} rounded-lg shadow-lg p-6 text-center`}>
            <h2 className={`text-2xl font-bold mb-4 ${colors.primaryText}`}>
              Game Complete!
            </h2>
            <p className={`text-xl mb-4 ${colors.primaryText}`}>
              Your score: {score} out of {gameData.questions.length}
            </p>
            <p className={`mb-6 ${colors.primaryText}`}>
              Time taken: {timeTaken} seconds
            </p>
            <button
              onClick={restartGame}
              className={`${colors.interactiveElements} text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity`}
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      {showCelebration && <CelebrationAnimation />}
    </div>
  );
};

export default BlankImageMultipleChoiceGame; 