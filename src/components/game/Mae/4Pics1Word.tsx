import React, { useState, ChangeEvent, useRef, KeyboardEvent, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { Box, Grid, TextField, Button, Typography, Paper, Container, Theme } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

interface GameQuestion {
  images: string[];
  answer: string;
  clue: string;
}

const questions: GameQuestion[] = [
  {
    images: ['farmer', 'fisherman', 'teacher', 'factory'],
    answer: 'HANAPBUHAY',
    clue: 'Paraan ng pagkita ng pera o pagkain para sa pamilya.'
  },
  {
    images: ['store', 'school', 'health', 'church'],
    answer: 'PAMAYANAN',
    clue: 'Lugar kung saan magkakasama ang mga tao na may tungkulin.'
  },
  {
    images: ['planting', 'cleaning', 'recycling', 'forest'],
    answer: 'KAPALIGIRAN',
    clue: 'Kailangan itong alagaan dahil ito ang ating tahanan.'
  },
  {
    images: ['jeepney', 'skyscrapers', 'market', 'street'],
    answer: 'LUNGSOD',
    clue: 'Mataong lugar na may maraming gusali at sasakyan.'
  },
  {
    images: ['rice', 'coconut', 'house', 'mountain'],
    answer: 'LALAWIGAN',
    clue: 'Lugar sa kanayunan na tahimik at may malawak na taniman.'
  },
  {
    images: ['fiesta', 'dancing', 'band', 'food'],
    answer: 'KULTURA',
    clue: 'Pagpapakita ng tradisyon, gawi, at paniniwala ng isang grupo.'
  },
  {
    images: ['praying', 'ceremony', 'helping', 'speaking'],
    answer: 'PAGGALANG',
    clue: 'Mahalaga ito sa pakikitungo sa iba.'
  },
  {
    images: ['hall', 'tanod', 'meeting', 'signs'],
    answer: 'BARANGAY',
    clue: 'Pinakamaliit na yunit ng pamahalaan.'
  },
  {
    images: ['market', 'fish', 'vendors', 'vegetables'],
    answer: 'KALAKALAN',
    clue: 'Palitan ng produkto o serbisyo.'
  },
  {
    images: ['raising', 'blackboard', 'books', 'writing'],
    answer: 'EDUKASYON',
    clue: 'Mahalaga ito upang matuto at makamit ang pangarap.'
  }
];

const ImagePlaceholder = styled(Paper)(({ theme }: { theme: Theme }) => ({
  width: '100%',
  height: '200px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.mode === 'dark' ? '#424242' : '#e0e0e0',
  color: theme.palette.mode === 'dark' ? '#fff' : '#666',
  fontSize: '1.2rem',
  fontWeight: 'bold',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[4],
  },
}));

const GameContainer = styled(Container)(({ theme }: { theme: Theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: theme.palette.mode === 'dark' ? '#121212' : '#f5f5f5',
  minHeight: '100vh',
}));

const shakeAnimation = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
`;

const popAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); } /* Scale up a bit */
  100% { transform: scale(1); } /* Return to normal size */
`;

const LetterInput = styled(TextField)<{ isCorrect?: boolean; isWrong?: boolean; isShaking?: boolean }>(({ theme, isCorrect, isWrong, isShaking }) => ({
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
        : theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200],
    transition: 'background-color 0.3s ease, transform 0.3s ease',
    '& fieldset': {
      borderColor: isCorrect 
        ? theme.palette.success.main
        : isWrong 
          ? theme.palette.error.dark
          : theme.palette.mode === 'dark' ? theme.palette.grey[600] : theme.palette.grey[400],
      borderWidth: isCorrect || isWrong ? '2px' : '1px',
    },
    '&:hover fieldset': {
      borderColor: isCorrect 
        ? theme.palette.success.main
        : isWrong 
          ? theme.palette.error.dark
          : theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: isCorrect 
        ? theme.palette.success.main
        : isWrong 
          ? theme.palette.error.dark
          : theme.palette.primary.main,
    },
  },
  '& .MuiOutlinedInput-input': {
    color: isCorrect 
      ? theme.palette.success.dark
      : isWrong 
        ? theme.palette.error.contrastText
        : theme.palette.mode === 'dark' ? theme.palette.grey[100] : theme.palette.grey[900],
    padding: '0 8px',
    textAlign: 'center',
    backgroundColor: 'transparent',
    '&::placeholder': {
      opacity: 0.5,
    },
  },
  '& .MuiInputBase-input': {
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
}));

const ClueText = styled(Typography)(({ theme }: { theme: Theme }) => ({
  color: theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
  marginBottom: theme.spacing(2),
  fontSize: '1.2rem',
}));

const FourPicsOneWord: React.FC = () => {
  const { theme } = useTheme();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [letterInputs, setLetterInputs] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [showClue, setShowClue] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const isInitialMount = useRef(true);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);

  // Initialize letter inputs when question changes or component mounts
  useEffect(() => {
    const answerLength = questions[currentQuestion].answer.length;
    setLetterInputs(Array(answerLength).fill(''));
    inputRefs.current = Array(answerLength).fill(null);
    // Ensure inputs are enabled initially and reset states
    setIsAnswerCorrect(false);
    setIsShaking(false);
    setIsAnswerSubmitted(false);
    // Set isInitialMount to true whenever the question changes, so the check doesn't run on the first render of the new question
    isInitialMount.current = true; 
  }, [currentQuestion]);

  // Check answer whenever letterInputs changes, but only if all are filled and not during shake
  useEffect(() => {
    // Prevent checking on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const userAnswer = letterInputs.join('');
    const correctAnswer = questions[currentQuestion].answer;

    // Only check if all inputs are filled and we are not currently shaking and haven't submitted an answer yet for this attempt
    if (letterInputs.every(letter => letter !== '') && !isShaking && !isAnswerSubmitted) {
      const isCorrect = userAnswer === correctAnswer;
      
      setIsAnswerSubmitted(true);
      setIsAnswerCorrect(isCorrect);

      if (isCorrect) {
        setScore(prev => prev + 1);
        // Wait for a short duration before moving to next question
        setTimeout(() => {
          if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
            setShowClue(false);
          } else {
            setGameOver(true);
          }
        }, 1000);
      } else {
        setShowClue(true);
        setIsShaking(true);
        // Clear the answer after the shake animation
        setTimeout(() => {
          setLetterInputs(Array(letterInputs.length).fill(''));
          setIsAnswerSubmitted(false); // Allow typing again after wrong answer
          setIsAnswerCorrect(false); // Reset correctness state
          setIsShaking(false);
          // Focus the first input after clearing
          if (inputRefs.current[0]) {
             inputRefs.current[0].focus();
          }
        }, 700); // Increased delay slightly for animation
      }
    } 
    // No else case needed here to avoid prematurely marking wrong on empty inputs
  }, [letterInputs, currentQuestion, isShaking, isAnswerSubmitted]); // Added isAnswerSubmitted to dependencies

  const handleLetterChange = (index: number, value: string) => {
    // Allow changes only if not currently shaking or the answer has been submitted as correct
    if (isShaking || (isAnswerSubmitted && isAnswerCorrect)) return; 
    
    // Only allow input if all previous tiles are filled
    const previousTilesFilled = letterInputs.slice(0, index).every(letter => letter !== '');
    if (!previousTilesFilled) return;
    
    const newValue = value.slice(-1).toUpperCase(); // Take only the last character and make it uppercase
    const newInputs = [...letterInputs];
    newInputs[index] = newValue;
    setLetterInputs(newInputs);

    // Only auto-focus next input if a letter was entered and it's not the last one
    if (newValue && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (isShaking || (isAnswerSubmitted && isAnswerCorrect)) return; // Prevent changes during shake or after correct submission
    
    if (event.key === 'Backspace') {
      if (!letterInputs[index] && index > 0) {
        // If current input is empty and backspace is pressed, focus previous input
        inputRefs.current[index - 1]?.focus();
      }
    } else if (event.key === 'ArrowLeft' && index > 0) {
      // Move to previous input on left arrow
      inputRefs.current[index - 1]?.focus();
    } else if (event.key === 'ArrowRight' && index < inputRefs.current.length - 1) {
      // Only allow moving right if current tile is filled
      if (letterInputs[index] !== '') {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleInputClick = (index: number) => {
    // Find the first empty input before this index
    const firstEmptyIndex = letterInputs.findIndex((letter, i) => i <= index && letter === '');
    
    // If there's an empty input before this index, focus that instead
    if (firstEmptyIndex !== -1) {
      inputRefs.current[firstEmptyIndex]?.focus();
    } else {
      // Otherwise, allow focusing the clicked input
      inputRefs.current[index]?.focus();
    }
  };

  const resetGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowClue(false);
    setGameOver(false);
    setIsAnswerCorrect(false);
    setIsShaking(false);
    setIsAnswerSubmitted(false);
  };

  if (gameOver) {
    return (
      <GameContainer>
        <Box textAlign="center" py={4}>
          <Typography variant="h3" gutterBottom>
            Game Over!
          </Typography>
          <Typography variant="h4" gutterBottom>
            Your Score: {score}/{questions.length}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={resetGame}
            sx={{ mt: 2 }}
          >
            Play Again
          </Button>
        </Box>
      </GameContainer>
    );
  }

  return (
    <GameContainer>
      <Box textAlign="center" mb={4}>
        <Typography variant="h3" gutterBottom>
          4 Pics 1 Word
        </Typography>
        <Typography variant="h5" gutterBottom>
          Score: {score}
        </Typography>
      </Box>

      <Grid container spacing={2} mb={4}>
        {questions[currentQuestion].images.map((image, index) => (
          <Grid item xs={12} sm={6} key={index} component="div">
            <ImagePlaceholder>
              {image.toUpperCase()}
            </ImagePlaceholder>
          </Grid>
        ))}
      </Grid>

      <Box textAlign="center" mb={4}>
        {letterInputs.length > 0 && (
          <Box display="flex" justifyContent="center" alignItems="center" mb={3}>
            {letterInputs.map((letter, index) => (
              <LetterInput
                key={index}
                value={letter}
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
                  }
                }}
                disabled={isShaking || (isAnswerSubmitted && isAnswerCorrect)}
                isCorrect={isAnswerSubmitted && !isShaking && letterInputs.every(letter => letter !== '') && isAnswerCorrect}
                isWrong={isAnswerSubmitted && !isAnswerCorrect && letterInputs.every(letter => letter !== '')}
                isShaking={isShaking}
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
        <Button
          variant="outlined"
          color="secondary"
          size="large"
          onClick={() => setShowClue(!showClue)}
        >
          {showClue ? 'Hide Clue' : 'Show Clue'}
        </Button>
      </Box>

      {showClue && (
        <Box textAlign="center">
          <ClueText>
            Clue: {questions[currentQuestion].clue}
          </ClueText>
        </Box>
      )}
    </GameContainer>
  );
};

export default FourPicsOneWord;
