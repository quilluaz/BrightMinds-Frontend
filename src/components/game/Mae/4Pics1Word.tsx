import React, { useState, ChangeEvent, useRef, KeyboardEvent, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { Box, TextField, Button, Typography, Theme } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { CelebrationAnimation, GameCompleteCelebration, animationStyles } from '../Selina/GameConfigurations';
import HintModal from './HintModal';
import GameLandingPage from '../GameLandingPage';
import { playSound, WordCelebration, WordGameCompleteCelebration, wordAnimationStyles } from './GameSoundEffects';

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
    border: '4px solid #9BA8E5',
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'scale(1.02)',
    },
  },
}));

const FourPicsOneWord: React.FC = () => {
  const { theme } = useTheme();
  const colors = COLORS[theme];
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [letterInputs, setLetterInputs] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [showClue, setShowClue] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [hasGameStarted, setHasGameStarted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showGameCompleteCelebration, setShowGameCompleteCelebration] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showHintModal, setShowHintModal] = useState(false);
  const [revealedLetters, setRevealedLetters] = useState<number[]>([]);
  const [hasShownHintModalForQuestion, setHasShownHintModalForQuestion] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const isInitialMount = useRef(true);
  const [showFunFact, setShowFunFact] = useState(false);

  // Helper function to format score
  const formatScore = (score: number): string => {
    return Number.isInteger(score) ? score.toString() : score.toFixed(1);
  };

  const handleStartGame = () => {
    playSound('click');
    setHasGameStarted(true);
  };

  const revealRandomLetter = () => {
    const answer = questions[currentQuestion].answer;
    const availableIndices = answer
      .split('')
      .map((_, index) => index)
      .filter((index) => !revealedLetters.includes(index));

    if (availableIndices.length > 0) {
      const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      const newRevealedLetters = [...revealedLetters, randomIndex];
      setRevealedLetters(newRevealedLetters);

      // Update the letter inputs with the revealed letter
      const newInputs = [...letterInputs];
      newInputs[randomIndex] = answer[randomIndex];
      setLetterInputs(newInputs);

      // Deduct points
      setScore((prev) => Math.max(0, prev - 0.2));

      // Focus the next empty input after the revealed letter
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

    // Find the next non-revealed letter position
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
        // Find the previous non-revealed letter position
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
      // Find the previous non-revealed letter position
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
      // Find the next non-revealed letter position
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

    // Find the first empty non-revealed position
    const firstEmptyIndex = letterInputs.findIndex((letter, i) => i <= index && letter === '' && !revealedLetters.includes(i));

    if (firstEmptyIndex !== -1) {
      setTimeout(() => {
        inputRefs.current[firstEmptyIndex]?.focus();
      }, 0);
    } else {
      // If no empty position found, find the next non-revealed position
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

    // Create a complete answer by combining user input and revealed letters
    const completeAnswer = letterInputs
      .map((letter, index) => (revealedLetters.includes(index) ? questions[currentQuestion].answer[index] : letter))
      .join('');

    const correctAnswer = questions[currentQuestion].answer;

    // Check if all non-revealed positions are filled
    const allPositionsFilled = letterInputs.every((letter, index) => revealedLetters.includes(index) || letter !== '');

    if (allPositionsFilled && !isShaking && !isAnswerSubmitted) {
      const isCorrect = completeAnswer === correctAnswer;

      setIsAnswerSubmitted(true);
      setIsAnswerCorrect(isCorrect);

      if (isCorrect) {
        playSound('correct');
        setScore((prev) => prev + 5);
        setShowFunFact(true);
        setTimeout(() => {
          if (currentQuestion < questions.length - 1) {
            setCurrentQuestion((prev) => prev + 1);
            setShowClue(false);
            setShowFunFact(false);
          } else {
            playSound('gameComplete');
            setGameOver(true);
          }
        }, 3000);
      } else {
        playSound('incorrect');
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        // Add logic to show modal after 3 incorrect attempts, only once per question
        if (newAttempts >= 3 && !hasShownHintModalForQuestion) {
          setShowHintModal(true);
          setHasShownHintModalForQuestion(true);
        }

        setShowClue(true);
        setIsShaking(true);
        setTimeout(() => {
          // Preserve revealed letters when resetting
          setLetterInputs(
            Array(letterInputs.length)
              .fill('')
              .map((_, idx) => (revealedLetters.includes(idx) ? correctAnswer[idx] : '')),
          );
          setIsAnswerSubmitted(false);
          setIsAnswerCorrect(false);
          setIsShaking(false);

          // Focus on the first non-revealed position
          const firstNonRevealedIndex = letterInputs.findIndex((_, idx) => !revealedLetters.includes(idx));
          if (firstNonRevealedIndex !== -1) {
            inputRefs.current[firstNonRevealedIndex]?.focus();
          }
        }, 700);
      }
    }
  }, [letterInputs, currentQuestion, isShaking, isAnswerSubmitted, attempts, revealedLetters, hasShownHintModalForQuestion]);

  useEffect(() => {
    const answerLength = questions[currentQuestion].answer.length;
    setLetterInputs(Array(answerLength).fill(''));
    inputRefs.current = Array(answerLength).fill(null);
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
  }, [currentQuestion]);

  const resetGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowClue(false);
    setGameOver(false);
    setIsAnswerCorrect(false);
    setIsShaking(false);
    setIsAnswerSubmitted(false);
    setAttempts(0);
    setRevealedLetters([]);
  };

  if (!hasGameStarted) {
    return (
      <GameLandingPage
        title="4 Pics 1 Word"
        subtitle="Test your vocabulary and observation skills!"
        description="Match the pictures to form a word that connects them all."
        instruction="Look at the 4 pictures and type the word that connects them all together."
        onStart={handleStartGame}
        /**gameIcon="/images/4pics1word/game-icon.svg"*/
      />
    );
  }

  if (gameOver) {
    const PASSING_SCORE = 30;
    const hasPassed = score >= PASSING_SCORE;

    return (
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
            {hasPassed ? 'Congratulations!' : 'Better Luck Next Time'}
          </h2>
          <p className="text-3xl mb-10" style={{ color: colors.primaryText }}>
            Your Score: <span className="font-bold text-4xl" style={{ color: colors.secondaryAccent }}>{formatScore(score)}</span> / 50
          </p>
          <button
            onClick={resetGame}
            className="hover:bg-[#5f6b9a] text-white font-bold py-2 px-4 rounded-full text-lg transition duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#DBD053] shadow-lg"
            style={{ backgroundColor: colors.interactiveElements }}
          >
            {hasPassed ? 'Play Again' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  return (
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
            Question {currentQuestion + 1} of {questions.length}
          </p>
          <Typography variant="h3" gutterBottom style={{ color: colors.primaryText }}>
            4 Pics 1 Word
          </Typography>
          <Typography variant="h5" gutterBottom style={{ color: colors.secondaryAccent }}>
            Score: {formatScore(score)}
          </Typography>
        </div>

        <Box display="flex" flexWrap="wrap" justifyContent="center" sx={{ columnGap: 0, rowGap: 2 }} mb={4}>
          {questions[currentQuestion].images.map((image, index) => (
            <ImageContainer key={index} sx={{ flexBasis: 'calc(40% - 8px)', maxWidth: 'calc(40% - 8px)' }}>
              {image.includes('/') && image.endsWith('.svg') ? (
                <img src={image} alt={`Image ${index + 1}`} />
              ) : (
                <Typography variant="h6" style={{ color: colors.primaryText }}>
                  {image.toUpperCase()}
                </Typography>
              )}
            </ImageContainer>
          ))}
        </Box>

        <Box textAlign="center" mb={4}>
          {letterInputs.length > 0 && (
            <Box display="flex" justifyContent="center" alignItems="center" mb={3}>
              {letterInputs.map((letter, index) => (
                <LetterInput
                  key={index}
                  value={revealedLetters.includes(index) ? questions[currentQuestion].answer[index] : letter}
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
                    letterInputs.every((letter, i) => revealedLetters.includes(i) || letter !== '') &&
                    isAnswerCorrect
                  }
                  isWrong={
                    isAnswerSubmitted &&
                    !isAnswerCorrect &&
                    letterInputs.every((letter, i) => revealedLetters.includes(i) || letter !== '')
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
                  }}
                />
              ))}
            </Box>
          )}
        </Box>

        <Box textAlign="center" mb={4}>
          <Typography variant="body1" gutterBottom style={{ color: colors.primaryText }}>
            {questions[currentQuestion].englishTranslation}
          </Typography>
          <Typography variant="body2" gutterBottom style={{ color: colors.interactiveElements, fontStyle: 'italic' }}>
            {questions[currentQuestion].clue}
          </Typography>
          {showFunFact && isAnswerCorrect && (
            <Typography
              variant="body1"
              style={{
                color: colors.secondaryAccent,
                marginTop: '1rem',
                animation: 'fadeIn 0.5s ease-in',
              }}
            >
              {questions[currentQuestion].funFact}
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
  );
};

// Append styles to document
const styleSheet = document.createElement('style');
styleSheet.innerText = `
  ${animationStyles}
  ${wordAnimationStyles}
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;
document.head.appendChild(styleSheet);

export default FourPicsOneWord;