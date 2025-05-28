// src/pages/teacher/TeacherGameLibraryPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameService } from '../../services/game';
import { GameDTO } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AssignGameModal from '../../components/teacher/AssignGameModal';
import { Library, Sparkles, Zap, Brain, Puzzle, Plus, BookCopy, Tag } from 'lucide-react';

interface LibraryGameDisplayConfig {
  idKey: string;
  title: string;
  description: string;
  subject?: string;
  gameMode: GameDTO['gameMode'];
  icon: React.ReactNode;
}

const PREFERRED_LIBRARY_GAMES: LibraryGameDisplayConfig[] = [
  {
    idKey: 'matching-game',
    title: "Matching Game",
    description: "Test memory by matching pairs. Covers Anyong Tubig, Anyong Lupa, and Pambansang Sagisag.",
    gameMode: "MATCHING",
    subject: "Araling Panlipunan / Tagalog",
    icon: <Sparkles size={28} className="text-green-500 dark:text-green-400" />
  },
  {
    idKey: 'image-quiz',
    title: "Image Quiz",
    description: "Identify the correct image for each question. A fun Araling Panlipunan knowledge test!",
    gameMode: "IMAGE_MULTIPLE_CHOICE",
    subject: "Araling Panlipunan",
    icon: <Zap size={28} className="text-blue-500 dark:text-blue-400" />
  },
  {
    idKey: 'sorting-game',
    title: "Sorting Game",
    description: "Create interactive sorting activities where students categorize items. Perfect for teaching classification and organization skills.",
    gameMode: "SORTING",
    subject: "All Subjects",
    icon: <Brain size={28} className="text-purple-500 dark:text-purple-400" />
  },
  {
    idKey: '4pics1word',
    title: "4 Pics 1 Word",
    description: "Guess the common Tagalog word that connects four different pictures. Great for vocabulary!",
    gameMode: "FOUR_PICS_ONE_WORD",
    subject: "Tagalog",
    icon: <Puzzle size={28} className="text-yellow-500 dark:text-amber-400" />
  },
];

interface DisplayableLibraryGame {
  config: LibraryGameDisplayConfig;
  actualGameDataFromBackend?: GameDTO;
}

