import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useClassroom } from '../../context/ClassroomContext';
import GameCard from '../../components/common/GameCard';
import LeaderboardTable from '../../components/common/LeaderboardTable';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ClassroomDTO, StudentClassroom, AssignedGameDTO, LeaderboardEntry, Game } from '../../types'; // Added Game

const StudentClassroomViewPage: React.FC = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate(); // Added navigate
  const [activeTab, setActiveTab] = useState('games');

  const {
    studentClassrooms,
    teacherClassrooms, // Assuming student might also view a classroom they are also a teacher of (edge case) or for unified logic
    getAssignedGames, // Renamed from getGamesForClassroom for consistency if it's fetching AssignedGameDTOs
    getClassroomLeaderboard,
  } = useClassroom();

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [classroomData, setClassroomData] = useState<StudentClassroom | ClassroomDTO | null>(null);

  const [games, setGames] = useState<AssignedGameDTO[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(false);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);

  useEffect(() => {
    setIsPageLoading(true);
    if (classroomId) {
      let foundClassroom: StudentClassroom | ClassroomDTO | undefined;
      if (currentUser?.role === 'STUDENT') {
        foundClassroom = studentClassrooms.find(c => c.classroomId === classroomId);
      } else if (currentUser?.role === 'TEACHER') { // Though this is student page, good to be robust
        foundClassroom = teacherClassrooms.find(c => c.id === classroomId);
      }
      setClassroomData(foundClassroom || null);
    } else {
      setClassroomData(null); // Ensure classroomData is null if no classroomId
      navigate(currentUser?.role === 'STUDENT' ? "/student/classrooms" : "/teacher/classrooms"); // Navigate away if no ID
    }
    setIsPageLoading(false);
  }, [classroomId, studentClassrooms, teacherClassrooms, currentUser?.role, navigate]);

  const fetchGames = useCallback(async () => {
    if (classroomId && getAssignedGames) { // Check getAssignedGames existence
      setIsLoadingGames(true);
      try {
        // Assuming getAssignedGames is the correct function name from context for fetching games for a classroom
        const fetchedGames = await getAssignedGames(classroomId);
        setGames(fetchedGames);
      } catch (error) {
        console.error("Failed to fetch games:", error);
        setGames([]);
      } finally {
        setIsLoadingGames(false);
      }
    }
  }, [classroomId, getAssignedGames]);

  useEffect(() => {
    if (classroomData) { // Only fetch games if classroomData is loaded
      fetchGames();
    }
  }, [fetchGames, classroomData]); // Added classroomData dependency

  const fetchLeaderboard = useCallback(async () => {
    if (classroomId && getClassroomLeaderboard) { // Check getClassroomLeaderboard existence
        setIsLoadingLeaderboard(true);
        try {
            const fetchedLeaderboard = await getClassroomLeaderboard(classroomId);
            setLeaderboard(fetchedLeaderboard);
        } catch (error) {
            console.error("Failed to fetch leaderboard:", error);
            setLeaderboard([]);
        } finally {
            setIsLoadingLeaderboard(false);
        }
    }
  }, [classroomId, getClassroomLeaderboard]);

  useEffect(() => {
    if (activeTab === 'leaderboard' && classroomData) { // Only fetch if tab is active and classroomData exists
      fetchLeaderboard();
    }
  }, [activeTab, fetchLeaderboard, classroomData]); // Added classroomData dependency

  // This function maps AssignedGameDTO to the Game shape expected by GameCard
  const mapAssignedGameToGameCardProp = (assignedGame: AssignedGameDTO): Game => {
    return {
      id: assignedGame.game?.id || assignedGame.gameId || assignedGame.id, // Prioritize game object's ID
      title: assignedGame.game?.title || assignedGame.gameTitle || 'Untitled Game',
      description: assignedGame.game?.description,
      subject: assignedGame.game?.subject,
      questions: assignedGame.game?.questions || [],
      gameMode: assignedGame.game?.gameMode,
      status: assignedGame.status as Game['status'] || 'not_started', // Map DTO status if necessary
      // Score is usually associated with an attempt, not the game definition itself.
      // If GameCard needs a score directly on the game object, it would come from student's attempt data.
    };
  };


  if (isPageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!classroomId) { // Should be caught by useEffect navigate, but good fallback
      return <div className="text-center p-8">Invalid classroom ID.</div>;
  }

  if (!classroomData) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4 text-primary-text dark:text-primary-text-dark">Classroom Not Found</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-300">The classroom you're looking for doesn't exist or you don't have access to it.</p>
        <Link to={currentUser?.role === 'STUDENT' ? "/student/classrooms" : "/teacher/classrooms"} className="btn btn-primary">
          Back to My Classrooms
        </Link>
      </div>
    );
  }

  const classroomName = 'classroomName' in classroomData ? classroomData.classroomName : classroomData.name;
  const teacherNameProperty = 'teacherName' in classroomData ? classroomData.teacherName : (classroomData as ClassroomDTO).teacherName;


  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <header className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl md:text-4xl font-bold text-primary-text dark:text-primary-text-dark">{classroomName}</h1>
        {teacherNameProperty && <p className="text-gray-600 dark:text-gray-300 mt-1">Teacher: {teacherNameProperty}</p>}
      </header>

      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-1 sm:space-x-4">
          <button
            className={`py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'games'
                ? 'border-primary-interactive dark:border-primary-interactive-dark text-primary-interactive dark:text-primary-interactive-dark'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-primary-text dark:hover:text-primary-text-dark'
            }`}
            onClick={() => setActiveTab('games')}
          >
            Games & Activities
          </button>
          <button
            className={`py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'leaderboard'
                ? 'border-primary-interactive dark:border-primary-interactive-dark text-primary-interactive dark:text-primary-interactive-dark'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-primary-text dark:hover:text-primary-text-dark'
            }`}
            onClick={() => setActiveTab('leaderboard')}
          >
            Classroom Leaderboard
          </button>
        </div>
      </div>

      <div className="mt-6">
        {activeTab === 'games' && (
          <div className="animate-fade-in">
            {isLoadingGames ? <LoadingSpinner /> : games.length === 0 ? (
              <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow-sm p-8 text-center border dark:border-gray-700">
                <h3 className="text-xl font-semibold mb-2 text-primary-text dark:text-primary-text-dark">No Activities Yet</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Your teacher hasn't added any learning activities to this classroom yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map((assignedGame: AssignedGameDTO) => (
                  <GameCard
                    key={assignedGame.id}
                    game={mapAssignedGameToGameCardProp(assignedGame)}
                    classroomId={classroomId!} // classroomId is guaranteed to be defined here
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-semibold mb-4 text-primary-text dark:text-primary-text-dark">Classroom Leaderboard</h2>
            {isLoadingLeaderboard ? <LoadingSpinner /> : leaderboard.length === 0 ? (
                 <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow-sm p-8 text-center border dark:border-gray-700">
                    <h3 className="text-xl font-semibold mb-2 text-primary-text dark:text-primary-text-dark">Leaderboard is Empty</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                        No scores recorded yet. Play some games to see your rank!
                    </p>
                </div>
            ) : (
                <LeaderboardTable
                  entries={leaderboard}
                  highlightedUserId={currentUser?.id !== undefined ? currentUser.id.toString() : undefined}
                />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentClassroomViewPage;