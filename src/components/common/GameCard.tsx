import React from "react";
import {
  PlayCircle,
  Check,
  TrendingUp,
  Eye,
  Tag,
  Info,
  CalendarDays,
  Repeat,
  Infinity as InfinityIcon,
  AlertTriangle,
  Activity,
  Award,
  ChevronRight,
  Clock,
  Lock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { AssignedGameDTO } from "../../types";
import { useAuth } from "../../context/AuthContext";

interface GameCardProps {
  assignedGame: AssignedGameDTO;
  classroomId: string;
  onOpenStatsModal?: (assignedGame: AssignedGameDTO) => void;
  attemptsMade?: number;
  highestScore?: number | null;
}

const GameCard: React.FC<GameCardProps> = ({
  assignedGame,
  classroomId,
  onOpenStatsModal,
  attemptsMade,
  highestScore,
}) => {
  const { currentUser } = useAuth();
  const isTeacher = currentUser?.role === "TEACHER";

  if (!assignedGame) {
    return (
      <div className="card border border-red-500 dark:border-red-700 h-full bg-white dark:bg-primary-card-dark flex flex-col opacity-60 filter grayscale-[50%] pointer-events-none">
        <div className="p-5">
          <h3 className="font-bold text-xl text-red-600 dark:text-red-400">
            Error
          </h3>
          <p className="text-base text-gray-600 dark:text-gray-400">
            Game data unavailable.
          </p>
        </div>
      </div>
    );
  }

  const gameDetails = assignedGame.game;
  // Use a local variable for effective status to avoid mutating props/state directly in getStatusDisplay
  const assignmentStatusFromProp = assignedGame.status || "PENDING";
  const maxAttempts = assignedGame.maxAttempts;
  const studentGameAttemptPath = `/student/classrooms/${classroomId}/game/${assignedGame.id}/attempt`;

  let isEffectivelyDisabled = false;
  if (!isTeacher) {
    // Check based on assignmentStatusFromProp first
    if (assignmentStatusFromProp === "COMPLETED") {
      isEffectivelyDisabled = false;
    } else if (assignmentStatusFromProp === "OVERDUE") {
      isEffectivelyDisabled = true;
    } else if (
      maxAttempts != null &&
      typeof attemptsMade === "number" &&
      attemptsMade >= maxAttempts
    ) {
      isEffectivelyDisabled = true;
    }
  }

  if (!gameDetails && !isTeacher) {
    let fallbackPlayButtonText = "Play Now";
    if (assignmentStatusFromProp === "COMPLETED")
      fallbackPlayButtonText = "View Score";
    else if (isEffectivelyDisabled) {
      fallbackPlayButtonText =
        assignmentStatusFromProp === "OVERDUE"
          ? "Past Due"
          : "Max Attempts Reached";
    }

    return (
      <div
        className={`card h-full bg-white dark:bg-primary-card-dark flex flex-col
                      ${
                        isEffectivelyDisabled
                          ? "opacity-60 filter grayscale-[50%] cursor-not-allowed"
                          : "card-hover"
                      }`}>
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="font-semibold text-xl md:text-2xl mb-2 text-primary-text dark:text-primary-text-dark">
            {assignedGame.gameTitle || "Game Activity"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-base text-gray-700 dark:text-gray-300 mb-4">
            <div className="flex items-center">
              <CalendarDays
                size={18}
                className="mr-2 text-primary-interactive dark:text-primary-interactive-dark flex-shrink-0"
              />
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  Deadline:
                </span>
                <p className="font-semibold">
                  {new Date(assignedGame.dueDate).toLocaleDateString([], {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <Repeat
                size={18}
                className="mr-2 text-primary-interactive dark:text-primary-interactive-dark flex-shrink-0"
              />
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  Attempts:
                </span>
                <p className="font-semibold">
                  {typeof attemptsMade === "number" ? `${attemptsMade}/` : "0/"}
                  {maxAttempts != null ? (
                    maxAttempts
                  ) : (
                    <InfinityIcon size={16} className="inline" />
                  )}
                </p>
              </div>
            </div>
            {typeof highestScore === "number" && (
              <div className="flex items-center">
                <Award
                  size={18}
                  className="mr-2 text-yellow-500 dark:text-yellow-400 flex-shrink-0"
                />
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    Highest:
                  </span>
                  <p className="font-semibold text-yellow-600 dark:text-yellow-500">
                    {highestScore} pts
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center">
              <Activity
                size={18}
                className="mr-2 text-primary-interactive dark:text-primary-interactive-dark flex-shrink-0"
              />
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  Status:
                </span>
                <p className="font-semibold capitalize">
                  {assignmentStatusFromProp.toLowerCase()}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              to={studentGameAttemptPath}
              onClick={(e) => isEffectivelyDisabled && e.preventDefault()}
              className={`flex items-center justify-center w-full p-3 rounded-lg transition-colors group text-base font-medium
                          ${
                            isEffectivelyDisabled
                              ? "bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                              : "bg-primary-interactive hover:bg-primary-interactive/90 dark:bg-primary-interactive-dark dark:hover:bg-opacity-80 text-white"
                          }`}
              aria-disabled={isEffectivelyDisabled}>
              {isEffectivelyDisabled ? (
                <Lock size={18} className="mr-2" />
              ) : (
                <PlayCircle size={18} className="mr-2" />
              )}
              {fallbackPlayButtonText}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const title = gameDetails?.title || assignedGame.gameTitle || "Untitled Game";
  const description = gameDetails?.description;
  const subject = gameDetails?.subject;
  const gameModeText =
    gameDetails?.gameMode?.replace(/_/g, " ").toLowerCase() || "";
  const gameMaxScore = gameDetails?.maxScore;

  const getStatusDisplay = () => {
    let effectiveStatus = assignmentStatusFromProp;
    const actualAttemptsMade =
      typeof attemptsMade === "number" ? attemptsMade : 0;
    const now = new Date();
    const dueDate = new Date(assignedGame.dueDate);

    // If any attempt has been made, show as completed
    if (actualAttemptsMade > 0) {
      effectiveStatus = "COMPLETED";
    }
    // If no attempts and past deadline, show as overdue
    else if (now > dueDate) {
      effectiveStatus = "OVERDUE";
    }

    let icon = <Activity size={16} className="mr-2 flex-shrink-0" />;
    let sTextColor = "text-gray-600 dark:text-gray-300";
    let statusTextFormatted = "";

    switch (effectiveStatus) {
      case "COMPLETED":
        icon = (
          <Check
            size={16}
            className="mr-2 text-green-500 dark:text-green-400 flex-shrink-0"
          />
        );
        sTextColor = "text-green-600 dark:text-green-400 font-semibold";
        statusTextFormatted = "Completed";
        break;
      case "OVERDUE":
        icon = (
          <AlertTriangle
            size={16}
            className="mr-2 text-red-500 dark:text-red-400 flex-shrink-0"
          />
        );
        sTextColor = "text-red-600 dark:text-red-400 font-semibold";
        statusTextFormatted = "Overdue";
        break;
      case "PENDING":
      case "not_started":
        icon = (
          <Clock
            size={16}
            className="mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0"
          />
        );
        sTextColor = "text-gray-600 dark:text-gray-400 font-semibold";
        statusTextFormatted = "Not yet attempted";
        break;
      default:
        statusTextFormatted = effectiveStatus.replace(/_/g, " ").toLowerCase();
    }

    return {
      icon,
      text: statusTextFormatted,
      sTextColor,
    };
  };

  const {
    icon: currentStatusIcon,
    text: currentStatusText,
    sTextColor: currentStatusTextColor,
  } = getStatusDisplay();

  let playButtonText: string;
  let playButtonIcon: JSX.Element;

  if (isTeacher) {
    playButtonText = "View Details & Stats";
    playButtonIcon = <Eye size={20} className="mr-2" />;
  } else {
    // Use assignmentStatusFromProp for button logic as it reflects the true state for disabling/enabling play
    if (assignmentStatusFromProp === "COMPLETED") {
      playButtonText = "View Score";
      playButtonIcon = <Check size={20} className="mr-2" />;
    } else if (isEffectivelyDisabled) {
      playButtonText =
        assignmentStatusFromProp === "OVERDUE"
          ? "Past Due"
          : "Max Attempts Reached";
      playButtonIcon =
        assignmentStatusFromProp === "OVERDUE" ? (
          <AlertTriangle size={20} className="mr-2" />
        ) : (
          <Lock size={20} className="mr-2" />
        ); // Changed icon to Lock
    } else if (
      assignmentStatusFromProp === "IN_PROGRESS" ||
      ((assignmentStatusFromProp === "PENDING" ||
        assignmentStatusFromProp === "not_started") &&
        typeof attemptsMade === "number" &&
        attemptsMade > 0)
    ) {
      playButtonText = "Continue"; // If attempts made, show "Continue"
      playButtonIcon = <TrendingUp size={20} className="mr-2" />;
    } else {
      // PENDING with 0 attempts
      playButtonText = "Play Now";
      playButtonIcon = <PlayCircle size={20} className="mr-2" />;
    }
  }

  const handleTeacherAction = () => {
    if (isTeacher && onOpenStatsModal) {
      onOpenStatsModal(assignedGame);
    }
  };

  let highestScoreFormatted: string | null = null;
  if (typeof highestScore === "number") {
    if (typeof gameMaxScore === "number" && gameMaxScore > 0) {
      const percentage = Math.round((highestScore / gameMaxScore) * 100);
      highestScoreFormatted = `${highestScore}/${gameMaxScore} (${percentage}%)`;
    } else {
      highestScoreFormatted = `${highestScore} pts`;
    }
  }

  return (
    <div
      className={`card h-full bg-white dark:bg-primary-card-dark flex flex-col
                   ${
                     !isTeacher && isEffectivelyDisabled
                       ? "opacity-50 filter grayscale-[60%] cursor-not-allowed"
                       : "card-hover"
                   }`}>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-semibold text-xl md:text-2xl mb-2 text-primary-text dark:text-primary-text-dark">
          {title}
        </h3>
        {isTeacher && description && (
          <p className="text-gray-500 dark:text-gray-400 text-base mb-4 line-clamp-3 flex-grow">
            {description}
          </p>
        )}
        {!isTeacher && <div className="flex-grow mb-4"></div>}

        {!isTeacher && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-base mb-5">
            <div className="flex items-center col-span-2">
              {currentStatusIcon}
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                Status:
              </span>
              <span
                className={`ml-1.5 capitalize font-semibold ${currentStatusTextColor}`}>
                {currentStatusText}
              </span>
            </div>
            <div className="flex items-start">
              <CalendarDays
                size={18}
                className="mr-2.5 text-primary-interactive dark:text-primary-interactive-dark flex-shrink-0 mt-0.5"
              />
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  Deadline:
                </span>
                <p className="font-semibold text-primary-text dark:text-primary-text-dark">
                  {new Date(assignedGame.dueDate).toLocaleString([], {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Repeat
                size={18}
                className="mr-2.5 text-primary-interactive dark:text-primary-interactive-dark flex-shrink-0 mt-0.5"
              />
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  Attempts:
                </span>
                <p className="font-semibold text-primary-text dark:text-primary-text-dark">
                  {typeof attemptsMade === "number" ? `${attemptsMade}/` : "0/"}
                  {maxAttempts != null ? (
                    maxAttempts
                  ) : (
                    <InfinityIcon size={16} className="inline" />
                  )}
                </p>
              </div>
            </div>
            {highestScoreFormatted &&
              (assignmentStatusFromProp === "COMPLETED" ||
                (typeof attemptsMade === "number" && attemptsMade > 0)) && (
                <div className="flex items-start col-span-2 sm:col-span-1">
                  <Award
                    size={18}
                    className="mr-2.5 text-yellow-500 dark:text-yellow-400 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      Your Highest:
                    </span>
                    <p className="font-semibold text-yellow-600 dark:text-yellow-500">
                      {highestScoreFormatted}
                    </p>
                  </div>
                </div>
              )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-4 text-sm">
          {gameModeText && (
            <span className="inline-flex items-center px-3 py-1.5 rounded-full font-medium bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-200 capitalize shadow-sm">
              <Tag size={15} className="mr-1.5" /> {gameModeText}
            </span>
          )}
          {subject && (
            <span className="inline-flex items-center px-3 py-1.5 rounded-full font-medium bg-sky-100 text-sky-700 dark:bg-sky-800 dark:text-sky-200 shadow-sm">
              <Info size={15} className="mr-1.5" /> {subject}
            </span>
          )}
          {isTeacher && gameDetails && (
            <span
              className={`inline-flex items-center px-3 py-1.5 rounded-full font-medium capitalize shadow-sm ${currentStatusTextColor
                .replace("text-", "bg-")
                .replace("-600", "-100")
                .replace("-500", "-100")
                .replace("-700", "-100")
                .replace("-400", "-800")} ${currentStatusTextColor}`}>
              {React.cloneElement(currentStatusIcon, {
                size: 15,
                className: `mr-1.5 ${currentStatusIcon.props.className}`,
              })}{" "}
              {currentStatusText}
            </span>
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
          {isTeacher ? (
            <button
              onClick={handleTeacherAction}
              className="flex items-center justify-center w-full p-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors group text-base font-medium">
              {playButtonIcon}
              <span className="ml-2 text-primary-text dark:text-primary-text-dark group-hover:text-primary-interactive dark:group-hover:text-primary-interactive-dark">
                {playButtonText}
              </span>
              <ChevronRight
                size={20}
                className="ml-auto text-gray-400 dark:text-gray-500 group-hover:text-primary-interactive dark:group-hover:text-primary-interactive-dark"
              />
            </button>
          ) : (
            <Link
              to={studentGameAttemptPath}
              className={`flex items-center justify-center w-full p-3.5 rounded-lg transition-colors group text-base font-semibold
                          ${
                            !isEffectivelyDisabled
                              ? "bg-primary-interactive hover:bg-opacity-90 dark:bg-primary-interactive-dark dark:hover:bg-opacity-80 text-white"
                              : "bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400"
                          }`}
              onClick={(e) => isEffectivelyDisabled && e.preventDefault()}
              aria-disabled={isEffectivelyDisabled}>
              {playButtonIcon}{" "}
              {/* Icon is now dynamic based on actual playability */}
              <span className="ml-1.5">{playButtonText}</span>
              {!isEffectivelyDisabled && (
                <ChevronRight size={20} className="ml-auto" />
              )}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameCard;
