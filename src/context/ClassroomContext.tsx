import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import {
  User,
  Classroom,
  StudentClassroom,
  CreateClassroomRequestDTO,
  AssignedGameDTO,
  LeaderboardEntry,
  BackendUserResponse,
} from "../types";

interface BackendTeacherClassroomResponse {
  id: number;
  name: string;
  description?: string;
  teacher: BackendUserResponse;
  students?: BackendUserResponse[];
  joinCode: string;
  iconUrl?: string;
}

interface BackendAssignedGameResponse {
  id: number;
  classroom: { id: number; name: string };
  game: {
    activityId: number;
    activityName: string;
    description?: string;
    subject?: string;
  };
  deadline: string;
  isPremade: boolean;
}

interface BackendLeaderboardEntry {
  studentId: number;
  firstName: string;
  lastName: string;
  expAmount: number;
  avatarImage?: string;
}

const CLASSROOM_API_BASE_URL = "http://localhost:8080/api/classrooms";
const STUDENT_API_BASE_URL = "http://localhost:8080/api/students";

interface ClassroomContextType {
  teacherClassrooms: Classroom[];
  studentClassrooms: StudentClassroom[];
  fetchStudentClassrooms: () => Promise<void>;
  currentClassroom: Classroom | null;
  isLoading: boolean;
  fetchTeacherClassrooms: () => Promise<void>;
  createClassroom: (
    data: CreateClassroomRequestDTO
  ) => Promise<Classroom | null>;
  joinClassroom: (code: string) => Promise<StudentClassroom | null>;
  setCurrentClassroom: (classroom: Classroom | null) => void;
  getAssignedGames: (classroomId: string) => Promise<AssignedGameDTO[]>;
  getStudentsInClassroom: (classroomId: string) => Promise<User[]>;
  assignGameToClassroom: (
    classroomId: string,
    gameId: string,
    deadline: string,
    isPremade: boolean
  ) => Promise<AssignedGameDTO | null>;
  getClassroomLeaderboard: (classroomId: string) => Promise<LeaderboardEntry[]>;
}

const ClassroomContext = createContext<ClassroomContextType | undefined>(
  undefined
);

export const ClassroomProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { currentUser, token } = useAuth();
  const [teacherClassrooms, setTeacherClassrooms] = useState<Classroom[]>([]);
  const [studentClassrooms, setStudentClassrooms] = useState<
    StudentClassroom[]
  >([]);
  const [currentClassroom, setCurrentClassroomState] =
    useState<Classroom | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const transformBackendTeacherClassroomToFrontend = useCallback(
    (dto: BackendTeacherClassroomResponse): Classroom => {
      return {
        id: dto.id.toString(),
        name: dto.name,
        description: dto.description,
        teacherId: dto.teacher.id.toString(),
        teacherName: `${dto.teacher.firstName} ${dto.teacher.lastName}`.trim(),
        code: dto.joinCode,
        studentCount: dto.students ? dto.students.length : 0,
        activityCount: 0,
        iconUrl: dto.iconUrl,
      };
    },
    []
  );

  const fetchTeacherClassrooms = useCallback(async () => {
    if (!currentUser || currentUser.role !== "TEACHER" || !token) {
      setTeacherClassrooms([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `${CLASSROOM_API_BASE_URL}/teacher/${currentUser.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch teacher classrooms");
      const data: BackendTeacherClassroomResponse[] = await response.json();
      setTeacherClassrooms(
        data.map(transformBackendTeacherClassroomToFrontend)
      );
    } catch (error) {
      console.error("Error fetching teacher classrooms:", error);
      setTeacherClassrooms([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, token, transformBackendTeacherClassroomToFrontend]);

  const fetchStudentClassrooms = useCallback(async () => {
    if (!currentUser || currentUser.role !== "STUDENT" || !token) {
      setStudentClassrooms([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `${STUDENT_API_BASE_URL}/${currentUser.id}/classrooms`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch student classrooms");
      }
      const backendClassrooms: BackendTeacherClassroomResponse[] =
        await response.json();
      const classroomsForStudent: StudentClassroom[] = backendClassrooms.map(
        (bc) => ({
          classroomId: bc.id.toString(),
          classroomName: bc.name,
          teacherName: `${bc.teacher.firstName} ${bc.teacher.lastName}`.trim(),
          iconUrl: bc.iconUrl,
        })
      );
      setStudentClassrooms(classroomsForStudent);
    } catch (error) {
      console.error("Error fetching student classrooms:", error);
      setStudentClassrooms([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, token]);

  useEffect(() => {
    if (currentUser && token) {
      if (currentUser.role === "TEACHER") {
        fetchTeacherClassrooms();
        setStudentClassrooms([]);
      } else if (currentUser.role === "STUDENT") {
        fetchStudentClassrooms();
        setTeacherClassrooms([]);
      }
    } else {
      setTeacherClassrooms([]);
      setStudentClassrooms([]);
    }
  }, [currentUser, token, fetchTeacherClassrooms, fetchStudentClassrooms]);

  const createClassroom = useCallback(
    async (data: CreateClassroomRequestDTO): Promise<Classroom | null> => {
      if (!currentUser || currentUser.role !== "TEACHER" || !token) {
        throw new Error("User must be a logged-in teacher.");
      }
      setIsLoading(true);
      try {
        const payload = {
          name: data.name,
          description: data.description,
          teacherId: currentUser.id,
        };
        const response = await fetch(`${CLASSROOM_API_BASE_URL}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `Failed to create classroom: ${response.status}`
          );
        }
        const newBackendClassroom: BackendTeacherClassroomResponse =
          await response.json();
        const newClassroom =
          transformBackendTeacherClassroomToFrontend(newBackendClassroom);
        setTeacherClassrooms((prev) => [...prev, newClassroom]);
        return newClassroom;
      } catch (error) {
        console.error("Error creating classroom:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser, token, transformBackendTeacherClassroomToFrontend]
  );

  const joinClassroom = useCallback(
    async (code: string): Promise<StudentClassroom | null> => {
      if (!currentUser || !token || currentUser.role !== "STUDENT") {
        throw new Error(
          "User must be a logged-in student to join a classroom."
        );
      }
      setIsLoading(true);
      try {
        const payload = { studentId: currentUser.id, joinCode: code };
        const response = await fetch(`${CLASSROOM_API_BASE_URL}/enroll`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: "Failed to join classroom" }));
          throw new Error(
            errorData.message || `Failed to join classroom: ${response.status}`
          );
        }
        const joinedBackendClassroom: BackendTeacherClassroomResponse =
          await response.json();
        const newStudentCls: StudentClassroom = {
          classroomId: joinedBackendClassroom.id.toString(),
          classroomName: joinedBackendClassroom.name,
          teacherName:
            `${joinedBackendClassroom.teacher.firstName} ${joinedBackendClassroom.teacher.lastName}`.trim(),
          iconUrl: joinedBackendClassroom.iconUrl,
        };
        setStudentClassrooms((prev) => [...prev, newStudentCls]);
        return newStudentCls;
      } catch (error) {
        console.error("Error joining classroom:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser, token]
  );

  const setCurrentClassroom = useCallback(
    (classroom: Classroom | null): void => {
      setCurrentClassroomState(classroom);
    },
    []
  );

  const getAssignedGames = useCallback(
    async (classroomId: string): Promise<AssignedGameDTO[]> => {
      if (!token) throw new Error("Authentication required.");
      try {
        const response = await fetch(
          `${CLASSROOM_API_BASE_URL}/${classroomId}/games`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch games for classroom");
        }
        const backendGames: BackendAssignedGameResponse[] =
          await response.json();

        const assignedGamesFrontend: AssignedGameDTO[] = backendGames.map(
          (bg) => ({
            id: bg.id.toString(),
            classroomId: bg.classroom.id.toString(),
            gameId: bg.game.activityId.toString(),
            gameTitle: bg.game.activityName,
            assignedAt: new Date().toISOString(),
            dueDate: bg.deadline,
            // The 'game' object for full details isn't part of the standard AssignedGameDTO type,
            // but if your backend sends it like in BackendAssignedGameResponse, you can include it
            // by extending AssignedGameDTO or handling it appropriately in the component.
            // For now, sticking to the defined AssignedGameDTO.
            // If GameCard needs more, it would fetch game details by gameId or AssignedGameDTO needs 'game?: GameDTO'.
          })
        );
        return assignedGamesFrontend;
      } catch (error) {
        console.error("Error fetching games for classroom:", error);
        return [];
      }
    },
    [token]
  );

  const getStudentsInClassroom = useCallback(
    async (classroomId: string): Promise<User[]> => {
      if (!token) throw new Error("Authentication required.");
      try {
        const response = await fetch(
          `${CLASSROOM_API_BASE_URL}/${classroomId}/students`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Failed to fetch students: ${response.status}`
          );
        }
        const studentsData: BackendUserResponse[] = await response.json();
        return studentsData.map((student) => ({
          id: student.id,
          email: student.email,
          firstName: student.firstName,
          lastName: student.lastName,
          name: `${student.firstName} ${student.lastName}`.trim(),
          role: student.role,
          avatarUrl:
            (student as any).avatarImage ||
            (student as any).profilePhoto ||
            `https://api.dicebear.com/7.x/bottts/svg?seed=${student.firstName}${student.lastName}`,
        }));
      } catch (error) {
        console.error("Error fetching students in classroom:", error);
        return [];
      }
    },
    [token]
  );

  const assignGameToClassroom = useCallback(
    async (
      classroomId: string,
      gameId: string,
      deadline: string,
      isPremade: boolean
    ): Promise<AssignedGameDTO | null> => {
      if (!currentUser || currentUser.role !== "TEACHER" || !token) {
        throw new Error("User must be a logged-in teacher.");
      }
      setIsLoading(true);
      try {
        const response = await fetch(
          `${CLASSROOM_API_BASE_URL}/${classroomId}/assign-game?gameId=${gameId}&deadline=${encodeURIComponent(
            deadline
          )}&isPremade=${isPremade}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Failed to assign game: ${response.status}`
          );
        }
        const assignedBackendGame: BackendAssignedGameResponse =
          await response.json();
        const newAssignedGame: AssignedGameDTO = {
          id: assignedBackendGame.id.toString(),
          classroomId: assignedBackendGame.classroom.id.toString(),
          gameId: assignedBackendGame.game.activityId.toString(),
          gameTitle: assignedBackendGame.game.activityName,
          assignedAt: new Date().toISOString(),
          dueDate: assignedBackendGame.deadline,
        };
        return newAssignedGame;
      } catch (error) {
        console.error("Error assigning game:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser, token]
  );

  const getClassroomLeaderboard = useCallback(
    async (classroomId: string): Promise<LeaderboardEntry[]> => {
      if (!token) {
        console.error(
          "Authentication token not found for getClassroomLeaderboard."
        );
        return [];
      }
      if (!classroomId) {
        console.error("Classroom ID is required for fetching leaderboard.");
        return [];
      }
      try {
        const response = await fetch(
          `${CLASSROOM_API_BASE_URL}/${classroomId}/leaderboard`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          const errorBody = await response.text();
          console.error(
            `Failed to fetch leaderboard: ${response.status}`,
            errorBody
          );
          throw new Error(`Failed to fetch leaderboard: ${response.status}`);
        }
        const studentsWithScores: BackendLeaderboardEntry[] =
          await response.json();
        const leaderboardEntries: LeaderboardEntry[] = studentsWithScores
          .sort((a, b) => (b.expAmount || 0) - (a.expAmount || 0))
          .map((student, index) => ({
            studentId: student.studentId.toString(),
            studentName: `${student.firstName} ${student.lastName}`.trim(),
            score: student.expAmount || 0,
            rank: index + 1,
            avatarUrl:
              student.avatarImage ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${student.firstName}${student.lastName}`,
          }));
        return leaderboardEntries;
      } catch (error) {
        console.error("Error fetching classroom leaderboard:", error);
        return [];
      }
    },
    [token]
  );

  return (
    <ClassroomContext.Provider
      value={{
        teacherClassrooms,
        studentClassrooms,
        fetchStudentClassrooms,
        currentClassroom,
        isLoading,
        fetchTeacherClassrooms,
        createClassroom,
        joinClassroom,
        setCurrentClassroom,
        getAssignedGames,
        getStudentsInClassroom,
        assignGameToClassroom,
        getClassroomLeaderboard,
      }}>
      {children}
    </ClassroomContext.Provider>
  );
};

export const useClassroom = (): ClassroomContextType => {
  const context = useContext(ClassroomContext);
  if (context === undefined) {
    throw new Error("useClassroom must be used within a ClassroomProvider");
  }
  return context;
};
