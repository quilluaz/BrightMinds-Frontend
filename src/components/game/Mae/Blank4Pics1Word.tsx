import React, { useState, ChangeEvent, useRef, KeyboardEvent, useEffect } from 'react';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { Box, TextField, Button as MuiButton, Typography, Theme } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { CelebrationAnimation, GameCompleteCelebration, animationStyles } from '../Selina/GameConfigurations';
import HintModal from './HintModal';
import GameLandingPage from '../GameLandingPage';
import { playSound, WordCelebration, WordGameCompleteCelebration, wordAnimationStyles } from './GameSoundEffects';
import BackgroundMusic from '../BackgroundMusic';
import { useTheme as useAppTheme } from '../../../context/ThemeContext';
import { AssignedGameDTO } from '../../../types';
import { useNavigate } from 'react-router-dom';

interface GameQuestion {
  images: string[];
  answer: string;
  clue: string;
  englishTranslation: string;
  funFact: string;
}

interface GameTemplate {
  activityName: string;
  maxScore: number;
  maxExp: number;
  questions: GameQuestion[];
}

interface Blank4Pics1WordProps {
  isPracticeMode: boolean;
  gameData: GameTemplate;
  assignedGameData?: AssignedGameDTO;
  onGameComplete: (score: number, timeTakenSeconds?: number, expReward?: number) => void;
  classroomId?: string;
  assignedGameId?: string;
}

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

const GameContainer = styled(Box)(({ theme }: { theme: Theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: theme.palette.mode === 'dark' ? '#1A1B41' : '#E8F9F0',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}));

