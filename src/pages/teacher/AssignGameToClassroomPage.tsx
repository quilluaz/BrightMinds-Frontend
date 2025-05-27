import React, { useEffect, useState } from 'react';
import { useParams, useNavigate }
from 'react-router-dom';
import { gameService } from '../../services/game';
import { GameDTO } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AssignGameModal from '../../components/teacher/AssignGameModal';
import Button from '../../components/common/Button';
import { Library, ChevronLeft, Tag, BookCopy } from 'lucide-react'; // Added Tag and BookCopy for capsules
import { useClassroom } from '../../context/ClassroomContext';

const AssignGameToClassroomPage: React.FC = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const navigate = useNavigate();
  const { teacherClassrooms } = useClassroom();

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
  };

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

      {games.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-xl text-gray-500 dark:text-gray-400">No games available in the library yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game) => (
            <div key={game.id} className="card bg-white dark:bg-primary-card-dark p-5 shadow-lg rounded-xl flex flex-col justify-between border border-gray-200 dark:border-gray-700 transition-all hover:shadow-xl hover:scale-[1.02]">
              <div className="flex-grow">
                {/* Game Title - Most prominent at the top */}
                <h3 className="font-bold text-lg mb-2 text-primary-text dark:text-primary-text-dark leading-tight">
                  {game.title}
                </h3>

                {/* Game Mode and Subject Capsules - Placed below title */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {game.gameMode && (
                    <span className="flex items-center text-xs font-medium bg-blue-100 dark:bg-blue-700/50 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full">
                      <Tag size={12} className="mr-1.5" />
                      {game.gameMode.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  )}
                  {game.subject && (
                    <span className="flex items-center text-xs font-medium bg-green-100 dark:bg-green-700/50 text-green-700 dark:text-green-300 px-2.5 py-1 rounded-full">
                       <BookCopy size={12} className="mr-1.5" />
                      {game.subject}
                    </span>
                  )}
                </div>
                
                {/* Game Description - Less prominent, below capsules */}
                <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-3">
                  {game.description || 'No description available.'}
                </p>
              </div>

              <Button
                onClick={() => handleOpenAssignModal(game)}
                variant="primary"
                fullWidth
                className="mt-4" // Ensure some space from content to button
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
          fixedClassroomId={classroomId}
        />
      )}
    </div>
  );
};

export default AssignGameToClassroomPage;