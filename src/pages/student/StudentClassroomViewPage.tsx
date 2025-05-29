import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useClassroom } from "../../context/ClassroomContext";
import GameCard from "../../components/common/GameCard";
import LeaderboardTable from "../../components/common/LeaderboardTable";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  StudentClassroom,
  AssignedGameDTO,
  LeaderboardEntry,
  StudentGameAttemptDTO,
  Reward,
} from "../../types";
import { gameService } from "../../services/game";
import api from "../../services/api";

interface EnrichedAssignedGame extends AssignedGameDTO {
  attemptsMade: number;
  highestScore: number | null;
}

const StudentClassroomViewPage: React.FC = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("games");

  const {
    studentClassrooms,
    getAssignedGames,
    getClassroomLeaderboard,
  } = useClassroom();

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [classroomData, setClassroomData] =
    useState<StudentClassroom | null>(null);

  const [enrichedGames, setEnrichedGames] = useState<EnrichedAssignedGame[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(false);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);

  useEffect(() => {
    setIsPageLoading(true);
    if (classroomId) {
      const foundClassroom = studentClassrooms.find(
        (c) => c.classroomId === classroomId
      );
      setClassroomData(foundClassroom || null);
    } else {
      setClassroomData(null);
      navigate("/student/classrooms");
    }
    setIsPageLoading(false);
  }, [classroomId, studentClassrooms, navigate]);

  const fetchGamesAndAttempts = useCallback(async () => {
    if (classroomId && getAssignedGames && currentUser && currentUser.id) { // Ensure currentUser.id is present
      setIsLoadingGames(true);
      try {
        const fetchedAssignedGames = await getAssignedGames(classroomId);
        
        const gamesWithAttemptsPromises = fetchedAssignedGames.map(async (ag) => {
          let attemptsMade = 0;
          let highestScore: number | null = null;
          try {
            // Pass studentId to getMyAttempts
            const attempts: StudentGameAttemptDTO[] = await gameService.getMyAttempts(ag.id, currentUser.id.toString());
            attemptsMade = attempts.length;
            if (attemptsMade > 0) {
              highestScore = Math.max(...attempts.map(att => att.score), 0);
            }
          } catch (attemptError) {
            console.error(`Failed to fetch attempts for assigned game ${ag.id}:`, attemptError);
          }
          return { ...ag, attemptsMade, highestScore };
        });

        const resolvedEnrichedGames = await Promise.all(gamesWithAttemptsPromises);
        setEnrichedGames(resolvedEnrichedGames);

      } catch (error) {
        console.error("Failed to fetch assigned games or their attempts:", error);
        setEnrichedGames([]);
      } finally {
        setIsLoadingGames(false);
      }
    }
  }, [classroomId, getAssignedGames, currentUser]);

  useEffect(() => {
    if (classroomData && currentUser) { // Ensure currentUser is available before fetching
      fetchGamesAndAttempts();
    }
  }, [fetchGamesAndAttempts, classroomData, currentUser]);

  const fetchLeaderboard = useCallback(async () => {
    if (classroomId && getClassroomLeaderboard) {
      setIsLoadingLeaderboard(true);
      try {
        const fetchedLeaderboard = await getClassroomLeaderboard(classroomId);
        
        // Fetch badges for each student in the leaderboard
        const leaderboardWithBadges = await Promise.all(fetchedLeaderboard.map(async (entry) => {
          try {
            const response = await api.get<Reward[]>(`/api/rewards?studentId=${entry.studentId}`);
            return { ...entry, rewards: response.data };
          } catch (error) {
            console.error(`Failed to fetch badges for student ${entry.studentId}:`, error);
            return { ...entry, rewards: [] }; // Return empty array on error
          }
        }));

        setLeaderboard(leaderboardWithBadges);
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

  if (isPageLoading || (isLoadingGames && activeTab === 'games')) { // Adjust loading condition
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
          to="/student/classrooms"
          className="btn btn-primary">
          Back to My Classrooms
        </Link>
      </div>
    );
  }
  
  const classroomName = classroomData.classroomName;
  const teacherNameProperty = classroomData.teacherName;

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
            {isLoadingGames ? ( // Check isLoadingGames specifically for this tab
              <div className="flex justify-center py-10"><LoadingSpinner /></div>
            ) : enrichedGames.length === 0 ? (
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
                {enrichedGames.map((enrichedAg: EnrichedAssignedGame) => (
                  <GameCard
                    key={enrichedAg.id}
                    assignedGame={enrichedAg}
                    classroomId={classroomId!}
                    attemptsMade={enrichedAg.attemptsMade}
                    highestScore={enrichedAg.highestScore}
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
                {currentUser && leaderboard.find(entry => entry.studentId === currentUser.id.toString()) && (
                  <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow-sm p-6 border dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 text-primary-text dark:text-primary-text-dark">
                      Your Current Rank
                    </h3>
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
                  </div>
                )}
                <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow-sm overflow-hidden border dark:border-gray-700">
                  <div className="p-4 border-b dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-primary-text dark:text-primary-text-dark">
                      Top Performers
                    </h3>
                  </div>
                  <LeaderboardTable
                    entries={leaderboard.slice(0, 10)}
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