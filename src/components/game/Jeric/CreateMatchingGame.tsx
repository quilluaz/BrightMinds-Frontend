import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  Alert,
  Grid, // <--- ADDED Grid HERE
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image'; // For image placeholder
import CloudUploadIcon from '@mui/icons-material/CloudUpload'; // For upload button
import { gameService } from '../../../services/game';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL } from '../../../config';
import { MatchingPair } from '../../../types';

// Interface for the pair structure within the component's state
interface UIPair {
  uiId: string; // Unique ID for React key management
  word: string;
  englishLabel: string; // This will be the 'content' for the image card if needed as a label
  imageUrl: string; // Path to the image from backend
  imagePreviewUrl?: string; // For local preview before saving game
}

interface GameTemplate {
  activityName: string;
  maxScore: number;
  maxExp: number;
  pairs: UIPair[]; // Uses the local UIPair for form state
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
        uiId: `pair${Date.now()}`,
        word: '',
        englishLabel: '',
        imageUrl: '',
        imagePreviewUrl: '',
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
    field: keyof UIPair,
    value: string,
  ) => {
    const newPairs = [...gameTemplate.pairs];
    newPairs[pairIndex] = {
      ...newPairs[pairIndex],
      [field]: value,
    };
    setGameTemplate({ ...gameTemplate, pairs: newPairs });
  };

  const handleImageUpload = async (
    pairIndex: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const newPairs = [...gameTemplate.pairs];
    // Set local preview immediately
    newPairs[pairIndex].imagePreviewUrl = URL.createObjectURL(file);
    setGameTemplate({ ...gameTemplate, pairs: newPairs });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('gameType', 'matching-game'); // Specify gameType

      const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to upload image, server response not JSON.' }));
        throw new Error(errorData.message || `Failed to upload image. Status: ${response.status}`);
      }

      const data = await response.json();
      const imagePathFromBackend = data.imagePath; // e.g., /images/matching-game/yourfile.jpg

      // Update the pair with the path from the backend
      const updatedPairsWithBackendPath = [...gameTemplate.pairs]; // Fetch fresh state
      updatedPairsWithBackendPath[pairIndex].imageUrl = imagePathFromBackend;
      setGameTemplate({ ...gameTemplate, pairs: updatedPairsWithBackendPath });

    } catch (uploadError) {
      console.error('Error uploading image:', uploadError);
      setError(uploadError instanceof Error ? uploadError.message : 'Failed to upload image.');
      // Optionally clear preview if upload fails
      const revertedPairs = [...gameTemplate.pairs];
      revertedPairs[pairIndex].imagePreviewUrl = ''; // Clear preview
      revertedPairs[pairIndex].imageUrl = ''; // Ensure backend path is also clear
      setGameTemplate({ ...gameTemplate, pairs: revertedPairs });
    }
  };

  const addPair = () => {
    setGameTemplate({
      ...gameTemplate,
      pairs: [
        ...gameTemplate.pairs,
        {
          uiId: `pair${Date.now()}`,
          word: '',
          englishLabel: '',
          imageUrl: '',
          imagePreviewUrl: '',
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
      setError('Please enter a game name.');
      return false;
    }

    if (gameTemplate.pairs.length === 0) {
      setError('Please add at least one matching pair.');
      return false;
    }

    for (const pair of gameTemplate.pairs) {
      if (!pair.word.trim()) {
        setError('All pairs must have a word.');
        return false;
      }
      if (!pair.imageUrl.trim()) { // Check for the backend imageUrl
        setError(`Pair with word "${pair.word}" is missing an uploaded image.`);
        return false;
      }
      if (!pair.englishLabel.trim()) {
        setError(`Pair with word "${pair.word}" is missing an English label/description for the image card.`);
        return false;
      }
    }
    setError('');
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

      const gameLogicPairs: MatchingPair[] = gameTemplate.pairs.map((uiPair, index) => ({
        id: index + 1, 
        word: uiPair.word,
        english: uiPair.englishLabel, 
        imageUrl: uiPair.imageUrl,
      }));

      const gameDataPayload = {
        activityName: gameTemplate.activityName,
        maxScore: gameTemplate.maxScore,
        maxExp: gameTemplate.maxExp,
        isPremade: false,
        gameMode: 'MATCHING' as const,
        gameData: JSON.stringify({
          levels: [
            {
              level: 1,
              title: gameTemplate.activityName || "Level 1", 
              pairs: gameLogicPairs,
            },
          ],
        }),
        createdBy: {
          id: currentUser.id,
          name: currentUser.name
        }
      };

      await gameService.createGame(gameDataPayload);
      setSuccess('Matching Game created successfully!');
      
      setGameTemplate({
        activityName: '',
        maxScore: 100,
        maxExp: 50,
        pairs: [{ uiId: `pair${Date.now()}`, word: '', englishLabel: '', imageUrl: '', imagePreviewUrl: '' }],
      });

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
              md: 'repeat(3, 1fr)', // Adjusted for 3 items
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
            InputProps={{ inputProps: { min: 0 } }}
            value={gameTemplate.maxScore}
            onChange={(e) =>
              handleGameTemplateChange('maxScore', parseInt(e.target.value) || 0)
            }
            required
          />
          <TextField
            fullWidth
            type="number"
            label="Max Experience"
            InputProps={{ inputProps: { min: 0 } }}
            value={gameTemplate.maxExp}
            onChange={(e) =>
              handleGameTemplateChange('maxExp', parseInt(e.target.value) || 0)
            }
            required
          />
        </Box>
      </Paper>

      {gameTemplate.pairs.map((pair, pairIndex) => (
        <Paper key={pair.uiId} sx={{ p: 3, mb: 3 }}>
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

          <Grid container spacing={3} alignItems="flex-start"> {/* Changed alignItems to flex-start */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Word (e.g., Tagalog)"
                value={pair.word}
                onChange={(e) =>
                  handlePairChange(pairIndex, 'word', e.target.value)
                }
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Image Card Label (e.g., English)"
                value={pair.englishLabel}
                onChange={(e) =>
                  handlePairChange(pairIndex, 'englishLabel', e.target.value)
                }
                required
                helperText="This label appears with the image card."
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id={`image-upload-${pairIndex}`}
                  type="file"
                  onChange={(e) => handleImageUpload(pairIndex, e)}
                />
                <label htmlFor={`image-upload-${pairIndex}`}>
                  <Button variant="outlined" component="span" startIcon={<CloudUploadIcon />}>
                    Upload Image
                  </Button>
                </label>
                {pair.imagePreviewUrl && (
                  <Box
                    component="img"
                    src={pair.imagePreviewUrl}
                    alt="Preview"
                    sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 1, border: '1px solid #ddd', mt: 1 }}
                  />
                )}
                {!pair.imagePreviewUrl && pair.imageUrl && ( 
                   <Box
                    component="img"
                    src={pair.imageUrl.startsWith('http') || pair.imageUrl.startsWith('/') ? pair.imageUrl : `${API_BASE_URL}${pair.imageUrl}`}
                    alt="Stored image"
                    sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 1, border: '1px solid #ddd', mt: 1 }}
                  />
                )}
                 {!pair.imagePreviewUrl && !pair.imageUrl && (
                  <Box sx={{ width: 100, height: 100, border: '1px dashed #ddd', display:'flex', alignItems:'center', justifyContent:'center', borderRadius: 1, mt:1, backgroundColor:'#f9f9f9'}}>
                    <ImageIcon color="action" />
                  </Box>
                 )}
              </Box>
            </Grid>
          </Grid>
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