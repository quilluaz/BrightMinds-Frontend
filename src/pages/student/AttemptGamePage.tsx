import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useClassroom } from "../../context/ClassroomContext";
import { useAuth } from "../../context/AuthContext";
import { AssignedGameDTO, StudentGameAttemptDTO } from "../../types";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Button from "../../components/common/Button";
import MessageModal from "../../components/common/MessageModal";
import { AlertTriangle, Lock } from "lucide-react";

import BlankMatchingGame from "../../components/game/Jeric/BlankMatchingGame";
import BlankImageMultipleChoiceGame from "../../components/game/Selina/BlankImageMultipleChoiceGame";
import BlankSortingGame from "../../components/game/Zeke/BlankSortingGame";
import Blank4Pics1Word from "../../components/game/Mae/Blank4Pics1Word";
import { gameService } from "../../services/game";

const AttemptGamePage: React.FC = () => {
  const { classroomId, assignedGameId } = useParams<{
    classroomId: string;
    assignedGameId: string;
  }>();
  const { currentUser } = useAuth();
  const { getAssignedGames, submitGameResults } = useClassroom();
  const navigate = useNavigate();

  const [assignedGame, setAssignedGame] = useState<AssignedGameDTO | null>(
    null
  );
  // studentAttempts is not strictly needed as a state here if only used for initial check
  // const [studentAttempts, setStudentAttempts] = useState<StudentGameAttemptDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canAttempt, setCanAttempt] = useState(false);
  const [blockReason, setBlockReason] = useState<string | null>(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [messageModal, setMessageModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "info" | "warning" | "error";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [completionMessage, setCompletionMessage] = useState<{
    title: string;
    message: string;
    type: "success" | "info" | "warning" | "error";
  } | null>(null);

  useEffect(() => {
    if (!classroomId || !assignedGameId || !currentUser || !currentUser.id) {
      setError("Missing critical information to load the game.");
      setIsLoading(false);
      return;
    }

    const fetchGameAndAttemptDetails = async () => {
      setIsLoading(true);
      setError(null);
      setBlockReason(null);
      setCanAttempt(false);
      setGameCompleted(false);
      setShowCompletionScreen(false);
      setFinalScore(null);
      setCompletionMessage(null);

      try {
        const gamesInClassroom = await getAssignedGames(classroomId);
        const foundGame = gamesInClassroom.find(
          (ag) => ag.id === assignedGameId
        );

        if (!foundGame) {
          setError(`Assigned game with ID ${assignedGameId} not found.`);
          setIsLoading(false);
          return;
        }
        setAssignedGame(foundGame);

        // Fetch attempts for this specific game by this student
        const attempts = await gameService.getMyAttempts(
          foundGame.id,
          currentUser.id.toString()
        );

        // Check if there are any completed attempts
        const hasCompletedAttempt = attempts.some(
          (attempt) =>
            attempt.completedAt && new Date(attempt.completedAt) > new Date(0)
        );

        if (hasCompletedAttempt) {
          // Get the latest attempt
          const latestAttempt = attempts.reduce((latest, current) => {
            const latestDate = new Date(latest.completedAt || 0);
            const currentDate = new Date(current.completedAt || 0);
            return currentDate > latestDate ? current : latest;
          });

          setGameCompleted(true);
          setCanAttempt(false);
          setBlockReason("You have already completed this activity.");
          setFinalScore(latestAttempt.score);

          // Set appropriate completion message based on score
          const maxScore = foundGame.game?.maxScore || 100;
          const scorePercentage = (latestAttempt.score / maxScore) * 100;

          let message = {
            title: "",
            message: "",
            type: "info" as const,
          };

          if (latestAttempt.score === maxScore) {
            message = {
              title: "Perfect Score! 🎉",
              message: "Congratulations! You've achieved the maximum score!",
              type: "success",
            };
          } else if (scorePercentage >= 90) {
            message = {
              title: "Excellent! 🌟",
              message:
                "You're doing amazing! Just a few more points to reach perfection!",
              type: "success",
            };
          } else if (scorePercentage >= 80) {
            message = {
              title: "Great Job! ⭐",
              message:
                "You're getting closer to the maximum score! Keep trying!",
              type: "info",
            };
          } else if (scorePercentage >= 60) {
            message = {
              title: "Good Effort! 💪",
              message:
                "You're making progress! Try again to improve your score!",
              type: "info",
            };
          } else {
            message = {
              title: "Keep Going! 🎯",
              message: "Don't give up! Practice makes perfect. Try again!",
              type: "info",
            };
          }

          setCompletionMessage(message);
          setShowCompletionScreen(true);
          setIsLoading(false);
          return;
        }

        const now = new Date();
        const dueDate = new Date(foundGame.dueDate);
        let reason = "";
        let allow = true;
        const attemptsMadeCount = attempts.length;

        if (foundGame.status === "COMPLETED") {
          if (
            foundGame.maxAttempts == null ||
            attemptsMadeCount >= foundGame.maxAttempts
          ) {
            allow = false;
            reason =
              "You have already completed this activity and reached max attempts (if any).";
          }
        } else if (now > dueDate) {
          allow = false;
          reason = "This activity is past its due date.";
        } else if (
          foundGame.maxAttempts != null &&
          attemptsMadeCount >= foundGame.maxAttempts
        ) {
          allow = false;
          reason = `You have reached the maximum number of attempts (${foundGame.maxAttempts}).`;
        }

        setCanAttempt(allow);
        if (!allow) {
          setBlockReason(reason);
        }
      } catch (err) {
        console.error("Error fetching game/attempt details:", err);
        const errorMsg =
          err instanceof Error ? err.message : "Failed to load game details.";
        setError(errorMsg);
        if (
          (err as any)?.response?.status === 404 &&
          (err as any)?.config?.url?.includes("/attempts/assignment/")
        ) {
          setError(
            `Could not fetch your attempt history for this game (Error 404). Please ensure the API is available. Displaying game based on assignment status only.`
          );
          let allowFallback = true;
          if (
            assignedGame?.status === "COMPLETED" ||
            assignedGame?.status === "OVERDUE"
          ) {
            allowFallback = false;
            setBlockReason(
              assignedGame?.status === "COMPLETED"
                ? "Activity already marked as completed."
                : "Activity is overdue."
            );
          }
          setCanAttempt(allowFallback);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameAndAttemptDetails();
  }, [classroomId, assignedGameId, getAssignedGames, currentUser]);

  const handleGameComplete = async (
    score: number,
    timeTakenSeconds?: number,
    expReward?: number
  ) => {
    // Prevent multiple submissions
    if (gameCompleted) {
      return;
    }

    if (!currentUser || !assignedGame || !classroomId || !submitGameResults) {
      setMessageModal({
        isOpen: true,
        title: "Error",
        message: "Missing required information to submit your score.",
        type: "error",
      });
      return;
    }

    // Get the game's max score
    const maxScore = assignedGame.game?.maxScore || 100;
    const scorePercentage = (score / maxScore) * 100;

    // Set completion message based on score
    let message = {
      title: "",
      message: "",
      type: "info" as const,
    };

    if (score === maxScore) {
      message = {
        title: "Perfect Score! 🎉",
        message: "Congratulations! You've achieved the maximum score!",
        type: "success",
      };
    } else if (scorePercentage >= 90) {
      message = {
        title: "Excellent! 🌟",
        message:
          "You're doing amazing! Just a few more points to reach perfection!",
        type: "success",
      };
    } else if (scorePercentage >= 80) {
      message = {
        title: "Great Job! ⭐",
        message: "You're getting closer to the maximum score! Keep trying!",
        type: "info",
      };
    } else if (scorePercentage >= 60) {
      message = {
        title: "Good Effort! 💪",
        message: "You're making progress! Try again to improve your score!",
        type: "info",
      };
    } else {
      message = {
        title: "Keep Going! 🎯",
        message: "Don't give up! Practice makes perfect. Try again!",
        type: "info",
      };
    }

    // Always submit the attempt, even for max score
    const attemptPayload: Omit<StudentGameAttemptDTO, "id" | "createdAt"> = {
      studentId: currentUser.id.toString(),
      assignedGameId: assignedGame.id,
      gameId: assignedGame.game?.id || assignedGame.gameId,
      classroomId: classroomId,
      score: score,
      completedAt: new Date().toISOString(),
      ...(timeTakenSeconds !== undefined && { timeTakenSeconds }),
      ...(expReward !== undefined && { expGained: expReward }),
    };

    try {
      await submitGameResults(
        classroomId,
        assignedGame.id,
        score,
        attemptPayload
      );
      // Mark game as completed and show completion screen
      setGameCompleted(true);
      setCanAttempt(false);
      setFinalScore(score);
      setCompletionMessage(message);
      setShowCompletionScreen(true);
    } catch (err) {
      // If there's an error, show it in the modal
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred while submitting your score.";
      setMessageModal({
        isOpen: true,
        title: "Submission Error",
        message: errorMessage,
        type: "error",
      });
      return; // Don't navigate on error
    }
  };

  const handleBackToClassroom = () => {
    if (classroomId) {
      navigate(`/student/classrooms/${classroomId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        <AlertTriangle size={48} className="mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Error Loading Game</h2>
        <p>{error}</p>
        <Button onClick={() => navigate(-1)} className="mt-6">
          Go Back
        </Button>
      </div>
    );
  }

  if (!assignedGame || !assignedGame.game || !assignedGame.game.gameData) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        Game data not found or invalid.
        <pre className="text-left text-xs mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-auto">
          Debug Info:{" "}
          {JSON.stringify(
            {
              assignedGameExists: !!assignedGame,
              gameExists: !!assignedGame?.game,
              gameDataExists: !!assignedGame?.game?.gameData,
            },
            null,
            2
          )}
        </pre>
      </div>
    );
  }

  if (showCompletionScreen && completionMessage && finalScore !== null) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <h2 className="text-4xl font-bold mb-6 text-primary-energetic dark:text-primary-energetic-dark">
            {completionMessage.title}
          </h2>
          <p className="text-xl mb-8 text-gray-700 dark:text-gray-300">
            {completionMessage.message}
          </p>
          <div className="mb-8">
            <p className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
              Your Score:
            </p>
            <p className="text-5xl font-bold text-primary-energetic dark:text-primary-energetic-dark">
              {finalScore} / {assignedGame?.game?.maxScore || 100}
            </p>
          </div>
          <Button
            onClick={handleBackToClassroom}
            className="px-8 py-3 text-lg font-semibold">
            Back to Classroom
          </Button>
        </div>
      </div>
    );
  }

  if (!canAttempt && blockReason) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Lock
          size={48}
          className="mx-auto mb-4 text-primary-energetic dark:text-primary-energetic-dark"
        />
        <h2 className="text-2xl font-semibold mb-2 text-primary-text dark:text-primary-text-dark">
          Attempt Not Allowed
        </h2>
        <p className="text-gray-700 dark:text-gray-300">{blockReason}</p>
        <Button
          onClick={() => navigate(`/student/classrooms/${classroomId}`)}
          className="mt-6">
          Back to Classroom
        </Button>
      </div>
    );
  }

  if (!canAttempt && !isLoading) {
    // Fallback if somehow blockReason wasn't set but canAttempt is false
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Lock
          size={48}
          className="mx-auto mb-4 text-primary-energetic dark:text-primary-energetic-dark"
        />
        <h2 className="text-2xl font-semibold mb-2 text-primary-text dark:text-primary-text-dark">
          Cannot Attempt Game
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          You may not have permission or the game conditions are not met.
        </p>
        <Button
          onClick={() => navigate(`/student/classrooms/${classroomId}`)}
          className="mt-6">
          Back to Classroom
        </Button>
      </div>
    );
  }

  const gameMode = assignedGame.game.gameMode;
  let parsedGameData;
  try {
    parsedGameData = JSON.parse(assignedGame.game.gameData);
  } catch (e) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        Error loading game: Invalid game data format.
      </div>
    );
  }

  const gameProps = {
    isPracticeMode: false,
    gameData: parsedGameData,
    assignedGameData: assignedGame,
    onGameComplete: handleGameComplete,
    classroomId,
    assignedGameId,
    gameCompleted,
  };

  switch (gameMode) {
    case "MATCHING":
      return <BlankMatchingGame {...gameProps} />;
    case "IMAGE_MULTIPLE_CHOICE":
      return <BlankImageMultipleChoiceGame {...gameProps} />;
    case "SORTING":
      return <BlankSortingGame {...gameProps} />;
    case "FOUR_PICS_ONE_WORD":
      return <Blank4Pics1Word {...gameProps} />;
    default:
      return (
        <div className="container mx-auto px-4 py-8 text-center">
          Unsupported game mode: {gameMode || "Not specified"}.
        </div>
      );
  }

  // If game is completed, show completion screen instead of game
  if (gameCompleted) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <h2 className="text-4xl font-bold mb-6 text-primary-energetic dark:text-primary-energetic-dark">
            Activity Completed
          </h2>
          <p className="text-xl mb-8 text-gray-700 dark:text-gray-300">
            You have already completed this activity.
          </p>
          <Button
            onClick={handleBackToClassroom}
            className="px-8 py-3 text-lg font-semibold">
            Back to Classroom
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <MessageModal
        isOpen={messageModal.isOpen}
        onClose={() => setMessageModal((prev) => ({ ...prev, isOpen: false }))}
        title={messageModal.title}
        message={messageModal.message}
        type={messageModal.type}
      />
      {!canAttempt && blockReason ? (
        <div className="container mx-auto px-4 py-8 text-center">
          <Lock
            size={48}
            className="mx-auto mb-4 text-primary-energetic dark:text-primary-energetic-dark"
          />
          <h2 className="text-2xl font-semibold mb-2 text-primary-text dark:text-primary-text-dark">
            {gameCompleted ? "Activity Completed" : "Attempt Not Allowed"}
          </h2>
          <p className="text-gray-700 dark:text-gray-300">{blockReason}</p>
          <Button
            onClick={() => navigate(`/student/classrooms/${classroomId}`)}
            className="mt-6">
            Back to Classroom
          </Button>
        </div>
      ) : assignedGame ? (
        <div className="container mx-auto px-4 py-8">
          {assignedGame.game?.gameMode === "MATCHING" && (
            <BlankMatchingGame
              gameData={assignedGame.game.gameData}
              onGameComplete={handleGameComplete}
              classroomId={classroomId}
              isPracticeMode={false}
              gameCompleted={gameCompleted}
            />
          )}
          {assignedGame.game?.gameMode === "IMAGE_MULTIPLE_CHOICE" && (
            <BlankImageMultipleChoiceGame
              gameData={assignedGame.game.gameData}
              onGameComplete={handleGameComplete}
              classroomId={classroomId}
              isPracticeMode={false}
              gameCompleted={gameCompleted}
            />
          )}
          {assignedGame.game?.gameMode === "SORTING" && (
            <BlankSortingGame
              gameData={assignedGame.game.gameData}
              onGameComplete={handleGameComplete}
              classroomId={classroomId}
              isPracticeMode={false}
              gameCompleted={gameCompleted}
            />
          )}
          {assignedGame.game?.gameMode === "4PICS1WORD" && (
            <Blank4Pics1Word
              gameData={assignedGame.game.gameData}
              onGameComplete={handleGameComplete}
              classroomId={classroomId}
              isPracticeMode={false}
              gameCompleted={gameCompleted}
            />
          )}
        </div>
      ) : null}
    </>
  );
};

export default AttemptGamePage;
