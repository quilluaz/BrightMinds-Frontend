import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, Gamepad2, Sparkles, Users, LayoutGrid, Zap, Brain, Puzzle, Bell, ActivitySquare, AlertTriangle } from 'lucide-react'; // Added AlertTriangle
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useClassroom } from '../../context/ClassroomContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ClassroomCard from '../../components/common/ClassroomCard';
import JoinClassroomCard from '../../components/student/JoinClassroomCard';
import { AssignedGameDTO, StudentClassroom } from '../../types';

interface LatestActivityDisplay {
  id: string; // Should be unique for the key prop, e.g., assignedGame.id
  gameId: string; // The actual game ID for linking
  title: string;
  description?: string;
  classroomIdForLink: string;
  classroomName?: string;
  dueDate?: string; // Added dueDate
  status?: AssignedGameDTO['status']; // Added status
}

const StudentDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    studentClassrooms,
    fetchStudentClassrooms,
    getAssignedGames, // Assuming this is the function to get games for a classroom
  } = useClassroom();
  const navigate = useNavigate();
  const [latestActivities, setLatestActivities] = useState<LatestActivityDisplay[]>([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return; // Added return
    } else if (currentUser.role !== 'STUDENT') {
      navigate('/teacher/classrooms'); // Redirect non-students (e.g. teachers to their classrooms)
      return; // Added return
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (currentUser?.role === 'STUDENT' && fetchStudentClassrooms) {
      setIsLoadingDashboard(true);
      fetchStudentClassrooms().finally(() => setIsLoadingDashboard(false));
    } else if (currentUser) { // If not student but logged in, stop loading
        setIsLoadingDashboard(false);
    }
    // If no currentUser, loading will be handled by redirect or a general loading screen
  }, [currentUser, fetchStudentClassrooms]);

  useEffect(() => {
    if (currentUser?.role === 'STUDENT' && studentClassrooms.length > 0 && getAssignedGames) {
      const fetchAllGamesForDashboard = async () => {
        // Fetch games for a limited number of classrooms to avoid too many API calls on dashboard
        const classroomsToFetchFor = studentClassrooms.slice(0, 5); // Example: fetch for first 5
        
        const gamePromises = classroomsToFetchFor.map(async (classroom) => {
          try {
            const gamesInClass: AssignedGameDTO[] = await getAssignedGames(classroom.classroomId);
            return {
              classroomId: classroom.classroomId,
              classroomName: classroom.classroomName,
              games: gamesInClass,
            };
          } catch (error) {
            console.error(`Error fetching games for classroom ${classroom.classroomId}:`, error);
            return { classroomId: classroom.classroomId, classroomName: classroom.classroomName, games: [] }; // Return empty games on error
          }
        });

        try {
          const results = await Promise.all(gamePromises);
          let combinedActivities: LatestActivityDisplay[] = [];

          results.forEach(result => {
            result.games.forEach(assignedGame => {
              // Filter for games that are PENDING or OVERDUE to show as "new" or "due"
              if (assignedGame.status === 'PENDING' || assignedGame.status === 'OVERDUE') {
                combinedActivities.push({
                  id: assignedGame.id, // Use assignedGame.id as the unique key for the list item
                  gameId: assignedGame.game?.id || assignedGame.gameId || assignedGame.id, // Actual game ID for the link
                  title: assignedGame.game?.title || assignedGame.gameTitle || 'Untitled Game',
                  description: assignedGame.game?.description || `New activity in ${result.classroomName}`,
                  classroomIdForLink: result.classroomId,
                  classroomName: result.classroomName,
                  dueDate: assignedGame.dueDate,
                  status: assignedGame.status,
                });
              }
            });
          });

          // Sort by due date (earliest first), then by assignedAt if needed
          combinedActivities.sort((a, b) => {
            if (a.dueDate && b.dueDate) {
              return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            }
            return 0;
          });
          
          setLatestActivities(combinedActivities.slice(0, 4)); // Show top 4 relevant activities
        } catch (error) {
          console.error("Error processing games for dashboard activities:", error);
          setLatestActivities([]);
        }
      };

      fetchAllGamesForDashboard();
    } else {
      setLatestActivities([]);
    }
  }, [studentClassrooms, currentUser, getAssignedGames]);

  const handleClassroomJoined = useCallback(() => {
    if (fetchStudentClassrooms) {
      // Add a small delay to allow backend to process and then refetch
      setTimeout(() => fetchStudentClassrooms(), 500);
    }
  }, [fetchStudentClassrooms]);

  if (!currentUser || isLoadingDashboard) { // Show loading if no current user yet or dashboard is loading
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
   // This case should ideally be caught by the redirect useEffect earlier
  if (currentUser.role !== 'STUDENT') {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <p>Access Denied. Redirecting...</p>
            <LoadingSpinner size="md" />
      </div>
    );
  }


  const firstName = currentUser.firstName || currentUser.name.split(' ')[0];

  const practiceGameLinks = [
    { to: "/4pics1word", label: "4 Pics 1 Word", icon: <Puzzle size={28} />, color: "from-yellow-400 via-amber-500 to-orange-500", hoverColor: "hover:from-yellow-500 hover:to-orange-600", shadow: "shadow-yellow-500/30 hover:shadow-yellow-600/50" },
    { to: "/image-quiz", label: "Image Quiz", icon: <Zap size={28} />, color: "from-blue-400 via-cyan-500 to-sky-500", hoverColor: "hover:from-blue-500 hover:to-sky-600", shadow: "shadow-blue-500/30 hover:shadow-blue-600/50" },
    { to: "/matching-game-test", label: "Matching Game", icon: <Sparkles size={28} />, color: "from-green-400 via-emerald-500 to-teal-500", hoverColor: "hover:from-green-500 hover:to-teal-600", shadow: "shadow-green-500/30 hover:shadow-green-600/50" },
    { to: "/likas-yaman", label: "Likas Yaman Sort", icon: <Brain size={28} />, color: "from-purple-400 via-violet-500 to-fuchsia-500", hoverColor: "hover:from-purple-500 hover:to-fuchsia-600", shadow: "shadow-purple-500/30 hover:shadow-purple-600/50" },
  ];

  const displayedClassrooms = studentClassrooms.slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-8 space-y-10 md:space-y-12">
      <div className="animate-fade-in">
        <header>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-energetic dark:text-primary-energetic-dark">
            Hello, {firstName}! 👋
          </h1>
          <p className="text-gray-700 dark:text-gray-300 text-lg mt-2">
            What exciting things will you learn today?
          </p>
        </header>
      </div>

      <div className="animate-slide-up animation-delay-200">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-primary-text dark:text-primary-text-dark flex items-center">
            <Bell size={28} className="mr-3 text-primary-energetic dark:text-primary-energetic-dark animate-bell-ring" />
            Upcoming Activities
            </h2>
        </div>
        {latestActivities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {latestActivities.map((activity) => (
                <Link
                to={`/student/classrooms/${activity.classroomIdForLink}/games/${activity.gameId}`}
                key={activity.id} // Use assignedGame.id for the key
                className="group block"
                >
                <div className="bg-white dark:bg-primary-card-dark p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 border-2 border-transparent hover:border-primary-energetic dark:hover:border-primary-energetic-dark">
                    <div className="flex items-center mb-2">
                    <div className={`p-2 ${activity.status === 'OVERDUE' ? 'bg-red-500/20' : 'bg-primary-energetic/20 dark:bg-primary-energetic-dark/30'} rounded-full mr-3`}>
                        {activity.status === 'OVERDUE' ? <AlertTriangle size={20} className="text-red-500 dark:text-red-400" /> : <ActivitySquare size={20} className="text-primary-energetic dark:text-primary-energetic-dark" />}
                    </div>
                    <h3 className="font-semibold text-primary-text dark:text-primary-text-dark group-hover:text-primary-energetic dark:group-hover:text-primary-energetic-dark">
                        {activity.title}
                    </h3>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-1">
                     In: {activity.classroomName || "Your Classroom"}
                    </p>
                     {activity.dueDate && (
                        <p className={`text-xs mb-2 ${activity.status === 'OVERDUE' ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                            Due: {new Date(activity.dueDate).toLocaleDateString()} {activity.status === 'OVERDUE' && "(Overdue)"}
                        </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                        {activity.description || "Time to learn something new!"}
                    </p>
                    <div className="mt-3 text-right">
                        <span className={`text-sm font-medium ${activity.status === 'OVERDUE' ? 'text-red-600 dark:text-red-400 group-hover:underline' : 'text-primary-energetic dark:text-primary-energetic-dark group-hover:underline'}`}>
                            {activity.status === 'OVERDUE' ? "View Details" : "Start Now"} &rarr;
                        </span>
                    </div>
                </div>
                </Link>
            ))}
            </div>
        ) : (
            <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow p-6 text-center">
                <Sparkles size={36} className="mx-auto text-primary-accent dark:text-primary-accent-dark opacity-70 mb-3" />
                <p className="text-gray-600 dark:text-gray-300">No new activities from your teacher right now. Check out the practice games below!</p>
            </div>
        )}
      </div>

      {/* Practice Zone and Classrooms sections remain the same */}
      <div className="animate-slide-up animation-delay-400">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-primary-text dark:text-primary-text-dark flex items-center">
            <Gamepad2 size={30} className="mr-3 text-primary-accent dark:text-primary-accent-dark" />
            Playground
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
          {practiceGameLinks.map(game => (
            <Link
              to={game.to}
              key={game.to}
              className={`group p-5 md:p-6 rounded-2xl text-white bg-gradient-to-br ${game.color} ${game.hoverColor}
                               flex flex-col items-center justify-center text-center
                               transition-all duration-300 ease-in-out
                               transform hover:-translate-y-2 hover:scale-[1.08] active:scale-95 active:translate-y-0
                               focus:outline-none focus:ring-4 focus:ring-offset-2 dark:focus:ring-offset-primary-background-dark ${game.shadow} focus:${game.shadow.replace('hover:', '')}
                               min-h-[160px] md:min-h-[180px] overflow-hidden relative`}
            >
              <div className="mb-3 text-white/90 group-hover:text-white transition-colors duration-300 transform group-hover:scale-125 group-hover:rotate-6 group-active:scale-110 ease-out group-hover:animate-icon-pop">
                {game.icon}
              </div>
              <span className="text-base md:text-lg font-semibold tracking-tight relative z-10">{game.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="animate-slide-up animation-delay-600">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
            <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-primary-text dark:text-primary-text-dark flex items-center">
                        <Users size={28} className="mr-3 text-primary-interactive dark:text-primary-interactive-dark" />
                        My Classrooms
                    </h2>
                    {studentClassrooms.length > 3 && (
                        <Button variant="outline" size="sm" onClick={() => navigate("/student/classrooms")} icon={<LayoutGrid size={16}/>}>
                        View All ({studentClassrooms.length})
                        </Button>
                    )}
                </div>

                {studentClassrooms.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {displayedClassrooms.map((classroom) => (
                    <ClassroomCard
                        key={classroom.classroomId}
                        classroom={classroom}
                        role="student"
                    />
                    ))}
                </div>
                ) : (
                <div className="bg-white dark:bg-primary-card-dark rounded-2xl shadow-lg p-8 text-center border-2 border-dashed border-primary-interactive/50 dark:border-primary-interactive-dark/50">
                    <div className="max-w-md mx-auto">
                    <BookOpen size={56} className="text-primary-interactive dark:text-primary-interactive-dark mx-auto mb-5 opacity-60" />
                    <h3 className="text-xl font-semibold mb-3 text-primary-text dark:text-primary-text-dark">No Classrooms Yet!</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                        Ask your teacher for a code and join using the form!
                    </p>
                    </div>
                </div>
                )}
                {studentClassrooms.length > 0 && displayedClassrooms.length < studentClassrooms.length && (
                    <div className="mt-6 text-center md:text-left">
                        <Button variant="primary" onClick={() => navigate("/student/classrooms")} icon={<LayoutGrid size={16}/>}>
                            Manage All Classrooms
                        </Button>
                    </div>
                )}
                 {studentClassrooms.length > 0 && displayedClassrooms.length === studentClassrooms.length && studentClassrooms.length <=3 &&(
                     <div className="mt-6 text-center md:text-left">
                        <Button variant="primary" onClick={() => navigate("/student/classrooms")} icon={<LayoutGrid size={16}/>}>
                            Manage All Classrooms
                        </Button>
                    </div>
                 )}
            </div>
            <div className="md:col-span-1 md:mt-10">
                 <JoinClassroomCard onClassroomJoined={handleClassroomJoined} className="w-full" />
            </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardPage;