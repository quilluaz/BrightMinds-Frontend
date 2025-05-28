import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useClassroom } from "../../context/ClassroomContext";
import GameCard from "../../components/common/GameCard";
import LeaderboardTable from "../../components/common/LeaderboardTable";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  Classroom,
  StudentClassroom,
  AssignedGameDTO,
  LeaderboardEntry,
  Game,
  ClassroomDTO,
} from "../../types"; // Ensure ClassroomDTO is imported if used

const StudentClassroomViewPage: React.FC = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("games");

  const {
    studentClassrooms,
    teacherClassrooms,
    getAssignedGames,
    getClassroomLeaderboard,
  } = useClassroom();

  const [isPageLoading, setIsPageLoading] = useState(true);
  // Adjusted to use Classroom | StudentClassroom type for flexibility
  const [classroomData, setClassroomData] = useState<
    Classroom | StudentClassroom | null
  >(null);

  const [games, setGames] = useState<AssignedGameDTO[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(false);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);

  useEffect(() => {
    setIsPageLoading(true);
    if (classroomId) {
      let foundClassroom: Classroom | StudentClassroom | undefined;
      if (currentUser?.role === "STUDENT") {
        foundClassroom = studentClassrooms.find(
          (c) => c.classroomId === classroomId
        );
      } else if (currentUser?.role === "TEACHER") {
        foundClassroom = teacherClassrooms.find((c) => c.id === classroomId);
      }
      setClassroomData(foundClassroom || null);
    } else {
      setClassroomData(null);
      navigate(
        currentUser?.role === "STUDENT"
          ? "/student/classrooms"
          : "/teacher/classrooms"
      );
    }
    setIsPageLoading(false);
  }, [
    classroomId,
    studentClassrooms,
    teacherClassrooms,
    currentUser?.role,
    navigate,
  ]);

  const fetchGames = useCallback(async () => {
    if (classroomId && getAssignedGames) {
      setIsLoadingGames(true);
      try {
        const fetchedGames = await getAssignedGames(classroomId);
        setGames(fetchedGames);
      } catch (error) {
        console.error("Failed to fetch games:", error);
        setGames([]);
      } finally {
        setIsLoadingGames(false);
      }
    }
  }, [classroomId, getAssignedGames]);

  useEffect(() => {
    if (classroomData) {
      fetchGames();
    }
  }, [fetchGames, classroomData]);

  const fetchLeaderboard = useCallback(async () => {
    if (classroomId && getClassroomLeaderboard) {
      setIsLoadingLeaderboard(true);
      try {
        const fetchedLeaderboard = await getClassroomLeaderboard(classroomId);
        setLeaderboard(fetchedLeaderboard);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
        setLeaderboard([]);
      } finally {
        setIsLoadingLeaderboard(false);
      }
    }
  }, [classroomId, getClassroomLeaderboard]);

  useEffect(() => {
    if (activeTab === "leaderboard" && classroomData) {
      fetchLeaderboard();
    }
  }, [activeTab, fetchLeaderboard, classroomData]);

  // This function maps AssignedGameDTO to the Game shape expected by GameCard for DISPLAY purposes
  const mapAssignedGameToGameCardDisplayProp = (
    assignedGame: AssignedGameDTO
  ): Game => {
    // The ID here should be the game template's ID for consistency if GameCard needs it for other reasons
    // or if the Game type strictly expects the game template ID.
    // For navigation, we are now passing assignedGameId separately to GameCard.
    return {
      id: assignedGame.game?.id || assignedGame.gameId || assignedGame.id, // Fallback chain for game template ID
      title:
        assignedGame.game?.title || assignedGame.gameTitle || "Untitled Game",
      description: assignedGame.game?.description,
      subject: assignedGame.game?.subject,
      questions: assignedGame.game?.questions || [], // Ensure questions is not undefined
      gameMode: assignedGame.game?.gameMode,
      status: (assignedGame.status as Game["status"]) || "not_started",
      // Score on the 'Game' type here refers to a general property or average,
      // not necessarily the student's score for this specific assignment.
      // Student's score for an assignment would typically be fetched alongside or within AssignedGameDTO if needed for display here.
    };
  };

  if (isPageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!classroomId) {
    return <div className="text-center p-8">Invalid classroom ID.</div>;
  }

  if (!classroomData) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4 text-primary-text dark:text-primary-text-dark">
          Classroom Not Found
        </h2>
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          The classroom you're looking for doesn't exist or you don't have
          access to it.
        </p>
        <Link
          to={
            currentUser?.role === "STUDENT"
              ? "/student/classrooms"
              : "/teacher/classrooms"
          }
          className="btn btn-primary">
          Back to My Classrooms
        </Link>
      </div>
    );
  }

  // Type guard to correctly access properties
  const classroomName =
    "classroomName" in classroomData
      ? classroomData.classroomName
      : classroomData.name;
  const teacherNameProperty =
    "teacherName" in classroomData
      ? classroomData.teacherName
      : (classroomData as Classroom).teacherName;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <header className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl md:text-4xl font-bold text-primary-text dark:text-primary-text-dark">
          {classroomName}
        </h1>
        {teacherNameProperty && (
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Teacher: {teacherNameProperty}
          </p>
        )}
      </header>

      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-1 sm:space-x-4">
          <button
            className={`py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
              activeTab === "games"
                ? "border-primary-interactive dark:border-primary-interactive-dark text-primary-interactive dark:text-primary-interactive-dark"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-primary-text dark:hover:text-primary-text-dark"
            }`}
            onClick={() => setActiveTab("games")}>
            Games & Activities
          </button>
          <button
            className={`py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
              activeTab === "leaderboard"
                ? "border-primary-interactive dark:border-primary-interactive-dark text-primary-interactive dark:text-primary-interactive-dark"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-primary-text dark:hover:text-primary-text-dark"
            }`}
            onClick={() => setActiveTab("leaderboard")}>
            Classroom Leaderboard
          </button>
        </div>
      </div>

      <div className="mt-6">
        {activeTab === "games" && (
          <div className="animate-fade-in">
            {isLoadingGames ? (
              <LoadingSpinner />
            ) : games.length === 0 ? (
              <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow-sm p-8 text-center border dark:border-gray-700">
                <h3 className="text-xl font-semibold mb-2 text-primary-text dark:text-primary-text-dark">
                  No Activities Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Your teacher hasn't added any learning activities to this
                  classroom yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map((assignedGame: AssignedGameDTO) => (
                  <GameCard
                    key={assignedGame.id} // React key uses the unique assignment ID
                    game={mapAssignedGameToGameCardDisplayProp(assignedGame)} // Maps to Game type for display props
                    classroomId={classroomId!}
                    assignedGameId={assignedGame.id} // <<< PASS THE CORRECT ASSIGNMENT ID
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-semibold mb-4 text-primary-text dark:text-primary-text-dark">
              Classroom Leaderboard
            </h2>
            {isLoadingLeaderboard ? (
              <LoadingSpinner />
            ) : leaderboard.length === 0 ? (
              <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow-sm p-8 text-center border dark:border-gray-700">
                <h3 className="text-xl font-semibold mb-2 text-primary-text dark:text-primary-text-dark">
                  Leaderboard is Empty
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  No scores recorded yet. Play some games to see your rank!
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Student's Current Rank */}
                <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow-sm p-6 border dark:border-gray-700">
                  <h3 className="text-lg font-semibold mb-4 text-primary-text dark:text-primary-text-dark">
                    Your Current Rank
                  </h3>
                  {currentUser && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl font-bold text-primary-accent">
                          #{leaderboard.find(entry => entry.studentId === currentUser.id.toString())?.rank || 'N/A'}
                        </div>
                        <div>
                          <p className="font-semibold text-primary-text dark:text-primary-text-dark">
                            {currentUser.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Score: {leaderboard.find(entry => entry.studentId === currentUser.id.toString())?.score || 0} pts
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Top Performers */}
                <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow-sm overflow-hidden border dark:border-gray-700">
                  <div className="p-4 border-b dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-primary-text dark:text-primary-text-dark">
                      Top Performers
                    </h3>
                  </div>
                  <LeaderboardTable
                    entries={leaderboard.slice(0, 5)} // Only show top 5
                    highlightedUserId={currentUser?.id?.toString()}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentClassroomViewPage;
