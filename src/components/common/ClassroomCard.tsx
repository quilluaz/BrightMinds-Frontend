import React from 'react';
import { Users, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Classroom, StudentClassroom } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface ClassroomCardProps {
  classroom: Classroom | StudentClassroom;
  role: 'teacher' | 'student';
}

const ClassroomCard: React.FC<ClassroomCardProps> = ({ classroom, role }) => {
  const { currentUser } = useAuth();
  
  // Type guard to check if it's a teacher classroom
  const isTeacherClassroom = (classroom: Classroom | StudentClassroom): classroom is Classroom => {
    return 'teacherId' in classroom;
  };
  
  const getClassroomPath = () => {
    return role === 'teacher' 
      ? `/teacher/classrooms/${isTeacherClassroom(classroom) ? classroom.id : ''}`
      : `/student/classrooms/${isTeacherClassroom(classroom) ? classroom.id : classroom.classroomId}`;
  };

  return (
    <Link to={getClassroomPath()}>
      <div className="card card-hover h-full border border-gray-100 overflow-hidden group">
        {/* Card Header with Icon/Avatar */}
        <div className="flex items-center justify-center h-20 bg-primary-interactive bg-opacity-10 rounded-t-xl mb-4 overflow-hidden">
          <div className="text-4xl">
            {isTeacherClassroom(classroom) ? classroom.iconUrl : classroom.iconUrl || '📚'}
          </div>
        </div>
        
        {/* Card Content */}
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2 group-hover:text-primary-interactive transition-colors">
            {isTeacherClassroom(classroom) ? classroom.name : classroom.classroomName}
          </h3>
          
          {isTeacherClassroom(classroom) && classroom.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{classroom.description}</p>
          )}
          
          <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
            {role === 'teacher' && isTeacherClassroom(classroom) && (
              <>
                <div className="flex items-center">
                  <Users size={16} className="mr-1" />
                  <span>{classroom.studentCount} students</span>
                </div>
                <div className="flex items-center">
                  <BookOpen size={16} className="mr-1" />
                  <span>{classroom.activityCount} activities</span>
                </div>
              </>
            )}
            
            {role === 'student' && (
              <div className="flex items-center">
                <span>Teacher: {isTeacherClassroom(classroom) ? classroom.teacherName : classroom.teacherName}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ClassroomCard;