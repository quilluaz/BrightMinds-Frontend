import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Table as Tabs, Component as TabsContent, List as TabsList, Refrigerator as TabsTrigger } from 'lucide-react';
import { useClassroom } from '../../context/ClassroomContext';
import GameCard from '../../components/common/GameCard';
import LeaderboardTable from '../../components/common/LeaderboardTable';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StudentClassroomViewPage: React.FC = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('games');
  const { 
    studentClassrooms, 
    teacherClassrooms,
    getClassroomGames, 
    getClassroomLeaderboard 
  } = useClassroom();
  
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [classroomId]);
  
  if (!classroomId || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  // Find the classroom from either teacher or student classrooms
  const classroom = studentClassrooms.find(c => c.classroomId === classroomId) || 
    teacherClassrooms.find(c => c.id === classroomId);
  
  if (!classroom) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Classroom Not Found</h2>
        <p className="mb-6">The classroom you're looking for doesn't exist or you don't have access to it.</p>
        <Link to="/student/classrooms" className="btn btn-primary">
          Back to My Classrooms
        </Link>
      </div>
    );
  }
  
  const classroomName = 'classroomName' in classroom ? classroom.classroomName : classroom.name;
  const teacherName = 'teacherName' in classroom ? classroom.teacherName : classroom.teacherName;
  const games = getClassroomGames(classroomId);
  const leaderboard = getClassroomLeaderboard(classroomId);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary-text">{classroomName}</h1>
        <p className="text-gray-600 mt-1">Teacher: {teacherName}</p>
      </header>
      
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-4">
          <button
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'games'
                ? 'border-primary-interactive text-primary-interactive'
                : 'border-transparent text-gray-600 hover:text-primary-text'
            }`}
            onClick={() => setActiveTab('games')}
          >
            Games & Activities
          </button>
          <button
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'leaderboard'
                ? 'border-primary-interactive text-primary-interactive'
                : 'border-transparent text-gray-600 hover:text-primary-text'
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
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <h3 className="text-xl font-semibold mb-2">No Activities Yet</h3>
                <p className="text-gray-600">
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
            <h2 className="text-xl font-semibold mb-4">Classroom Leaderboard</h2>
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