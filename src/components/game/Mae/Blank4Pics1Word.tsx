import React, { useState, ChangeEvent, useRef, KeyboardEvent, useEffect, useCallback } from 'react';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { Box, TextField, Button as MuiButton, Typography, Theme } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import HintModal from './HintModal';
import { playSound, WordCelebration, WordGameCompleteCelebration, wordAnimationStyles } from './GameSoundEffects';
import BackgroundMusic from '../BackgroundMusic';
import { useTheme as useAppTheme } from '../../../context/ThemeContext';
import { AssignedGameDTO } from '../../../types';
import { useNavigate } from 'react-router-dom';

// Interface for the structure of each question in the gameData
interface GameQuestion {
  images: string[];
  answer: string;
  clue: string;
  englishTranslation: string;
  funFact: string;
}

// Interface for the overall game template structure passed as gameData
interface GameTemplate {
  activityName: string;
  maxScore: number; // This can be used to calculate percentage if needed
  maxExp: number;
  questions: GameQuestion[];
}

// Props for the Blank4Pics1Word component
interface Blank4Pics1WordProps {
  isPracticeMode: boolean; // Will be false for assigned games
  gameData: GameTemplate; // Parsed game data
  assignedGameData?: AssignedGameDTO; // Details of the assignment
  onGameComplete: (score: number, timeTakenSeconds?: number, expReward?: number) => void;
  classroomId?: string;
  assignedGameId?: string;
}

// Color Palette (consistent with 4Pics1Word.tsx)
const COLORS = {
  light: {
    primaryBackground: '#E8F9FF', // Light baby blue
    primaryText: '#1A1B41',      // Dark indigo
    interactiveElements: '#7A89C2', // Muted cornflower blue
    primaryAccent: '#DBD053',     // Pale yellow
    secondaryAccent: '#FFA500',   // Bright orange (like Duolingo)
    neutralBackground: '#FFFFFF',
    cardBackground: '#FFFFFF',
    borderColor: 'transparent',
    hoverBg: 'bg-slate-200',
  },
  dark: {
    primaryBackground: '#1A1B41', // Dark indigo
    primaryText: '#E8F9FF',      // Light baby blue
    interactiveElements: '#9BA8E5', // Lighter cornflower blue
    primaryAccent: '#DBD053',     // Pale yellow (same)
    secondaryAccent: '#FFA500',   // Bright orange (same)
    neutralBackground: '#2A2B51', // Darker indigo/purple
    cardBackground: '#2A2B51',
    borderColor: '#3A3B61',      // Slightly lighter than card bg
    hoverBg: 'bg-slate-700',
  },
} as const;

type ThemeType = keyof typeof COLORS;

// Styled components (copied from 4Pics1Word.tsx for consistency)
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
        : isRevealed && !isCorrect // Make revealed letters look correct but not green if game not submitted
          ? theme.palette.mode === 'dark' ? '#3A3B61' : '#E0E7FF' // Light blue for revealed
          : theme.palette.mode === 'dark' ? '#2A2B51' : '#FFFFFF',
    transition: 'background-color 0.3s ease, transform 0.3s ease',
    '& fieldset': {
      borderColor: isCorrect 
        ? theme.palette.success.main
        : isWrong 
          ? theme.palette.error.dark
          : isRevealed && !isCorrect
            ? theme.palette.mode === 'dark' ? '#5C6BC0' : '#9FA8DA' // Border for revealed
            : theme.palette.mode === 'dark' ? '#3A3B61' : '#E0E0E0',
      borderWidth: isCorrect || isWrong || (isRevealed && !isCorrect) ? '2px' : '1px',
    },
    '&:hover fieldset': {
      borderColor: isCorrect 
        ? theme.palette.success.main
        : isWrong 
          ? theme.palette.error.dark
          : isRevealed && !isCorrect
            ? theme.palette.mode === 'dark' ? '#7986CB' : '#7986CB'
            : theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: isCorrect 
        ? theme.palette.success.main
        : isWrong 
          ? theme.palette.error.dark
          : isRevealed && !isCorrect
            ? theme.palette.mode === 'dark' ? '#7986CB' : '#7986CB'
            : theme.palette.primary.main,
    },
  },
  '& .MuiOutlinedInput-input': {
    color: isCorrect 
      ? theme.palette.success.dark
      : isWrong 
        ? theme.palette.error.contrastText
        : isRevealed && !isCorrect
          ? theme.palette.mode === 'dark' ? theme.palette.text.secondary : theme.palette.text.primary
          : theme.palette.text.primary,
    padding: '0 8px',
    textAlign: 'center',
    backgroundColor: 'transparent',
    '&::placeholder': {
      opacity: 0.5,
    },
  },
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
    border: `4px solid ${theme.palette.mode === 'dark' ? COLORS.dark.interactiveElements : COLORS.light.interactiveElements}`,
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'scale(1.02)',
    },
  },
}));


const Blank4Pics1Word: React.FC<Blank4Pics1WordProps> = ({
  isPracticeMode, // Will be false for assigned games
  gameData,
  assignedGameData,
  onGameComplete,
  classroomId,
  assignedGameId,
}) => {
  const { theme: appTheme } = useAppTheme();
  const muiTheme = useMuiTheme();
  const colors = COLORS[appTheme as ThemeType];
  const navigate = useNavigate();

  const activeQuestions = gameData.questions;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string[]>([]); // Renamed from letterInputs for clarity
  const [score, setScore] = useState<number>(0);
  
  // States ported from 4Pics1Word.tsx
  const [showClue, setShowClue] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false); // For correct answer on a single question
  const [showGameCompleteCelebration, setShowGameCompleteCelebration] = useState(false); // For all questions complete
  const [attempts, setAttempts] = useState(0); // Attempts for the current question
  const [showHintModal, setShowHintModal] = useState(false);
  const [revealedLetters, setRevealedLetters] = useState<number[]>([]); // Indices of revealed letters
  const [hasShownHintModalForQuestion, setHasShownHintModalForQuestion] = useState(false);
  const [showFunFact, setShowFunFact] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const isInitialMount = useRef(true);
  const [startTime, setStartTime] = useState<number | null>(null); // For timing the attempt

  // Start timer when game starts
  useEffect(() => {
    setStartTime(Date.now());
    // Inject animation styles
    if (!document.getElementById('blank-4pics-animations')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'blank-4pics-animations';
        styleSheet.innerText = `${wordAnimationStyles} @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`;
        document.head.appendChild(styleSheet);
    }
  }, []);

  // Initialize/Reset inputs when question changes
  useEffect(() => {
    if(activeQuestions[currentQuestionIndex]) {
        const answerLength = activeQuestions[currentQuestionIndex].answer.length;
        setUserAnswer(Array(answerLength).fill(''));
        inputRefs.current = Array(answerLength).fill(null);
        setRevealedLetters([]); // Reset revealed letters for new question
    }
    // Reset states for the new question
    setIsAnswerCorrect(false);
    setIsShaking(false);
    setIsAnswerSubmitted(false);
    setAttempts(0);
    setShowClue(false);
    setShowFunFact(false);
    setHasShownHintModalForQuestion(false);
    isInitialMount.current = true; 
    setTimeout(() => { // Focus first input
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, 0);
  }, [currentQuestionIndex, activeQuestions]);


  const formatScore = (s: number): string => {
    return Number.isInteger(s) ? s.toString() : s.toFixed(1);
  };

  const revealRandomLetter = () => {
    const answer = activeQuestions[currentQuestionIndex].answer;
    const availableIndices = answer
      .split('')
      .map((_, index) => index)
      .filter((index) => !revealedLetters.includes(index) && userAnswer[index] === '');

    if (availableIndices.length > 0) {
      const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      const newRevealedLetters = [...revealedLetters, randomIndex];
      setRevealedLetters(newRevealedLetters);
      
      const newUserAnswer = [...userAnswer];
      newUserAnswer[randomIndex] = answer[randomIndex];
      setUserAnswer(newUserAnswer);
      
      setScore((prev) => Math.max(0, prev - 0.2)); // Penalty for hint
      playSound('click'); // Or a specific hint sound

      // Focus next empty, non-revealed input
      const nextEmptyIndex = newUserAnswer.findIndex((letter, idx) => idx > randomIndex && letter === '' && !newRevealedLetters.includes(idx));
      if (nextEmptyIndex !== -1) {
        setTimeout(() => inputRefs.current[nextEmptyIndex]?.focus(), 0);
      }
    }
    setShowHintModal(false);
  };

  const handleLetterChange = (index: number, value: string) => {
    if (isShaking || (isAnswerSubmitted && isAnswerCorrect) || revealedLetters.includes(index)) return;
    playSound('click');
    const newValue = value.slice(-1).toUpperCase(); // Ensure single uppercase letter
    const newUserAnswer = [...userAnswer];
    newUserAnswer[index] = newValue;
    setUserAnswer(newUserAnswer);

    // Auto-focus next non-revealed input if current input is filled
    if (newValue) {
      let nextIndex = index + 1;
      while (nextIndex < inputRefs.current.length && revealedLetters.includes(nextIndex)) {
        nextIndex++;
      }
      if (nextIndex < inputRefs.current.length) {
        setTimeout(() => inputRefs.current[nextIndex]?.focus(), 0);
      }
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (isShaking || (isAnswerSubmitted && isAnswerCorrect) || revealedLetters.includes(index)) return;
    
    if (event.key === 'Backspace') {
      const newUserAnswer = [...userAnswer];
      if (!userAnswer[index] && index > 0) { // If current is empty, move to previous
        let prevIndex = index - 1;
        while (prevIndex >= 0 && revealedLetters.includes(prevIndex)) { // Skip revealed
          prevIndex--;
        }
        if (prevIndex >= 0) {
          newUserAnswer[prevIndex] = ''; // Clear previous if it wasn't revealed
          setUserAnswer(newUserAnswer);
          setTimeout(() => inputRefs.current[prevIndex]?.focus(), 0);
        }
      } else { // Clear current if not empty
        newUserAnswer[index] = '';
        setUserAnswer(newUserAnswer);
      }
    } else if (event.key === 'ArrowLeft') {
      let prevIndex = index - 1;
      while (prevIndex >= 0 && revealedLetters.includes(prevIndex)) { prevIndex--; }
      if (prevIndex >= 0) setTimeout(() => inputRefs.current[prevIndex]?.focus(), 0);
    } else if (event.key === 'ArrowRight') {
      let nextIndex = index + 1;
      while (nextIndex < inputRefs.current.length && revealedLetters.includes(nextIndex)) { nextIndex++; }
      if (nextIndex < inputRefs.current.length) setTimeout(() => inputRefs.current[nextIndex]?.focus(), 0);
    }
  };

  const handleInputClick = (index: number) => {
    if (isShaking || (isAnswerSubmitted && isAnswerCorrect) || revealedLetters.includes(index)) return;
    
    // Find the first empty, non-revealed input up to the clicked index
    const firstEmptyIndex = userAnswer.findIndex((letter, i) => i <= index && letter === '' && !revealedLetters.includes(i));
    if (firstEmptyIndex !== -1) {
      setTimeout(() => inputRefs.current[firstEmptyIndex]?.focus(), 0);
    } else { // If all are filled or revealed up to here, try focusing the current or next available
      let targetIndex = index;
      while(targetIndex < userAnswer.length && revealedLetters.includes(targetIndex)) {
        targetIndex++;
      }
      if (targetIndex < userAnswer.length) {
        setTimeout(() => inputRefs.current[targetIndex]?.focus(), 0);
      }
    }
  };

  // Main game logic effect (answer checking)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const currentAnswer = activeQuestions[currentQuestionIndex].answer;
    const allInputsFilled = userAnswer.every((letter, index) => revealedLetters.includes(index) || letter !== '');

    if (allInputsFilled && !isShaking && !isAnswerSubmitted && userAnswer.length === currentAnswer.length) {
      const submittedAnswerString = userAnswer.join('');
      const currentAnswerIsCorrect = submittedAnswerString === currentAnswer;
      
      setIsAnswerSubmitted(true);
      setIsAnswerCorrect(currentAnswerIsCorrect);

      if (currentAnswerIsCorrect) {
        playSound('correct');
        setScore((prev) => prev + 5); // Award 5 points for correct answer
        setShowFunFact(true);
        setShowCelebration(true); 
        setTimeout(() => setShowCelebration(false), 2000); // Celebration duration

        setTimeout(() => { // Delay before moving to next question or ending game
          if (currentQuestionIndex < activeQuestions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            // States like showFunFact, isAnswerSubmitted will be reset by the other useEffect hook
          } else {
            setGameOver(true);
            playSound('gameComplete');
            setShowGameCompleteCelebration(true);
            // Call onGameComplete when the game is truly over (all questions answered)
            const endTime = Date.now();
            const timeTakenSeconds = startTime ? Math.round((endTime - startTime) / 1000) : 0;
            // Score is already updated, pass the final score
            onGameComplete(score + 5, timeTakenSeconds, gameData.maxExp); 
          }
        }, 3000); // Wait for fun fact/celebration
      } else { // Incorrect answer
        playSound('incorrect');
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= 3 && !hasShownHintModalForQuestion) {
          setShowHintModal(true);
          setHasShownHintModalForQuestion(true); // Prevent showing modal again for this question
        }
        setShowClue(true);
        setIsShaking(true);
        
        setTimeout(() => { // After shake animation
          // Reset only non-revealed inputs
          setUserAnswer(
            Array(userAnswer.length)
              .fill('')
              .map((_, idx) => (revealedLetters.includes(idx) ? currentAnswer[idx] : ''))
          );
          setIsAnswerSubmitted(false); // Allow another try
          setIsAnswerCorrect(false);
          setIsShaking(false);
          
          // Focus the first non-revealed input field
          const firstNonRevealedIndex = userAnswer.findIndex((_, idx) => !revealedLetters.includes(idx));
          if (firstNonRevealedIndex !== -1 && inputRefs.current[firstNonRevealedIndex]) {
            inputRefs.current[firstNonRevealedIndex]?.focus();
          }
        }, 700); // Shake duration
      }
    }
  }, [userAnswer, currentQuestionIndex, activeQuestions, isShaking, isAnswerSubmitted, attempts, revealedLetters, hasShownHintModalForQuestion, score, gameData.maxExp, onGameComplete, startTime]);


  // If game is over, display completion screen
  if (gameOver) {
    const maxPossibleScore = activeQuestions.length * 5;
    return (
      <>
        <BackgroundMusic musicFile="/audio/4pics.mp3" volume={0.15} />
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
              Game Finished!
            </h2>
            <p className="text-3xl mb-10" style={{ color: colors.primaryText }}>
              Your Score: <span className="font-bold text-4xl" style={{ color: colors.secondaryAccent }}>{formatScore(score)}</span> / {maxPossibleScore}
            </p>
            <MuiButton 
                onClick={() => {
                    playSound('click');
                    // For assigned games, "Finish" typically means the attempt is over and results submitted.
                    // onGameComplete has already been called. Now navigate away.
                    if(classroomId) {
                        navigate(`/student/classrooms/${classroomId}`);
                    } else {
                        navigate('/student/dashboard'); // Fallback
                    }
                }} 
                variant="contained" 
                sx={{ 
                    backgroundColor: colors.interactiveElements, 
                    color: appTheme === 'dark' ? colors.primaryText : '#FFFFFF',
                    '&:hover': { backgroundColor: muiTheme.palette.augmentColor({ color: {main: colors.interactiveElements}}).dark }, 
                    padding: '10px 20px', borderRadius: '9999px', fontSize: '1.1rem' 
                }}
            >
              Finish Attempt
            </MuiButton>
          </div>
        </div>
      </>
    );
  }

  const currentQData = activeQuestions[currentQuestionIndex];
  if (!currentQData) {
      return <div className={`bg-pattern min-h-screen flex flex-col items-center justify-center p-4 sm:p-6`} style={{ color: colors.primaryText }}>Loading question...</div>;
  }

  return (
    <>
      <BackgroundMusic musicFile="/audio/4pics.mp3" volume={0.15} />
      <div className={`bg-pattern min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-200`} style={{ color: colors.primaryText }}>
        {showCelebration && <WordCelebration />}
        <div className={`p-6 sm:p-10 rounded-3xl shadow-xl w-full max-w-3xl transition-colors duration-200 relative`} style={{ backgroundColor: colors.cardBackground }}>
          {/* Hint Bulb Icon */}
          <Box
            sx={{ position: 'absolute', bottom: 16, left: 16, cursor: 'pointer', zIndex: 10, '&:hover': { opacity: 0.8 } }}
            onClick={() => { playSound('click'); setShowHintModal(true); }}
          >
            <img src="/images/4pics1word/bulb.svg" alt="Hint" aria-label="Open hint modal" style={{ width: '85px', height: '85px' }} />
          </Box>

          {/* Header */}
          <div className="mb-8 text-center">
            <p className="text-xl sm:text-2xl font-semibold mb-2" style={{ color: colors.interactiveElements }}>
              Question {currentQuestionIndex + 1} of {activeQuestions.length}
            </p>
            <Typography variant="h3" gutterBottom sx={{ color: colors.primaryText, fontWeight:'bold' }}>
              {gameData.activityName || "4 Pics 1 Word"}
            </Typography>
            <Typography variant="h5" gutterBottom sx={{ color: colors.secondaryAccent, fontWeight:'bold' }}>
              Score: {formatScore(score)}
            </Typography>
          </div>

          {/* Images */}
          <Box display="flex" flexWrap="wrap" justifyContent="center" sx={{ columnGap: {xs:1, sm:2}, rowGap: {xs:1, sm:2} }} mb={4}>
            {currentQData.images.map((image, index) => (
              <ImageContainer key={index} sx={{ flexBasis: {xs: 'calc(50% - 8px)', sm:'calc(40% - 8px)'}, maxWidth: {xs: 'calc(50% - 8px)', sm:'calc(40% - 8px)'}, height:{xs:150, sm:200} }}>
                <img src={image} alt={`Image ${index + 1}`} />
              </ImageContainer>
            ))}
          </Box>

          {/* Letter Inputs */}
          <Box textAlign="center" mb={4}>
            {userAnswer.length > 0 && (
              <Box display="flex" justifyContent="center" alignItems="center" mb={3} flexWrap="wrap">
                {userAnswer.map((letter, index) => (
                  <LetterInput
                    key={index}
                    value={revealedLetters.includes(index) ? currentQData.answer[index] : letter}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleLetterChange(index, e.target.value)}
                    onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => handleKeyDown(index, e)}
                    onClick={() => handleInputClick(index)}
                    inputRef={(el) => (inputRefs.current[index] = el)}
                    inputProps={{
                      maxLength: 1,
                      style: { textAlign: 'center', padding: '0 8px', fontSize: '2rem', fontWeight: 'bold', textTransform: 'uppercase', backgroundColor: 'transparent', boxSizing: 'border-box' },
                    }}
                    disabled={isShaking || (isAnswerSubmitted && isAnswerCorrect) || revealedLetters.includes(index)}
                    isCorrect={isAnswerSubmitted && !isShaking && isAnswerCorrect}
                    isWrong={isAnswerSubmitted && !isAnswerCorrect && !isShaking}
                    isShaking={isShaking}
                    isRevealed={revealedLetters.includes(index)}
                    placeholder=""
                    variant="outlined"
                    sx={{ display: 'flex', visibility: 'visible', minWidth: '50px', minHeight: '55px', marginY: {xs: '4px', sm: 0} }}
                  />
                ))}
              </Box>
            )}
          </Box>

          {/* Clue, Translation, Fun Fact */}
          <Box textAlign="center" mb={4}>
            <Typography variant="body1" gutterBottom sx={{ color: colors.primaryText, fontSize: '1.1rem', minHeight: '1.5em' }}>
              {currentQData.englishTranslation}
            </Typography>
            {showClue && (
              <Typography variant="body2" gutterBottom sx={{ color: colors.interactiveElements, fontStyle: 'italic', fontSize: '1rem', animation: 'fadeIn 0.5s ease-in', minHeight: '1.5em' }}>
                Clue: {currentQData.clue}
              </Typography>
            )}
            {showFunFact && isAnswerCorrect && (
              <Typography variant="body1" sx={{ color: colors.secondaryAccent, marginTop: '1rem', animation: 'fadeIn 0.5s ease-in', fontSize: '1.1rem', fontWeight: 'medium', minHeight: '1.5em' }}>
                Fun Fact: {currentQData.funFact}
              </Typography>
            )}
          </Box>

          {/* Hint Modal */}
          <HintModal
            open={showHintModal}
            onClose={() => { playSound('click'); setShowHintModal(false); }}
            onAccept={revealRandomLetter} // revealRandomLetter now also handles setShowHintModal(false)
            attempts={attempts} // Pass current attempts for the question
          />
        </div>
      </div>
    </>
  );
};

export default Blank4Pics1Word;