import React, { useEffect, useState } from 'react';
import { gameService } from '../../services/game';
import { GameDTO } from '../../types'; // Assuming GameDTO is suitable for library display
import GameCard from '../../components/common/GameCard'; // You might need to adapt GameCard or create a new one for library view
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AssignGameModal from '../../components/teacher/AssignGameModal'; // To be created
import { Library } from 'lucide-react';

const TeacherGameLibraryPage: React.FC = () => {
  const [games, setGames] = useState<GameDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<GameDTO | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  useEffect(() => {
    const fetchGames = async () => {
      setIsLoading(true);
      try {
        const libraryGames = await gameService.getLibraryGames();
        setGames(libraryGames);
      } catch (error) {
        console.error("Failed to fetch game library:", error);
        // Handle error display
      } finally {
        setIsLoading(false);
      }
    };
    fetchGames();
  }, []);

  const handleOpenAssignModal = (game: GameDTO) => {
    setSelectedGame(game);
    setIsAssignModalOpen(true);
  };

  const handleCloseAssignModal = () => {
    setSelectedGame(null);
    setIsAssignModalOpen(false);
    // Optionally refresh assigned games list or navigate
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

      {games.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-xl text-gray-500 dark:text-gray-400">No games available in the library yet.</p>
          {/* This should not happen if you've seeded the games table */}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game) => (
            // You might need a different type of card or adapt GameCard
            // For now, let's assume a simple display and an assign button
            <div key={game.id} className="card bg-white dark:bg-primary-card-dark p-4 shadow-lg rounded-xl flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg mb-2 text-primary-text dark:text-primary-text-dark">{game.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-3">{game.description || 'No description available.'}</p>
                {game.subject && (
                  <span className="inline-block bg-primary-accent/20 dark:bg-primary-accent-dark/30 text-primary-accent dark:text-primary-accent-dark text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full mb-3">
                    {game.subject}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleOpenAssignModal(game)}
                className="btn btn-primary w-full mt-4"
              >
                Assign to Classroom
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedGame && isAssignModalOpen && (
        <AssignGameModal
          isOpen={isAssignModalOpen}
          onClose={handleCloseAssignModal}
          gameToAssign={selectedGame}
        />
      )}
    </div>
  );
};

export default TeacherGameLibraryPage;