import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { useClassroom } from '../../context/ClassroomContext';
import ClassroomCard from '../../components/common/ClassroomCard';
import Button from '../../components/common/Button';
import JoinClassroomModal from '../../components/student/JoinClassroomModal';

const StudentClassroomsPage: React.FC = () => {
  const { studentClassrooms } = useClassroom();
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-text">My Classrooms</h1>
          <p className="text-gray-600 mt-1">Learn fun subjects with your classmates</p>
        </div>
        
        <Button 
          variant="primary"
          size="lg" 
          className="mt-4 md:mt-0"
          icon={<PlusCircle size={18} />}
          onClick={() => setIsJoinModalOpen(true)}
        >
          Join New Classroom
        </Button>
      </div>
      
      {studentClassrooms.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-2">No Classrooms Yet</h2>
            <p className="text-gray-600 mb-6">
              Join your first classroom to start your learning journey.
            </p>
            <Button 
              variant="primary" 
              size="lg"
              icon={<PlusCircle size={18} />}
              onClick={() => setIsJoinModalOpen(true)}
            >
              Join Your First Classroom
            </Button>
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
      
      <JoinClassroomModal 
        isOpen={isJoinModalOpen} 
        onClose={() => setIsJoinModalOpen(false)} 
      />
    </div>
  );
};

export default StudentClassroomsPage;