import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import { useTheme } from '../../../context/ThemeContext';

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

const Create4Pics1Word: React.FC = () => {
  const { theme } = useTheme();
  const [gameTemplate, setGameTemplate] = useState<GameTemplate>({
    activityName: '',
    maxScore: 100,
    maxExp: 50,
    questions: [
      {
        images: ['', '', '', ''],
        answer: '',
        clue: '',
        englishTranslation: '',
        funFact: '',
      },
    ],
  });

  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // We need a way to store the temporary URLs for previews independently
  // without affecting the main gameTemplate state which stores the final paths.
  // A simple approach for demonstration is a separate state or ref.
  // Let's use a state variable to hold preview URLs keyed by question and image index.
  const [previewUrls, setPreviewUrls] = useState<string[][]>(
    gameTemplate.questions.map(q => q.images.map(() => ''))
  );

  // Effect to update previewUrls state when gameTemplate.questions changes
  React.useEffect(() => {
    setPreviewUrls(gameTemplate.questions.map(q => q.images.map(() => '')));
  }, [gameTemplate.questions]);

  const handleQuestionChange = (index: number, field: keyof GameQuestion, value: string | string[]) => {
    const newQuestions = [...gameTemplate.questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value,
    };
    setGameTemplate({ ...gameTemplate, questions: newQuestions });
  };

  const handleImageUpload = async (questionIndex: number, imageIndex: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create a temporary URL for immediate preview
    const previewUrl = URL.createObjectURL(file);

    // Update the separate previewUrls state
    setPreviewUrls(prevUrls => {
      const newUrls = [...prevUrls];
      if (!newUrls[questionIndex]) newUrls[questionIndex] = [];
      newUrls[questionIndex][imageIndex] = previewUrl;
      return newUrls;
    });

    // Here you would typically upload the file to your storage service
    // and get the permanent URL/path back from the backend.
    // For now, we will store the intended path in the main state.
    const imagePath = `/images/4pics1word/${file.name}`;
    
    const newQuestions = [...gameTemplate.questions];
    // Store the intended path in the main state
    newQuestions[questionIndex].images[imageIndex] = imagePath;
    setGameTemplate({ ...gameTemplate, questions: newQuestions });

    // Optional: Clean up previous temporary URL to free memory
    // if (previewUrls[questionIndex]?.[imageIndex]) {
    //   URL.revokeObjectURL(previewUrls[questionIndex][imageIndex]);
    // }
  };

  const addQuestion = () => {
    setGameTemplate({
      ...gameTemplate,
      questions: [
        ...gameTemplate.questions,
        {
          images: ['', '', '', ''],
          answer: '',
          clue: '',
          englishTranslation: '',
          funFact: '',
        },
      ],
    });
  };

  const removeQuestion = (index: number) => {
    const newQuestions = gameTemplate.questions.filter((_, i) => i !== index);
    setGameTemplate({ ...gameTemplate, questions: newQuestions });
  };

  const validateGame = (): boolean => {
    if (!gameTemplate.activityName.trim()) {
      setError('Please enter a game name');
      return false;
    }

    if (gameTemplate.questions.length === 0) {
      setError('Please add at least one question');
      return false;
    }

    for (const question of gameTemplate.questions) {
      if (!question.answer.trim()) {
        setError('All questions must have an answer');
        return false;
      }
      if (!question.clue.trim()) {
        setError('All questions must have a clue');
        return false;
      }
      if (!question.englishTranslation.trim()) {
        setError('All questions must have an English translation');
        return false;
      }
      if (question.images.some(img => !img.trim())) {
        setError('All questions must have 4 images');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!validateGame()) {
      return;
    }

    try {
      // Create the game data in the format expected by the backend
      const gameData = {
        activityName: gameTemplate.activityName,
        maxScore: gameTemplate.maxScore,
        maxExp: gameTemplate.maxExp,
        isPremade: false,
        gameMode: 'FOUR_PICS_ONE_WORD',
        gameData: JSON.stringify({
          questions: gameTemplate.questions,
        }),
      };

      // TODO: Add your API call here to save the game
      // const response = await api.createGame(gameData);
      
      setSuccess('Game created successfully!');
      // Reset form or redirect
    } catch (err) {
      setError('Failed to create game. Please try again.');
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Create 4 Pics 1 Word Game
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr) 1fr 1fr' }, gap: 3 }}>
          <TextField
            fullWidth
            label="Game Name"
            value={gameTemplate.activityName}
            onChange={(e) => setGameTemplate({ ...gameTemplate, activityName: e.target.value })}
            required
          />
          <TextField
            fullWidth
            type="number"
            label="Max Score"
            value={gameTemplate.maxScore}
            onChange={(e) => setGameTemplate({ ...gameTemplate, maxScore: parseInt(e.target.value) })}
            required
          />
          <TextField
            fullWidth
            type="number"
            label="Max Experience"
            value={gameTemplate.maxExp}
            onChange={(e) => setGameTemplate({ ...gameTemplate, maxExp: parseInt(e.target.value) })}
            required
          />
        </Box>
      </Paper>

      {gameTemplate.questions.map((question, questionIndex) => (
        <Paper key={questionIndex} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Question {questionIndex + 1}</Typography>
            <IconButton
              color="error"
              onClick={() => removeQuestion(questionIndex)}
              disabled={gameTemplate.questions.length === 1}
            >
              <DeleteIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
            {gameTemplate.questions[questionIndex].images.map((imagePath, imageIndex) => {
              const currentPreviewUrl = previewUrls[questionIndex]?.[imageIndex] || imagePath; // Use preview URL if available, otherwise the stored path
              return (
                <Box key={imageIndex} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id={`image-upload-${questionIndex}-${imageIndex}`}
                    type="file"
                    onChange={(e) => handleImageUpload(questionIndex, imageIndex, e)}
                  />
                  <label htmlFor={`image-upload-${questionIndex}-${imageIndex}`}>
                    <Box
                      sx={{
                        width: 150,
                        height: 150,
                        border: '2px dashed',
                        borderColor: 'divider',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backgroundColor: currentPreviewUrl ? 'transparent' : 'action.hover',
                        '&:hover': {
                          borderColor: 'primary.main',
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      {currentPreviewUrl ? (
                        <Box
                          component="img"
                          src={currentPreviewUrl} // Use the temporary URL for preview
                          alt={`Image ${imageIndex + 1}`}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: 1,
                          }}
                        />
                      ) : (
                        <ImageIcon color="action" sx={{ fontSize: 40 }} />
                      )}
                    </Box>
                  </label>
                  <Typography variant="caption" color="text.secondary" align="center">
                    Image {imageIndex + 1}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          <Box sx={{ display: 'grid', gap: 3, mt: 3 }}>
            <TextField
              fullWidth
              label="Answer (in Filipino)"
              value={question.answer}
              onChange={(e) => handleQuestionChange(questionIndex, 'answer', e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Clue (in Filipino)"
              value={question.clue}
              onChange={(e) => handleQuestionChange(questionIndex, 'clue', e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="English Translation"
              value={question.englishTranslation}
              onChange={(e) => handleQuestionChange(questionIndex, 'englishTranslation', e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Fun Fact"
              value={question.funFact}
              onChange={(e) => handleQuestionChange(questionIndex, 'funFact', e.target.value)}
              required
              multiline
              rows={2}
            />
          </Box>
        </Paper>
      ))}

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={addQuestion}
        >
          Add Question
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleSubmit}
        >
          Create Game
        </Button>
      </Box>
    </Box>
  );
};

export default Create4Pics1Word; 