import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  Grid,
  Alert,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';

interface Choice {
  id: string;
  imagePath: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  questionText: string;
  choices: Choice[];
}

interface GameTemplate {
  activityName: string;
  maxScore: number;
  maxExp: number;
  questions: Question[];
}

const CreateImageMultipleChoice: React.FC = () => {
  const [gameTemplate, setGameTemplate] = useState<GameTemplate>({
    activityName: '',
    maxScore: 100,
    maxExp: 50,
    questions: [
      {
        id: `question${Date.now()}`,
        questionText: '',
        choices: [
          { id: `choice${Date.now()}A`, imagePath: '', isCorrect: false },
          { id: `choice${Date.now()}B`, imagePath: '', isCorrect: false },
          { id: `choice${Date.now()}C`, imagePath: '', isCorrect: false },
          { id: `choice${Date.now()}D`, imagePath: '', isCorrect: false },
        ],
      },
    ],
  });

  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const [previewUrls, setPreviewUrls] = useState<string[][]>(
    gameTemplate.questions.map((q) => q.choices.map(() => '')),
  );

  useEffect(() => {
    setPreviewUrls(gameTemplate.questions.map((q) => q.choices.map(() => '')));
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

  const handleChoiceChange = (
    questionIndex: number,
    choiceIndex: number,
    field: keyof Choice,
    value: any,
  ) => {
    const newQuestions = [...gameTemplate.questions];
    newQuestions[questionIndex].choices[choiceIndex] = {
      ...newQuestions[questionIndex].choices[choiceIndex],
      [field]: value,
    };
    if (field === 'isCorrect' && value) {
      newQuestions[questionIndex].choices.forEach((choice, idx) => {
        if (idx !== choiceIndex) {
          choice.isCorrect = false;
        }
      });
    }
    setGameTemplate({ ...gameTemplate, questions: newQuestions });
  };

  const handleImageUpload = async (
    questionIndex: number,
    choiceIndex: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    setPreviewUrls((prevUrls) => {
      const newUrls = [...prevUrls];
      if (!newUrls[questionIndex]) newUrls[questionIndex] = [];
      newUrls[questionIndex][choiceIndex] = previewUrl;
      return newUrls;
    });

    const imagePath = `/images/multiple-choice/${file.name}`;

    const newQuestions = [...gameTemplate.questions];
    newQuestions[questionIndex].choices[choiceIndex].imagePath = imagePath;
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
          questionText: '',
          choices: [
            { id: `choice${Date.now()}A`, imagePath: '', isCorrect: false },
            { id: `choice${Date.now()}B`, imagePath: '', isCorrect: false },
            { id: `choice${Date.now()}C`, imagePath: '', isCorrect: false },
            { id: `choice${Date.now()}D`, imagePath: '', isCorrect: false },
          ],
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

  const addChoice = (questionIndex: number) => {
    const newQuestions = [...gameTemplate.questions];
    const newChoiceId = `choice${Date.now()}${String.fromCharCode(
      65 + newQuestions[questionIndex].choices.length,
    )}`;
    newQuestions[questionIndex].choices.push({
      id: newChoiceId,
      imagePath: '',
      isCorrect: false,
    });
    setGameTemplate({ ...gameTemplate, questions: newQuestions });
    setPreviewUrls((prevUrls) => {
      const newUrls = [...prevUrls];
      if (newUrls[questionIndex]) {
        newUrls[questionIndex].push('');
      }
      return newUrls;
    });
  };

  const removeChoice = (questionIndex: number, choiceIndex: number) => {
    const newQuestions = [...gameTemplate.questions];
    newQuestions[questionIndex].choices = newQuestions[
      questionIndex
    ].choices.filter((_, i) => i !== choiceIndex);
    setGameTemplate({ ...gameTemplate, questions: newQuestions });
    setPreviewUrls((prevUrls) => {
      const newUrls = [...prevUrls];
      if (newUrls[questionIndex]) {
        newUrls[questionIndex] = newUrls[questionIndex].filter(
          (_, i) => i !== choiceIndex,
        );
      }
      return newUrls;
    });
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
      if (!question.questionText.trim()) {
        setError(`Question ${question.id}: Please enter the question text`);
        return false;
      }
      if (question.choices.length < 2) {
        setError(
          `Question ${question.id}: Please add at least two answer choices`,
        );
        return false;
      }
      if (question.choices.filter((choice) => choice.isCorrect).length !== 1) {
        setError(`Question ${question.id}: Please select exactly one correct answer`);
        return false;
      }
      if (
        question.choices.some(
          (choice) => !choice.imagePath || !choice.imagePath.trim(),
        )
      ) {
        setError(`Question ${question.id}: All choices must have an image selected.`);
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
      const gameData = {
        activityName: gameTemplate.activityName,
        maxScore: gameTemplate.maxScore,
        maxExp: gameTemplate.maxExp,
        isPremade: false,
        gameMode: 'IMAGE_MULTIPLE_CHOICE',
        gameData: JSON.stringify({
          questions: gameTemplate.questions,
        }),
      };

      setSuccess('Image Multiple Choice Game created successfully!');
      setGameTemplate({
        activityName: '',
        maxScore: 100,
        maxExp: 50,
        questions: [
          {
            id: `question${Date.now()}`,
            questionText: '',
            choices: [
              { id: `choice${Date.now()}A`, imagePath: '', isCorrect: false },
              { id: `choice${Date.now()}B`, imagePath: '', isCorrect: false },
              { id: `choice${Date.now()}C`, imagePath: '', isCorrect: false },
              { id: `choice${Date.now()}D`, imagePath: '', isCorrect: false },
            ],
          },
        ],
      });
      setPreviewUrls([['', '', '', '']]);
    } catch (err) {
      setError('Failed to create game. Please try again.');
      console.error('Error creating image multiple choice game:', err);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Create Image Multiple Choice Game
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
              label="Question Text"
              value={question.questionText}
              onChange={(e) =>
                handleQuestionChange(questionIndex, 'questionText', e.target.value)
              }
              required
              multiline
              rows={2}
            />

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Answer Choices
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
              {question.choices.map((choice, choiceIndex) => {
                const currentPreviewUrl =
                  previewUrls[questionIndex]?.[choiceIndex] || choice.imagePath;

                return (
                  <Box
                    key={choice.id}
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
                      Choice {String.fromCharCode(65 + choiceIndex)}
                    </Typography>
                    <Box sx={{ position: 'relative', width: 150, height: 150 }}>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id={`choice-image-${questionIndex}-${choiceIndex}`}
                        type="file"
                        onChange={(e) =>
                          handleImageUpload(questionIndex, choiceIndex, e)
                        }
                      />
                      <label htmlFor={`choice-image-${questionIndex}-${choiceIndex}`}>
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
                              alt={`Choice ${String.fromCharCode(65 + choiceIndex)} Image`}
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
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={choice.isCorrect}
                          onChange={(e) =>
                            handleChoiceChange(
                              questionIndex,
                              choiceIndex,
                              'isCorrect',
                              e.target.checked,
                            )
                          }
                        />
                      }
                      label="Correct Answer"
                    />
                    <IconButton
                      color="error"
                      onClick={() => removeChoice(questionIndex, choiceIndex)}
                      disabled={question.choices.length <= 2}
                    >
                      <DeleteIcon />
                    </IconButton>
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

export default CreateImageMultipleChoice;