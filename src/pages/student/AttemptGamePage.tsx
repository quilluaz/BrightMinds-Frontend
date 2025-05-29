import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useClassroom } from "../../context/ClassroomContext";
import { useAuth } from "../../context/AuthContext";
import { AssignedGameDTO, StudentGameAttemptDTO } from "../../types";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Button from "../../components/common/Button";
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

  const [assignedGame, setAssignedGame] = useState<AssignedGameDTO | null>(null);
  // studentAttempts is not strictly needed as a state here if only used for initial check
  // const [studentAttempts, setStudentAttempts] = useState<StudentGameAttemptDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canAttempt, setCanAttempt] = useState(false);
  const [blockReason, setBlockReason] = useState<string | null>(null);

  useEffect(() => {
    if (!classroomId || !assignedGameId || !currentUser || !currentUser.id) { // Ensure currentUser.id exists
      setError("Missing critical information to load the game.");
      setIsLoading(false);
      return;
    }

    const fetchGameAndAttemptDetails = async () => {
      setIsLoading(true);
      setError(null);
      setBlockReason(null);
      setCanAttempt(false);

      try {
        const gamesInClassroom = await getAssignedGames(classroomId);
        const foundGame = gamesInClassroom.find((ag) => ag.id === assignedGameId);

        if (!foundGame) {
          setError(`Assigned game with ID ${assignedGameId} not found.`);
          setIsLoading(false);
          return;
        }
        setAssignedGame(foundGame);

        // Fetch attempts for this specific game by this student
        const attempts = await gameService.getMyAttempts(foundGame.id, currentUser.id.toString());
        // setStudentAttempts(attempts); // Update state if needed elsewhere

        const now = new Date();
        const dueDate = new Date(foundGame.dueDate);
        let reason = "";
        let allow = true;
        const attemptsMadeCount = attempts.length;
        
        if (foundGame.status === "COMPLETED") {
             if (foundGame.maxAttempts == null || attemptsMadeCount >= foundGame.maxAttempts) {
                 allow = false;
                 reason = "You have already completed this activity and reached max attempts (if any).";
             }
        } else if (now > dueDate) { 
          allow = false;
          reason = "This activity is past its due date.";
        } else if (foundGame.maxAttempts != null && attemptsMadeCount >= foundGame.maxAttempts) {
          allow = false;
          reason = `You have reached the maximum number of attempts (${foundGame.maxAttempts}).`;
        }
        
        setCanAttempt(allow);
        if (!allow) {
          setBlockReason(reason);
        }

      } catch (err) {
        console.error("Error fetching game/attempt details:", err);
        const errorMsg = err instanceof Error ? err.message : "Failed to load game details.";
        setError(errorMsg);
        // If 404 was due to getMyAttempts, it means the endpoint is still an issue.
        if ((err as any)?.response?.status === 404 && (err as any)?.config?.url?.includes('/attempts/assignment/')) {
            setError(`Could not fetch your attempt history for this game (Error 404). Please ensure the API is available. Displaying game based on assignment status only.`);
            // Fallback: allow attempt based only on assignedGame status if attempts can't be fetched
            // This is a temporary fallback; the 404 should be fixed.
            let allowFallback = true;
            if (assignedGame?.status === "COMPLETED" || assignedGame?.status === "OVERDUE") {
                allowFallback = false;
                setBlockReason(assignedGame?.status === "COMPLETED" ? "Activity already marked as completed." : "Activity is overdue.");
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
    if (!currentUser || !assignedGame || !classroomId || !submitGameResults) {
      alert("Error: Could not submit game results. Required information is missing.");
      return;
    }
    
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
      await submitGameResults(classroomId, assignedGame.id, score, attemptPayload);
      alert(`Game finished! Score: ${score}. Results submitted.`);
      navigate(`/student/classrooms/${classroomId}`);
    } catch (err) {
      alert(`Failed to submit game results: ${err instanceof Error ? err.message : "Unknown error"}`);
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
        <Button onClick={() => navigate(-1)} className="mt-6">Go Back</Button>
      </div>
    );
  }

  if (!assignedGame || !assignedGame.game || !assignedGame.game.gameData) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        Game data not found or invalid.
         <pre className="text-left text-xs mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-auto">
            Debug Info: {JSON.stringify({ assignedGameExists: !!assignedGame, gameExists: !!assignedGame?.game, gameDataExists: !!assignedGame?.game?.gameData }, null, 2)}
          </pre>
      </div>
    );
  }

  if (!canAttempt && blockReason) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Lock size={48} className="mx-auto mb-4 text-primary-energetic dark:text-primary-energetic-dark" />
        <h2 className="text-2xl font-semibold mb-2 text-primary-text dark:text-primary-text-dark">Attempt Not Allowed</h2>
        <p className="text-gray-700 dark:text-gray-300">{blockReason}</p>
        <Button onClick={() => navigate(`/student/classrooms/${classroomId}`)} className="mt-6">
            Back to Classroom
        </Button>
      </div>
    );
  }
  
  if (!canAttempt && !isLoading) { // Fallback if somehow blockReason wasn't set but canAttempt is false
     return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Lock size={48} className="mx-auto mb-4 text-primary-energetic dark:text-primary-energetic-dark" />
        <h2 className="text-2xl font-semibold mb-2 text-primary-text dark:text-primary-text-dark">Cannot Attempt Game</h2>
        <p className="text-gray-700 dark:text-gray-300">You may not have permission or the game conditions are not met.</p>
         <Button onClick={() => navigate(`/student/classrooms/${classroomId}`)} className="mt-6">
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
};

export default AttemptGamePage;