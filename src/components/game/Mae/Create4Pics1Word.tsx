import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import { gameService } from '../../../services/game';
import { useNavigate } from 'react-router-dom';
import { GameDTO } from '../../../types';
import { useAuth } from '../../../context/AuthContext';

interface Question {
  id: string;
  answer: string;
  images: string[];
}

interface GameTemplate {
  activityName: string;
  maxScore: number;
  maxExp: number;
  questions: Question[];
}

const Create4Pics1Word: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [gameTemplate, setGameTemplate] = useState<GameTemplate>({
    activityName: '',
    maxScore: 100,
    maxExp: 50,
    questions: [
      {
        id: `question${Date.now()}`,
        answer: '',
        images: ['', '', '', ''],
      },
    ],
  });

  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const [previewUrls, setPreviewUrls] = useState<string[][]>(
    gameTemplate.questions.map(q => q.images.map(() => ''))
  );

  useEffect(() => {
    setPreviewUrls(gameTemplate.questions.map(q => q.images.map(() => '')));
  }, [gameTemplate.questions]);

  const handleGameTemplateChange = (field: keyof GameTemplate, value: any) => {
    setGameTemplate({ ...gameTemplate, [field]: value });
  };

  const handleQuestionChange = (
    questionIndex: number,
    field: keyof Question,
    value: any,
  ) => {
    const newQuestions = [...gameTemplate.questions];
    newQuestions[questionIndex] = {
      ...newQuestions[questionIndex],
      [field]: value,
    };
    setGameTemplate({ ...gameTemplate, questions: newQuestions });
  };

  const handleImageUpload = async (
    questionIndex: number,
    imageIndex: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    setPreviewUrls((prevUrls) => {
      const newUrls = [...prevUrls];
      if (!newUrls[questionIndex]) newUrls[questionIndex] = [];
      newUrls[questionIndex][imageIndex] = previewUrl;
      return newUrls;
    });

    const imagePath = `/images/4pics1word/${file.name}`;

    const newQuestions = [...gameTemplate.questions];
    newQuestions[questionIndex].images[imageIndex] = imagePath;
    setGameTemplate({ ...gameTemplate, questions: newQuestions });
  };

  const addQuestion = () => {
    const newQuestionId = `question${Date.now()}`;
    setGameTemplate({
      ...gameTemplate,
      questions: [
        ...gameTemplate.questions,
        {
          id: newQuestionId,
          answer: '',
          images: ['', '', '', ''],
        },
      ],
    });
    setPreviewUrls((prevUrls) => [...prevUrls, ['', '', '', '']]);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = gameTemplate.questions.filter((_, i) => i !== index);
    setGameTemplate({ ...gameTemplate, questions: newQuestions });
    setPreviewUrls((prevUrls) => prevUrls.filter((_, i) => i !== index));
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
        setError(`Question ${question.id}: Please enter the answer`);
        return false;
      }
      if (question.images.some(image => !image.trim())) {
        setError(`Question ${question.id}: All images must be selected`);
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
      if (!currentUser || currentUser.role !== 'TEACHER') {
        setError('You must be logged in as a teacher to create games.');
        return;
      }

      const gameData = {
        activityName: gameTemplate.activityName,
        maxScore: gameTemplate.maxScore,
        maxExp: gameTemplate.maxExp,
        isPremade: false,
        gameMode: 'FOUR_PICS_ONE_WORD' as const,
        gameData: JSON.stringify({
          questions: gameTemplate.questions,
        }),
        createdBy: {
          id: currentUser.id,
          name: currentUser.name
        }
      };

      await gameService.createGame(gameData);
      setSuccess('4 Pics 1 Word Game created successfully!');
      
      // Reset form
      setGameTemplate({
        activityName: '',
        maxScore: 100,
        maxExp: 50,
        questions: [
          {
            id: `question${Date.now()}`,
            answer: '',
            images: ['', '', '', ''],
          },
        ],
      });

      // Navigate back to game library after successful creation
      setTimeout(() => {
        navigate('/teacher/games/library');
      }, 2000);
    } catch (err) {
      setError('Failed to create game. Please try again.');
      console.error('Error creating 4 pics 1 word game:', err);
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
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr) 1fr 1fr',
            },
            gap: 3,
          }}
        >
          <TextField
            fullWidth
            label="Game Name"
            value={gameTemplate.activityName}
            onChange={(e) => handleGameTemplateChange('activityName', e.target.value)}
            required
          />
          <TextField
            fullWidth
            type="number"
            label="Max Score"
            value={gameTemplate.maxScore}
            onChange={(e) =>
              handleGameTemplateChange('maxScore', parseInt(e.target.value))
            }
            required
          />
          <TextField
            fullWidth
            type="number"
            label="Max Experience"
            value={gameTemplate.maxExp}
            onChange={(e) =>
              handleGameTemplateChange('maxExp', parseInt(e.target.value))
            }
            required
          />
        </Box>
      </Paper>

      {gameTemplate.questions.map((question, questionIndex) => (
        <Paper key={question.id} sx={{ p: 3, mb: 3 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <Typography variant="h6">Question {questionIndex + 1}</Typography>
            <IconButton
              color="error"
              onClick={() => removeQuestion(questionIndex)}
              disabled={gameTemplate.questions.length === 1}
            >
              <DeleteIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: 'grid', gap: 3 }}>
            <TextField
              fullWidth
              label="Answer"
              value={question.answer}
              onChange={(e) =>
                handleQuestionChange(questionIndex, 'answer', e.target.value)
              }
              required
            />

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Images
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { 
                xs: '1fr', 
                sm: 'repeat(2, 1fr)', 
                md: 'repeat(4, 1fr)' 
              }, 
              gap: 2 
            }}>
              {question.images.map((_, imageIndex) => {
                const currentPreviewUrl = previewUrls[questionIndex]?.[imageIndex] || '';

                return (
                  <Box
                    key={imageIndex}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      border: '1px solid #ddd',
                      p: 2,
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="subtitle1">
                      Image {imageIndex + 1}
                    </Typography>
                    <Box sx={{ position: 'relative', width: 150, height: 150 }}>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id={`image-upload-${questionIndex}-${imageIndex}`}
                        type="file"
                        onChange={(e) =>
                          handleImageUpload(questionIndex, imageIndex, e)
                        }
                      />
                      <label htmlFor={`image-upload-${questionIndex}-${imageIndex}`}>
                        <Box
                          sx={{
                            width: '100%',
                            height: '100%',
                            border: '2px dashed',
                            borderColor: 'divider',
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            backgroundColor: currentPreviewUrl
                              ? 'transparent'
                              : 'action.hover',
                            '&:hover': {
                              borderColor: 'primary.main',
                              backgroundColor: 'action.hover',
                            },
                          }}
                        >
                          {currentPreviewUrl ? (
                            <Box
                              component="img"
                              src={currentPreviewUrl}
                              alt={`Image ${imageIndex + 1}`}
                              sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: 1,
                              }}
                            />
                          ) : (
                            <ImageIcon color="action" sx={{ fontSize: 50 }} />
                          )}
                        </Box>
                      </label>
                    </Box>
                  </Box>
                );
              })}
            </Box>
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