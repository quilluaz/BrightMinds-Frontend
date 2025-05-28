import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gameService } from '../../services/game';
import { GameDTO } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AssignGameModal from '../../components/teacher/AssignGameModal';
import Button from '../../components/common/Button';
import { Library, ChevronLeft, Tag, BookCopy, Sparkles, Zap, Brain, Puzzle } from 'lucide-react';
import { useClassroom } from '../../context/ClassroomContext';

// Define the structure for our desired library games
interface LibraryGameDisplayConfig {
  idKey: string;
  title: string;
  description: string;
  subject?: string;
  gameMode: GameDTO['gameMode'];
  icon: React.ReactNode;
}

// Configuration for the main games to be displayed
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
    description: "Create interactive sorting activities where students categorize items. Perfect for teaching classification.",
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

const AssignGameToClassroomPage: React.FC = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const navigate = useNavigate();
  const { teacherClassrooms } = useClassroom();

  const [displayableGames, setDisplayableGames] = useState<DisplayableLibraryGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<GameDTO | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [classroomName, setClassroomName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<GameDTO['gameMode'] | 'all' | null>('all');

  useEffect(() => {
    if (classroomId) {
      const classroom = teacherClassrooms.find(c => c.id === classroomId);
      if (classroom) {
        setClassroomName(classroom.name);
      }
    }
  }, [classroomId, teacherClassrooms]);

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
      setSelectedGame(gameDataForAssignment);
      setIsAssignModalOpen(true);
    } else {
      alert("This game configuration is not available for assignment or is missing data.");
    }
  };

  const handleCloseAssignModal = () => {
    setSelectedGame(null);
    setIsAssignModalOpen(false);
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

  if (!classroomId) {
    navigate('/teacher/classrooms');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-10 pb-6 border-b border-gray-200 dark:border-gray-700">
        <Button
            variant="text"
            onClick={() => navigate(`/teacher/classrooms/${classroomId}`)}
            className="mb-4 text-sm text-primary-interactive dark:text-primary-interactive-dark hover:underline"
            icon={<ChevronLeft size={18} />}
        >
            Back to {classroomName || 'Classroom'}
        </Button>
        <h1 className="text-3xl md:text-4xl font-bold text-primary-text dark:text-primary-text-dark flex items-center">
          <Library size={32} className="mr-3 text-primary-interactive dark:text-primary-interactive-dark" />
          Assign Game {classroomName ? `to ${classroomName}` : ''}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
          Select an activity from the library to assign to your students.
        </p>
      </div>

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
          {PREFERRED_LIBRARY_GAMES.map((gameConfig) => (
            <button
              key={gameConfig.idKey}
              onClick={() => gameConfig.gameMode && handleTabClick(gameConfig.gameMode)}
              className={`
                ${activeTab === gameConfig.gameMode
                  ? 'border-primary-interactive text-primary-interactive dark:border-primary-interactive-dark dark:text-primary-interactive-dark'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                }
                whitespace-nowrap py-3 px-1 sm:py-4 sm:px-1 border-b-2 font-medium text-sm transition-colors duration-200
              `}
            >
              {gameConfig.title}
            </button>
          ))}
        </nav>
      </div>

      {filteredGames.length === 0 && !isLoading ? (
        <div className="text-center py-10">
          <p className="text-xl text-gray-500 dark:text-gray-400">
            {activeTab === 'all' ? "No games available in the library yet." : "No games found for this category."}
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
                <h3 className="font-bold text-xl mb-2 text-primary-text dark:text-primary-text-dark leading-tight">
                  {config.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 h-20 line-clamp-4">
                  {config.description}
                </p>

                <div className="w-full space-y-1 mb-4">
                  {config.subject && (
                    <span className="inline-block bg-primary-accent/20 dark:bg-primary-accent-dark/30 text-primary-accent dark:text-primary-accent-dark text-xs font-semibold mr-2 px-2.5 py-1 rounded-full">
                      <BookCopy size={12} className="inline mr-1.5" />{config.subject}
                    </span>
                  )}
                  {config.gameMode && (
                     <span className="inline-block bg-blue-500/20 dark:bg-blue-400/30 text-blue-600 dark:text-blue-300 text-xs font-semibold px-2.5 py-1 rounded-full">
                       <Tag size={12} className="inline mr-1.5" />{config.gameMode.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                     </span>
                  )}
                </div>
              </div>
              <Button
                onClick={() => handleOpenAssignModal(actualGameDataFromBackend)}
                variant="primary"
                fullWidth
                className={`mt-auto ${!actualGameDataFromBackend ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!actualGameDataFromBackend}
              >
                {actualGameDataFromBackend ? 'Assign Game' : 'Unavailable'}
              </Button>
            </div>
          ))}
        </div>
      )}

      {selectedGame && isAssignModalOpen && (
        <AssignGameModal
          isOpen={isAssignModalOpen}
          onClose={handleCloseAssignModal}
          gameToAssign={selectedGame}
          fixedClassroomId={classroomId}
        />
      )}
    </div>
  );
};

export default AssignGameToClassroomPage;