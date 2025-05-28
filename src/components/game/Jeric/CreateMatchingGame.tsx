import React, { useState } from 'react';
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
import { gameService } from '../../../services/game';
import { useNavigate } from 'react-router-dom';
import { GameDTO } from '../../../types';
import { useAuth } from '../../../context/AuthContext';

interface MatchingPair {
  id: string;
  leftItem: string;
  rightItem: string;
}

interface GameTemplate {
  activityName: string;
  maxScore: number;
  maxExp: number;
  pairs: MatchingPair[];
}

const CreateMatchingGame: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [gameTemplate, setGameTemplate] = useState<GameTemplate>({
    activityName: '',
    maxScore: 100,
    maxExp: 50,
    pairs: [
      {
        id: `pair${Date.now()}`,
        leftItem: '',
        rightItem: '',
      },
    ],
  });

  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleGameTemplateChange = (field: keyof GameTemplate, value: any) => {
    setGameTemplate({ ...gameTemplate, [field]: value });
  };

  const handlePairChange = (
    pairIndex: number,
    field: keyof MatchingPair,
    value: string,
  ) => {
    const newPairs = [...gameTemplate.pairs];
    newPairs[pairIndex] = {
      ...newPairs[pairIndex],
      [field]: value,
    };
    setGameTemplate({ ...gameTemplate, pairs: newPairs });
  };

  const addPair = () => {
    setGameTemplate({
      ...gameTemplate,
      pairs: [
        ...gameTemplate.pairs,
        {
          id: `pair${Date.now()}`,
          leftItem: '',
          rightItem: '',
        },
      ],
    });
  };

  const removePair = (index: number) => {
    const newPairs = gameTemplate.pairs.filter((_, i) => i !== index);
    setGameTemplate({ ...gameTemplate, pairs: newPairs });
  };

  const validateGame = (): boolean => {
    if (!gameTemplate.activityName.trim()) {
      setError('Please enter a game name');
      return false;
    }

    if (gameTemplate.pairs.length === 0) {
      setError('Please add at least one matching pair');
      return false;
    }

    for (const pair of gameTemplate.pairs) {
      if (!pair.leftItem.trim() || !pair.rightItem.trim()) {
        setError('All pairs must have both left and right items');
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
        gameMode: 'MATCHING' as const,
        gameData: JSON.stringify({
          pairs: gameTemplate.pairs,
        }),
        createdBy: {
          id: currentUser.id,
          name: currentUser.name
        }
      };

      await gameService.createGame(gameData);
      setSuccess('Matching Game created successfully!');
      
      // Reset form
      setGameTemplate({
        activityName: '',
        maxScore: 100,
        maxExp: 50,
        pairs: [
          {
            id: `pair${Date.now()}`,
            leftItem: '',
            rightItem: '',
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

      {gameTemplate.pairs.map((pair, pairIndex) => (
        <Paper key={pair.id} sx={{ p: 3, mb: 3 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <Typography variant="h6">Pair {pairIndex + 1}</Typography>
            <IconButton
              color="error"
              onClick={() => removePair(pairIndex)}
              disabled={gameTemplate.pairs.length === 1}
            >
              <DeleteIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: 'grid', gap: 3 }}>
            <TextField
              fullWidth
              label="Left Item"
              value={pair.leftItem}
              onChange={(e) =>
                handlePairChange(pairIndex, 'leftItem', e.target.value)
              }
              required
            />
            <TextField
              fullWidth
              label="Right Item"
              value={pair.rightItem}
              onChange={(e) =>
                handlePairChange(pairIndex, 'rightItem', e.target.value)
              }
              required
            />
          </Box>
        </Paper>
      ))}

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={addPair}
        >
          Add Pair
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