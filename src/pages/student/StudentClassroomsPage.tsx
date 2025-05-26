import React from 'react';
import { BookOpenText } from 'lucide-react'; // Changed Icon
import { useClassroom } from '../../context/ClassroomContext';
import ClassroomCard from '../../components/common/ClassroomCard';
import JoinClassroomCard from '../../components/student/JoinClassroomCard';

const StudentClassroomsPage: React.FC = () => {
  const { studentClassrooms, fetchStudentClassrooms } = useClassroom();

  const handleClassroomJoined = () => {
    if (fetchStudentClassrooms) {
        fetchStudentClassrooms();
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold text-primary-text dark:text-primary-text-dark">My Classrooms</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Explore your classes and learn fun new things!
          </p>
        </div>
        
        <div className="md:col-span-1 md:mt-0 mt-4"> {/* Ensure it doesn't overlap on mobile */}
          <JoinClassroomCard onClassroomJoined={handleClassroomJoined} className="max-w-md ml-auto"/> {/* Added max-w-md and ml-auto for alignment */}
        </div>
      </div>
      
      {studentClassrooms.length === 0 ? (
        <div className="bg-white dark:bg-primary-card-dark rounded-2xl shadow-lg p-8 text-center border-2 border-dashed border-primary-interactive dark:border-primary-interactive-dark mt-8">
          <div className="max-w-md mx-auto">
            <BookOpenText size={56} className="text-primary-interactive dark:text-primary-interactive-dark mx-auto mb-5 opacity-70" />
            <h2 className="text-2xl font-bold mb-3 text-primary-text dark:text-primary-text-dark">It's a bit empty here!</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Use the form above to join a classroom with a code from your teacher. Let the adventure begin! ✨
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {studentClassrooms.map((classroom) => (
            <ClassroomCard 
              key={classroom.classroomId} 
              classroom={classroom} 
              role="student" 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentClassroomsPage;