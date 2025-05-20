import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useClassroom } from '../../context/ClassroomContext';
import GameCard from '../../components/common/GameCard';
import LeaderboardTable from '../../components/common/LeaderboardTable';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ClassroomDTO, StudentClassroom } from '../../types';

const StudentClassroomViewPage: React.FC = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('games');
  const { 
    studentClassrooms, 
    getClassroomGames, 
    getClassroomLeaderboard,
    teacherClassrooms,
  } = useClassroom();
  
  const [isLoading, setIsLoading] = useState(true);
  const [classroomData, setClassroomData] = useState<StudentClassroom | ClassroomDTO | null>(null);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (classroomId) {
        let foundClassroom: StudentClassroom | ClassroomDTO | undefined = studentClassrooms.find(c => c.classroomId === classroomId);
        if (!foundClassroom) {
          foundClassroom = teacherClassrooms.find(c => c.id === classroomId);
        }
        setClassroomData(foundClassroom || null);
      }
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [classroomId, studentClassrooms, teacherClassrooms]);
  
  if (isLoading || !classroomId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (!classroomData) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4 text-primary-text dark:text-primary-text-dark">Classroom Not Found</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-300">The classroom you're looking for doesn't exist or you don't have access to it.</p>
        <Link to="/student/classrooms" className="btn btn-primary">
          Back to My Classrooms
        </Link>
      </div>
    );
  }
  
  const classroomName = 'classroomName' in classroomData ? classroomData.classroomName : classroomData.name;
  const teacherName = classroomData.teacherName;

  const games = getClassroomGames(classroomId);
  const leaderboard = getClassroomLeaderboard(classroomId);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary-text dark:text-primary-text-dark">{classroomName}</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Teacher: {teacherName}</p>
      </header>
      
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-4">
          <button
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'games'
                ? 'border-primary-interactive dark:border-primary-interactive-dark text-primary-interactive dark:text-primary-interactive-dark'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-primary-text dark:hover:text-primary-text-dark'
            }`}
            onClick={() => setActiveTab('games')}
          >
            Games & Activities
          </button>
          <button
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
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
            {games.length === 0 ? (
              <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow-sm p-8 text-center border dark:border-gray-700">
                <h3 className="text-xl font-semibold mb-2 text-primary-text dark:text-primary-text-dark">No Activities Yet</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Your teacher hasn't added any learning activities to this classroom yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map(game => (
                  <GameCard
                    key={game.id}
                    game={game}
                    classroomId={classroomId}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'leaderboard' && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-primary-text dark:text-primary-text-dark">Classroom Leaderboard</h2>
            <LeaderboardTable 
              entries={leaderboard} 
              highlightedUserId={currentUser?.id}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentClassroomViewPage;