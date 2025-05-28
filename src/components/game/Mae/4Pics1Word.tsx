// src/components/game/Mae/4Pics1Word.tsx
import React, { useState, ChangeEvent, useRef, KeyboardEvent, useEffect } from 'react';
import { useTheme as useMuiTheme } from '@mui/material/styles'; // Alias MUI useTheme
import { Box, TextField, Button as MuiButton, Typography, Theme } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
// Assuming GameConfigurations contains general animation styles
import { CelebrationAnimation, GameCompleteCelebration, animationStyles } from '../Selina/GameConfigurations';
import HintModal from './HintModal';
import GameLandingPage from '../GameLandingPage';
import { playSound, WordCelebration, WordGameCompleteCelebration, wordAnimationStyles } from './GameSoundEffects';
import BackgroundMusic from '../BackgroundMusic';
import { useTheme as useAppTheme } from '../../../context/ThemeContext'; // Your app's theme context
import { AssignedGameDTO } from '../../../types'; // For assignedGameData prop
import { useNavigate } from 'react-router-dom';


interface GameQuestion {
  images: string[];
  answer: string;
  clue: string;
  englishTranslation: string;
  funFact: string;
}

const questions: GameQuestion[] = [
  {
    images: ['/images/4pics1word/farmer.svg', '/images/4pics1word/fisherman.svg', '/images/4pics1word/teacher.svg', '/images/4pics1word/factory.svg'],
    answer: 'HANAPBUHAY',
    clue: 'Mga trabaho para kumita ng pera para sa pamilya.',
    englishTranslation: 'Jobs to earn money for the family.',
    funFact: 'Some people work as farmers or teachers to help their families!'
  },
  {
    images: ['/images/4pics1word/store.svg', '/images/4pics1word/school.svg', '/images/4pics1word/health.svg', '/images/4pics1word/church.svg'],
    answer: 'PAMAYANAN',
    clue: 'Lugar kung saan nakatira at nagtutulungan ang mga tao.',
    englishTranslation: 'A place where people live and help each other.',
    funFact: 'In a community, neighbors share food and fun together!'
  },
  {
    images: ['/images/4pics1word/planting.svg',
    '/images/4pics1word/recycling.svg',
    '/images/4pics1word/cleaning.svg',
    '/images/4pics1word/forest.svg'],
    answer: 'KAPALIGIRAN',
    clue: 'Ang ating mundo na kailangan nating ingatan.',
    englishTranslation: 'Our world that we need to take care of.',
    funFact: 'Planting trees helps keep our environment clean and green!'
  },
  {
    images: ['/images/4pics1word/jeepney.svg', '/images/4pics1word/skyscrapers.svg', '/images/4pics1word/market.svg', '/images/4pics1word/street.svg'],
    answer: 'LUNGSOD',
    clue: 'Lugar na maraming tao, bahay, at sasakyan.',
    englishTranslation: 'A place with many people, houses, and cars.',
    funFact: 'Cities have tall buildings and busy streets with jeepneys!'
  },
  {
    images: ['/images/4pics1word/rice.svg', '/images/4pics1word/coconut.svg', '/images/4pics1word/house.svg', '/images/4pics1word/mountain.svg'],
    answer: 'LALAWIGAN',
    clue: 'Tahimik na lugar na may bukirin at bundok.',
    englishTranslation: 'A quiet place with farms and mountains.',
    funFact: 'Provinces have big fields where rice and coconuts grow!'
  },
  {   
    images: ['/images/4pics1word/fiesta.svg', '/images/4pics1word/dancing (2).svg', '/images/4pics1word/dancing.svg', '/images/4pics1word/food.svg'],
    answer: 'KULTURA',
    clue: 'Mga tradisyon at gawain ng mga tao.',
    englishTranslation: 'Traditions and activities of people.',
    funFact: 'Our culture includes fun dances and yummy food at fiestas!'
  },
  {
    images: ['/images/4pics1word/praying.svg', '/images/4pics1word/ceremony.svg', '/images/4pics1word/helping.svg', '/images/4pics1word/speaking.svg'],
    answer: 'PAGGALANG',
    clue: 'Pagpapakita ng kabutihan sa iba.',
    englishTranslation: 'Showing kindness to others.',
    funFact: 'Saying "po" and "opo" shows respect to elders!'
  },
  {
    images: ['/images/4pics1word/hall.svg', '/images/4pics1word/tanod.svg', '/images/4pics1word/meeting.svg', '/images/4pics1word/signs.svg'],
    answer: 'BARANGAY',
    clue: 'Maliit na grupo ng mga bahay sa isang lugar.',
    englishTranslation: 'A small group of houses in a place.',
    funFact: 'A barangay has leaders who keep everyone safe!'
  },
  {
    images: ['/images/4pics1word/market.svg', '/images/4pics1word/fish.svg', '/images/4pics1word/vendors.svg', '/images/4pics1word/vegetables.svg'],
    answer: 'KALAKALAN',
    clue: 'Pagbili at pagbenta ng mga bagay.',
    englishTranslation: 'Buying and selling things.',
    funFact: 'In markets, people trade fish and vegetables!'
  },
  {
    images: ['/images/4pics1word/raising.svg', '/images/4pics1word/blackboard.svg', '/images/4pics1word/books.svg', '/images/4pics1word/writing.svg'],
    answer: 'EDUKASYON',
    clue: 'Pag-aaral para maging mas matalino.',
    englishTranslation: 'Learning to become smarter.',
    funFact: 'Going to school helps you learn to read and write!'
  }
];

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
};

