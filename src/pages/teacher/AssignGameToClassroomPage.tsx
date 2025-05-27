import React, { useEffect, useState } from 'react';
import { useParams, useNavigate }
from 'react-router-dom';
import { gameService } from '../../services/game';
import { GameDTO } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AssignGameModal from '../../components/teacher/AssignGameModal';
import Button from '../../components/common/Button'; // Assuming Button is styled
import { Library, ChevronLeft } from 'lucide-react';
import { useClassroom } from '../../context/ClassroomContext'; // To get classroom details

const AssignGameToClassroomPage: React.FC = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const navigate = useNavigate();
  const { teacherClassrooms } = useClassroom(); // Get classroom details

  const [games, setGames] = useState<GameDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<GameDTO | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [classroomName, setClassroomName] = useState<string | null>(null);

  useEffect(() => {
    if (classroomId) {
      const classroom = teacherClassrooms.find(c => c.id === classroomId);
      if (classroom) {
        setClassroomName(classroom.name);
      } else {
        // Handle case where classroom might not be in context yet or is invalid
        // console.warn("Classroom details not found for ID:", classroomId);
        // Potentially fetch classroom details if not found or rely on context update
      }
    }
  }, [classroomId, teacherClassrooms]);

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
    // Potentially navigate back to classroom view or refresh assigned games
    // navigate(`/teacher/classrooms/${classroomId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!classroomId) {
    navigate('/teacher/classrooms'); // Should not happen if routed correctly
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

      {games.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-xl text-gray-500 dark:text-gray-400">No games available in the library yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game) => (
            <div key={game.id} className="card bg-white dark:bg-primary-card-dark p-4 shadow-lg rounded-xl flex flex-col justify-between border border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="font-bold text-lg mb-2 text-primary-text dark:text-primary-text-dark">{game.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-3 h-12">{game.description || 'No description available.'}</p>
                {game.subject && (
                  <span className="inline-block bg-primary-accent/20 dark:bg-primary-accent-dark/30 text-primary-accent dark:text-primary-accent-dark text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full mb-3">
                    {game.subject}
                  </span>
                )}
                 {game.gameMode && (
                  <span className="inline-block bg-blue-500/20 dark:bg-blue-400/30 text-blue-600 dark:text-blue-300 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3">
                    {game.gameMode.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                )}
              </div>
              <Button
                onClick={() => handleOpenAssignModal(game)}
                variant="primary"
                fullWidth
                className="mt-4"
              >
                Assign
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
          fixedClassroomId={classroomId} // Pass the fixed classroomId
        />
      )}
    </div>
  );
};

export default AssignGameToClassroomPage;