const TeacherGameLibraryPage: React.FC = () => {
  const [displayableGames, setDisplayableGames] = useState<DisplayableLibraryGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGameToAssign, setSelectedGameToAssign] = useState<GameDTO | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isGameModeModalOpen, setIsGameModeModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<GameDTO['gameMode'] | 'all' | null>('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAndProcessGames = async () => {
      setIsLoading(true);
      try {
        const allLibraryGames: GameDTO[] = await gameService.getLibraryGames();
        
        const finalGamesList: DisplayableLibraryGame[] = [];
        const processedBackendGameIds = new Set<string>();

        // Step 1: Iterate through PREFERRED_LIBRARY_GAMES configurations
        PREFERRED_LIBRARY_GAMES.forEach(preferredConfig => {
          const matchingBackendGame = allLibraryGames.find(
            g => g.gameMode === preferredConfig.gameMode && g.isPremade
          );

          if (matchingBackendGame && !processedBackendGameIds.has(matchingBackendGame.id)) {
            finalGamesList.push({
              config: preferredConfig,
              actualGameDataFromBackend: matchingBackendGame
            });
            processedBackendGameIds.add(matchingBackendGame.id);
          } else {
             if (!finalGamesList.some(fg => fg.config.idKey === preferredConfig.idKey && !fg.actualGameDataFromBackend)) {
                finalGamesList.push({
                    config: preferredConfig,
                    actualGameDataFromBackend: undefined
                });
            }
          }
        });

        // Step 2: Add all other games from the library that haven't been processed yet.
        allLibraryGames.forEach(backendGame => {
          if (!processedBackendGameIds.has(backendGame.id)) {
            const genericConfig: LibraryGameDisplayConfig = {
              idKey: backendGame.id,
              title: backendGame.title,
              description: backendGame.description || "No description available.",
              subject: backendGame.subject,
              gameMode: backendGame.gameMode,
              icon: PREFERRED_LIBRARY_GAMES.find(pc => pc.gameMode === backendGame.gameMode)?.icon || <Library size={28} className="text-gray-500" />,
            };
            finalGamesList.push({
              config: genericConfig,
              actualGameDataFromBackend: backendGame
            });
            processedBackendGameIds.add(backendGame.id);
          }
        });
        
        setDisplayableGames(finalGamesList);

      } catch (error) {
        console.error("Failed to fetch or process game library:", error);
        setDisplayableGames(PREFERRED_LIBRARY_GAMES.map(config => ({ config, actualGameDataFromBackend: undefined })));
      } finally {
        setIsLoading(false);
      }
    };
    fetchAndProcessGames();
  }, []);

  const handleOpenAssignModal = (gameDataForAssignment?: GameDTO) => {
    if (gameDataForAssignment) {
      setSelectedGameToAssign(gameDataForAssignment);
      setIsAssignModalOpen(true);
    } else {
      alert("This game is currently not available for assignment.");
    }
  };

  const handleCloseAssignModal = () => {
    setSelectedGameToAssign(null);
    setIsAssignModalOpen(false);
  };

  const handleCreateGame = (gameMode: GameDTO['gameMode']) => {
    if (!gameMode) return;
    
    const templateRoutes = {
      'MATCHING': '/teacher/create-game/matching',
      'IMAGE_MULTIPLE_CHOICE': '/teacher/create-game/image-quiz',
      'SORTING': '/teacher/create-game/sorting',
      'FOUR_PICS_ONE_WORD': '/teacher/create-game/4pics1word'
    } as const;

    const route = templateRoutes[gameMode as keyof typeof templateRoutes];
    if (route) {
      navigate(route);
    }
  };

  const handleTabClick = (gameMode: GameDTO['gameMode'] | 'all') => {
    setActiveTab(gameMode);
  };

  const filteredGames = activeTab === 'all'
    ? displayableGames
    : displayableGames.filter(game => game.config.gameMode === activeTab);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-10 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary-text dark:text-primary-text-dark flex items-center">
              <Library size={32} className="mr-3 text-primary-interactive dark:text-primary-interactive-dark" />
              Game Library
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
              Browse premade activities or create your own to assign to your classrooms.
            </p>
          </div>
          <button
            onClick={() => setIsGameModeModalOpen(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Create Game
          </button>
        </div>
      </div>

      {isGameModeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-primary-card-dark rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold mb-4 text-primary-text dark:text-primary-text-dark">Select Game Mode to Create</h2>
            <div className="grid grid-cols-1 gap-3">
              {PREFERRED_LIBRARY_GAMES.map((game) => (
                <button
                  key={game.idKey}
                  onClick={() => {
                    setIsGameModeModalOpen(false);
                    handleCreateGame(game.gameMode);
                  }}
                  className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-full">
                    {game.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-primary-text dark:text-primary-text-dark">{game.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{game.description}</p>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsGameModeModalOpen(false)}
              className="btn btn-secondary w-full mt-4"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto pb-px" aria-label="Tabs">
          <button
            key="all"
            onClick={() => handleTabClick('all')}
            className={`
              ${activeTab === 'all'
                ? 'border-primary-interactive text-primary-interactive dark:border-primary-interactive-dark dark:text-primary-interactive-dark'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
              }
              whitespace-nowrap py-3 px-1 sm:py-4 sm:px-1 border-b-2 font-medium text-sm transition-colors duration-200
            `}
          >
            All Games
          </button>
          {PREFERRED_LIBRARY_GAMES.map((game) => 
            <button
              key={game.idKey}
              onClick={() => game.gameMode && handleTabClick(game.gameMode)}
              className={`
                ${activeTab === game.gameMode
                  ? 'border-primary-interactive text-primary-interactive dark:border-primary-interactive-dark dark:text-primary-interactive-dark'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                }
                whitespace-nowrap py-3 px-1 sm:py-4 sm:px-1 border-b-2 font-medium text-sm transition-colors duration-200
              `}
            >
              {game.title}
            </button>
          )}
        </nav>
      </div>

      {filteredGames.length === 0 && !isLoading ? (
        <div className="text-center py-10">
          <p className="text-xl text-gray-500 dark:text-gray-400">
             {activeTab === 'all' ? "No games found in the library." : "No games found for this category."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGames.map(({ config, actualGameDataFromBackend }) => (
            <div 
              key={actualGameDataFromBackend?.id || config.idKey} 
              className="card bg-white dark:bg-primary-card-dark p-5 shadow-lg rounded-xl flex flex-col justify-between border border-gray-200 dark:border-gray-700 transition-all hover:shadow-xl hover:scale-[1.03]"
            >
              <div className="flex flex-col items-center text-center flex-grow">
                <div className="p-3 bg-gray-100 dark:bg-slate-700 rounded-full mb-4">
                  {config.icon || <Library size={28} className="text-gray-500" />}
                </div>
                <h3 className="font-bold text-xl mb-2 text-primary-text dark:text-primary-text-dark">{config.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 h-20 line-clamp-4">{config.description}</p>
                
                <div className="w-full space-y-1 mb-4">
                  {config.subject && (
                     <span className="inline-flex items-center text-xs font-medium bg-primary-accent/20 dark:bg-primary-accent-dark/30 text-primary-accent dark:text-primary-accent-dark px-2.5 py-1 rounded-full mr-1.5 mb-1 sm:mb-0">
                      <BookCopy size={12} className="mr-1" /> {config.subject}
                    </span>
                  )}
                   {config.gameMode && (
                    <span className="inline-flex items-center text-xs font-medium bg-blue-100 dark:bg-blue-700/50 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full mb-1 sm:mb-0">
                        <Tag size={12} className="mr-1" /> {config.gameMode.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                     </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleOpenAssignModal(actualGameDataFromBackend)}
                className={`btn btn-primary w-full mt-auto ${!actualGameDataFromBackend ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!actualGameDataFromBackend}
              >
                {actualGameDataFromBackend ? 'Assign to Classroom' : 'Unavailable'}
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedGameToAssign && isAssignModalOpen && (
        <AssignGameModal
          isOpen={isAssignModalOpen}
          onClose={handleCloseAssignModal}
          gameToAssign={selectedGameToAssign}
        />
      )}
    </div>
  );
};

export default TeacherGameLibraryPage;