const GameContainer = styled(Box)(({ theme }: { theme: Theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: theme.palette.mode === 'dark' ? '#1A1B41' : '#E8F9F0', // Example background
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
          : theme.palette.mode === 'dark' ? '#E8F9FF' : '#1A1B41',
    padding: '0 8px',
    textAlign: 'center',
    backgroundColor: 'transparent',
    '&::placeholder': {
      opacity: 0.5,
    },
  },
}));

const ClueText = styled(Typography)(({ theme }: { theme: Theme }) => ({
  color: theme.palette.mode === 'dark' ? '#9BA8E5' : '#7A89C2',
  marginBottom: theme.spacing(2),
  fontSize: '1.2rem',
  fontWeight: 'medium',
}));

const ImageContainer = styled(Box)(({ theme }: { theme: Theme }) => ({
  width: '100%',
  height: '200px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
  '& img': {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    borderRadius: '12px',
    border: '4px solid #9BA8E5', // Example border color, can be themed
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'scale(1.02)',
    },
  },
}));

// Props definition for the game component
interface FourPicsOneWordProps {
  isPracticeMode: boolean;
  assignedGameData?: AssignedGameDTO; // Data if game is assigned
  onGameComplete: (score: number, timeTakenSeconds?: number, expReward?: number) => void; // Callback
  classroomId?: string; // Optional: for navigation or context
  assignedGameId?: string; // Optional
}

