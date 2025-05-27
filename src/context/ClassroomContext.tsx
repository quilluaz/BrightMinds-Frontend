import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import api from "../services/api"; // Import the pre-configured axios instance
import {
  User,
  Classroom,
  StudentClassroom,
  CreateClassroomRequestDTO,
  UpdateClassroomRequestDTO,
  AssignedGameDTO,
  LeaderboardEntry,
  BackendUserResponse,
  UserRole, // Added UserRole for clarity
} from "../types";

interface BackendTeacherClassroomResponse {
  id: number;
  name: string;
  description?: string;
  teacher: BackendUserResponse;
  students?: BackendUserResponse[]; // This is a list of students in the classroom
  joinCode: string;
  iconUrl?: string;
  // Add other fields if your backend classroom response includes them (e.g., activityCount directly)
}

interface BackendStudentInClassroomResponse extends BackendUserResponse {
  // Student-specific fields if any, beyond User fields
  // For now, assuming BackendUserResponse is sufficient for student details from /students endpoint
}


interface BackendAssignedGameResponse {
  id: number;
  classroom: { id: number; name: string }; // Simplified classroom info
  game: { // Assuming Game DTO from backend
    activityId: number; // Matches GameDTO 'id' (string in frontend, number in backend)
    activityName: string; // Matches GameDTO 'title'
    description?: string;
    subject?: string;
    // gameMode: string; // if available from backend
  };
  deadline: string; // ISO date string
  isPremade: boolean; // Added this field
  // Add other relevant fields from your backend response, like status
}


interface BackendLeaderboardEntry {
  studentId: number;
  firstName: string;
  lastName: string;
  expAmount: number;
  avatarImage?: string;
}

