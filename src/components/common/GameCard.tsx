import React from "react";
import { PlayCircle, Check, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Game } from "../../types"; // Game type for displaying game details
import { useAuth } from "../../context/AuthContext";

interface GameCardProps {
  game: Game; // Represents the game template's details for display
  classroomId: string;
  assignedGameId?: string; // <<< NEW PROP: For the specific assignment ID
  showPerformance?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({
  game,
  classroomId,
  assignedGameId, // <<< USE NEW PROP
  showPerformance = false,
}) => {
  const { currentUser } = useAuth();
  const isTeacher = currentUser?.role === "TEACHER"; // Corrected: TEACHER, not teacher

  const getStatusIcon = () => {
    const status = game.status || "not_started";
    if (status === "not_started") {
      return (
        <PlayCircle
          size={20}
          className="text-primary-energetic dark:text-primary-energetic-dark"
        />
      );
    } else if (status === "completed") {
      return <Check size={20} className="text-green-500 dark:text-green-400" />;
    } else {
      return (
        <TrendingUp
          size={20}
          className="text-primary-interactive dark:text-primary-interactive-dark"
        />
      );
    }
  };

  const getActionText = () => {
    if (isTeacher) {
      return showPerformance ? "View Performance" : "View Details";
    }
    const status = game.status || "not_started";
    if (status === "not_started") {
      return "Play Now";
    } else if (status === "completed") {
      return "Play Again"; // Or "View Score"
    } else { // in_progress or PENDING or OVERDUE
      return "Continue";
    }
  };

  const getLinkPath = () => {
    if (isTeacher) {
      // Teacher links to game details or performance, using the game template ID (game.id)
      return showPerformance
        ? `/teacher/classrooms/${classroomId}/games/${game.id}/performance`
        : `/teacher/classrooms/${classroomId}/games/${game.id}`;
    } else {
      // Student links to an attempt page using the specific ASSIGNMENT ID
      if (!assignedGameId) {
        console.warn("GameCard: assignedGameId is missing for student link. Falling back to game.id, which might be incorrect for attempts.");
        // Fallback or error, ideally assignedGameId should always be provided for student attempts
        return `/student/classrooms/${classroomId}/game/${game.id}/attempt`; 
      }
      return `/student/classrooms/${classroomId}/game/${assignedGameId}/attempt`;
    }
  };

  return (
    <div className="card card-hover border border-gray-100 dark:border-gray-700 h-full bg-white dark:bg-primary-card-dark">
      <div className="flex flex-col h-full p-4">
        <div>
          <h3 className="font-bold text-lg mb-2 text-primary-text dark:text-primary-text-dark">
            {game.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3"> {/* Added line-clamp */}
            {game.description}
          </p>

          {game.subject && ( /* Display subject if available */
            <div className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 bg-primary-interactive bg-opacity-10 text-primary-interactive dark:bg-primary-interactive-dark dark:bg-opacity-20 dark:text-primary-interactive-dark">
              {game.subject}
            </div>
          )}
        </div>

        <div className="mt-auto">
          {/* Displaying score for completed games for students might need more context,
              as 'game.score' on the Game template might not be student-specific.
              This often comes from attempt data. For now, we'll keep it as is if your 'Game' type can hold a score.
          */}
          {game.status === "completed" &&
            game.score !== undefined &&
            !isTeacher && (
              <div className="flex items-center mb-3">
                <div className="bg-primary-accent bg-opacity-20 text-primary-text dark:bg-primary-accent-dark dark:bg-opacity-20 dark:text-primary-text-dark px-3 py-1 rounded-full text-sm font-medium">
                  Your Score: {game.score}% {/* Ensure score is percentage or adjust display */}
                </div>
              </div>
            )}

          <Link
            to={getLinkPath()}
            className="flex items-center justify-between w-full mt-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors">
            <span className="flex items-center">
              {getStatusIcon()}
              <span className="ml-2 font-medium text-primary-text dark:text-primary-text-dark">
                {getActionText()}
              </span>
            </span>

            {isTeacher && showPerformance && game.status !== 'not_started' && ( /* Added status check */
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Avg. Score: {game.score !== undefined ? `${game.score}%` : "N/A"} {/* Example display */}
              </span>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GameCard;