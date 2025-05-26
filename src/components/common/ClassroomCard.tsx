import React from 'react';
import { Users, BookOpen, AlertTriangle, CheckCircle, ArrowRightCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Classroom, StudentClassroom } from '../../types';

interface ClassroomCardProps {
  classroom: Classroom | StudentClassroom;
  role: 'teacher' | 'student';
}

const ClassroomCard: React.FC<ClassroomCardProps> = ({ classroom, role }) => {
  const isTeacherClassroom = (cls: Classroom | StudentClassroom): cls is Classroom => {
    return 'teacherId' in cls;
  };

  const classroomId = isTeacherClassroom(classroom) ? classroom.id : classroom.classroomId;
  const classroomName = isTeacherClassroom(classroom) ? classroom.name : classroom.classroomName;
  const iconUrl = classroom.iconUrl || '📚'; // Default emoji icon
  const description = isTeacherClassroom(classroom) ? classroom.description : undefined;
  const studentCount = isTeacherClassroom(classroom) ? classroom.studentCount : undefined;
  const teacherName = isTeacherClassroom(classroom) ? classroom.teacherName : classroom.teacherName;
  const activityCount = classroom.activityCount || 0;

  const getClassroomPath = () => {
    return role === 'teacher'
      ? `/teacher/classrooms/${classroomId}`
      : `/student/classrooms/${classroomId}`;
  };

  const cardColors = [
    { bg: "bg-primary-interactive/10 dark:bg-primary-interactive-dark/20", text: "text-primary-interactive dark:text-primary-interactive-dark", border: "hover:border-primary-interactive dark:hover:border-primary-interactive-dark" },
    { bg: "bg-primary-energetic/10 dark:bg-primary-energetic-dark/20", text: "text-primary-energetic dark:text-primary-energetic-dark", border: "hover:border-primary-energetic dark:hover:border-primary-energetic-dark" },
    { bg: "bg-primary-accent/10 dark:bg-primary-accent-dark/20", text: "text-primary-accent dark:text-primary-accent-dark", border: "hover:border-primary-accent dark:hover:border-primary-accent-dark" },
    { bg: "bg-blue-400/10 dark:bg-blue-500/20", text: "text-blue-500 dark:text-blue-400", border: "hover:border-blue-500 dark:hover:border-blue-400" },
    { bg: "bg-green-400/10 dark:bg-green-500/20", text: "text-green-500 dark:text-green-400", border: "hover:border-green-500 dark:hover:border-green-400" },
  ];
  const colorTheme = cardColors[classroomName.length % cardColors.length];

  return (
    <Link to={getClassroomPath()} className="block h-full group focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-primary-background-dark focus:ring-primary-interactive rounded-2xl">
      <div
        className={`bg-white dark:bg-primary-card-dark rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 ease-in-out h-full flex flex-col overflow-hidden border-2 border-transparent ${colorTheme.border} group-hover:scale-[1.04] active:scale-[0.97]`}
      >
        <div className={`flex items-center justify-center h-32 ${colorTheme.bg} rounded-t-xl relative overflow-hidden p-4`}>
          <div className={`text-6xl opacity-80 group-hover:scale-110 group-hover:animate-subtle-float transition-transform duration-300 ease-out ${colorTheme.text}`}>
            {iconUrl}
          </div>
          {role === 'student' && activityCount > 0 && (
            <div className="absolute top-3 right-3 bg-primary-energetic text-white text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg flex items-center group-hover:animate-pulse-slow">
              <AlertTriangle size={14} className="mr-1.5" />
              {activityCount} {activityCount === 1 ? 'Task' : 'Tasks'}!
            </div>
          )}
          {role === 'teacher' && isTeacherClassroom(classroom) && activityCount > 0 && (
            <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg flex items-center">
              <CheckCircle size={14} className="mr-1.5" />
              {activityCount} {activityCount === 1 ? 'Activity' : 'Activities'}
            </div>
          )}
        </div>

        <div className="p-5 flex flex-col flex-grow">
          <h3 className={`font-bold text-xl mb-1.5 ${colorTheme.text.replace('text-opacity-80', '')} group-hover:underline transition-colors`}>
            {classroomName}
          </h3>

          {role === 'teacher' && description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2 flex-grow">{description}</p>
          )}
          {role === 'student' && teacherName && (
            <p className="text-gray-500 dark:text-gray-400 text-xs mb-3">Teacher: {teacherName}</p>
          )}

          <div className="mt-auto pt-3 border-t border-gray-200 dark:border-gray-700">
            {role === 'teacher' && isTeacherClassroom(classroom) && (
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <Users size={16} className="mr-1.5" />
                  <span>{studentCount ?? 0} students</span>
                </div>
                <span className={`font-semibold flex items-center ${colorTheme.text}`}>
                  View <ArrowRightCircle size={16} className="ml-1.5 group-hover:translate-x-1 transition-transform"/>
                </span>
              </div>
            )}

            {role === 'student' && (
              <div className="text-right">
                <span className={`font-semibold flex items-center justify-end text-sm ${colorTheme.text}`}>
                  Enter Classroom <ArrowRightCircle size={18} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ClassroomCard;