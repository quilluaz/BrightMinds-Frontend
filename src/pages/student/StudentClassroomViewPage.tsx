import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useClassroom } from '../../context/ClassroomContext';
import GameCard from '../../components/common/GameCard';
import LeaderboardTable from '../../components/common/LeaderboardTable';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ClassroomDTO, StudentClassroom, AssignedGameDTO, LeaderboardEntry } from '../../types';

const StudentClassroomViewPage: React.FC = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('games');
  
  const classroomContext = useClassroom();
  // Destructure functions directly if you are confident they are always provided by the context type
  const { 
    studentClassrooms, 
    getGamesForClassroom,
    getClassroomLeaderboard,
    teacherClassrooms,
  } = classroomContext;
  
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [classroomData, setClassroomData] = useState<StudentClassroom | ClassroomDTO | null>(null);
  
  const [games, setGames] = useState<AssignedGameDTO[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(false);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);

  useEffect(() => {
    setIsPageLoading(true);
    if (classroomId) {
      let foundClassroom: StudentClassroom | ClassroomDTO | undefined = 
        studentClassrooms.find(c => c.classroomId === classroomId);
      if (!foundClassroom) {
        foundClassroom = teacherClassrooms.find(c => c.id === classroomId);
      }
      setClassroomData(foundClassroom || null);
    }
    setIsPageLoading(false); 
  }, [classroomId, studentClassrooms, teacherClassrooms]);

  const fetchGames = useCallback(async () => {
    if (classroomId) { // Removed redundant check for getGamesForClassroom's existence
      setIsLoadingGames(true);
      try {
        const fetchedGames = await getGamesForClassroom(classroomId);
        setGames(fetchedGames);
      } catch (error) {
        console.error("Failed to fetch games:", error);
        setGames([]);
      } finally {
        setIsLoadingGames(false);
      }
    }
  }, [classroomId, getGamesForClassroom]); // getGamesForClassroom is now a stable dependency

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const fetchLeaderboard = useCallback(async () => {
    if (classroomId) { // Removed redundant check for getClassroomLeaderboard's existence
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
  }, [classroomId, getClassroomLeaderboard]); // getClassroomLeaderboard is now a stable dependency

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      fetchLeaderboard();
    }
  }, [activeTab, fetchLeaderboard]);

  if (isPageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (!classroomId) {
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
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary-text dark:text-primary-text-dark">{classroomName}</h1>
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
          <div>
            {isLoadingGames ? <LoadingSpinner /> : games.length === 0 ? (
              <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow-sm p-8 text-center border dark:border-gray-700">
                <h3 className="text-xl font-semibold mb-2 text-primary-text dark:text-primary-text-dark">No Activities Yet</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Your teacher hasn't added any learning activities to this classroom yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map((game: AssignedGameDTO) => (
                  <GameCard
                    key={game.id}
                    // GameCard might expect a different 'Game' shape.
                    // AssignedGameDTO has gameTitle, gameId, etc. but not the full Game structure with questions.
                    // You might need to adapt GameCard or fetch full game details if GameCard needs them.
                    game={{ ...game, title: game.gameTitle || "Game" } as any} 
                    classroomId={classroomId!}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'leaderboard' && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-primary-text dark:text-primary-text-dark">Classroom Leaderboard</h2>
            {isLoadingLeaderboard ? <LoadingSpinner /> : (
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