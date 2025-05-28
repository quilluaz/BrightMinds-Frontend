import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  Grid,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import { gameService } from '../../../services/game';
import { useNavigate } from 'react-router-dom';
import { GameDTO } from '../../../types';

interface MatchingPair {
  id: number;
  word: string;
  english: string;
  imageUrl?: string; // Optional image URL
}

interface GameLevel {
  level: number;
  pairs: MatchingPair[];
}

interface GameTemplate {
  activityName: string;
  maxScore: number;
  maxExp: number;
  levels: GameLevel[];
}

const CreateMatchingGame: React.FC = () => {
  const navigate = useNavigate();
  const [gameTemplate, setGameTemplate] = useState<GameTemplate>({
    activityName: '',
    maxScore: 100,
    maxExp: 50,
    levels: [
      {
        level: 1,
        pairs: [],
      },
    ],
  });

  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleLevelChange = (levelIndex: number, field: keyof GameLevel, value: any) => {
    const newLevels = [...gameTemplate.levels];
    newLevels[levelIndex] = {
      ...newLevels[levelIndex],
      [field]: value,
    };
    setGameTemplate({ ...gameTemplate, levels: newLevels });
  };

  const handlePairChange = (levelIndex: number, pairIndex: number, field: keyof MatchingPair, value: string) => {
    const newLevels = [...gameTemplate.levels];
    newLevels[levelIndex].pairs[pairIndex] = {
      ...newLevels[levelIndex].pairs[pairIndex],
      [field]: value,
    };
    setGameTemplate({ ...gameTemplate, levels: newLevels });
  };

  const handleImageUpload = async (levelIndex: number, pairIndex: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Convert the file path to a relative path format
    const imagePath = `/images/matching/${file.name}`;
    
    const newLevels = [...gameTemplate.levels];
    newLevels[levelIndex].pairs[pairIndex] = {
      ...newLevels[levelIndex].pairs[pairIndex],
      imageUrl: imagePath,
    };
    setGameTemplate({ ...gameTemplate, levels: newLevels });

    // TODO: Implement actual image upload to your storage service
  };

  const addLevel = () => {
    setGameTemplate({
      ...gameTemplate,
      levels: [
        ...gameTemplate.levels,
        {
          level: gameTemplate.levels.length + 1,
          pairs: [],
        },
      ],
    });
  };

  const removeLevel = (index: number) => {
    const newLevels = gameTemplate.levels.filter((_, i) => i !== index);
    setGameTemplate({ ...gameTemplate, levels: newLevels });
  };

  const addPair = (levelIndex: number) => {
    const newLevels = [...gameTemplate.levels];
    newLevels[levelIndex].pairs.push({
      id: Date.now(), // Simple unique ID for the pair
      word: '',
      english: '',
      imageUrl: '',
    });
    setGameTemplate({ ...gameTemplate, levels: newLevels });
  };

  const removePair = (levelIndex: number, pairIndex: number) => {
    const newLevels = [...gameTemplate.levels];
    newLevels[levelIndex].pairs = newLevels[levelIndex].pairs.filter((_, i) => i !== pairIndex);
    setGameTemplate({ ...gameTemplate, levels: newLevels });
  };

  const validateGame = (): boolean => {
    if (!gameTemplate.activityName.trim()) {
      setError('Please enter a game name');
      return false;
    }

    if (gameTemplate.levels.length === 0) {
      setError('Please add at least one level');
      return false;
    }

    for (const level of gameTemplate.levels) {
      if (level.pairs.length === 0) {
        setError(`Level ${level.level} must have at least one matching pair`);
        return false;
      }

      for (const pair of level.pairs) {
        if (!pair.word.trim()) {
          setError(`Level ${level.level}: All matching pairs must have a Word`);
          return false;
        }
        if (!pair.english.trim()) {
          setError(`Level ${level.level}: All matching pairs must have an English translation`);
          return false;
        }
        // Image is optional, so no validation needed for imageUrl
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
        gameMode: 'MATCHING' as GameDTO['gameMode'],
        gameData: JSON.stringify({
          levels: gameTemplate.levels,
        }),
      };

      await gameService.createGame(gameData);
      setSuccess('Matching Game created successfully!');
      
      // Reset form
      setGameTemplate({
        activityName: '',
        maxScore: 100,
        maxExp: 50,
        levels: [
          {
            level: 1,
            pairs: [],
          },
        ],
      });

      // Navigate back to game library after successful creation
      setTimeout(() => {
        navigate('/teacher/games/library');
      }, 2000);
    } catch (err) {
      setError('Failed to create game. Please try again.');
      console.error('Error creating matching game:', err);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Create Matching Game
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

      {gameTemplate.levels.map((level, levelIndex) => (
        <Paper key={levelIndex} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Level {level.level}</Typography>
            <IconButton
              color="error"
              onClick={() => removeLevel(levelIndex)}
              disabled={gameTemplate.levels.length === 1}
            >
              <DeleteIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: 'grid', gap: 3 }}>
            <Typography variant="h6" gutterBottom>Matching Pairs</Typography>
            {level.pairs.map((pair, pairIndex) => (
              <Box key={pairIndex} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  fullWidth
                  label="Word (e.g., Filipino)"
                  value={pair.word}
                  onChange={(e) => handlePairChange(levelIndex, pairIndex, 'word', e.target.value)}
                  required
                />
                <TextField
                  fullWidth
                  label="English Translation"
                  value={pair.english}
                  onChange={(e) => handlePairChange(levelIndex, pairIndex, 'english', e.target.value)}
                  required
                />
                <Box sx={{ position: 'relative' }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id={`image-upload-${levelIndex}-${pairIndex}`}
                    type="file"
                    onChange={(e) => handleImageUpload(levelIndex, pairIndex, e)}
                  />
                  <label htmlFor={`image-upload-${levelIndex}-${pairIndex}`}>
                    <Box
                      sx={{
                        width: 100,
                        height: 100,
                        border: '2px dashed',
                        borderColor: 'divider',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backgroundColor: pair.imageUrl ? 'transparent' : 'action.hover',
                        '&:hover': {
                          borderColor: 'primary.main',
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      {pair.imageUrl ? (
                        <Box
                          component="img"
                          src={pair.imageUrl}
                          alt={`Pair ${pairIndex + 1} Image`}
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
                </Box>
                <IconButton
                  color="error"
                  onClick={() => removePair(levelIndex, pairIndex)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => addPair(levelIndex)}
              sx={{ mt: 1 }}
            >
              Add Matching Pair
            </Button>
          </Box>
        </Paper>
      ))}

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={addLevel}
        >
          Add Level
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

export default CreateMatchingGame; 