const FourPicsOneWord: React.FC<FourPicsOneWordProps> = ({ 
  isPracticeMode, 
  assignedGameData, 
  onGameComplete,
  classroomId 
}) => {
  const muiTheme = useMuiTheme(); // MUI theme for styled components
  const { theme: appTheme } = useAppTheme(); // Your app's theme context
  const colors = COLORS[appTheme];
  const navigate = useNavigate();


  // Determine active questions: if assigned and data exists, parse it; otherwise, use default.
  // This simplified version still uses local `questions`.
  // For a real scenario:
  // const activeQuestions = (!isPracticeMode && assignedGameData?.game?.gameData) 
  // ? JSON.parse(assignedGameData.game.gameData).questions // Ensure this structure matches your gameData
  // : questions;
  const activeQuestions = questions; // Keeping it simple as per "minimal changes"

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [letterInputs, setLetterInputs] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [showClue, setShowClue] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [hasGameStarted, setHasGameStarted] = useState(isPracticeMode ? false : true); // Start immediately if assigned
  const [showCelebration, setShowCelebration] = useState(false);
  const [showGameCompleteCelebration, setShowGameCompleteCelebration] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showHintModal, setShowHintModal] = useState(false);
  const [revealedLetters, setRevealedLetters] = useState<number[]>([]);
  const [hasShownHintModalForQuestion, setHasShownHintModalForQuestion] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const isInitialMount = useRef(true);
  const [showFunFact, setShowFunFact] = useState(false);

  const formatScore = (s: number): string => {
    return Number.isInteger(s) ? s.toString() : s.toFixed(1);
  };

  const handleStartGame = () => {
    playSound('click');
    setHasGameStarted(true);
  };

  const revealRandomLetter = () => {
    const answer = activeQuestions[currentQuestion].answer;
    const availableIndices = answer
      .split('')
      .map((_, index) => index)
      .filter((index) => !revealedLetters.includes(index));

    if (availableIndices.length > 0) {
      const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      const newRevealedLetters = [...revealedLetters, randomIndex];
      setRevealedLetters(newRevealedLetters);
      const newInputs = [...letterInputs];
      newInputs[randomIndex] = answer[randomIndex];
      setLetterInputs(newInputs);
      setScore((prev) => Math.max(0, prev - 0.2)); // Small penalty for hint
      const nextEmptyIndex = newInputs.findIndex((letter, idx) => idx > randomIndex && letter === '');
      if (nextEmptyIndex !== -1) {
        setTimeout(() => {
          inputRefs.current[nextEmptyIndex]?.focus();
        }, 0);
      }
    }
  };

  const handleLetterChange = (index: number, value: string) => {
    if (isShaking || (isAnswerSubmitted && isAnswerCorrect) || revealedLetters.includes(index)) return;
    playSound('click');
    const newValue = value.slice(-1).toUpperCase();
    const newInputs = [...letterInputs];
    newInputs[index] = newValue;
    setLetterInputs(newInputs);

    if (newValue) {
      let nextIndex = index + 1;
      while (nextIndex < inputRefs.current.length && revealedLetters.includes(nextIndex)) {
        nextIndex++;
      }
      if (nextIndex < inputRefs.current.length) {
        setTimeout(() => {
          inputRefs.current[nextIndex]?.focus();
        }, 0);
      }
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (isShaking || (isAnswerSubmitted && isAnswerCorrect) || revealedLetters.includes(index)) return;
    if (event.key === 'Backspace') {
      const newInputs = [...letterInputs];
      if (!letterInputs[index] && index > 0) {
        let prevIndex = index - 1;
        while (prevIndex >= 0 && revealedLetters.includes(prevIndex)) {
          prevIndex--;
        }
        if (prevIndex >= 0) {
          newInputs[prevIndex] = '';
          setLetterInputs(newInputs);
          setTimeout(() => {
            inputRefs.current[prevIndex]?.focus();
          }, 0);
        }
      } else {
        newInputs[index] = '';
        setLetterInputs(newInputs);
      }
    } else if (event.key === 'ArrowLeft') {
      let prevIndex = index - 1;
      while (prevIndex >= 0 && revealedLetters.includes(prevIndex)) {
        prevIndex--;
      }
      if (prevIndex >= 0) {
        setTimeout(() => {
          inputRefs.current[prevIndex]?.focus();
        }, 0);
      }
    } else if (event.key === 'ArrowRight') {
      let nextIndex = index + 1;
      while (nextIndex < inputRefs.current.length && revealedLetters.includes(nextIndex)) {
        nextIndex++;
      }
      if (nextIndex < inputRefs.current.length) {
        setTimeout(() => {
          inputRefs.current[nextIndex]?.focus();
        }, 0);
      }
    }
  };

  const handleInputClick = (index: number) => {
    if (isShaking || (isAnswerSubmitted && isAnswerCorrect)) return;
    const firstEmptyIndex = letterInputs.findIndex((letter, i) => i <= index && letter === '' && !revealedLetters.includes(i));
    if (firstEmptyIndex !== -1) {
      setTimeout(() => {
        inputRefs.current[firstEmptyIndex]?.focus();
      }, 0);
    } else {
      let nextIndex = index;
      while (nextIndex < inputRefs.current.length && revealedLetters.includes(nextIndex)) {
        nextIndex++;
      }
      if (nextIndex < inputRefs.current.length) {
        setTimeout(() => {
          inputRefs.current[nextIndex]?.focus();
        }, 0);
      }
    }
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const completeAnswer = letterInputs
      .map((letter, index) => (revealedLetters.includes(index) ? activeQuestions[currentQuestion].answer[index] : letter))
      .join('');
    const correctAnswer = activeQuestions[currentQuestion].answer;
    const allPositionsFilled = letterInputs.every((letter, index) => revealedLetters.includes(index) || letter !== '');

    if (allPositionsFilled && !isShaking && !isAnswerSubmitted) {
      const currentAnswerIsCorrect = completeAnswer === correctAnswer;
      setIsAnswerSubmitted(true);
      setIsAnswerCorrect(currentAnswerIsCorrect);

      if (currentAnswerIsCorrect) {
        playSound('correct');
        const pointsForCorrectAnswer = 5; // Define points for a correct answer
        setScore((prev) => prev + pointsForCorrectAnswer);
        setShowFunFact(true);
        setShowCelebration(true); setTimeout(() => setShowCelebration(false), 2000);

        setTimeout(() => {
          if (currentQuestion < activeQuestions.length - 1) {
            setCurrentQuestion((prev) => prev + 1);
            setShowClue(false);
            setShowFunFact(false);
          } else {
            playSound('gameComplete');
            setShowGameCompleteCelebration(true);
            setGameOver(true);
            if (!isPracticeMode) {
              // Score state already includes points for the last answer.
              onGameComplete(score + pointsForCorrectAnswer); // Pass the updated score.
            }
          }
        }, 3000);
      } else {
        playSound('incorrect');
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= 3 && !hasShownHintModalForQuestion) {
          setShowHintModal(true);
          setHasShownHintModalForQuestion(true);
        }
        setShowClue(true);
        setIsShaking(true);
        setTimeout(() => {
          setLetterInputs(
            Array(letterInputs.length)
              .fill('')
              .map((_, idx) => (revealedLetters.includes(idx) ? correctAnswer[idx] : '')),
          );
          setIsAnswerSubmitted(false);
          setIsAnswerCorrect(false);
          setIsShaking(false);
          const firstNonRevealedIndex = letterInputs.findIndex((_, idx) => !revealedLetters.includes(idx));
          if (firstNonRevealedIndex !== -1 && inputRefs.current[firstNonRevealedIndex]) {
            inputRefs.current[firstNonRevealedIndex]?.focus();
          }
        }, 700);
      }
    }
  }, [letterInputs, currentQuestion, isShaking, isAnswerSubmitted, attempts, revealedLetters, hasShownHintModalForQuestion, activeQuestions, score, isPracticeMode, onGameComplete]); // Added score to dependencies for onGameComplete

  useEffect(() => {
    if(activeQuestions[currentQuestion]) { // Check if question data exists before accessing length
        const answerLength = activeQuestions[currentQuestion].answer.length;
        setLetterInputs(Array(answerLength).fill(''));
        inputRefs.current = Array(answerLength).fill(null);
    }
    setIsAnswerCorrect(false);
    setIsShaking(false);
    setIsAnswerSubmitted(false);
    setAttempts(0);
    setRevealedLetters([]);
    setShowFunFact(false);
    setHasShownHintModalForQuestion(false);
    isInitialMount.current = true; 
    setTimeout(() => {
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, 0);
  }, [currentQuestion, activeQuestions]);

  const resetGame = () => {
    playSound('click');
    setCurrentQuestion(0);
    setScore(0);
    setShowClue(false);
    setGameOver(false);
    setIsAnswerCorrect(false);
    setIsShaking(false);
    setIsAnswerSubmitted(false);
    setAttempts(0);
    setRevealedLetters([]);
    setShowFunFact(false);
    setShowGameCompleteCelebration(false);
    
    if (isPracticeMode) {
        setHasGameStarted(false); // Go back to landing for practice mode
    } else {
        // For assigned games, the "Finish" button typically means the attempt is over.
        // The onGameComplete should have been called already.
        // This can navigate back to the classroom or dashboard.
        if(classroomId) {
            navigate(`/student/classrooms/${classroomId}`);
        } else {
            navigate('/student/dashboard'); // Fallback
        }
    }
  };

  useEffect(() => {
    if (!document.getElementById('4pics-animations')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = '4pics-animations';
        styleSheet.innerText = `
        ${animationStyles} 
        ${wordAnimationStyles}
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`;
        document.head.appendChild(styleSheet);
    }
  }, []);


  if (!hasGameStarted && isPracticeMode) {
    return (
      <>
        <BackgroundMusic 
          musicFile="/audio/4pics.mp3" 
          volume={0.15} 
        />
        <GameLandingPage
          title="4 Pics 1 Word"
          subtitle="Test your vocabulary and observation skills!"
          description="Match the pictures to form a word that connects them all."
          instruction="Look at the 4 pictures and type the word that connects them all together."
          onStart={handleStartGame}
          gameIcon="/images/4pics1word/game-icon.svg" // Added game icon
        />
      </>
    );
  }

  if (gameOver) {
    const PASSING_SCORE = 30; // Example passing score for practice mode visuals
    const maxPossibleScore = activeQuestions.length * 5; // Assuming 5 points per correct answer
    const hasPassed = score >= PASSING_SCORE;

    return (
      <>
        <BackgroundMusic 
          musicFile="/audio/4pics.mp3" 
          volume={0.15} 
        />
        <div
          className={`bg-pattern min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-200`}
          style={{ color: colors.primaryText }}
        >
          {showGameCompleteCelebration && <WordGameCompleteCelebration />}
          <div
            className={`p-10 rounded-3xl shadow-xl text-center max-w-md w-full transition-colors duration-200`}
            style={{ backgroundColor: colors.cardBackground }}
          >
            <h2 className="text-5xl font-bold mb-6" style={{ color: colors.primaryAccent }}>
              {isPracticeMode ? (hasPassed ? 'Congratulations!' : 'Game Over') : 'Game Finished!'}
            </h2>
            <p className="text-3xl mb-10" style={{ color: colors.primaryText }}>
              Your Score: <span className="font-bold text-4xl" style={{ color: colors.secondaryAccent }}>{formatScore(score)}</span> / {maxPossibleScore}
            </p>
            <MuiButton 
                onClick={resetGame} 
                variant="contained" 
                sx={{ 
                    backgroundColor: colors.interactiveElements, 
                    color: appTheme === 'dark' ? colors.primaryText : '#FFFFFF', // Ensure contrast for text
                    '&:hover': { 
                        backgroundColor: muiTheme.palette.augmentColor({ color: {main: colors.interactiveElements}}).dark 
                    }, 
                    padding: '10px 20px', 
                    borderRadius: '9999px', 
                    fontSize: '1.1rem' 
                }}
            >
              {isPracticeMode ? (hasPassed ? 'Play Again' : 'Try Again') : 'Finish'}
            </MuiButton>
          </div>
        </div>
      </>
    );
  }

  if (!activeQuestions || !activeQuestions[currentQuestion]) {
      return (
           <div className={`bg-pattern min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-200`} style={{ color: colors.primaryText }}>
            Loading question data... If this persists, the game data might be missing or corrupted.
        </div>
      )
  }


  return (
    <>
      <BackgroundMusic 
        musicFile="/audio/4pics.mp3" 
        volume={0.15} 
      />
      <div className={`bg-pattern min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-200`} style={{ color: colors.primaryText }}>
        {showCelebration && <WordCelebration />}
        <div className={`p-6 sm:p-10 rounded-3xl shadow-xl w-full max-w-3xl transition-colors duration-200 relative`} style={{ backgroundColor: colors.cardBackground }}>
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              cursor: 'pointer',
              zIndex: 10,
              '&:hover': {
                opacity: 0.8,
              },
            }}
            onClick={() => setShowHintModal(true)}
          >
            <img src="/images/4pics1word/bulb.svg" alt="Hint" aria-label="Open hint modal" style={{ width: '85px', height: '85px' }} />
          </Box>

          <div className="mb-8 text-center">
            <p className="text-xl sm:text-2xl font-semibold mb-2" style={{ color: colors.interactiveElements }}>
              Question {currentQuestion + 1} of {activeQuestions.length}
            </p>
            <Typography variant="h3" gutterBottom sx={{ color: colors.primaryText, fontWeight:'bold' }}>
              4 Pics 1 Word
            </Typography>
            <Typography variant="h5" gutterBottom sx={{ color: colors.secondaryAccent, fontWeight:'bold' }}>
              Score: {formatScore(score)}
            </Typography>
          </div>

          <Box display="flex" flexWrap="wrap" justifyContent="center" sx={{ columnGap: {xs:1, sm:2}, rowGap: {xs:1, sm:2} }} mb={4}>
            {activeQuestions[currentQuestion].images.map((image, index) => (
              <ImageContainer key={index} sx={{ flexBasis: {xs: 'calc(50% - 8px)', sm:'calc(40% - 8px)'}, maxWidth: {xs: 'calc(50% - 8px)', sm:'calc(40% - 8px)'}, height:{xs:150, sm:200} }}>
                {image.includes('/') && (image.endsWith('.svg') || image.endsWith('.png') || image.endsWith('.jpg')) ? (
                  <img src={image} alt={`Image ${index + 1}`} />
                ) : (
                  <Typography variant="h6" sx={{ color: colors.primaryText }}>
                    {image.toUpperCase()}
                  </Typography>
                )}
              </ImageContainer>
            ))}
          </Box>

          <Box textAlign="center" mb={4}>
            {letterInputs.length > 0 && (
              <Box display="flex" justifyContent="center" alignItems="center" mb={3} flexWrap="wrap">
                {letterInputs.map((letter, index) => (
                  <LetterInput
                    key={index}
                    value={revealedLetters.includes(index) ? activeQuestions[currentQuestion].answer[index] : letter}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleLetterChange(index, e.target.value)}
                    onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => handleKeyDown(index, e)}
                    onClick={() => handleInputClick(index)}
                    inputRef={(el) => (inputRefs.current[index] = el)}
                    inputProps={{
                      maxLength: 1,
                      style: {
                        textAlign: 'center',
                        padding: '0 8px',
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        backgroundColor: 'transparent',
                        boxSizing: 'border-box',
                      },
                    }}
                    disabled={isShaking || (isAnswerSubmitted && isAnswerCorrect) || revealedLetters.includes(index)}
                    isCorrect={
                      isAnswerSubmitted &&
                      !isShaking &&
                      letterInputs.every((l, i) => revealedLetters.includes(i) || l !== '') &&
                      isAnswerCorrect
                    }
                    isWrong={
                      isAnswerSubmitted &&
                      !isAnswerCorrect &&
                      letterInputs.every((l, i) => revealedLetters.includes(i) || l !== '')
                    }
                    isShaking={isShaking}
                    isRevealed={revealedLetters.includes(index)}
                    placeholder=""
                    variant="outlined"
                    sx={{
                      display: 'flex',
                      visibility: 'visible',
                      minWidth: '50px',
                      minHeight: '55px',
                      marginY: {xs: '4px', sm: 0} // Added Y margin for smaller screens if they wrap
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>

          <Box textAlign="center" mb={4}>
            <Typography variant="body1" gutterBottom sx={{ color: colors.primaryText, fontSize: '1.1rem' }}>
              {activeQuestions[currentQuestion].englishTranslation}
            </Typography>
            <Typography variant="body2" gutterBottom sx={{ color: colors.interactiveElements, fontStyle: 'italic', fontSize: '1rem' }}>
              {activeQuestions[currentQuestion].clue}
            </Typography>
            {showFunFact && isAnswerCorrect && (
              <Typography
                variant="body1"
                sx={{
                  color: colors.secondaryAccent,
                  marginTop: '1rem',
                  animation: 'fadeIn 0.5s ease-in',
                  fontSize: '1.1rem', fontWeight: 'medium'
                }}
              >
                {activeQuestions[currentQuestion].funFact}
              </Typography>
            )}
          </Box>

          <HintModal
            open={showHintModal}
            onClose={() => setShowHintModal(false)}
            onAccept={() => {
              revealRandomLetter();
              setShowHintModal(false);
            }}
            attempts={attempts}
          />
        </div>
      </div>
    </>
  );
};

export default FourPicsOneWord;