import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Award, Sparkles, ChevronRight } from 'lucide-react';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useClassroom } from '../../context/ClassroomContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StudentDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { studentClassrooms } = useClassroom();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else if (currentUser.role !== 'STUDENT') {
      navigate('/dashboard'); 
    }
  }, [currentUser, navigate]);

  if (!currentUser || currentUser.role !== 'STUDENT') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const firstName = currentUser.name.split(' ')[0];
  const totalScore = 850; 
  const activitiesCompleted = 8;
  const totalActivities = 13;

  const nextActivity = {
    title: 'Tagalog Verbs Practice',
    classroomId: 'class-1',
    gameId: 'game-1'
  };

  const hasClassrooms = studentClassrooms.length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary-energetic dark:text-primary-energetic-dark mb-2">
          Hello, {firstName}! 🎉
        </h1>
        <p className="text-gray-700 dark:text-gray-300 text-lg">
          Let's learn something new today!
        </p>
      </header>

      {/* Quick Stats / Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow-lg p-6 text-center border border-primary-interactive border-opacity-20 dark:border-primary-interactive-dark">
          <Award size={40} className="text-primary-accent dark:text-primary-accent-dark mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary-text dark:text-primary-text-dark mb-2">My Score!</h2>
          <p className="text-5xl font-extrabold text-primary-energetic dark:text-primary-energetic-dark">{totalScore}</p>
          <p className="text-gray-600 dark:text-gray-400 mt-2">total points earned</p>
        </div>

        <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow-lg p-6 text-center border border-primary-energetic border-opacity-20 dark:border-primary-energetic-dark">
          <Sparkles size={40} className="text-primary-interactive dark:text-primary-interactive-dark mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary-text dark:text-primary-text-dark mb-2">Activities Done</h2>
          <p className="text-5xl font-extrabold text-primary-interactive dark:text-primary-interactive-dark">
            {activitiesCompleted} / {totalActivities}
          </p>
          <p className="text-gray-600 dark:text-gray-400 mt-2">activities completed</p>
        </div>
      </div>

      {/* My Classrooms Section */}
      <div className="bg-primary-card dark:bg-primary-card-dark rounded-xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-primary-text dark:text-primary-text-dark">My Classrooms</h2>
          <Button
            variant="text"
            size="sm"
            onClick={() => navigate('/student/classrooms')}
          >
            View All <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
        
        {hasClassrooms ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {studentClassrooms.slice(0, 3).map((classroom) => ( // Show top 3 classrooms
              <div
                key={classroom.classroomId}
                className="bg-primary-background dark:bg-primary-background-dark p-4 rounded-lg flex items-center space-x-3 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="text-2xl">{classroom.iconUrl || '📚'}</div>
                <div>
                  <h3 className="font-medium text-primary-text dark:text-primary-text-dark">{classroom.classroomName}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Teacher: {classroom.teacherName}</p>
                </div>
              </div>
            ))}
            {studentClassrooms.length > 3 && (
                <div className="flex items-center justify-center">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate('/student/classrooms')}
                    >
                        See More Classrooms
                    </Button>
                </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You haven't joined any classrooms yet.
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/student/classrooms')}
            >
              Join a Classroom
            </Button>
          </div>
        )}
      </div>

      {/* Continue Learning / Next Activity */}
      {nextActivity.title && (
        <div className="bg-primary-card dark:bg-primary-card-dark rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-primary-text dark:text-primary-text-dark mb-4">Continue Learning!</h2>
          <div className="flex items-center justify-between bg-primary-interactive bg-opacity-10 dark:bg-primary-interactive-dark dark:bg-opacity-20 p-4 rounded-lg">
            <div className="flex items-center">
              <BookOpen size={24} className="text-primary-interactive dark:text-primary-interactive-dark mr-3" />
              <div>
                <p className="font-medium text-primary-text dark:text-primary-text-dark">{nextActivity.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ready for your next challenge?</p>
              </div>
            </div>
            <Button
              variant="primary"
              size="md"
              icon={<ChevronRight size={18} />}
              onClick={() => navigate(`/student/classrooms/${nextActivity.classroomId}/games/${nextActivity.gameId}`)}
            >
              Start
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboardPage;