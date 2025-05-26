// src/context/ClassroomContext.tsx
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
  BackendUserResponse, // For transforming backend responses
} from "../types";

// Define the actual structure returned by your backend for a Classroom object
interface BackendClassroomResponse {
  id: number;
  name: string;
  description?: string;
  teacher: BackendUserResponse;
  students?: BackendUserResponse[];
  joinCode: string;
  iconUrl?: string; // If you add this to your backend Classroom model
}

// Define the actual structure for a Game assigned to a classroom from backend
interface BackendClassroomGameResponse {
    id: number;
    classroom: BackendClassroomResponse;
    game: BackendGameResponse; // Define BackendGameResponse based on your Game model
    deadline: string;
    isPremade: boolean;
}

interface BackendGameResponse {
  activityId: number;
  activityName: string;
  // ... other relevant fields from your Game model
}

const CLASSROOM_API_BASE_URL = "http://localhost:8080/api/classrooms";
const STUDENT_API_BASE_URL = "http://localhost:8080/api/students"; // For student-specific endpoints

interface ClassroomContextType {
  teacherClassrooms: Classroom[];
  studentClassrooms: StudentClassroom[];
  fetchStudentClassrooms: () => Promise<void>; // Added
  currentClassroom: Classroom | null;
  isLoading: boolean;
  fetchTeacherClassrooms: () => Promise<void>;
  createClassroom: (data: CreateClassroomRequestDTO) => Promise<Classroom | null>;
  joinClassroom: (code: string) => Promise<Classroom | null>;
  setCurrentClassroom: (classroom: Classroom | null) => void;
  getGamesForClassroom: (classroomId: string) => Promise<AssignedGameDTO[]>;
  getStudentsInClassroom: (classroomId: string) => Promise<User[]>;
  assignGameToClassroom: (classroomId: string, gameId: string, deadline: string, isPremade: boolean) => Promise<AssignedGameDTO | null>;
  getClassroomLeaderboard: (classroomId: string) => Promise<LeaderboardEntry[]>;
}

const ClassroomContext = createContext<ClassroomContextType | undefined>(undefined);

export const ClassroomProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser, token } = useAuth();
  const [teacherClassrooms, setTeacherClassrooms] = useState<Classroom[]>([]);
  const [studentClassrooms, setStudentClassrooms] = useState<StudentClassroom[]>([]);
  const [currentClassroom, setCurrentClassroomState] = useState<Classroom | null>(null);
  const [isLoading, setIsLoading] = useState(false); // General loading state

  const transformBackendClassroomToFrontend = useCallback((dto: BackendClassroomResponse): Classroom => {
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
  }, []);
  
  const fetchTeacherClassrooms = useCallback(async () => {
    // ... (implementation from previous response)
    if (!currentUser || currentUser.role !== "TEACHER" || !token) {
      setTeacherClassrooms([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${CLASSROOM_API_BASE_URL}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch teacher classrooms");
      const data: BackendClassroomResponse[] = await response.json();
      setTeacherClassrooms(data.map(transformBackendClassroomToFrontend));
    } catch (error) {
      console.error("Error fetching teacher classrooms:", error);
      setTeacherClassrooms([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, token, transformBackendClassroomToFrontend]);

  const fetchStudentClassrooms = useCallback(async () => {
    if (!currentUser || currentUser.role !== 'STUDENT' || !token) {
      setStudentClassrooms([]);
      return;
    }
    setIsLoading(true);
    try {
      // Endpoint: GET /api/students/{id}/classrooms returns List<Classroom>
      const response = await fetch(`${STUDENT_API_BASE_URL}/${currentUser.id}/classrooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch student classrooms');
      }
      const backendClassrooms: BackendClassroomResponse[] = await response.json();
      const classroomsForStudent: StudentClassroom[] = backendClassrooms.map(bc => ({
        classroomId: bc.id.toString(),
        classroomName: bc.name,
        teacherName: `${bc.teacher.firstName} ${bc.teacher.lastName}`.trim(),
        iconUrl: bc.iconUrl, 
      }));
      setStudentClassrooms(classroomsForStudent);
    } catch (error) {
      console.error('Error fetching student classrooms:', error);
      setStudentClassrooms([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, token]);


  useEffect(() => {
    if (currentUser && token) {
      if (currentUser.role === 'TEACHER') {
        fetchTeacherClassrooms();
        setStudentClassrooms([]); 
      } else if (currentUser.role === 'STUDENT') {
        fetchStudentClassrooms();
        setTeacherClassrooms([]); 
      }
    } else {
      setTeacherClassrooms([]);
      setStudentClassrooms([]);
    }
  }, [currentUser, token, fetchTeacherClassrooms, fetchStudentClassrooms]);

  const createClassroom = /* ... (implementation from previous response) ... */ useCallback(
    async (data: CreateClassroomRequestDTO): Promise<Classroom | null> => {
        // ... (exact implementation from before)
        if (!currentUser || currentUser.role !== "TEACHER" || !token) {
          throw new Error("User must be a logged-in teacher.");
        }
        setIsLoading(true);
        try {
          const payload = {
            name: data.name,
            description: data.description,
            teacher: { id: currentUser.id },
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
              errorData.message || `Failed to create classroom: ${response.status}`
            );
          }
          const newBackendClassroom: BackendClassroomResponse = await response.json();
          const newClassroom = transformBackendClassroomToFrontend(newBackendClassroom);
          setTeacherClassrooms((prev) => [...prev, newClassroom]);
          return newClassroom;
        } catch (error) {
          console.error("Error creating classroom:", error);
          throw error;
        } finally {
          setIsLoading(false);
        }
    }, [currentUser, token, transformBackendClassroomToFrontend]
);

  const joinClassroom = /* ... (implementation from previous response) ... */ useCallback(
    async (code: string): Promise<Classroom | null> => {
        // ... (exact implementation from before)
        if (!currentUser || !token) {
          throw new Error("User must be logged in to join a classroom.");
        }
        setIsLoading(true);
        try {
          const response = await fetch(
            `${CLASSROOM_API_BASE_URL}/join?joinCode=${encodeURIComponent(
              code
            )}&studentId=${currentUser.id}`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
    
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to join classroom' }));
            throw new Error(
              errorData.message || `Failed to join classroom: ${response.status}`
            );
          }
          const joinedBackendClassroom: BackendClassroomResponse = await response.json();
          const newStudentCls: StudentClassroom = {
            classroomId: joinedBackendClassroom.id.toString(),
            classroomName: joinedBackendClassroom.name,
            teacherName: `${joinedBackendClassroom.teacher.firstName} ${joinedBackendClassroom.teacher.lastName}`.trim(),
            iconUrl: joinedBackendClassroom.iconUrl,
          };
          // Optimistically update, or call fetchStudentClassrooms()
          setStudentClassrooms((prev) => [...prev, newStudentCls]); 
          // await fetchStudentClassrooms(); // Alternative: re-fetch for consistency
          return transformBackendClassroomToFrontend(joinedBackendClassroom);
        } catch (error) {
          console.error("Error joining classroom:", error);
          throw error;
        } finally {
          setIsLoading(false);
        }
    }, [currentUser, token, transformBackendClassroomToFrontend /*, fetchStudentClassrooms (if re-fetching)*/ ]
);

  const setCurrentClassroom = /* ... (implementation from previous response) ... */ useCallback(
    (classroom: Classroom | null): void => {
        setCurrentClassroomState(classroom);
    }, []
);

  const getGamesForClassroom = /* ... (implementation from previous response) ... */ useCallback(
    async (classroomId: string): Promise<AssignedGameDTO[]> => {
        // ... (exact implementation from before, ensure BackendClassroomGameResponse and BackendGameResponse are accurate)
        if (!token) throw new Error("Authentication required.");
        // setIsLoading(true); // Consider if this specific function needs its own loading state
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
          const backendGames: BackendClassroomGameResponse[] = await response.json();
          const assignedGames: AssignedGameDTO[] = backendGames.map(bg => ({
            id: bg.id.toString(),
            classroomId: bg.classroom.id.toString(),
            gameId: bg.game.activityId.toString(),
            gameTitle: bg.game.activityName,
            assignedAt: new Date().toISOString(), 
            dueDate: bg.deadline,
          }));
          return assignedGames;
        } catch (error) {
          console.error("Error fetching games for classroom:", error);
          return [];
        } finally {
          // setIsLoading(false);
        }
    }, [token]
);

  const getStudentsInClassroom = /* ... (implementation from previous response) ... */ useCallback(
    async (classroomId: string): Promise<User[]> => {
        // ... (exact implementation from before)
        if (!token) throw new Error("Authentication required.");
        try {
          const response = await fetch(`${CLASSROOM_API_BASE_URL}/${classroomId}/students`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to fetch students: ${response.status}`);
          }
          const studentsData: BackendUserResponse[] = await response.json();
          return studentsData.map(student => ({
            id: student.id,
            email: student.email,
            firstName: student.firstName,
            lastName: student.lastName,
            name: `${student.firstName} ${student.lastName}`.trim(),
            role: student.role,
            avatarUrl: student.role === 'STUDENT' ? (student as any).avatarImage : (student as any).profilePhoto,
          }));
        } catch (error) {
          console.error("Error fetching students in classroom:", error);
          return [];
        }
    }, [token]
);
  
  const assignGameToClassroom = /* ... (implementation from previous response) ... */ useCallback(
    async (classroomId: string, gameId: string, deadline: string, isPremade: boolean): Promise<AssignedGameDTO | null> => {
        // ... (exact implementation from before)
        if (!currentUser || currentUser.role !== "TEACHER" || !token) {
          throw new Error("User must be a logged-in teacher.");
        }
        setIsLoading(true); // Or a more specific loading state
        try {
          const response = await fetch(
            `${CLASSROOM_API_BASE_URL}/${classroomId}/assign-game?gameId=${gameId}&deadline=${encodeURIComponent(deadline)}&isPremade=${isPremade}`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json",},
            }
          );
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to assign game: ${response.status}`);
          }
          const assignedBackendGame: BackendClassroomGameResponse = await response.json();
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
    }, [currentUser, token]
);

  const getClassroomLeaderboard = /* ... (implementation from previous response) ... */ useCallback(
    async (classroomId: string): Promise<LeaderboardEntry[]> => {
        // ... (exact implementation from before)
        if (!token) {
          console.error("Authentication token not found for getClassroomLeaderboard.");
          return [];
        }
        if (!classroomId) {
            console.error("Classroom ID is required for fetching leaderboard.");
            return [];
        }
        // setIsLoading(true); // Or specific loading state
        try {
          const response = await fetch(`${CLASSROOM_API_BASE_URL}/${classroomId}/leaderboard`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json",},
          });
          if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Failed to fetch leaderboard: ${response.status}`, errorBody);
            throw new Error(`Failed to fetch leaderboard: ${response.status}`);
          }
          const students: BackendUserResponse[] = await response.json();
          const leaderboardEntries: LeaderboardEntry[] = students.map((student, index) => ({
            studentId: student.id.toString(),
            studentName: `${student.firstName} ${student.lastName}`.trim(),
            score: (student as any).expAmount || 0,
            rank: index + 1,
            avatarUrl: (student as any).avatarImage,
          }));
          return leaderboardEntries;
        } catch (error) {
          console.error("Error fetching classroom leaderboard:", error);
          return [];
        } finally {
          // setIsLoading(false);
        }
    }, [token]
);

  return (
    <ClassroomContext.Provider
      value={{
        teacherClassrooms,
        studentClassrooms,
        fetchStudentClassrooms, // Added
        currentClassroom,
        isLoading,
        fetchTeacherClassrooms,
        createClassroom,
        joinClassroom,
        setCurrentClassroom,
        getGamesForClassroom,
        getStudentsInClassroom,
        assignGameToClassroom,
        getClassroomLeaderboard,
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