// src/pages/teacher/TeacherGameLibraryPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameService } from '../../services/game';
import { GameDTO } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AssignGameModal from '../../components/teacher/AssignGameModal';
import { Library, Sparkles, Zap, Brain, Puzzle } from 'lucide-react'; // Icons for games

// Define the structure for our desired library games
interface LibraryGameDisplayConfig {
  idKey: string; // Unique key for React list
  title: string;
  description: string;
  subject?: string;
  gameMode: GameDTO['gameMode'];
  icon: React.ReactNode; // Icon for the card
}

// Configuration for the 4 main games to be displayed in the library
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
    idKey: 'likas-yaman-sort',
    title: "Likas Yaman Sort",
    description: "Learn about natural resources by sorting items into correct categories. Teaches uses and care.",
    gameMode: "SORTING",
    subject: "Araling Panlipunan",
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

// Interface for the game data that will be displayed and used for assignment
interface DisplayableLibraryGame {
  config: LibraryGameDisplayConfig;
  // This will hold the actual game fetched from backend, primarily for its ID.
  // We prefer display text from `config` but need `id` from `actualGameDataFromBackend`.
  actualGameDataFromBackend?: GameDTO;
}

const TeacherGameLibraryPage: React.FC = () => {
  const [displayableGames, setDisplayableGames] = useState<DisplayableLibraryGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGameToAssign, setSelectedGameToAssign] = useState<GameDTO | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAndProcessGames = async () => {
      setIsLoading(true);
      try {
        const allPremadeGamesFromBackend = await gameService.getLibraryGames();
        
        const processedGames: DisplayableLibraryGame[] = PREFERRED_LIBRARY_GAMES.map(config => {
          // Find the first game from backend that matches the gameMode.
          // This assumes each of the 4 game types has a unique gameMode among premade games.
          // If not, you might need a more specific way to identify the "template" game from the backend,
          // e.g., by a specific title or a dedicated flag if your backend Game entity has one.
          const correspondingBackendGame = allPremadeGamesFromBackend.find(
            g => g.gameMode === config.gameMode
          );
          
          return {
            config: config,
            actualGameDataFromBackend: correspondingBackendGame
          };
        });
        
        setDisplayableGames(processedGames);

      } catch (error) {
        console.error("Failed to fetch or process game library:", error);
        setDisplayableGames(PREFERRED_LIBRARY_GAMES.map(config => ({ config }))); // Show config even if backend match fails, but assign will be disabled
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
      // Handle case where the game might not be available in backend (e.g., show an alert)
      alert("This game is currently not available for assignment.");
    }
  };

  const handleCloseAssignModal = () => {
    setSelectedGameToAssign(null);
    setIsAssignModalOpen(false);
  };

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
        <h1 className="text-3xl md:text-4xl font-bold text-primary-text dark:text-primary-text-dark flex items-center">
          <Library size={32} className="mr-3 text-primary-interactive dark:text-primary-interactive-dark" />
          Game Library
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
          Browse and assign premade activities to your classrooms.
        </p>
      </div>

      {displayableGames.length === 0 && !isLoading ? (
        <div className="text-center py-10">
          <p className="text-xl text-gray-500 dark:text-gray-400">Game library is currently empty or encountered an issue.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayableGames.map(({ config, actualGameDataFromBackend }) => (
            <div 
              key={config.idKey} 
              className={`card bg-white dark:bg-primary-card-dark p-5 shadow-lg rounded-xl flex flex-col justify-between border border-gray-200 dark:border-gray-700 transition-all hover:shadow-xl hover:scale-[1.03]`}
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-gray-100 dark:bg-slate-700 rounded-full mb-4">
                  {config.icon || <Library size={28} className="text-gray-500" />}
                </div>
                <h3 className="font-bold text-xl mb-2 text-primary-text dark:text-primary-text-dark">{config.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 h-20 line-clamp-4">{config.description}</p>
                
                <div className="w-full space-y-1 mb-4">
                  {config.subject && (
                    <span className="inline-block bg-primary-accent/20 dark:bg-primary-accent-dark/30 text-primary-accent dark:text-primary-accent-dark text-xs font-semibold mr-2 px-2.5 py-1 rounded-full">
                      {config.subject}
                    </span>
                  )}
                  {config.gameMode && (
                     <span className="inline-block bg-blue-500/20 dark:bg-blue-400/30 text-blue-600 dark:text-blue-300 text-xs font-semibold px-2.5 py-1 rounded-full">
                        {config.gameMode.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
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