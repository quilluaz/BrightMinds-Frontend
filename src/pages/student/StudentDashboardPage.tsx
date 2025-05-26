// src/pages/student/StudentDashboardPage.tsx
import React, { useEffect, useState }from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight, PlusCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useClassroom } from '../../context/ClassroomContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ClassroomCard from '../../components/common/ClassroomCard';
import JoinClassroomModal from '../../components/student/JoinClassroomModal';

const StudentDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { studentClassrooms } = useClassroom();
  const navigate = useNavigate();
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else if (currentUser.role !== 'STUDENT') {
      // If not a student, redirect to a general dashboard or appropriate page
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

  // Mock data for next activity - in a real app, this would come from context or API
  const nextActivity = studentClassrooms.length > 0 ? {
    title: 'Tagalog Verbs Practice', // Example: Get the first game from the first classroom
    classroomId: studentClassrooms[0].classroomId, // Example
    gameId: 'game-1' // Example
  } : null;


  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-energetic dark:text-primary-energetic-dark">
          Hello, {firstName}! 👋
        </h1>
        <p className="text-gray-700 dark:text-gray-300 text-lg mt-1">
          Ready for some fun learning?
        </p>
      </header>

      {/* My Classrooms Section - Main Focus */}
      <div className="mb-10">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-primary-text dark:text-primary-text-dark mb-3 sm:mb-0">
            My Classrooms
          </h2>
          <Button
            variant="primary"
            icon={<PlusCircle size={18} />}
            onClick={() => setIsJoinModalOpen(true)}
            size="md"
          >
            Join New Classroom
          </Button>
        </div>
        
        {studentClassrooms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {studentClassrooms.map((classroom) => (
              <ClassroomCard 
                key={classroom.classroomId} 
                classroom={classroom} 
                role="student" 
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow-sm p-8 text-center border dark:border-gray-700">
            <div className="max-w-md mx-auto">
              <BookOpen size={48} className="text-primary-interactive dark:text-primary-interactive-dark mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-primary-text dark:text-primary-text-dark">It's quiet here...</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                You haven't joined any classrooms yet. Ask your teacher for a code to join!
              </p>
              <Button 
                variant="primary" 
                size="lg"
                icon={<PlusCircle size={18} />}
                onClick={() => setIsJoinModalOpen(true)}
              >
                Join a Classroom
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Next Adventure Section */}
      {nextActivity && studentClassrooms.length > 0 && (
        <div className="bg-primary-card dark:bg-primary-card-dark rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-primary-text dark:text-primary-text-dark mb-4">Next Adventure!</h2>
          <div className="flex flex-col sm:flex-row items-center justify-between bg-primary-interactive bg-opacity-10 dark:bg-primary-interactive-dark dark:bg-opacity-20 p-4 rounded-lg">
            <div className="flex items-center mb-3 sm:mb-0">
              <div className="p-2 bg-primary-energetic rounded-full mr-3">
                <BookOpen size={24} className="text-white" />
              </div>
              <div>
                <p className="font-medium text-primary-text dark:text-primary-text-dark">{nextActivity.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ready for your next challenge?</p>
              </div>
            </div>
            <Button
              variant="energetic"
              size="md"
              icon={<ChevronRight size={18} />}
              onClick={() => navigate(`/student/classrooms/${nextActivity.classroomId}/games/${nextActivity.gameId}`)}
              className="w-full sm:w-auto"
            >
              Let's Go!
            </Button>
          </div>
        </div>
      )}
      
      <JoinClassroomModal 
        isOpen={isJoinModalOpen} 
        onClose={() => setIsJoinModalOpen(false)} 
      />
    </div>
  );
};

export default StudentDashboardPage;