import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { useClassroom } from '../../context/ClassroomContext';
import ClassroomCard from '../../components/common/ClassroomCard';
import Button from '../../components/common/Button';
import CreateClassroomModal from '../../components/teacher/CreateClassroomModal';

const TeacherClassroomsPage: React.FC = () => {
  const { teacherClassrooms } = useClassroom();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-text">My Classrooms</h1>
          <p className="text-gray-600 mt-1">Manage your teaching classes and learning activities</p>
        </div>
        
        <Button 
          variant="primary"
          size="lg" 
          className="mt-4 md:mt-0"
          icon={<PlusCircle size={18} />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create New Classroom
        </Button>
      </div>
      
      {teacherClassrooms.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-2">No Classrooms Yet</h2>
            <p className="text-gray-600 mb-6">
              Create your first classroom to start adding students and learning activities.
            </p>
            <Button 
              variant="primary" 
              size="lg"
              icon={<PlusCircle size={18} />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create Your First Classroom
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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