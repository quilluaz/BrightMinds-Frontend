import React from 'react';
import { PlayCircle, Check, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Game } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface GameCardProps {
  game: Game;
  classroomId: string;
  showPerformance?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ game, classroomId, showPerformance = false }) => {
  const { currentUser } = useAuth();
  const isTeacher = currentUser?.role === 'teacher';
  
  const getStatusIcon = () => {
    const status = game.status || 'not_started';
    if (status === 'not_started') {
      return <PlayCircle size={20} className="text-primary-energetic dark:text-primary-energetic-dark" />;
    } else if (status === 'completed') {
      return <Check size={20} className="text-green-500 dark:text-green-400" />;
    } else {
      return <TrendingUp size={20} className="text-primary-interactive dark:text-primary-interactive-dark" />;
    }
  };
  
  const getActionText = () => {
    if (isTeacher) {
      return showPerformance ? 'View Performance' : 'View Details';
    }
    const status = game.status || 'not_started';
    if (status === 'not_started') {
      return 'Play Now';
    } else if (status === 'completed') {
      return 'Play Again';
    } else {
      return 'Continue';
    }
  };
  
  const getLinkPath = () => {
    if (isTeacher) {
      return showPerformance 
        ? `/teacher/classrooms/${classroomId}/games/${game.id}/performance` 
        : `/teacher/classrooms/${classroomId}/games/${game.id}`;
    } else {
      return `/student/classrooms/${classroomId}/games/${game.id}`;
    }
  };

  return (
    <div className="card card-hover border border-gray-100 dark:border-gray-700 h-full bg-white dark:bg-primary-card-dark">
      <div className="flex flex-col h-full p-4">
        <div>
          <h3 className="font-bold text-lg mb-2 text-primary-text dark:text-primary-text-dark">{game.title}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{game.description}</p>
          
          <div className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 bg-primary-interactive bg-opacity-10 text-primary-interactive dark:bg-primary-interactive-dark dark:bg-opacity-20 dark:text-primary-interactive-dark">
            {game.subject === 'tagalog' ? 'Tagalog' : 'Araling Panlipunan'}
          </div>
        </div>
        
        <div className="mt-auto">
          {game.status === 'completed' && game.score !== undefined && !isTeacher && (
            <div className="flex items-center mb-3">
              <div className="bg-primary-accent bg-opacity-20 text-primary-text dark:bg-primary-accent-dark dark:bg-opacity-20 dark:text-primary-text-dark px-3 py-1 rounded-full text-sm font-medium">
                Your Score: {game.score}%
              </div>
            </div>
          )}
          
          <Link 
            to={getLinkPath()}
            className="flex items-center justify-between w-full mt-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
          >
            <span className="flex items-center">
              {getStatusIcon()}
              <span className="ml-2 font-medium text-primary-text dark:text-primary-text-dark">{getActionText()}</span>
            </span>
            
            {isTeacher && showPerformance && (
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg. Score: 78%</span>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GameCard;