const shakeAnimation = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
`;

const popAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const LetterInput = styled(TextField)<{ isCorrect?: boolean; isWrong?: boolean; isShaking?: boolean; isRevealed?: boolean }>(({ theme, isCorrect, isWrong, isShaking, isRevealed }) => ({
  width: '50px',
  margin: '0 4px',
  animation: isShaking ? `${shakeAnimation} 0.5s ease-in-out` : (isCorrect ? `${popAnimation} 0.6s ease-in-out` : 'none'),
  '& .MuiOutlinedInput-root': {
    height: '55px',
    minHeight: '55px',
    width: '50px',
    minWidth: '50px',
    fontSize: '2rem',
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
    backgroundColor: isCorrect 
      ? theme.palette.success.light
      : isWrong 
        ? theme.palette.error.main
        : isRevealed && !isCorrect
          ? theme.palette.success.light
          : theme.palette.mode === 'dark' ? '#2A2B51' : '#FFFFFF',
    transition: 'background-color 0.3s ease, transform 0.3s ease',
    '& fieldset': {
      borderColor: isCorrect 
        ? theme.palette.success.main
        : isWrong 
          ? theme.palette.error.dark
          : isRevealed && !isCorrect
            ? theme.palette.success.main
            : theme.palette.mode === 'dark' ? '#3A3B61' : '#E0E0E0',
      borderWidth: isCorrect || isWrong || (isRevealed && !isCorrect) ? '2px' : '1px',
    },
    '&:hover fieldset': {
      borderColor: isCorrect 
        ? theme.palette.success.main
        : isWrong 
          ? theme.palette.error.dark
          : isRevealed && !isCorrect
            ? theme.palette.success.main
            : theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: isCorrect 
        ? theme.palette.success.main
        : isWrong 
          ? theme.palette.error.dark
          : isRevealed && !isCorrect
            ? theme.palette.success.main
            : theme.palette.primary.main,
    },
  },
  '& .MuiOutlinedInput-input': {
    color: isCorrect 
      ? theme.palette.success.dark
      : isWrong 
        ? theme.palette.error.contrastText
        : isRevealed && !isCorrect
          ? theme.palette.success.dark
          : theme.palette.text.primary,
    textAlign: 'center',
    padding: '8px',
  },
}));

const Blank4Pics1Word: React.FC<Blank4Pics1WordProps> = ({
  isPracticeMode,
  gameData,
  assignedGameData,
  onGameComplete,
  classroomId,
  assignedGameId,
}) => {
  const { theme } = useAppTheme();
  const muiTheme = useMuiTheme();
  const colors = COLORS[theme as ThemeType];
  const navigate = useNavigate();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [hasGameStarted, setHasGameStarted] = useState<boolean>(isPracticeMode ? false : true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string[]>([]);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [showGameCompleteCelebration, setShowGameCompleteCelebration] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeTaken, setTimeTaken] = useState<number>(0);
  const [revealedLetters, setRevealedLetters] = useState<boolean[]>([]);
  const [attempts, setAttempts] = useState<number>(0);

  const currentQuestion = gameData.questions[currentQuestionIndex];

  useEffect(() => {
    if (hasGameStarted && !startTime) {
      setStartTime(Date.now());
    }
  }, [hasGameStarted, startTime]);

  useEffect(() => {
    if (currentQuestion) {
      setUserAnswer(new Array(currentQuestion.answer.length).fill(''));
      setRevealedLetters(new Array(currentQuestion.answer.length).fill(false));
    }
  }, [currentQuestion]);

  const formatScore = (s: number): string => {
    return s.toString().padStart(2, '0');
  };

  const handleStartGame = (): void => {
    playSound('click');
    setHasGameStarted(true);
    setStartTime(Date.now());
  };

  const revealRandomLetter = (): void => {
    const unrevealedIndices = revealedLetters
      .map((revealed, index) => (!revealed ? index : -1))
      .filter(index => index !== -1);

    if (unrevealedIndices.length > 0) {
      const randomIndex = unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)];
      const newRevealedLetters = [...revealedLetters];
      newRevealedLetters[randomIndex] = true;
      setRevealedLetters(newRevealedLetters);

      const newUserAnswer = [...userAnswer];
      newUserAnswer[randomIndex] = currentQuestion.answer[randomIndex];
      setUserAnswer(newUserAnswer);

      if (inputRefs.current[randomIndex]) {
        inputRefs.current[randomIndex]?.focus();
      }
    }
  };

  const handleLetterChange = (index: number, value: string): void => {
    const newValue = value.slice(-1).toUpperCase();
    const newUserAnswer = [...userAnswer];
    newUserAnswer[index] = newValue;
    setUserAnswer(newUserAnswer);

    if (newValue && index < currentQuestion.answer.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const isComplete = newUserAnswer.every(letter => letter !== '');
    if (isComplete) {
      checkAnswer(newUserAnswer);
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Backspace' && !userAnswer[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleInputClick = (index: number): void => {
    inputRefs.current[index]?.focus();
  };

  const checkAnswer = (answer: string[]): void => {
    const userAnswerString = answer.join('');
    if (userAnswerString === currentQuestion.answer) {
      playSound('correct');
      setShowCelebration(true);
      const newScore = score + 1;
      setScore(newScore);

      setTimeout(() => {
        setShowCelebration(false);
        if (currentQuestionIndex < gameData.questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
          handleGameComplete(newScore);
        }
      }, 2000);
    } else {
      playSound('incorrect');
      const inputs = document.querySelectorAll('.MuiOutlinedInput-root');
      inputs.forEach(input => {
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 500);
      });
    }
  };

  const handleGameComplete = (finalScore: number): void => {
    const endTime = Date.now();
    const timeTakenSeconds = startTime ? Math.round((endTime - startTime) / 1000) : 0;
    setTimeTaken(timeTakenSeconds);
    setShowGameCompleteCelebration(true);
    onGameComplete(finalScore, timeTakenSeconds, gameData.maxExp);
  };

  const resetGame = (): void => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setUserAnswer([]);
    setShowHint(false);
    setShowCelebration(false);
    setShowGameCompleteCelebration(false);
    setStartTime(Date.now());
  };

  const handleHintAccept = (): void => {
    revealRandomLetter();
    setShowHint(false);
  };

  if (!hasGameStarted) {
    return (
      <div className={`min-h-screen ${colors.primaryBackground} flex items-center justify-center`}>
        <div className={`${colors.cardBackground} p-8 rounded-lg shadow-lg max-w-2xl w-full`}>
          <h1 className={`text-3xl font-bold mb-4 ${colors.primaryText}`}>
            {gameData.activityName}
          </h1>
          <p className={`mb-6 ${colors.primaryText}`}>
            Look at the four pictures and guess the word they represent!
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
      {showGameCompleteCelebration && <WordGameCompleteCelebration />}
      
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
          <div className="grid grid-cols-2 gap-4 mb-8">
            {currentQuestion.images.map((image, index) => (
              <div key={index} className="aspect-square">
                <img
                  src={image}
                  alt={`Picture ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-center items-center space-x-2 mb-6">
            {currentQuestion.answer.split('').map((_, index) => (
              <LetterInput
                key={index}
                inputRef={(el) => (inputRefs.current[index] = el)}
                value={userAnswer[index] || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleLetterChange(index, e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => handleKeyDown(index, e)}
                onClick={() => handleInputClick(index)}
                inputProps={{ maxLength: 1 }}
                isCorrect={userAnswer[index] === currentQuestion.answer[index]}
                isWrong={userAnswer[index] !== '' && userAnswer[index] !== currentQuestion.answer[index]}
                isRevealed={revealedLetters[index]}
                disabled={revealedLetters[index]}
              />
            ))}
          </div>

          <div className="flex justify-center space-x-4">
            <MuiButton
              variant="contained"
              color="primary"
              onClick={() => setShowHint(true)}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Show Hint
            </MuiButton>
            <MuiButton
              variant="contained"
              color="secondary"
              onClick={revealRandomLetter}
              className="bg-green-500 hover:bg-green-600"
            >
              Reveal Letter
            </MuiButton>
          </div>
        </div>

        {showHint && (
          <HintModal
            open={showHint}
            onClose={() => setShowHint(false)}
            onAccept={handleHintAccept}
            attempts={attempts}
          />
        )}

        {showCelebration && <WordCelebration />}
      </div>
    </div>
  );
};

export default Blank4Pics1Word; 