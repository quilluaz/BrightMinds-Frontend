// src/pages/student/AttemptGamePage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useClassroom } from "../../context/ClassroomContext";
import { useAuth } from "../../context/AuthContext";
import { AssignedGameDTO, StudentGameAttemptDTO } from "../../types";
import LoadingSpinner from "../../components/common/LoadingSpinner";

// Import your actual game components
import MatchingGamePage from "../../components/game/Jeric/MatchingGamePage";
import ImageMultipleChoiceGame from "../../components/game/Selina/ImageMultipleChoiceGame";
import LikasYamanGame from "../../components/game/Zeke/LikasYamanGame";
import FourPicsOneWord from "../../components/game/Mae/4Pics1Word";
// Add other game components as needed

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!classroomId || !assignedGameId) {
      setError("Missing classroom or game assignment ID.");
      setIsLoading(false);
      navigate("/student/dashboard");
      return;
    }

    const fetchAssignedGameDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const gamesInClassroom = await getAssignedGames(classroomId);
        const foundGame = gamesInClassroom.find(
          (ag) => ag.id === assignedGameId
        );

        if (foundGame) {
          setAssignedGame(foundGame);
        } else {
          setError(
            `Assigned game with ID ${assignedGameId} not found in classroom ${classroomId}.`
          );
          console.error(
            `Assigned game with ID ${assignedGameId} not found in classroom ${classroomId}.`
          );
        }
      } catch (err) {
        console.error("Error fetching assigned game details:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load game details."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignedGameDetails();
  }, [classroomId, assignedGameId, getAssignedGames, navigate]);

  const handleGameComplete = async (
    score: number,
    timeTakenSeconds?: number,
    expReward?: number
  ) => {
    if (!currentUser || !assignedGame || !classroomId || !submitGameResults) {
      console.error(
        "Cannot submit game results: missing user, game, classroomId, or context function."
      );
      alert(
        "Error: Could not submit game results. Required information is missing."
      );
      return;
    }

    const attemptData: Omit<StudentGameAttemptDTO, "id" | "createdAt"> = {
      studentId: currentUser.id.toString(),
      assignedGameId: assignedGame.id,
      gameId: assignedGame.game?.id || assignedGame.gameId,
      score: score,
      completedAt: new Date().toISOString(),
      // expGained and timeTakenSeconds are optional and can be added if your games track them
      // expGained: expReward, // example if you pass it from the game
      // timeTakenSeconds: timeTakenSeconds, // example
    };

    try {
      console.log("AttemptGamePage: Submitting game attempt:", attemptData);
      await submitGameResults(classroomId, assignedGame.id, score, attemptData);
      alert(`Game finished! Score: ${score}. Results submitted.`);
      navigate(`/student/classrooms/${classroomId}`);
    } catch (err) {
      console.error("AttemptGamePage: Error submitting game results:", err);
      alert(
        `Failed to submit game results: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
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
        Error: {error}
      </div>
    );
  }

  if (!assignedGame || !assignedGame.game) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        Game data not found or invalid.
      </div>
    );
  }

  const gameMode = assignedGame.game.gameMode;

  const gameProps = {
    isPracticeMode: false,
    assignedGameData: assignedGame,
    onGameComplete: handleGameComplete,
    classroomId,
    assignedGameId,
  };

  switch (gameMode) {
    case "MATCHING":
      return <MatchingGamePage {...gameProps} />;
    case "IMAGE_MULTIPLE_CHOICE":
      return <ImageMultipleChoiceGame {...gameProps} />;
    case "SORTING": // Assuming LikasYamanGame is for SORTING
      return <LikasYamanGame {...gameProps} />;
    case "FOUR_PICS_ONE_WORD":
      return <FourPicsOneWord {...gameProps} />;
    // Add cases for other game modes
    // case 'BALLOON':
    //   return <BalloonGame {...gameProps} />;
    default:
      return (
        <div className="container mx-auto px-4 py-8 text-center">
          Unsupported game mode: {gameMode || "Not specified"}. Please contact
          support.
          <pre className="text-left text-xs mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-auto">
            {JSON.stringify(assignedGame, null, 2)}
          </pre>
        </div>
      );
  }
};

export default AttemptGamePage;
