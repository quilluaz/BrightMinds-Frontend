import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Trash2, UploadCloud, Image as ImageIconLucide, Palette, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { gameService } from '../../../services/game'; // Ensure this service is set up
import { API_BASE_URL } from '../../../config';
import Button from '../../common/Button';

// Interfaces for state management
interface GameItemState {
  id: string;
  name: string;
  imageFile?: File;
  imagePreviewUrl?: string;
  backendUrl: string; // Stores the URL from the backend after upload
  categoryKey: string;
  careTip?: string;
  learnMore?: string;
}

interface CategoryState {
  key: string;
  title: string;
  color: string; // Hex color
  textColor?: string; // Optional: if you want to define text color for contrast
}

interface GameLevelState {
  level: number;
  title: string;
  items: GameItemState[];
  categories: CategoryState[];
  instructions: string;
}

interface GameTemplateState {
  activityName: string;
  maxScore: number;
  maxExp: number;
  levels: GameLevelState[];
}

const CreateSortingGame: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [gameTemplate, setGameTemplate] = useState<GameTemplateState>({
    activityName: '',
    maxScore: 100,
    maxExp: 50,
    levels: [
      {
        level: 1,
        title: '',
        items: [],
        categories: [{ key: `cat-${Date.now()}`, title: '', color: '#58CC02', textColor: '#FFFFFF' }],
        instructions: '',
      },
    ],
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState<boolean>(false);

  // --- General Game Template Handlers ---
  const handleGameTemplateChange = (field: keyof Omit<GameTemplateState, 'levels'>, value: string | number) => {
    setGameTemplate(prev => ({ ...prev, [field]: value }));
  };

  // --- Level Handlers ---
  const addLevel = () => {
    setGameTemplate(prev => ({
      ...prev,
      levels: [
        ...prev.levels,
        {
          level: prev.levels.length + 1,
          title: '',
          items: [],
          categories: [{ key: `cat-${Date.now()}`, title: '', color: '#58CC02', textColor: '#FFFFFF' }],
          instructions: '',
        },
      ],
    }));
  };

  const removeLevel = (levelIndex: number) => {
    if (gameTemplate.levels.length <= 1) {
      setError("You must have at least one level.");
      return;
    }
    setGameTemplate(prev => ({
      ...prev,
      levels: prev.levels.filter((_, i) => i !== levelIndex),
    }));
  };

  const handleLevelDetailChange = (levelIndex: number, field: 'title' | 'instructions', value: string) => {
    setGameTemplate(prev => {
      const newLevels = [...prev.levels];
      newLevels[levelIndex] = { ...newLevels[levelIndex], [field]: value };
      return { ...prev, levels: newLevels };
    });
  };

  // --- Category Handlers ---
  const addCategory = (levelIndex: number) => {
    setGameTemplate(prev => {
      const newLevels = [...prev.levels];
      newLevels[levelIndex].categories.push({
        key: `cat-${Date.now()}-${newLevels[levelIndex].categories.length}`,
        title: '',
        color: '#1CB0F6', // Default new category color
        textColor: '#FFFFFF',
      });
      return { ...prev, levels: newLevels };
    });
  };

  const removeCategory = (levelIndex: number, categoryIndex: number) => {
    setGameTemplate(prev => {
      const newLevels = [...prev.levels];
      if (newLevels[levelIndex].categories.length <= 1) {
        setError("Each level must have at least one category.");
        return prev;
      }
      // Also remove items associated with this category or re-assign them
      const categoryKeyToRemove = newLevels[levelIndex].categories[categoryIndex].key;
      newLevels[levelIndex].items = newLevels[levelIndex].items.filter(item => item.categoryKey !== categoryKeyToRemove);
      newLevels[levelIndex].categories = newLevels[levelIndex].categories.filter((_, i) => i !== categoryIndex);
      // Ensure remaining items have valid categoryKeys if their assigned category was removed
      if (newLevels[levelIndex].categories.length > 0) {
        const firstCategoryKey = newLevels[levelIndex].categories[0].key;
        newLevels[levelIndex].items.forEach(item => {
            if (!newLevels[levelIndex].categories.find(cat => cat.key === item.categoryKey)) {
                item.categoryKey = firstCategoryKey;
            }
        });
      } else {
        // If no categories left, items technically become orphaned. Consider how to handle this.
        // For now, if last category is removed, items will have invalid categoryKeys until a new one is added.
      }
      return { ...prev, levels: newLevels };
    });
  };

  const handleCategoryDetailChange = (levelIndex: number, categoryIndex: number, field: 'title' | 'color' | 'textColor', value: string) => {
    setGameTemplate(prev => {
      const newLevels = [...prev.levels];
      newLevels[levelIndex].categories[categoryIndex] = {
        ...newLevels[levelIndex].categories[categoryIndex],
        [field]: value,
      };
       // Basic contrast check for textColor (simplified)
       if (field === 'color') {
        const isDark = (hex: string) => { // Basic check, not foolproof
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return (r * 0.299 + g * 0.587 + b * 0.114) < 186; // Threshold for darkness
        };
        newLevels[levelIndex].categories[categoryIndex].textColor = isDark(value) ? '#FFFFFF' : '#000000';
      }
      return { ...prev, levels: newLevels };
    });
  };

  // --- Item Handlers ---
  const addItem = (levelIndex: number) => {
    setGameTemplate(prev => {
      const newLevels = [...prev.levels];
      const defaultCategoryKey = newLevels[levelIndex].categories[0]?.key || '';
      if (!defaultCategoryKey && newLevels[levelIndex].categories.length === 0) {
        setError("Please add at least one category before adding items to this level.");
        return prev;
      }
      newLevels[levelIndex].items.push({
        id: `item-${Date.now()}`,
        name: '',
        backendUrl: '',
        categoryKey: defaultCategoryKey,
        careTip: '',
        learnMore: '',
      });
      return { ...prev, levels: newLevels };
    });
  };

  const removeItem = (levelIndex: number, itemIndex: number) => {
    setGameTemplate(prev => {
      const newLevels = [...prev.levels];
      newLevels[levelIndex].items = newLevels[levelIndex].items.filter((_, i) => i !== itemIndex);
      return { ...prev, levels: newLevels };
    });
  };

  const handleItemDetailChange = (levelIndex: number, itemIndex: number, field: 'name' | 'categoryKey' | 'careTip' | 'learnMore', value: string) => {
    setGameTemplate(prev => {
      const newLevels = [...prev.levels];
      newLevels[levelIndex].items[itemIndex] = {
        ...newLevels[levelIndex].items[itemIndex],
        [field]: value,
      };
      return { ...prev, levels: newLevels };
    });
  };

  const handleItemImageSelect = (levelIndex: number, itemIndex: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setGameTemplate(prev => {
      const newLevels = [...prev.levels];
      const targetItem = newLevels[levelIndex].items[itemIndex];
      if (file) {
        targetItem.imageFile = file;
        targetItem.imagePreviewUrl = URL.createObjectURL(file);
        targetItem.backendUrl = ""; // Clear previous backend URL
      } else {
        targetItem.imageFile = undefined;
        targetItem.imagePreviewUrl = "";
      }
      return { ...prev, levels: newLevels };
    });
    setError(null);
  };
  
  // --- Validation and Submission ---
  const validateGame = (): boolean => {
    setError(null);
    if (!gameTemplate.activityName.trim()) {
      setError("Please enter a game name."); return false;
    }
    if (Number(gameTemplate.maxScore) <= 0 || Number(gameTemplate.maxExp) <= 0) {
      setError("Max Score and Max EXP must be positive values."); return false;
    }
    if (gameTemplate.levels.length === 0) {
      setError("Please add at least one level."); return false;
    }

    for (let lIdx = 0; lIdx < gameTemplate.levels.length; lIdx++) {
      const level = gameTemplate.levels[lIdx];
      if (!level.title.trim()) {
        setError(`Level ${lIdx + 1}: Title is required.`); return false;
      }
      if (!level.instructions.trim()) {
        setError(`Level ${lIdx + 1}: Instructions are required.`); return false;
      }
      if (level.categories.length === 0) {
        setError(`Level ${lIdx + 1}: Must have at least one category.`); return false;
      }
      for (const category of level.categories) {
        if (!category.title.trim()) {
          setError(`Level ${lIdx + 1}: All categories must have a title.`); return false;
        }
        if (!/^#[0-9A-F]{6}$/i.test(category.color)) {
            setError(`Level ${lIdx + 1}, Category "${category.title || 'Untitled'}": Invalid color format. Use hex (e.g., #RRGGBB).`); return false;
        }
      }
      if (level.items.length === 0) {
        setError(`Level ${lIdx + 1}: Must have at least one item.`); return false;
      }
      for (const item of level.items) {
        if (!item.name.trim()) {
          setError(`Level ${lIdx + 1}: All items must have a name.`); return false;
        }
        if (!item.imageFile && !item.backendUrl) {
          setError(`Level ${lIdx + 1}, Item "${item.name || 'Untitled'}": An image is required.`); return false;
        }
        if (!item.categoryKey || !level.categories.find(c => c.key === item.categoryKey)) {
          setError(`Level ${lIdx + 1}, Item "${item.name || 'Untitled'}": Must be assigned to a valid category.`); return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateGame()) return;
    setIsLoadingSubmit(true);
    setError(null); setSuccess(null);

    try {
      if (!currentUser || currentUser.role !== "TEACHER") {
        setError("Authentication required."); setIsLoadingSubmit(false); return;
      }

      const processedLevels = await Promise.all(
        gameTemplate.levels.map(async (level) => {
          const processedItems = await Promise.all(
            level.items.map(async (item) => {
              let finalImageUrl = item.backendUrl;
              if (item.imageFile && !item.backendUrl) {
                const formData = new FormData();
                formData.append("file", item.imageFile);
                formData.append("gameType", "sorting"); // Or a generic type

                const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
                  method: "POST",
                  body: formData,
                  // Add Authorization header if needed by your API
                });
                if (!response.ok) throw new Error(`Failed to upload image for item "${item.name}"`);
                const data = await response.json();
                finalImageUrl = data.imagePath;
              }
              return {
                id: item.id,
                name: item.name,
                image: finalImageUrl, // This is the key BlankSortingGame expects
                categoryKey: item.categoryKey,
                careTip: item.careTip,
                learnMore: item.learnMore,
              };
            })
          );
          return {
            level: level.level,
            title: level.title,
            items: processedItems,
            categories: level.categories.map(cat => ({ // Ensure category structure for backend
                key: cat.key, 
                title: cat.title, 
                color: cat.color,
                textColor: cat.textColor
            })),
            instructions: level.instructions,
          };
        })
      );

      const gamePayload = {
        activityName: gameTemplate.activityName,
        maxScore: Number(gameTemplate.maxScore),
        maxExp: Number(gameTemplate.maxExp),
        isPremade: false,
        gameMode: "SORTING" as const,
        gameData: JSON.stringify({ levels: processedLevels }),
        createdBy: { id: currentUser.id },
      };

      await gameService.createGame(gamePayload as any);
      setSuccess("Sorting Game created successfully! Redirecting...");
      setGameTemplate({ /* Reset form */
        activityName: '', maxScore: 100, maxExp: 50,
        levels: [{ level: 1, title: '', items: [], categories: [{key: `cat-${Date.now()}`, title: '', color: '#58CC02', textColor: '#FFFFFF'}], instructions: '' }],
      });
      setTimeout(() => navigate("/teacher/games/library"), 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create game.");
      console.error("Error creating sorting game:", err);
    } finally {
      setIsLoadingSubmit(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl"> {/* Increased max-width for richer content */}
      <header className="mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-text dark:text-primary-text-dark">
          Create New Sorting Game
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Design an activity where students sort items into categories.
        </p>
      </header>

      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative dark:bg-red-700/20 dark:border-red-600/30 dark:text-red-300 flex items-start" role="alert">
          <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" /><span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative dark:bg-green-700/20 dark:border-green-600/30 dark:text-green-300 flex items-start" role="alert">
          <CheckCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" /><span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Game Details Section */}
        <section className="card p-6 md:p-8">
          <h2 className="text-2xl font-semibold mb-6 text-primary-text dark:text-primary-text-dark border-b pb-3 border-gray-200 dark:border-gray-700">
            Game Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-3">
              <label htmlFor="activityName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Game Name / Title</label>
              <input id="activityName" type="text" value={gameTemplate.activityName} onChange={(e) => handleGameTemplateChange('activityName', e.target.value)} className="input-field" placeholder="e.g., Classifying Animals" required disabled={isLoadingSubmit} />
            </div>
            <div>
              <label htmlFor="maxScore" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Score</label>
              <input id="maxScore" type="number" value={gameTemplate.maxScore} onChange={(e) => handleGameTemplateChange('maxScore', parseInt(e.target.value) || 0)} className="input-field" min="1" required disabled={isLoadingSubmit} />
            </div>
            <div>
              <label htmlFor="maxExp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Experience (EXP)</label>
              <input id="maxExp" type="number" value={gameTemplate.maxExp} onChange={(e) => handleGameTemplateChange('maxExp', parseInt(e.target.value) || 0)} className="input-field" min="1" required disabled={isLoadingSubmit} />
            </div>
          </div>
        </section>

        {/* Levels Section */}
        {gameTemplate.levels.map((level, levelIndex) => (
          <section key={levelIndex} className="card p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center border-b pb-3 border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-semibold text-primary-text dark:text-primary-text-dark">Level {level.level}</h2>
              <Button type="button" variant="text" onClick={() => removeLevel(levelIndex)} icon={<Trash2 size={18} />} className="text-red-500 hover:bg-red-100 dark:hover:bg-red-700/20 !p-2" disabled={gameTemplate.levels.length <= 1 || isLoadingSubmit} aria-label="Remove level" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor={`level-${levelIndex}-title`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Level Title</label>
                <input id={`level-${levelIndex}-title`} type="text" value={level.title} onChange={(e) => handleLevelDetailChange(levelIndex, 'title', e.target.value)} className="input-field" placeholder="e.g., Farm Animals vs. Wild Animals" required disabled={isLoadingSubmit} />
              </div>
              <div>
                <label htmlFor={`level-${levelIndex}-instructions`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instructions for this Level</label>
                <textarea id={`level-${levelIndex}-instructions`} value={level.instructions} onChange={(e) => handleLevelDetailChange(levelIndex, 'instructions', e.target.value)} className="input-field min-h-[60px]" placeholder="Drag items to the correct category." required disabled={isLoadingSubmit} />
              </div>
            </div>

            {/* Categories for this Level */}
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
              <h3 className="text-xl font-semibold text-primary-text dark:text-primary-text-dark">Categories</h3>
              {level.categories.map((category, categoryIndex) => (
                <div key={category.key} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border dark:border-gray-700">
                  <input type="text" value={category.title} onChange={(e) => handleCategoryDetailChange(levelIndex, categoryIndex, 'title', e.target.value)} className="input-field flex-grow" placeholder="Category Name (e.g., Mammals)" required disabled={isLoadingSubmit} />
                  <div className="flex items-center gap-2">
                    <Palette size={20} className="text-gray-500 dark:text-gray-400"/>
                    <input type="text" value={category.color} onChange={(e) => handleCategoryDetailChange(levelIndex, categoryIndex, 'color', e.target.value)} className="input-field w-28" placeholder="#RRGGBB" maxLength={7} required disabled={isLoadingSubmit} />
                    <div style={{ backgroundColor: category.color }} className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <Button type="button" variant="text" onClick={() => removeCategory(levelIndex, categoryIndex)} icon={<Trash2 size={16} />} className="text-red-500 hover:bg-red-100 dark:hover:bg-red-700/20 !p-1.5" disabled={level.categories.length <= 1 || isLoadingSubmit} aria-label="Remove category" />
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => addCategory(levelIndex)} icon={<PlusCircle size={16} />} disabled={isLoadingSubmit}>Add Category</Button>
            </div>

            {/* Items for this Level */}
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
              <h3 className="text-xl font-semibold text-primary-text dark:text-primary-text-dark">Items to Sort</h3>
              {level.items.map((item, itemIndex) => (
                <div key={item.id} className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border dark:border-gray-700 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    <div className="md:col-span-2 space-y-3">
                        <div>
                            <label htmlFor={`item-${levelIndex}-${itemIndex}-name`} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Item Name</label>
                            <input id={`item-${levelIndex}-${itemIndex}-name`} type="text" value={item.name} onChange={(e) => handleItemDetailChange(levelIndex, itemIndex, 'name', e.target.value)} className="input-field" placeholder="e.g., Cow" required disabled={isLoadingSubmit} />
                        </div>
                        <div>
                            <label htmlFor={`item-${levelIndex}-${itemIndex}-category`} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Correct Category</label>
                            <select id={`item-${levelIndex}-${itemIndex}-category`} value={item.categoryKey} onChange={(e) => handleItemDetailChange(levelIndex, itemIndex, 'categoryKey', e.target.value)} className="input-field" required disabled={isLoadingSubmit || level.categories.length === 0}>
                                <option value="" disabled>Select category</option>
                                {level.categories.map(cat => <option key={cat.key} value={cat.key}>{cat.title}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Image</label>
                        <div className="mt-1 flex flex-col items-center justify-center px-3 py-2 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg h-32 relative">
                            {item.imagePreviewUrl ? (
                            <img src={item.imagePreviewUrl} alt="Preview" className="max-h-full max-w-full object-contain rounded-md" />
                            ) : ( 
                            <div className="space-y-1 text-center">
                                <ImageIconLucide className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500" />
                                <p className="text-xs text-gray-500 dark:text-gray-400">Upload</p>
                            </div>
                            )}
                            <input id={`item-${levelIndex}-${itemIndex}-image`} type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleItemImageSelect(levelIndex, itemIndex, e)} disabled={isLoadingSubmit} />
                        </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label htmlFor={`item-${levelIndex}-${itemIndex}-caretip`} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Care Tip (Optional)</label>
                        <input id={`item-${levelIndex}-${itemIndex}-caretip`} type="text" value={item.careTip || ''} onChange={(e) => handleItemDetailChange(levelIndex, itemIndex, 'careTip', e.target.value)} className="input-field text-sm" placeholder="e.g., Needs fresh grass and water." disabled={isLoadingSubmit} />
                    </div>
                    <div>
                        <label htmlFor={`item-${levelIndex}-${itemIndex}-learnmore`} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Fun Fact (Optional)</label>
                        <input id={`item-${levelIndex}-${itemIndex}-learnmore`} type="text" value={item.learnMore || ''} onChange={(e) => handleItemDetailChange(levelIndex, itemIndex, 'learnMore', e.target.value)} className="input-field text-sm" placeholder="e.g., Cows have four stomachs!" disabled={isLoadingSubmit} />
                    </div>
                  </div>
                  <div className="text-right">
                    <Button type="button" variant="text" onClick={() => removeItem(levelIndex, itemIndex)} icon={<Trash2 size={16} />} className="text-red-500 hover:bg-red-100 dark:hover:bg-red-700/20 !p-1.5" disabled={isLoadingSubmit} aria-label="Remove item" />
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => addItem(levelIndex)} icon={<PlusCircle size={16} />} disabled={isLoadingSubmit || level.categories.length === 0}>Add Item</Button>
                {level.categories.length === 0 && <p className="text-xs text-red-500 mt-1">Add a category first to enable adding items.</p>}
            </div>
          </section>
        ))}

        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-end items-center gap-4">
          <Button type="button" variant="outline" onClick={addLevel} icon={<PlusCircle size={18}/>} disabled={isLoadingSubmit}>Add Another Level</Button>
          <Button type="submit" variant="primary" size="lg" isLoading={isLoadingSubmit} disabled={isLoadingSubmit}>Create Sorting Game</Button>
        </div>
      </form>
    </div>
  );
};

export default CreateSortingGame;