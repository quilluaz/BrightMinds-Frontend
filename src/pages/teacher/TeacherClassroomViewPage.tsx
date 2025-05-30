import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Users,
  BookOpen,
  Settings,
  Copy,
  AlertTriangle,
  Library,
  Trash2,
  Check,
  UserX,
  Eye,
} from "lucide-react";
import { useClassroom } from "../../context/ClassroomContext";
import Button from "../../components/common/Button";
import GameCard from "../../components/common/GameCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import LeaderboardTable from "../../components/common/LeaderboardTable";
import ClassroomSettingsModal from "../../components/teacher/ClassroomSettingsModal";
import Modal from "../../components/common/Modal";
import {
  Classroom,
  AssignedGameDTO,
  LeaderboardEntry,
  User as StudentUser,
} from "../../types";
import { useAuth } from "../../context/AuthContext";
import ClassroomStatistics from "../../components/teacher/ClassroomStatistics";
import GameStatisticsModal from "../../components/teacher/GameStatisticsModal";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "games", label: "Games" },
  { key: "students", label: "Students" },
  { key: "leaderboard", label: "Leaderboard" },
];

const TeacherClassroomViewPage: React.FC = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const {
    teacherClassrooms,
    getAssignedGames,
    getClassroomLeaderboard,
    getStudentsInClassroom,
    fetchTeacherClassrooms,
    removeStudentFromClassroom,
    deleteClassroom,
    updateClassroom,
  } = useClassroom();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [assignedGames, setAssignedGames] = useState<AssignedGameDTO[]>([]);
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [averageScore, setAverageScore] = useState<number | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const [isRemoveStudentModalOpen, setIsRemoveStudentModalOpen] =
    useState(false);
  const [studentToRemove, setStudentToRemove] = useState<StudentUser | null>(
    null
  );
  const [removeStudentError, setRemoveStudentError] = useState<string | null>(
    null
  );

  const [isGameStatsModalOpen, setIsGameStatsModalOpen] = useState(false);
  const [selectedAssignedGame, setSelectedAssignedGame] =
    useState<AssignedGameDTO | null>(null);

  const fetchClassroomData = useCallback(
    async (forceRefreshContext = false) => {
      if (!classroomId) {
        navigate("/teacher/classrooms");
        return;
      }
      setIsLoading(true);

      if (forceRefreshContext && fetchTeacherClassrooms) {
        await fetchTeacherClassrooms();
      }

      try {
        // Use the latest from context, which might have been updated by forceRefreshContext
        const currentClassrooms = teacherClassrooms;
        const foundClassroom = currentClassrooms.find(
          (c) => c.id === classroomId
        );

        if (foundClassroom) {
          setClassroom(foundClassroom);

          const [gamesData, studentsData, leaderboardData] = await Promise.all([
            getAssignedGames
              ? getAssignedGames(classroomId)
              : Promise.resolve([]),
            getStudentsInClassroom
              ? getStudentsInClassroom(classroomId)
              : Promise.resolve([]),
            getClassroomLeaderboard
              ? getClassroomLeaderboard(classroomId)
              : Promise.resolve([]),
          ]);

          setAssignedGames(gamesData);
          setStudents(studentsData);
          setLeaderboard(leaderboardData);

          if (leaderboardData.length > 0) {
            const totalScore = leaderboardData.reduce(
              (sum, entry) => sum + entry.score,
              0
            );
            setAverageScore(Math.round(totalScore / leaderboardData.length));
          } else {
            setAverageScore(0);
          }
        } else {
          console.warn(
            "Classroom not found in context after potential refresh, redirecting."
          );
          // If still not found after context refresh, then redirect.
          if (forceRefreshContext || teacherClassrooms.length > 0) {
            // Avoid redirect if context was empty initially and hasn't loaded
            navigate("/teacher/classrooms");
          }
        }
      } catch (error) {
        console.error("Failed to fetch classroom data:", error);
        navigate("/teacher/classrooms");
      } finally {
        setIsLoading(false);
      }
    },
    [
      classroomId,
      getAssignedGames,
      getStudentsInClassroom,
      getClassroomLeaderboard,
      navigate,
      fetchTeacherClassrooms,
      teacherClassrooms,
    ]
  );

  useEffect(() => {
    fetchClassroomData();
  }, [fetchClassroomData]);

  const handleAssignmentUpdatedOrDeleted = useCallback(() => {
    // Refetch assigned games primarily, or full classroom data if other stats might change
    if (classroomId && getAssignedGames) {
      setIsLoading(true); // Indicate loading for the games list or relevant sections
      getAssignedGames(classroomId)
        .then((gamesData) => {
          setAssignedGames(gamesData);
          // If activityCount on the classroom object needs update, refetch classroom object
          // This could be part of a broader fetchClassroomData(true) call if necessary
          // For now, just focusing on assigned games list.
          if (fetchTeacherClassrooms) {
            // Also refetch classroom details if student count might change
            fetchTeacherClassrooms().then(() => {
              const updatedClassroom = teacherClassrooms.find(
                (c) => c.id === classroomId
              );
              if (updatedClassroom) setClassroom(updatedClassroom);
            });
          }
        })
        .catch((error) =>
          console.error("Failed to refresh assigned games:", error)
        )
        .finally(() => setIsLoading(false));
    }
  }, [
    classroomId,
    getAssignedGames,
    fetchTeacherClassrooms,
    teacherClassrooms,
  ]);

  const handleOpenGameStatsModal = (game: AssignedGameDTO) => {
    setSelectedAssignedGame(game);
    setIsGameStatsModalOpen(true);
  };

  const handleCloseGameStatsModal = () => {
    setIsGameStatsModalOpen(false);
    setSelectedAssignedGame(null);
  };

  const handleCopyCode = () => {
    if (classroom?.code) {
      navigator.clipboard
        .writeText(classroom.code)
        .then(() => {
          setCodeCopied(true);
          setTimeout(() => setCodeCopied(false), 2000);
        })
        .catch((err) => console.error("Failed to copy class code: ", err));
    }
  };

  const openRemoveStudentModal = (student: StudentUser) => {
    setStudentToRemove(student);
    setRemoveStudentError(null);
    setIsRemoveStudentModalOpen(true);
  };

  const closeRemoveStudentModal = () => {
    setStudentToRemove(null);
    setIsRemoveStudentModalOpen(false);
    setRemoveStudentError(null);
  };

  const confirmRemoveStudent = async () => {
    if (
      !studentToRemove ||
      !classroomId ||
      !removeStudentFromClassroom ||
      !getStudentsInClassroom
    )
      return;

    setIsLoadingAction(true);
    setRemoveStudentError(null);
    try {
      await removeStudentFromClassroom(
        classroomId,
        studentToRemove.id.toString()
      );
      const updatedStudents = await getStudentsInClassroom(classroomId);
      setStudents(updatedStudents);
      // Refetch classroom details from context to update studentCount display
      if (fetchTeacherClassrooms) {
        await fetchTeacherClassrooms(); // This updates teacherClassrooms in context
        const updatedClassroomInContext = teacherClassrooms.find(
          (c) => c.id === classroomId
        );
        if (updatedClassroomInContext) {
          setClassroom(updatedClassroomInContext);
        }
      }
      closeRemoveStudentModal();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred.";
      console.error("Error removing student:", error);
      setRemoveStudentError(`Failed to remove student: ${errorMessage}`);
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleDeleteClassroom = async () => {
    if (!classroomId || !deleteClassroom) return;

    setIsLoadingAction(true);
    try {
      await deleteClassroom(classroomId);
      navigate("/teacher/classrooms");
    } catch (error) {
      console.error("Error deleting classroom:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoadingAction(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4 text-primary-text dark:text-primary-text-dark">
          Classroom Not Found
        </h2>
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          The classroom you are looking for does not exist or you may not have
          access.
        </p>
        <Link to="/teacher/classrooms" className="btn btn-primary">
          Back to My Classrooms
        </Link>
      </div>
    );
  }

  const studentCount = classroom.studentCount || students.length; // Fallback to live students length if studentCount isn't updated fast enough
  const activityCount = assignedGames.length;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <header className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary-text dark:text-primary-text-dark">
              {classroom.name}
            </h1>
            {classroom.description && (
              <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-2xl">
                {classroom.description}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            {classroom.code && (
              <div className="flex items-baseline mr-2">
                <span className="text-sm font-semibold text-primary-text dark:text-primary-text-dark mr-1.5 uppercase">
                  Code:
                </span>
                <span className="font-mono text-3xl font-bold text-primary-text dark:text-primary-text-dark mr-1.5 tracking-wider">
                  {classroom.code}
                </span>
                <Button
                  variant="text"
                  size="sm"
                  onClick={handleCopyCode}
                  icon={
                    codeCopied ? (
                      <Check size={16} className="text-green-500" />
                    ) : (
                      <Copy size={16} />
                    )
                  }
                  className="!p-1 text-gray-500 dark:text-gray-400 hover:text-primary-text dark:hover:text-primary-text-dark self-center"
                  aria-label="Copy class code"
                />
              </div>
            )}
            <Button
              variant="primary"
              size="md"
              icon={<Library size={18} />}
              onClick={() =>
                navigate(`/teacher/classrooms/${classroomId}/assign-game`)
              }
              className="whitespace-nowrap">
              Assign Game
            </Button>
            <Button
              variant="outline"
              size="md"
              icon={<Settings size={18} />}
              onClick={() => setIsSettingsModalOpen(true)}>
              Settings
            </Button>
          </div>
        </div>
      </header>

      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav
          className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto pb-px"
          aria-label="Tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                whitespace-nowrap py-3 px-1 sm:py-4 sm:px-1 border-b-2 font-medium text-sm transition-colors duration-200
                ${
                  activeTab === tab.key
                    ? "border-primary-interactive text-primary-interactive dark:border-primary-interactive-dark dark:text-primary-interactive-dark"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600"
                }
              `}>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === "overview" && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-semibold mb-6 text-primary-text dark:text-primary-text-dark">
              Classroom Statistics
            </h2>
            <ClassroomStatistics
              leaderboard={leaderboard}
              assignedGames={assignedGames}
              averageScore={averageScore}
              totalStudents={studentCount}
            />
          </div>
        )}

        {activeTab === "games" && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-primary-text dark:text-primary-text-dark">
                Learning Activities ({activityCount})
              </h2>
            </div>
            {assignedGames.length === 0 ? (
              <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow-sm p-8 text-center border-2 border-dashed dark:border-gray-700">
                <AlertTriangle
                  size={40}
                  className="mx-auto mb-4 text-yellow-500"
                />
                <h3 className="text-xl font-semibold mb-2 text-primary-text dark:text-primary-text-dark">
                  No Activities Assigned Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Assign games and learning activities to engage your students
                  from the "Assign Game" button above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignedGames.map((ag) => (
                  <GameCard
                    key={ag.id}
                    assignedGame={ag}
                    classroomId={classroomId!}
                    onOpenStatsModal={handleOpenGameStatsModal}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "students" && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-primary-text dark:text-primary-text-dark">
                Enrolled Students ({studentCount})
              </h2>
            </div>
            {students.length === 0 ? (
              <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow-sm p-8 text-center border-2 border-dashed dark:border-gray-700">
                <Users size={40} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2 text-primary-text dark:text-primary-text-dark">
                  No Students Enrolled
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Share the classroom code{" "}
                  <code className="font-mono bg-gray-100 dark:bg-slate-700 p-1 rounded">
                    {classroom.code}
                  </code>{" "}
                  with your students to let them join.
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow-sm overflow-hidden border dark:border-gray-700">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-slate-800">
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                        Name
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                        Email
                      </th>
                      <th className="py-3 px-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {students.map((student) => (
                      <tr
                        key={student.id.toString()}
                        className="hover:bg-gray-50 dark:hover:bg-slate-700">
                        <td className="py-3 px-4 whitespace-nowrap text-primary-text dark:text-primary-text-dark">
                          <div className="flex items-center">
                            <img
                              src={
                                student.avatarUrl ||
                                `https://api.dicebear.com/7.x/bottts/svg?seed=${student.firstName}${student.lastName}`
                              }
                              alt={student.name}
                              className="w-8 h-8 rounded-full mr-3"
                            />
                            {student.name}
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-primary-text dark:text-primary-text-dark">
                          {student.email}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <Button
                            variant="text"
                            size="sm"
                            className="mr-2 opacity-50 cursor-not-allowed"
                            title="Student progress view not implemented">
                            View Progress
                          </Button>
                          <Button
                            variant="text"
                            size="sm"
                            onClick={() => openRemoveStudentModal(student)}
                            className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-700/20"
                            icon={<Trash2 size={14} />}>
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-semibold mb-6 text-primary-text dark:text-primary-text-dark">
              Classroom Leaderboard
            </h2>
            {leaderboard.length === 0 ? (
              <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow-sm p-8 text-center border dark:border-gray-700">
                <h3 className="text-xl font-semibold mb-2 text-primary-text dark:text-primary-text-dark">
                  Leaderboard is Empty
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  No scores recorded yet. Scores will appear here as students
                  complete activities.
                </p>
              </div>
            ) : (
              <LeaderboardTable
                entries={leaderboard}
                highlightedUserId={currentUser?.id.toString()}
              />
            )}
          </div>
        )}
      </div>

      {classroom && (
        <ClassroomSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => {
            setIsSettingsModalOpen(false);
            // Refetch classroom data to reflect any name/description changes in the header
            fetchClassroomData(true); // Pass true to force context refresh
          }}
          classroom={classroom}
          onUpdate={async (name, description) => {
            if (!classroomId) return;
            setIsLoadingAction(true);
            try {
              await updateClassroom(classroomId, { name, description });
              await fetchClassroomData(true);
            } catch (error) {
              console.error("Error updating classroom:", error);
              throw error;
            } finally {
              setIsLoadingAction(false);
            }
          }}
          onDelete={handleDeleteClassroom}
        />
      )}

      {studentToRemove && (
        <Modal
          isOpen={isRemoveStudentModalOpen}
          onClose={closeRemoveStudentModal}
          title="Confirm Student Removal"
          size="sm"
          footer={
            <>
              <Button
                variant="text"
                onClick={closeRemoveStudentModal}
                disabled={isLoadingAction}>
                Cancel
              </Button>
              <Button
                variant="energetic"
                onClick={confirmRemoveStudent}
                isLoading={isLoadingAction}
                icon={<UserX size={16} />}>
                Yes, Remove Student
              </Button>
            </>
          }>
          <div className="text-center">
            <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
            <p className="text-lg font-medium text-primary-text dark:text-primary-text-dark">
              Are you sure you want to remove{" "}
              <span className="font-bold">{studentToRemove.name}</span> from
              this classroom?
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              This action will unenroll the student. Their past progress might
              be retained if they rejoin, but they will lose access until then.
            </p>
            {removeStudentError && (
              <p className="text-red-500 text-xs mt-3 bg-red-100 dark:bg-red-900/30 p-2 rounded-md">
                {removeStudentError}
              </p>
            )}
          </div>
        </Modal>
      )}

      {selectedAssignedGame && classroomId && (
        <GameStatisticsModal
          isOpen={isGameStatsModalOpen}
          onClose={handleCloseGameStatsModal}
          assignedGame={selectedAssignedGame}
          classroomId={classroomId}
          onAssignmentUpdatedOrDeleted={handleAssignmentUpdatedOrDeleted}
        />
      )}
    </div>
  );
};

export default TeacherClassroomViewPage;
