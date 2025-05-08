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
    if (!game.status || game.status === 'not_started') {
      return <PlayCircle size={20} className="text-primary-energetic" />;
    } else if (game.status === 'completed') {
      return <Check size={20} className="text-green-500" />;
    } else {
      return <TrendingUp size={20} className="text-primary-interactive" />;
    }
  };
  
  const getActionText = () => {
    if (isTeacher) {
      return showPerformance ? 'View Performance' : 'View Details';
    }
    
    if (!game.status || game.status === 'not_started') {
      return 'Play Now';
    } else if (game.status === 'completed') {
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
    <div className="card card-hover border border-gray-100 h-full">
      <div className="flex flex-col h-full">
        <div>
          <h3 className="font-bold text-lg mb-2">{game.title}</h3>
          <p className="text-gray-600 text-sm mb-4">{game.description}</p>
          
          <div className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 bg-primary-interactive bg-opacity-10 text-primary-interactive">
            {game.subject === 'tagalog' ? 'Tagalog' : 'Araling Panlipunan'}
          </div>
        </div>
        
        <div className="mt-auto">
          {game.status === 'completed' && game.score !== undefined && !isTeacher && (
            <div className="flex items-center mb-3">
              <div className="bg-primary-accent bg-opacity-20 text-primary-text px-3 py-1 rounded-full text-sm font-medium">
                Your Score: {game.score}%
              </div>
            </div>
          )}
          
          <Link 
            to={getLinkPath()}
            className="flex items-center justify-between w-full mt-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <span className="flex items-center">
              {getStatusIcon()}
              <span className="ml-2 font-medium">{getActionText()}</span>
            </span>
            
            {isTeacher && showPerformance && (
              <span className="text-sm text-gray-600">Avg. Score: 78%</span>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GameCard;