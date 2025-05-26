// src/pages/teacher/TeacherClassroomsPage.tsx
import React, { useState, useEffect } from 'react';
import { PlusCircle, BookOpenText, Users } from 'lucide-react'; // Using Users for the empty state icon
import { useAuth } from '../../context/AuthContext';
import { useClassroom } from '../../context/ClassroomContext';
import ClassroomCard from '../../components/common/ClassroomCard';
import Button from '../../components/common/Button';
import CreateClassroomModal from '../../components/teacher/CreateClassroomModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const TeacherClassroomsPage: React.FC = () => {
  const { teacherClassrooms, fetchTeacherClassrooms } = useClassroom();
  const { currentUser } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    // Redirect if not a teacher or not logged in
    if (!currentUser) {
      navigate('/login');
      return;
    } else if (currentUser.role !== 'TEACHER') {
      navigate('/dashboard'); // Or a general student dashboard / landing page
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      if (fetchTeacherClassrooms) {
        await fetchTeacherClassrooms();
      }
      // Simulate a short delay for a better UX, even if data loads fast
      // In a real app, this might not be necessary if fetch is quick
      setTimeout(() => setIsLoading(false), 300); 
    };
    
    if (currentUser && currentUser.role === 'TEACHER') {
      loadData();
    }
  }, [currentUser, fetchTeacherClassrooms, navigate]);

  if (!currentUser || currentUser.role !== 'TEACHER') {
    // This check is important if the redirect effect hasn't run yet
    // or to prevent rendering anything for non-teachers.
    return <LoadingSpinner size="lg" />; 
  }


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]"> {/* Adjusted height */}
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* Welcome and Create Classroom Button */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-text dark:text-primary-text-dark">
            Welcome, Teacher {currentUser?.firstName || 'Teacher'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
            Manage your classrooms and inspire your students.
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          className="mt-5 sm:mt-0 py-3 px-6 shadow-md hover:shadow-lg transition-shadow"
          icon={<PlusCircle size={20} />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create New Classroom
        </Button>
      </div>

      {/* Classroom List Section Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-primary-text dark:text-primary-text-dark flex items-center">
          <BookOpenText size={26} className="mr-3 text-primary-interactive dark:text-primary-interactive-dark"/>
          My Classrooms
        </h2>
      </div>
      
      {teacherClassrooms.length === 0 ? (
        <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow-sm p-10 text-center border-2 border-dashed border-gray-300 dark:border-gray-600">
          <Users size={56} className="text-gray-400 dark:text-gray-500 mx-auto mb-5" /> {/* Changed icon */}
          <h3 className="text-xl font-semibold mb-3 text-primary-text dark:text-primary-text-dark">
            It looks a bit empty here!
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
            You haven't created any classrooms yet. Get started by creating your first one.
          </p>
          <Button
            variant="energetic"
            size="lg"
            icon={<PlusCircle size={20} />}
            onClick={() => setIsCreateModalOpen(true)}
            className="shadow-md hover:shadow-lg transition-shadow"
          >
            Create Your First Classroom
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teacherClassrooms.map((classroom) => (
            <ClassroomCard
              key={classroom.id}
              classroom={classroom}
              role="teacher"
            />
          ))}
        </div>
      )}

      <CreateClassroomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default TeacherClassroomsPage;