// No change needed to CLASSROOM_API_BASE_URL or STUDENT_API_BASE_URL
const CLASSROOM_API_BASE_URL = "/classrooms"; // Using relative path as api instance has baseURL
const STUDENT_API_BASE_URL = "/students"; // Using relative path


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
    gameId: string, // gameId should be string if your frontend GameDTO uses string ID
    deadline: string, // ISO string
    isPremade: boolean
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
        // Calculate studentCount based on the length of the students array from backend
        studentCount: dto.students ? dto.students.length : 0,
        activityCount: 0, // This would ideally be calculated based on assigned games or fetched
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
      // Assuming currentUser.id is a number as per User type, but API might expect string or number
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
      const response = await api.get<BackendTeacherClassroomResponse[]>( // Backend returns full classroom details
        `${STUDENT_API_BASE_URL}/${currentUser.id}/classrooms`
      );
      const classroomsForStudent: StudentClassroom[] = response.data.map(
        (bc) => ({
          classroomId: bc.id.toString(),
          classroomName: bc.name,
          teacherName: `${bc.teacher.firstName} ${bc.teacher.lastName}`.trim(),
          iconUrl: bc.iconUrl,
          activityCount: 0, // Placeholder
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
        setStudentClassrooms([]); // Clear student classrooms if user is a teacher
      } else if (currentUser.role === "STUDENT") {
        fetchStudentClassrooms();
        setTeacherClassrooms([]); // Clear teacher classrooms if user is a student
      }
    } else {
      // Clear both if no user or token (logged out)
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
        const payload = { // Ensure payload matches backend DTO expectations
          name: data.name,
          description: data.description,
          teacherId: currentUser.id, // Assuming backend expects teacherId in payload
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
        const response = await api.post<BackendTeacherClassroomResponse>( // Backend returns the enrolled classroom details
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
          // activityCount could be fetched/updated separately if needed
        };
        fetchStudentClassrooms(); // Refetch all student classrooms to update the list
        return newStudentCls;
      } catch (error: any) {
        console.error("Error joining classroom:", error);
        throw new Error(error.response?.data?.message || "Failed to join classroom. Invalid code or server error.");
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser, token, fetchStudentClassrooms] // Added fetchStudentClassrooms
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
            game: { // Embedding GameDTO structure
              id: bg.game.activityId.toString(),
              title: bg.game.activityName,
              description: bg.game.description,
              subject: bg.game.subject,
              // gameMode: bg.game.gameMode as GameDTO['gameMode'], // if available
            },
            assignedAt: new Date().toISOString(), // Placeholder if not from backend
            dueDate: bg.deadline,
            status: 'PENDING' // Placeholder; ideally, status comes from backend
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
      // setIsLoading(true); // Avoid global loading for this specific fetch if not desired
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
          avatarUrl: (studentDto as any).avatarImage || // Use avatarImage from Student model if present
            `https://api.dicebear.com/7.x/bottts/svg?seed=${studentDto.firstName}${studentDto.lastName}`,
        }));
      } catch (error: any) {
        console.error(`Error fetching students for classroom ${classroomId}:`, error);
        throw new Error(error.response?.data?.message || "Failed to fetch students.");
      } finally {
        // setIsLoading(false);
      }
    },
    [token]
  );

  const assignGameToClassroom = useCallback(
    async (
      classroomId: string,
      gameId: string, // Should be string if GameDTO.id is string
      deadline: string, // ISO string
      isPremade: boolean
    ): Promise<AssignedGameDTO | null> => {
      if (!currentUser || currentUser.role !== "TEACHER" || !token) {
        throw new Error("User must be a logged-in teacher.");
      }
      setIsLoading(true);
      try {
        // Backend expects Long for gameId, ensure conversion if gameId is string
        const gameIdLong = parseInt(gameId, 10);
        if (isNaN(gameIdLong)) {
            throw new Error("Invalid game ID format.");
        }

        const response = await api.post<BackendAssignedGameResponse>(
          `${CLASSROOM_API_BASE_URL}/${classroomId}/assign-game?gameId=${gameIdLong}&deadline=${encodeURIComponent(
            deadline
          )}&isPremade=${isPremade}`
          // No body if params are in URL
        );
        const assignedBackendGame = response.data;
        return {
            id: assignedBackendGame.id.toString(),
            classroomId: assignedBackendGame.classroom.id.toString(),
            gameId: assignedBackendGame.game.activityId.toString(),
            gameTitle: assignedBackendGame.game.activityName,
            assignedAt: new Date().toISOString(), // Placeholder
            dueDate: assignedBackendGame.deadline,
            status: 'PENDING', // Placeholder
            game: {
                id: assignedBackendGame.game.activityId.toString(),
                title: assignedBackendGame.game.activityName,
                description: assignedBackendGame.game.description,
                subject: assignedBackendGame.game.subject,
            }
        };
      } catch (error: any) {
        console.error("Error assigning game:", error);
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
      // setIsLoading(true); // Consider if global loading is desired here
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
      } finally {
        // setIsLoading(false);
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
      setIsLoading(true); // Or a more specific loading state for this action
      try {
        // The backend expects Long for IDs, ensure conversion if they are strings
        const classroomIdLong = parseInt(classroomId, 10);
        const studentIdLong = parseInt(studentId, 10);

        if (isNaN(classroomIdLong) || isNaN(studentIdLong)) {
            throw new Error("Invalid Classroom or Student ID format.");
        }

        await api.delete(`${CLASSROOM_API_BASE_URL}/${classroomIdLong}/students/${studentIdLong}`);
        
        // Optimistically update UI or refetch
        // To update student count, refetch teacher classrooms or the specific classroom
        fetchTeacherClassrooms(); // This will update student counts if backend provides it
                                 // and classroom details on TeacherClassroomViewPage if it uses this context.

      } catch (error: any) {
        console.error(`Error removing student ${studentId} from classroom ${classroomId}:`, error);
        throw new Error(error.response?.data?.message || "Failed to remove student from classroom.");
      } finally {
        setIsLoading(false);
      }
    },
    [token, currentUser, fetchTeacherClassrooms] // Added fetchTeacherClassrooms
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