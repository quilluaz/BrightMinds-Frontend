import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Plus, Users, BookOpen, BarChart2, Settings, Copy, AlertTriangle, Library } from 'lucide-react';
import { useClassroom } from '../../context/ClassroomContext';
import Button from '../../components/common/Button';
import GameCard from '../../components/common/GameCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import LeaderboardTable from '../../components/common/LeaderboardTable';
import { ClassroomDTO, AssignedGameDTO, LeaderboardEntry, Game } from '../../types';
import { useAuth } from '../../context/AuthContext';

const TeacherClassroomViewPage: React.FC = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const {
    teacherClassrooms,
    getAssignedGames,
    getClassroomLeaderboard,
    // getClassroomDetails, // Assuming this is not used or handled by finding in teacherClassrooms
  } = useClassroom();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [classroom, setClassroom] = useState<ClassroomDTO | null>(null);
  const [assignedGames, setAssignedGames] = useState<AssignedGameDTO[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [averageScore, setAverageScore] = useState<number | null>(null); // Placeholder for actual calculation

  const fetchClassroomData = useCallback(async () => {
    if (!classroomId) {
      navigate('/teacher/classrooms');
      return;
    }
    setIsLoading(true);
    try {
      const foundClassroom = teacherClassrooms.find(c => c.id === classroomId);

      if (foundClassroom) {
        setClassroom(foundClassroom);
        if (getAssignedGames) {
          const gamesData = await getAssignedGames(classroomId);
          setAssignedGames(gamesData);
        }
        if (getClassroomLeaderboard) {
          const leaderboardData = await getClassroomLeaderboard(classroomId);
          setLeaderboard(leaderboardData);
          // Basic average score calculation placeholder
          if (leaderboardData.length > 0) {
            const totalScore = leaderboardData.reduce((sum, entry) => sum + entry.score, 0);
            setAverageScore(Math.round(totalScore / leaderboardData.length));
          } else {
            setAverageScore(0);
          }
        }
      } else {
        console.error("Classroom not found in context");
        navigate('/teacher/classrooms');
      }
    } catch (error) {
      console.error("Failed to fetch classroom data:", error);
      navigate('/teacher/classrooms');
    } finally {
      setIsLoading(false);
    }
  }, [classroomId, teacherClassrooms, getAssignedGames, getClassroomLeaderboard, navigate]);

  useEffect(() => {
    fetchClassroomData();
  }, [fetchClassroomData]);


  const handleCopyCode = () => {
    if (classroom?.uniqueCode) {
      navigator.clipboard.writeText(classroom.uniqueCode)
        .then(() => {
          // Consider adding a toast notification for "Copied!"
          console.log('Class code copied to clipboard');
        })
        .catch(err => {
          console.error('Failed to copy class code: ', err);
        });
    }
  };

  const handleRefreshData = () => {
    fetchClassroomData(); // Re-fetch all classroom specific data
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4 text-primary-text dark:text-primary-text-dark">Classroom Not Found</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-300">The classroom you are looking for does not exist or you may not have access.</p>
        <Link to="/teacher/classrooms" className="btn btn-primary">
          Back to My Classrooms
        </Link>
      </div>
    );
  }

  const studentCount = classroom.studentCount || 0;
  const activityCount = assignedGames.length;


  // This function attempts to map AssignedGameDTO to the Game shape expected by GameCard
  // It's a simplified mapping; GameCard might need more detailed game info for full functionality.
  const mapAssignedGameToGameCardProp = (assignedGame: AssignedGameDTO): Game => {
    return {
      id: assignedGame.gameId || assignedGame.id, // Prefer gameId if available
      title: assignedGame.gameTitle || 'Untitled Game',
      description: assignedGame.game?.description, // Assumes 'game' object might be part of AssignedGameDTO
      subject: assignedGame.game?.subject,
      questions: assignedGame.game?.questions || [],
      gameMode: assignedGame.game?.gameMode,
      // Map status from AssignedGameDTO to GameStatus if GameCard expects it
      // status: assignedGame.status ? mapDtoStatusToGameStatus(assignedGame.status) : 'not_started',
      status: assignedGame.status as Game['status'], // Direct cast if types are compatible or mapped elsewhere
      // score is not typically on the game definition itself, but on an attempt.
    };
  };


  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <header className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary-text dark:text-primary-text-dark">{classroom.name}</h1>
            {classroom.description && (
              <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-2xl">{classroom.description}</p>
            )}
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <Button
                variant="outline"
                size="md"
                onClick={handleRefreshData}
                aria-label="Refresh classroom data"
            >
                Refresh Data
            </Button>
            <Button
              variant="outline"
              size="md"
              icon={<Settings size={18} />}
              onClick={() => navigate(`/teacher/classrooms/${classroomId}/settings`)} // Navigate to settings page
            >
              Settings
            </Button>
          </div>
        </div>
        {classroom.uniqueCode && (
          <div className="mt-5 bg-primary-background dark:bg-primary-background-dark p-3 rounded-lg inline-flex items-center shadow">
            <p className="text-sm text-gray-700 dark:text-gray-300 mr-2">Class Code:</p>
            <span className="font-mono text-md font-semibold text-primary-text dark:text-primary-text-dark mr-3">{classroom.uniqueCode}</span>
            <Button variant="text" size="sm" onClick={handleCopyCode} icon={<Copy size={16} />} aria-label="Copy class code">
              Copy
            </Button>
          </div>
        )}
      </header>

      <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-1 sm:space-x-4">
          {['overview', 'activities', 'students', 'leaderboard'].map((tabName) => (
            <button
              key={tabName}
              className={`py-3 px-3 sm:px-4 text-sm font-medium border-b-2 transition-colors capitalize ${
                activeTab === tabName
                  ? 'border-primary-interactive dark:border-primary-interactive-dark text-primary-interactive dark:text-primary-interactive-dark'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-primary-text dark:hover:text-primary-text-dark'
              }`}
              onClick={() => setActiveTab(tabName)}
            >
              {tabName.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-semibold text-primary-text dark:text-primary-text-dark mb-6">Classroom Snapshot</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow p-6 border dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg text-primary-text dark:text-primary-text-dark">Students</h3>
                  <Users size={22} className="text-primary-interactive dark:text-primary-interactive-dark" />
                </div>
                <p className="text-4xl font-bold text-primary-text dark:text-primary-text-dark">{studentCount}</p>
              </div>
              <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow p-6 border dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg text-primary-text dark:text-primary-text-dark">Activities</h3>
                  <BookOpen size={22} className="text-primary-energetic dark:text-primary-energetic-dark" />
                </div>
                <p className="text-4xl font-bold text-primary-text dark:text-primary-text-dark">{activityCount}</p>
              </div>
              <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow p-6 border dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg text-primary-text dark:text-primary-text-dark">Avg. Score</h3>
                  <BarChart2 size={22} className="text-primary-accent dark:text-primary-accent-dark" />
                </div>
                <p className="text-4xl font-bold text-primary-text dark:text-primary-text-dark">{averageScore !== null ? `${averageScore}%` : 'N/A'}</p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-primary-text dark:text-primary-text-dark mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Button variant="primary" icon={<Library size={18}/>} onClick={() => navigate('/teacher/games/library')}>Assign From Library</Button>
                <Button variant="outline" icon={<Users size={18}/>} onClick={() => setActiveTab('students')}>Manage Students</Button>
                <Button variant="outline" icon={<BarChart2 size={18}/>} onClick={() => setActiveTab('leaderboard')}>View Leaderboard</Button>
              </div>
            </div>

            <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow p-6 border dark:border-gray-700">
              <h3 className="text-xl font-semibold text-primary-text dark:text-primary-text-dark mb-4">Recent Activity</h3>
              <ul className="space-y-3">
                <li className="text-sm text-gray-700 dark:text-gray-300">Juan Dela Cruz completed "Pangngalan Quiz" with 85%.</li>
                <li className="text-sm text-gray-700 dark:text-gray-300">Maria Santos joined the classroom.</li>
                <li className="text-sm text-gray-700 dark:text-gray-300">New activity "Pandiwa Practice" assigned.</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'activities' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-primary-text dark:text-primary-text-dark">Learning Activities</h2>
              <Button
                variant="primary"
                icon={<Library size={18} />}
                onClick={() => navigate('/teacher/games/library')}
              >
                Assign From Library
              </Button>
            </div>
            {assignedGames.length === 0 ? (
              <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow-sm p-8 text-center border-2 border-dashed dark:border-gray-700">
                <AlertTriangle size={40} className="mx-auto mb-4 text-yellow-500" />
                <h3 className="text-xl font-semibold mb-2 text-primary-text dark:text-primary-text-dark">No Activities Assigned Yet</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Assign games and learning activities from the library to engage your students.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignedGames.map(assignedGame => (
                  <GameCard
                    key={assignedGame.id}
                    game={mapAssignedGameToGameCardProp(assignedGame)}
                    classroomId={classroomId!}
                    showPerformance
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'students' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-primary-text dark:text-primary-text-dark">Enrolled Students ({studentCount})</h2>
              <Button
                variant="primary"
                icon={<Plus size={18} />}
                 onClick={() => alert('Navigate to enroll student page or open modal - TBD')}
              >
                Enroll New Student
              </Button>
            </div>
            {studentCount === 0 ? (
              <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow-sm p-8 text-center border-2 border-dashed dark:border-gray-700">
                <Users size={40} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2 text-primary-text dark:text-primary-text-dark">No Students Enrolled</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Share the classroom code <code className="font-mono bg-gray-100 dark:bg-gray-700 p-1 rounded">{classroom.uniqueCode}</code> with your students to let them join.
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow-sm overflow-hidden border dark:border-gray-700">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-slate-800">
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Name</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Email</th>
                      <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600 dark:text-gray-300">Activities Completed</th>
                      <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600 dark:text-gray-300">Avg. Score</th>
                      <th className="py-3 px-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {[
                      {id: 's1', name: 'Juan Dela Cruz', email: 'juan@example.com', completed: 5, total: 8, avgScore: 88, avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=juan&backgroundColor=E8F9FF,B3E5FC,FFDF8E,F4B400`},
                      {id: 's2', name: 'Maria Clara', email: 'maria@example.com', completed: 8, total: 8, avgScore: 92, avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=maria&backgroundColor=E8F9FF,B3E5FC,FFDF8E,F4B400`}
                    ].map(student => (
                      <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                        <td className="py-3 px-4 whitespace-nowrap text-primary-text dark:text-primary-text-dark">
                          <div className="flex items-center">
                            <img src={student.avatar} alt={student.name} className="w-8 h-8 rounded-full mr-3"/>
                            {student.name}
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-primary-text dark:text-primary-text-dark">{student.email}</td>
                        <td className="py-3 px-4 text-center whitespace-nowrap text-primary-text dark:text-primary-text-dark">{student.completed}/{student.total}</td>
                        <td className="py-3 px-4 text-center whitespace-nowrap text-primary-text dark:text-primary-text-dark font-medium">{student.avgScore}%</td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <Button variant="text" size="sm" onClick={() => navigate(`/teacher/classrooms/${classroomId}/students/${student.id}`)}>View Progress</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-semibold mb-6 text-primary-text dark:text-primary-text-dark">Classroom Leaderboard</h2>
            <LeaderboardTable
              entries={leaderboard}
              highlightedUserId={currentUser?.id.toString()}
            />
            {leaderboard.length === 0 && (
              <p className="mt-4 text-center text-gray-500 dark:text-gray-400">No leaderboard data available yet. Scores will appear here as students complete activities.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherClassroomViewPage;