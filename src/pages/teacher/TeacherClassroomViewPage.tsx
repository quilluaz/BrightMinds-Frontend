import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Users, BookOpen, BarChart2, Settings, Copy, AlertTriangle, Library, Trash2 } from 'lucide-react'; // Added Trash2
import { useClassroom } from '../../context/ClassroomContext';
import Button from '../../components/common/Button';
import GameCard from '../../components/common/GameCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import LeaderboardTable from '../../components/common/LeaderboardTable';
import ClassroomSettingsModal from '../../components/teacher/ClassroomSettingsModal'; // Import the new modal
import { ClassroomDTO, AssignedGameDTO, LeaderboardEntry, Game, User as StudentUser } from '../../types';
import { useAuth } from '../../context/AuthContext';

const TeacherClassroomViewPage: React.FC = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const {
    teacherClassrooms,
    getAssignedGames,
    getClassroomLeaderboard,
    getStudentsInClassroom,
    fetchTeacherClassrooms,
    // removeStudentFromClassroom // Assuming this function will be added to context
  } = useClassroom();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [classroom, setClassroom] = useState<ClassroomDTO | null>(null);
  const [assignedGames, setAssignedGames] = useState<AssignedGameDTO[]>([]);
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [averageScore, setAverageScore] = useState<number | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const fetchClassroomData = useCallback(async (forceRefreshContext = false) => {
    if (!classroomId) {
      navigate('/teacher/classrooms');
      return;
    }
    setIsLoading(true);

    if (forceRefreshContext && fetchTeacherClassrooms) {
      await fetchTeacherClassrooms();
    }

    try {
      const currentClassrooms = teacherClassrooms;
      const foundClassroom = currentClassrooms.find(c => c.id === classroomId);

      if (foundClassroom) {
        setClassroom(foundClassroom);

        const [gamesData, studentsData, leaderboardData] = await Promise.all([
          getAssignedGames ? getAssignedGames(classroomId) : Promise.resolve([]),
          getStudentsInClassroom ? getStudentsInClassroom(classroomId) : Promise.resolve([]),
          getClassroomLeaderboard ? getClassroomLeaderboard(classroomId) : Promise.resolve([])
        ]);

        setAssignedGames(gamesData);
        setStudents(studentsData);
        setLeaderboard(leaderboardData);

        if (leaderboardData.length > 0) {
          const totalScore = leaderboardData.reduce((sum, entry) => sum + entry.score, 0);
          setAverageScore(Math.round(totalScore / leaderboardData.length));
        } else {
          setAverageScore(0);
        }
      } else {
        console.warn("Classroom not found in context, attempting direct fetch or redirecting.");
        // Optionally, you could try to fetch a single classroom here if context is stale
        // or just navigate away if it's truly not found/accessible.
        navigate('/teacher/classrooms');
      }
    } catch (error) {
      console.error("Failed to fetch classroom data:", error);
      navigate('/teacher/classrooms');
    } finally {
      setIsLoading(false);
    }
  }, [classroomId, getAssignedGames, getStudentsInClassroom, getClassroomLeaderboard, navigate, fetchTeacherClassrooms, teacherClassrooms]);


  useEffect(() => {
    fetchClassroomData();
  }, [fetchClassroomData]);

  const handleCopyCode = () => {
    if (classroom?.uniqueCode) {
      navigator.clipboard.writeText(classroom.uniqueCode)
        .then(() => {
          setCodeCopied(true);
          setTimeout(() => setCodeCopied(false), 2000);
        })
        .catch(err => console.error('Failed to copy class code: ', err));
    }
  };

  const handleRemoveStudent = async (studentId: string | number) => {
    if (!classroomId) return;
    // Confirm before removing
    if (window.confirm(`Are you sure you want to remove this student? This action cannot be undone.`)) {
        try {
            // TODO: Implement removeStudentFromClassroom in ClassroomContext
            // await removeStudentFromClassroom(classroomId, studentId.toString());
            alert(`Student ${studentId} removed (simulated). Refreshing student list.`); // Placeholder
            // Refetch students after removal
            if (getStudentsInClassroom) {
                const updatedStudents = await getStudentsInClassroom(classroomId);
                setStudents(updatedStudents);
            }
             // Also refetch classroom data to update studentCount
            fetchClassroomData(true);
        } catch (error) {
            alert(`Failed to remove student: ${error instanceof Error ? error.message : 'Unknown error'}`);
            console.error("Error removing student:", error);
        }
    }
  };


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

  const studentCount = classroom.studentCount !== undefined ? classroom.studentCount : students.length;
  const activityCount = assignedGames.length;

  const mapAssignedGameToGameCardProp = (assignedGame: AssignedGameDTO): Game => {
    return {
      id: assignedGame.game?.id || assignedGame.gameId || assignedGame.id,
      title: assignedGame.game?.title || assignedGame.gameTitle || 'Untitled Game',
      description: assignedGame.game?.description,
      subject: assignedGame.game?.subject,
      questions: assignedGame.game?.questions || [],
      gameMode: assignedGame.game?.gameMode,
      status: assignedGame.status as Game['status'] || 'not_started',
    };
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <header className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary-text dark:text-primary-text-dark">{classroom.name}</h1>
            {classroom.description && (
              <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-2xl">{classroom.description}</p>
            )}
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            {classroom.uniqueCode && (
              <div className="bg-primary-background dark:bg-slate-700 p-2.5 rounded-lg flex items-center shadow-sm border border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-600 dark:text-gray-300 mr-1.5">Code:</p>
                <span className="font-mono text-sm font-semibold text-primary-text dark:text-primary-text-dark mr-2">{classroom.uniqueCode}</span>
                <Button
                  variant="text"
                  size="sm"
                  onClick={handleCopyCode}
                  icon={codeCopied ? <Check size={14} className="text-green-500"/> : <Copy size={14} />}
                  className="!p-1.5"
                  aria-label="Copy class code"
                >
                  {codeCopied ? '' : ''}
                </Button>
              </div>
            )}
            <Button
              variant="primary"
              size="md"
              icon={<Library size={18} />}
              onClick={() => navigate(`/teacher/classrooms/${classroomId}/assign-game`)}
            >
              Assign Game
            </Button>
            <Button
              variant="outline"
              size="md"
              icon={<Settings size={18} />}
              onClick={() => setIsSettingsModalOpen(true)}
            >
              Settings
            </Button>
          </div>
        </div>
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
            {/* Further streamlining: Removed quick actions and recent activity */}
          </div>
        )}

        {activeTab === 'activities' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-primary-text dark:text-primary-text-dark">Learning Activities ({activityCount})</h2>
              {/* Assign Game button is now in the header for all tabs */}
            </div>
            {assignedGames.length === 0 ? (
              <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow-sm p-8 text-center border-2 border-dashed dark:border-gray-700">
                <AlertTriangle size={40} className="mx-auto mb-4 text-yellow-500" />
                <h3 className="text-xl font-semibold mb-2 text-primary-text dark:text-primary-text-dark">No Activities Assigned Yet</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Assign games and learning activities to engage your students from the "Assign Game" button above.
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
              {/* The "Enroll New Student" button is removed. Student management is now inline. */}
            </div>
            {students.length === 0 ? (
              <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow-sm p-8 text-center border-2 border-dashed dark:border-gray-700">
                <Users size={40} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2 text-primary-text dark:text-primary-text-dark">No Students Enrolled</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Share the classroom code <code className="font-mono bg-gray-100 dark:bg-slate-700 p-1 rounded">{classroom.uniqueCode}</code> with your students to let them join.
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow-sm overflow-hidden border dark:border-gray-700">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-slate-800">
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Name</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Email</th>
                      <th className="py-3 px-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {students.map(student => (
                      <tr key={student.id.toString()} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                        <td className="py-3 px-4 whitespace-nowrap text-primary-text dark:text-primary-text-dark">
                          <div className="flex items-center">
                            <img src={student.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${student.firstName}${student.lastName}`} alt={student.name} className="w-8 h-8 rounded-full mr-3"/>
                            {student.name}
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-primary-text dark:text-primary-text-dark">{student.email}</td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <Button variant="text" size="sm" onClick={() => navigate(`/teacher/classrooms/${classroomId}/students/${student.id}`)} className="mr-2">
                            View Progress
                          </Button>
                          <Button
                            variant="text"
                            size="sm"
                            onClick={() => handleRemoveStudent(student.id)}
                            className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-700/20"
                            icon={<Trash2 size={14}/>}
                          >
                            Remove
                          </Button>
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
            {leaderboard.length === 0 ? (
                 <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow-sm p-8 text-center border dark:border-gray-700">
                    <h3 className="text-xl font-semibold mb-2 text-primary-text dark:text-primary-text-dark">Leaderboard is Empty</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                        No scores recorded yet. Scores will appear here as students complete activities.
                    </p>
                </div>
            ) : (
                <LeaderboardTable
                  entries={leaderboard}
                />
            )}
          </div>
        )}
      </div>

      {classroom && (
        <ClassroomSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          classroom={classroom}
        />
      )}
    </div>
  );
};

export default TeacherClassroomViewPage;