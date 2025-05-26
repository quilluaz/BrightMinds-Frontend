import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, ChevronRight, Gamepad2, Sparkles, Users, LayoutGrid, Zap, Brain, Puzzle } from 'lucide-react';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useClassroom } from '../../context/ClassroomContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ClassroomCard from '../../components/common/ClassroomCard';
import JoinClassroomCard from '../../components/student/JoinClassroomCard';

const StudentDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { studentClassrooms, fetchStudentClassrooms, games: allGamesFromLibrary } = useClassroom();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else if (currentUser.role !== 'STUDENT') {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleClassroomJoined = () => {
    if (fetchStudentClassrooms) {
      fetchStudentClassrooms();
    }
  };

  if (!currentUser || currentUser.role !== 'STUDENT') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const firstName = currentUser.name.split(' ')[0];

  const assignedGamesForDashboard = studentClassrooms.length > 0 && allGamesFromLibrary.length > 0 ?
    allGamesFromLibrary.slice(0, 1).map(game => ({
      ...game,
      classroomId: studentClassrooms[0].classroomId
    }))
    : [];
  const nextActivity = assignedGamesForDashboard.length > 0 ? assignedGamesForDashboard[0] : null;

  const practiceGameLinks = [
    { to: "/4pics1word", label: "4 Pics 1 Word", icon: <Puzzle size={32} />, color: "from-yellow-400 via-amber-500 to-orange-500", hoverColor: "hover:from-yellow-500 hover:to-orange-600", shadow: "shadow-yellow-500/30 hover:shadow-yellow-600/50" },
    { to: "/image-quiz", label: "Image Quiz", icon: <Zap size={32} />, color: "from-blue-400 via-cyan-500 to-sky-500", hoverColor: "hover:from-blue-500 hover:to-sky-600", shadow: "shadow-blue-500/30 hover:shadow-blue-600/50" },
    { to: "/matching-game-test", label: "Matching Game", icon: <Sparkles size={32} />, color: "from-green-400 via-emerald-500 to-teal-500", hoverColor: "hover:from-green-500 hover:to-teal-600", shadow: "shadow-green-500/30 hover:shadow-green-600/50" },
    { to: "/likas-yaman", label: "Likas Yaman Sort", icon: <Brain size={32} />, color: "from-purple-400 via-violet-500 to-fuchsia-500", hoverColor: "hover:from-purple-500 hover:to-fuchsia-600", shadow: "shadow-purple-500/30 hover:shadow-purple-600/50" },
  ];

  const displayedClassrooms = studentClassrooms.slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-8 space-y-10 md:space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-7 gap-6 md:gap-8 items-start">
        <div className="md:col-span-4">
          <header>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-energetic dark:text-primary-energetic-dark animate-fade-in">
              Hello, {firstName}! 👋
            </h1>
            <p className="text-gray-700 dark:text-gray-300 text-lg mt-2 animate-fade-in animation-delay-200">
              Ready for a new adventure in learning today?
            </p>
          </header>
        </div>
        <div className="md:col-span-3 md:mt-0 mt-4 animate-fade-in animation-delay-400">
          <JoinClassroomCard onClassroomJoined={handleClassroomJoined} className="w-full" />
        </div>
      </div>

      <div className="animate-slide-up animation-delay-200">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-primary-text dark:text-primary-text-dark flex items-center">
            <Gamepad2 size={30} className="mr-3 text-primary-accent dark:text-primary-accent-dark" />
            Pick a Practice Game!
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
      
      <div className="animate-slide-up animation-delay-400">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                Join a classroom using the code from your teacher to see your classes here.
              </p>
            </div>
          </div>
        )}
         {studentClassrooms.length > 0 && studentClassrooms.length <=3 && studentClassrooms.length > 0 && ( // Ensure there are classrooms to manage
            <div className="mt-6 text-center">
                <Button variant="primary" onClick={() => navigate("/student/classrooms")} icon={<LayoutGrid size={16}/>}>
                    Manage All Classrooms
                </Button>
            </div>
        )}
      </div>

      {nextActivity && studentClassrooms.length > 0 && (
        <div className="bg-primary-card dark:bg-primary-card-dark rounded-xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 animate-slide-up animation-delay-600">
          <h2 className="text-xl font-semibold text-primary-text dark:text-primary-text-dark mb-4">Next Adventure in Class!</h2>
          <div className="flex flex-col sm:flex-row items-center justify-between bg-primary-interactive bg-opacity-10 dark:bg-primary-interactive-dark dark:bg-opacity-20 p-4 rounded-lg hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-3 sm:mb-0">
              <div className="p-3 bg-primary-energetic rounded-full mr-4 shadow-md">
                <BookOpen size={24} className="text-white" />
              </div>
              <div>
                <p className="font-medium text-primary-text dark:text-primary-text-dark">{nextActivity.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">A new challenge awaits!</p>
              </div>
            </div>
            <Button
              variant="energetic"
              size="md"
              icon={<ChevronRight size={18} />}
              onClick={() => navigate(`/student/classrooms/${nextActivity.classroomId}/games/${nextActivity.gameId}`)}
              className="w-full sm:w-auto transform hover:scale-105 active:scale-95"
            >
              Let's Go!
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboardPage;