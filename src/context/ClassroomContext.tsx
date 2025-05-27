import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import api from "../services/api";
import {
  User,
  Classroom,
  StudentClassroom,
  CreateClassroomRequestDTO,
  UpdateClassroomRequestDTO,
  AssignedGameDTO,
  LeaderboardEntry,
  BackendUserResponse,
  UserRole,
  GameDTO,
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

interface BackendStudentInClassroomResponse extends BackendUserResponse {
  avatarImage?: string;
}

interface BackendAssignedGameResponse {
  id: number;
  classroom: { id: number; name: string };
  game: {
    activityId: number;
    activityName: string;
    description?: string;
    subject?: string;
    gameMode?: GameDTO['gameMode'];
    isPremade?: boolean;
  };
  deadline: string;
  isPremade: boolean; 
  status?: AssignedGameDTO['status'];
  maxAttempts?: number;
}

interface BackendLeaderboardEntry {
  studentId: number;
  firstName: string;
  lastName: string;
  expAmount: number;
  avatarImage?: string;
}

const CLASSROOM_API_BASE_URL = "/classrooms";
const STUDENT_API_BASE_URL = "/students";

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
    gameToAssign: GameDTO,
    deadline: string,
    maxAttempts?: number
  ) => Promise<AssignedGameDTO | null>;
  getClassroomLeaderboard: (classroomId: string) => Promise<LeaderboardEntry[]>;
  updateClassroom: (
    classroomId: string,
    data: UpdateClassroomRequestDTO
  ) => Promise<Classroom | null>;
  deleteClassroom: (classroomId: string) => Promise<void>;
  removeStudentFromClassroom: (
    classroomId: string,
    studentId: string
  ) => Promise<void>;
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
      const response = await api.get<BackendTeacherClassroomResponse[]>(
        `${CLASSROOM_API_BASE_URL}/teacher/${currentUser.id}`
      );
      setTeacherClassrooms(
        response.data.map(transformBackendTeacherClassroomToFrontend)
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
      const response = await api.get<BackendTeacherClassroomResponse[]>(
        `${STUDENT_API_BASE_URL}/${currentUser.id}/classrooms`
      );
      const classroomsForStudent: StudentClassroom[] = response.data.map(
        (bc) => ({
          classroomId: bc.id.toString(),
          classroomName: bc.name,
          teacherName: `${bc.teacher.firstName} ${bc.teacher.lastName}`.trim(),
          iconUrl: bc.iconUrl,
          activityCount: 0,
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
        const response = await api.post<BackendTeacherClassroomResponse>(
          `${CLASSROOM_API_BASE_URL}`,
          payload
        );
        const newClassroom =
          transformBackendTeacherClassroomToFrontend(response.data);
        setTeacherClassrooms((prev) => [...prev, newClassroom]);
        return newClassroom;
      } catch (error: any) {
        console.error("Error creating classroom:", error);
        throw new Error(error.response?.data?.message || "Failed to create classroom");
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
        const response = await api.post<BackendTeacherClassroomResponse>(
          `${CLASSROOM_API_BASE_URL}/enroll`,
          payload
        );
        const joinedBackendClassroom = response.data;
        const newStudentCls: StudentClassroom = {
          classroomId: joinedBackendClassroom.id.toString(),
          classroomName: joinedBackendClassroom.name,
          teacherName:
            `${joinedBackendClassroom.teacher.firstName} ${joinedBackendClassroom.teacher.lastName}`.trim(),
          iconUrl: joinedBackendClassroom.iconUrl,
        };
        await fetchStudentClassrooms();
        return newStudentCls;
      } catch (error: any) {
        console.error("Error joining classroom:", error);
        throw new Error(error.response?.data?.message || "Failed to join classroom. Invalid code or server error.");
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser, token, fetchStudentClassrooms]
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
      setIsLoading(true);
      try {
        const response = await api.get<BackendAssignedGameResponse[]>(
          `${CLASSROOM_API_BASE_URL}/${classroomId}/games`
        );
        return response.data.map(
          (bg): AssignedGameDTO => ({
            id: bg.id.toString(),
            classroomId: bg.classroom.id.toString(),
            gameId: bg.game.activityId.toString(),
            gameTitle: bg.game.activityName,
            game: { 
              id: bg.game.activityId.toString(),
              title: bg.game.activityName,
              description: bg.game.description,
              subject: bg.game.subject,
              gameMode: bg.game.gameMode,
              isPremade: bg.game.isPremade,
            },
            assignedAt: new Date().toISOString(), 
            dueDate: bg.deadline,
            status: bg.status || 'PENDING',
            maxAttempts: bg.maxAttempts,
          })
        );
      } catch (error) {
        console.error(`Error fetching games for classroom ${classroomId}:`, error);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  const getStudentsInClassroom = useCallback(
    async (classroomId: string): Promise<User[]> => {
      if (!token) throw new Error("Authentication required.");
      try {
        const response = await api.get<BackendStudentInClassroomResponse[]>(
          `${CLASSROOM_API_BASE_URL}/${classroomId}/students`
        );
        return response.data.map((studentDto) => ({
          id: studentDto.id,
          email: studentDto.email,
          firstName: studentDto.firstName,
          lastName: studentDto.lastName,
          name: `${studentDto.firstName} ${studentDto.lastName}`.trim(),
          role: studentDto.role as UserRole,
          avatarUrl: studentDto.avatarImage ||
            `https://api.dicebear.com/7.x/bottts/svg?seed=${studentDto.firstName}${studentDto.lastName}`,
        }));
      } catch (error: any) {
        console.error(`Error fetching students for classroom ${classroomId}:`, error);
        throw new Error(error.response?.data?.message || "Failed to fetch students.");
      }
    },
    [token]
  );

  const assignGameToClassroom = useCallback(
    async (
      classroomId: string,
      gameToAssign: GameDTO,
      deadline: string,
      maxAttempts?: number
    ): Promise<AssignedGameDTO | null> => {
      if (!currentUser || currentUser.role !== "TEACHER" || !token) {
        throw new Error("User must be a logged-in teacher.");
      }
      if (!gameToAssign || typeof gameToAssign.id !== 'string' || gameToAssign.id.trim() === '') {
        console.error("Context: Invalid gameToAssign object or gameToAssign.id:", gameToAssign);
        throw new Error("Invalid game data provided for assignment.");
      }
      
      setIsLoading(true);
      try {
        const gameIdLong = parseInt(gameToAssign.id, 10);
        if (isNaN(gameIdLong)) {
            console.error(`Context: Game ID "${gameToAssign.id}" is not a valid number format.`);
            throw new Error("Invalid game ID format."); 
        }

        // For games assigned from the library, ClassroomGame.isPremade should be true.
        // The GameDTO's isPremade field (gameToAssign.isPremade) refers to the game's nature.
        const isPremadeForAssignmentPayload = true; 

        let queryParams = `gameId=${gameIdLong}&deadline=${encodeURIComponent(
          deadline
        )}&isPremade=${isPremadeForAssignmentPayload}`;
        
        if (maxAttempts !== undefined) {
          queryParams += `&maxAttempts=${maxAttempts}`;
        }

        const response = await api.post<BackendAssignedGameResponse>(
          `${CLASSROOM_API_BASE_URL}/${classroomId}/assign-game?${queryParams}`
        );
        const assignedBackendGame = response.data;
        return {
            id: assignedBackendGame.id.toString(),
            classroomId: assignedBackendGame.classroom.id.toString(),
            gameId: assignedBackendGame.game.activityId.toString(),
            gameTitle: assignedBackendGame.game.activityName,
            assignedAt: new Date().toISOString(), 
            dueDate: assignedBackendGame.deadline,
            status: assignedBackendGame.status || 'PENDING',
            maxAttempts: assignedBackendGame.maxAttempts,
            game: {
                id: assignedBackendGame.game.activityId.toString(),
                title: assignedBackendGame.game.activityName,
                description: assignedBackendGame.game.description,
                subject: assignedBackendGame.game.subject,
                gameMode: assignedBackendGame.game.gameMode,
                isPremade: assignedBackendGame.game.isPremade,
            }
        };
      } catch (error: any) {
        console.error("Error assigning game in Context:", error);
        // Check if the error is the one we threw, or a new one from the API
        if (error.message === "Invalid game ID format.") {
            throw error; // Re-throw the specific error
        }
        throw new Error(error.response?.data?.message || "Failed to assign game.");
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser, token]
  );


  const getClassroomLeaderboard = useCallback(
    async (classroomId: string): Promise<LeaderboardEntry[]> => {
      if (!token) {
        console.error("Auth token not found for getClassroomLeaderboard.");
        return [];
      }
      if (!classroomId) {
        console.error("Classroom ID required for fetching leaderboard.");
        return [];
      }
      try {
        const response = await api.get<BackendLeaderboardEntry[]>(
          `${CLASSROOM_API_BASE_URL}/${classroomId}/leaderboard`
        );
        return response.data
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
      } catch (error: any) {
        console.error("Error fetching classroom leaderboard:", error);
        throw new Error(error.response?.data?.message || "Failed to fetch leaderboard.");
      }
    },
    [token]
  );

  const updateClassroom = useCallback(
    async (classroomId: string, data: UpdateClassroomRequestDTO): Promise<Classroom | null> => {
      if (!token || !currentUser || currentUser.role !== 'TEACHER') {
        throw new Error("Unauthorized or not a teacher.");
      }
      setIsLoading(true);
      try {
        const response = await api.put<BackendTeacherClassroomResponse>(
          `${CLASSROOM_API_BASE_URL}/${classroomId}`,
          data
        );
        const updatedClassroom = transformBackendTeacherClassroomToFrontend(response.data);
        setTeacherClassrooms(prev => prev.map(c => c.id === classroomId ? updatedClassroom : c));
        if (currentClassroom?.id === classroomId) {
            setCurrentClassroomState(updatedClassroom);
        }
        return updatedClassroom;
      } catch (error: any) {
        console.error("Error updating classroom:", error);
        throw new Error(error.response?.data?.message || "Failed to update classroom.");
      } finally {
        setIsLoading(false);
      }
    },
    [token, currentUser, transformBackendTeacherClassroomToFrontend, currentClassroom]
  );

  const deleteClassroom = useCallback(
    async (classroomId: string): Promise<void> => {
      if (!token || !currentUser || currentUser.role !== 'TEACHER') {
        throw new Error("Unauthorized or not a teacher.");
      }
      setIsLoading(true);
      try {
        await api.delete(`${CLASSROOM_API_BASE_URL}/${classroomId}`);
        setTeacherClassrooms(prev => prev.filter(c => c.id !== classroomId));
        if (currentClassroom?.id === classroomId) {
            setCurrentClassroomState(null);
        }
      } catch (error: any) {
        console.error("Error deleting classroom:", error);
        throw new Error(error.response?.data?.message || "Failed to delete classroom.");
      } finally {
        setIsLoading(false);
      }
    },
    [token, currentUser, currentClassroom]
  );

  const removeStudentFromClassroom = useCallback(
    async (classroomId: string, studentId: string): Promise<void> => {
      if (!token || !currentUser || currentUser.role !== 'TEACHER') {
        throw new Error("Unauthorized or not a teacher to perform this action.");
      }
      setIsLoading(true);
      try {
        const classroomIdLong = parseInt(classroomId, 10);
        const studentIdLong = parseInt(studentId, 10);

        if (isNaN(classroomIdLong) || isNaN(studentIdLong)) {
            throw new Error("Invalid Classroom or Student ID format.");
        }

        await api.delete(`${CLASSROOM_API_BASE_URL}/${classroomIdLong}/students/${studentIdLong}`);
        
        await fetchTeacherClassrooms();

      } catch (error: any) {
        console.error(`Error removing student ${studentId} from classroom ${classroomId}:`, error);
        throw new Error(error.response?.data?.message || "Failed to remove student from classroom.");
      } finally {
        setIsLoading(false);
      }
    },
    [token, currentUser, fetchTeacherClassrooms]
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
        updateClassroom,
        deleteClassroom,
        removeStudentFromClassroom,
      }}
    >
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