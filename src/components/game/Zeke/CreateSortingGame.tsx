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
  Popover,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useTheme } from '../../../context/ThemeContext';
import { HexColorPicker } from 'react-colorful';
import { useNavigate } from 'react-router-dom';
import { gameService, GameMode } from '../../../services/gameService';
import { useAuth } from '../../../context/AuthContext';

interface GameItem {
  id: string;
  name: string;
  image: string; // Path to the image
  categoryKey: string;
  description?: string;
  additionalInfo?: string;
  careTip?: string;
  learnMore?: string;
}

interface Category {
  key: string;
  title: string;
  color: string;
  textColor?: string;
}

interface GameLevel {
  level: number;
  title: string;
  items: GameItem[];
  categories: Category[];
  instructions: string;
}

interface GameTemplate {
  activityName: string;
  maxScore: number;
  maxExp: number;
  levels: GameLevel[];
}

const CreateSortingGame: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [gameTemplate, setGameTemplate] = useState<GameTemplate>({
    activityName: '',
    maxScore: 100,
    maxExp: 50,
    levels: [
      {
        level: 1,
        title: '',
        items: [],
        categories: [],
        instructions: '',
      },
    ],
  });

  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [colorPickerAnchor, setColorPickerAnchor] = useState<{ element: HTMLElement; levelIndex: number; categoryIndex: number } | null>(null);

  const handleLevelChange = (levelIndex: number, field: keyof GameLevel, value: any) => {
    const newLevels = [...gameTemplate.levels];
    newLevels[levelIndex] = {
      ...newLevels[levelIndex],
      [field]: value,
    };
    setGameTemplate({ ...gameTemplate, levels: newLevels });
  };

  const handleItemChange = (levelIndex: number, itemIndex: number, field: keyof GameItem, value: string) => {
    const newLevels = [...gameTemplate.levels];
    newLevels[levelIndex].items[itemIndex] = {
      ...newLevels[levelIndex].items[itemIndex],
      [field]: value,
    };
    setGameTemplate({ ...gameTemplate, levels: newLevels });
  };

  const handleCategoryChange = (levelIndex: number, categoryIndex: number, field: keyof Category, value: string) => {
    const newLevels = [...gameTemplate.levels];
    newLevels[levelIndex].categories[categoryIndex] = {
      ...newLevels[levelIndex].categories[categoryIndex],
      [field]: value,
    };
    setGameTemplate({ ...gameTemplate, levels: newLevels });
  };

  const addLevel = () => {
    setGameTemplate({
      ...gameTemplate,
      levels: [
        ...gameTemplate.levels,
        {
          level: gameTemplate.levels.length + 1,
          title: '',
          items: [],
          categories: [],
          instructions: '',
        },
      ],
    });
  };

  const removeLevel = (index: number) => {
    const newLevels = gameTemplate.levels.filter((_, i) => i !== index);
    setGameTemplate({ ...gameTemplate, levels: newLevels });
  };

  const addItem = (levelIndex: number) => {
    const newLevels = [...gameTemplate.levels];
    const categoryKey = newLevels[levelIndex].categories[0]?.key || '';
    newLevels[levelIndex].items.push({
      id: `item${Date.now()}`,
      name: '',
      image: '',
      categoryKey,
    });
    setGameTemplate({ ...gameTemplate, levels: newLevels });
  };

  const removeItem = (levelIndex: number, itemIndex: number) => {
    const newLevels = [...gameTemplate.levels];
    newLevels[levelIndex].items = newLevels[levelIndex].items.filter((_, i) => i !== itemIndex);
    setGameTemplate({ ...gameTemplate, levels: newLevels });
  };

  const addCategory = (levelIndex: number) => {
    const newLevels = [...gameTemplate.levels];
    newLevels[levelIndex].categories.push({
      key: `category${Date.now()}`,
      title: '',
      color: '#58CC02',
    });
    setGameTemplate({ ...gameTemplate, levels: newLevels });
  };

  const removeCategory = (levelIndex: number, categoryIndex: number) => {
    const newLevels = [...gameTemplate.levels];
    newLevels[levelIndex].categories = newLevels[levelIndex].categories.filter((_, i) => i !== categoryIndex);
    setGameTemplate({ ...gameTemplate, levels: newLevels });
  };

  const handleColorPickerOpen = (event: React.MouseEvent<HTMLElement>, levelIndex: number, categoryIndex: number) => {
    setColorPickerAnchor({ element: event.currentTarget, levelIndex, categoryIndex });
  };

  const handleColorPickerClose = () => {
    setColorPickerAnchor(null);
  };

  const handleColorChange = (color: string) => {
    if (colorPickerAnchor) {
      const { levelIndex, categoryIndex } = colorPickerAnchor;
      handleCategoryChange(levelIndex, categoryIndex, 'color', color);
    }
  };

  const handleImageUpload = async (levelIndex: number, itemIndex: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Convert the file path to a relative path format
    const imagePath = `/images/sorting/${file.name}`;
    
    const newLevels = [...gameTemplate.levels];
    newLevels[levelIndex].items[itemIndex] = {
      ...newLevels[levelIndex].items[itemIndex],
      image: imagePath,
    };
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
      if (!level.title.trim()) {
        setError('All levels must have a title');
        return false;
      }
      if (!level.instructions.trim()) {
        setError('All levels must have instructions');
        return false;
      }
      if (level.items.length === 0) {
        setError('All levels must have at least one item');
        return false;
      }
      if (level.categories.length === 0) {
        setError('All levels must have at least one category');
        return false;
      }

      for (const item of level.items) {
        if (!item.name.trim()) {
          setError('All items must have a name');
          return false;
        }
      }

      for (const category of level.categories) {
        if (!category.title.trim()) {
          setError('All categories must have a title');
          return false;
        }
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
        gameMode: 'SORTING' as const,
        gameData: JSON.stringify({
          levels: gameTemplate.levels,
        }),
        createdBy: {
          id: currentUser.id,
          name: currentUser.name
        }
      };

      await gameService.createGame(gameData);
      setSuccess('Sorting Game created successfully!');
      
      // Reset form
      setGameTemplate({
        activityName: '',
        maxScore: 100,
        maxExp: 50,
        levels: [
          {
            level: 1,
            title: '',
            items: [],
            categories: [],
            instructions: '',
          },
        ],
      });

      // Navigate back to game library after successful creation
      setTimeout(() => {
        navigate('/teacher/games/library');
      }, 2000);
    } catch (err) {
      setError('Failed to create game. Please try again.');
      console.error('Error creating sorting game:', err);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Create Sorting Game
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
            <TextField
              fullWidth
              label="Level Title"
              value={level.title}
              onChange={(e) => handleLevelChange(levelIndex, 'title', e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Instructions"
              value={level.instructions}
              onChange={(e) => handleLevelChange(levelIndex, 'instructions', e.target.value)}
              required
              multiline
              rows={2}
            />

            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Categories
              </Typography>
              {level.categories.map((category, categoryIndex) => (
                <Box key={categoryIndex} sx={{ display: 'grid', gap: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                      fullWidth
                      label="Category Title"
                      value={category.title}
                      onChange={(e) => handleCategoryChange(levelIndex, categoryIndex, 'title', e.target.value)}
                      required
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1,
                          border: '2px solid',
                          borderColor: 'divider',
                          backgroundColor: category.color,
                          cursor: 'pointer',
                          '&:hover': {
                            opacity: 0.8,
                          },
                        }}
                        onClick={(e) => handleColorPickerOpen(e, levelIndex, categoryIndex)}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {category.color}
                      </Typography>
                    </Box>
                    <IconButton
                      color="error"
                      onClick={() => removeCategory(levelIndex, categoryIndex)}
                      disabled={level.categories.length === 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              ))}
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => addCategory(levelIndex)}
                sx={{ mt: 1 }}
              >
                Add Category
              </Button>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Items
              </Typography>
              {level.items.map((item, itemIndex) => (
                <Box key={itemIndex} sx={{ display: 'grid', gap: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                      fullWidth
                      label="Item Name"
                      value={item.name}
                      onChange={(e) => handleItemChange(levelIndex, itemIndex, 'name', e.target.value)}
                      required
                    />
                    <FormControl fullWidth>
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={item.categoryKey}
                        label="Category"
                        onChange={(e) => handleItemChange(levelIndex, itemIndex, 'categoryKey', e.target.value)}
                      >
                        {level.categories.map((category) => (
                          <MenuItem key={category.key} value={category.key}>
                            {category.title}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Box sx={{ position: 'relative' }}>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id={`image-upload-${levelIndex}-${itemIndex}`}
                        type="file"
                        onChange={(e) => handleImageUpload(levelIndex, itemIndex, e)}
                      />
                      <label htmlFor={`image-upload-${levelIndex}-${itemIndex}`}>
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
                            backgroundColor: item.image ? 'transparent' : 'action.hover',
                            '&:hover': {
                              borderColor: 'primary.main',
                              backgroundColor: 'action.hover',
                            },
                          }}
                        >
                          {item.image ? (
                            <Box
                              component="img"
                              src={item.image}
                              alt={item.name}
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
                    <TextField
                      fullWidth
                      label="Care Tip (shown after correct sort)"
                      value={item.careTip || ''}
                      onChange={(e) => handleItemChange(levelIndex, itemIndex, 'careTip', e.target.value)}
                      placeholder="e.g., Planting trees helps the environment."
                      helperText="A quick educational tip about the item"
                    />
                    <TextField
                      fullWidth
                      label="Fun Fact (shown after care tip)"
                      value={item.learnMore || ''}
                      onChange={(e) => handleItemChange(levelIndex, itemIndex, 'learnMore', e.target.value)}
                      placeholder="e.g., Trees give us oxygen to breathe and are homes for many animals!"
                      helperText="An interesting fact to engage students"
                    />
                    <IconButton
                      color="error"
                      onClick={() => removeItem(levelIndex, itemIndex)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              ))}
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => addItem(levelIndex)}
                sx={{ mt: 1 }}
              >
                Add Item
              </Button>
            </Box>
          </Box>
        </Paper>
      ))}

      <Popover
        open={Boolean(colorPickerAnchor)}
        anchorEl={colorPickerAnchor?.element}
        onClose={handleColorPickerClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2 }}>
          <HexColorPicker color={colorPickerAnchor ? gameTemplate.levels[colorPickerAnchor.levelIndex].categories[colorPickerAnchor.categoryIndex].color : '#000000'} onChange={handleColorChange} />
        </Box>
      </Popover>

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

export default CreateSortingGame; 