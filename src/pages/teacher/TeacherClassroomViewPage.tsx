import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, Users, BookOpen, BarChart2 } from 'lucide-react';
import { useClassroom } from '../../context/ClassroomContext';
import Button from '../../components/common/Button';
import GameCard from '../../components/common/GameCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const TeacherClassroomViewPage: React.FC = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const { teacherClassrooms, getClassroomGames, getClassroomLeaderboard } = useClassroom();
  
  const [activeTab, setActiveTab] = useState('dashboard');
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
  
  const classroom = teacherClassrooms.find(c => c.id === classroomId);
  
  if (!classroom) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Classroom Not Found</h2>
        <p className="mb-6">The classroom you're looking for doesn't exist or you don't have access to it.</p>
        <Link to="/teacher/classrooms" className="btn btn-primary">
          Back to My Classrooms
        </Link>
      </div>
    );
  }
  
  const games = getClassroomGames(classroomId);
  const leaderboard = getClassroomLeaderboard(classroomId);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Students</h3>
                  <Users size={24} className="text-primary-interactive" />
                </div>
                <p className="text-3xl font-bold">{classroom.studentCount}</p>
                <p className="text-gray-600 text-sm mt-1">Enrolled students</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Activities</h3>
                  <BookOpen size={24} className="text-primary-energetic" />
                </div>
                <p className="text-3xl font-bold">{classroom.activityCount}</p>
                <p className="text-gray-600 text-sm mt-1">Active games</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Avg. Score</h3>
                  <BarChart2 size={24} className="text-primary-accent" />
                </div>
                <p className="text-3xl font-bold">78%</p>
                <p className="text-gray-600 text-sm mt-1">Across all activities</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
              <h3 className="font-semibold text-lg mb-4">Classroom Leaderboard (Top 5)</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">Rank</th>
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">Student</th>
                      <th className="py-2 px-4 text-right text-sm font-semibold text-gray-600">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.slice(0, 5).map((entry) => (
                      <tr key={entry.studentId} className="border-t border-gray-100">
                        <td className="py-3 px-4 whitespace-nowrap">{entry.rank}</td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {entry.avatarUrl && (
                              <img 
                                src={entry.avatarUrl} 
                                alt={entry.studentName} 
                                className="w-6 h-6 rounded-full mr-2"
                              />
                            )}
                            {entry.studentName}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap font-medium">
                          {entry.score} pts
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
        
      case 'games':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Activities</h2>
              <Button 
                variant="primary"
                size="sm"
                icon={<Plus size={16} />}
              >
                Add Activity
              </Button>
            </div>
            
            {games.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <h3 className="text-xl font-semibold mb-2">No Activities Yet</h3>
                <p className="text-gray-600 mb-6">
                  Add games and learning activities to this classroom for your students.
                </p>
                <Button 
                  variant="primary" 
                  size="lg"
                  icon={<Plus size={18} />}
                >
                  Add Your First Activity
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map(game => (
                  <GameCard
                    key={game.id}
                    game={game}
                    classroomId={classroomId}
                    showPerformance={true}
                  />
                ))}
              </div>
            )}
          </div>
        );
        
      case 'students':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Students</h2>
              <Button 
                variant="primary"
                size="sm"
                icon={<Plus size={16} />}
              >
                Add Student
              </Button>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 mb-6">
              <div className="flex items-center p-3 bg-primary-interactive bg-opacity-10 rounded-lg">
                <div className="mr-4 text-primary-interactive">
                  <BookOpen size={20} />
                </div>
                <div>
                  <p className="font-medium">Classroom Code: <span className="font-mono">{classroom.code}</span></p>
                  <p className="text-sm text-gray-600">Share this code with students to join this classroom</p>
                </div>
              </div>
            </div>
            
            {classroom.studentCount === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <h3 className="text-xl font-semibold mb-2">No Students Yet</h3>
                <p className="text-gray-600 mb-6">
                  Share your classroom code with students so they can join your class.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Name</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Email</th>
                      <th className="py-3 px-4 text-right text-sm font-semibold text-gray-600">Activities Completed</th>
                      <th className="py-3 px-4 text-right text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {/* Mock data for students */}
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img 
                            src="https://api.dicebear.com/7.x/bottts/svg?seed=student" 
                            alt="Student Demo" 
                            className="w-8 h-8 rounded-full mr-2"
                          />
                          <span>Student Demo</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">student@brightminds.com</td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">1/8</td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                          Remove
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img 
                            src="https://api.dicebear.com/7.x/bottts/svg?seed=maria" 
                            alt="Maria Santos" 
                            className="w-8 h-8 rounded-full mr-2"
                          />
                          <span>Maria Santos</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">maria@example.com</td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">7/8</td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                          Remove
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary-text">{classroom.name}</h1>
        {classroom.description && (
          <p className="text-gray-600 mt-1">{classroom.description}</p>
        )}
      </header>
      
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-4">
          <button
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'dashboard'
                ? 'border-primary-interactive text-primary-interactive'
                : 'border-transparent text-gray-600 hover:text-primary-text'
            }`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
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
              activeTab === 'students'
                ? 'border-primary-interactive text-primary-interactive'
                : 'border-transparent text-gray-600 hover:text-primary-text'
            }`}
            onClick={() => setActiveTab('students')}
          >
            Students
          </button>
        </div>
      </div>
      
      <div className="mt-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default TeacherClassroomViewPage;