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
  UpdateClassroomRequestDTO, // Import this type
  AssignedGameDTO,
  LeaderboardEntry,
  BackendUserResponse,
} from "../types"; // Make sure UpdateClassroomRequestDTO is in your types

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
  // --- Add the new methods here ---
  updateClassroom: (
    classroomId: string,
    data: UpdateClassroomRequestDTO
  ) => Promise<Classroom | null>;
  deleteClassroom: (classroomId: string) => Promise<void>;
  removeStudentFromClassroom: (
    classroomId: string,
    studentId: string
  ) => Promise<void>;
  // --- End of new methods ---
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
        activityCount: 0, // This would ideally be calculated based on assigned games
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
          activityCount: 0, // Placeholder, ideally fetched or calculated
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
          teacherId: currentUser.id, // Assuming backend uses this
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
        throw error; // Rethrow to be caught by the calling component
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
        const payload = { studentId: currentUser.id, joinCode: code }; // Adjust payload as per backend
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
      setIsLoading(true);
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

        return backendGames.map(
          (bg) => ({
            id: bg.id.toString(),
            classroomId: bg.classroom.id.toString(),
            gameId: bg.game.activityId.toString(),
            gameTitle: bg.game.activityName,
            // You might want to fetch full GameDTO here if needed by GameCard, or extend AssignedGameDTO
            game: { // Embedding a minimal GameDTO structure
                id: bg.game.activityId.toString(),
                title: bg.game.activityName,
                description: bg.game.description,
                subject: bg.game.subject,
                questions: [], // Placeholder, fetch if needed
                // gameMode: undefined // Determine how to get this if needed
            },
            assignedAt: new Date().toISOString(), // Placeholder, backend should provide this
            dueDate: bg.deadline,
            status: 'PENDING' // Placeholder, backend should provide this
          })
        );
      } catch (error) {
        console.error("Error fetching games for classroom:", error);
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
      setIsLoading(true);
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
          id: student.id, // Ensure ID is number if your User type expects number
          email: student.email,
          firstName: student.firstName,
          lastName: student.lastName,
          // This is the line in question:
          name: `${student.firstName} ${student.lastName}`.trim(), 
          role: student.role as UserRole, // Cast if necessary
          avatarUrl:
            (student as any).avatarImage || 
            (student as any).profilePhoto ||
            `https://api.dicebear.com/7.x/bottts/svg?seed=${student.firstName}${student.lastName}`,
        }));
      } catch (error) {
        console.error("Error fetching students in classroom:", error);
        return [];
      } finally {
        setIsLoading(false);
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
            // body: JSON.stringify({ gameId, deadline, isPremade }), // Backend might expect body
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
        // TODO: Potentially update the list of assigned games in state or refetch
        return { // Transform to AssignedGameDTO
            id: assignedBackendGame.id.toString(),
            classroomId: assignedBackendGame.classroom.id.toString(),
            gameId: assignedBackendGame.game.activityId.toString(),
            gameTitle: assignedBackendGame.game.activityName,
            assignedAt: new Date().toISOString(), // Placeholder
            dueDate: assignedBackendGame.deadline,
             status: 'PENDING' // Placeholder
        };
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
        console.error("Auth token not found for getClassroomLeaderboard.");
        return [];
      }
      if (!classroomId) {
        console.error("Classroom ID required for fetching leaderboard.");
        return [];
      }
      setIsLoading(true);
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
          throw new Error(
            `Failed to fetch leaderboard: ${response.status} ${errorBody}`
          );
        }
        const studentsWithScores: BackendLeaderboardEntry[] =
          await response.json();
        return studentsWithScores
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
      } catch (error) {
        console.error("Error fetching classroom leaderboard:", error);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  // --- Placeholder Implementations for new functions ---
  const updateClassroom = useCallback(
    async (classroomId: string, data: UpdateClassroomRequestDTO): Promise<Classroom | null> => {
      if (!token || !currentUser || currentUser.role !== 'TEACHER') {
        throw new Error("Unauthorized or not a teacher.");
      }
      console.log(`Simulating update classroom ${classroomId} with data:`, data);
      setIsLoading(true);
      // Simulate API Call
      await new Promise(resolve => setTimeout(resolve, 1000));
      try {
        // This is where you'd make your actual PUT/PATCH request
        // const response = await fetch(`${CLASSROOM_API_BASE_URL}/${classroomId}`, {
        //   method: 'PUT', // or PATCH
        //   headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        //   body: JSON.stringify(data),
        // });
        // if (!response.ok) throw new Error('Failed to update classroom on backend');
        // const updatedBackendClassroom: BackendTeacherClassroomResponse = await response.json();
        // const updatedClassroom = transformBackendTeacherClassroomToFrontend(updatedBackendClassroom);

        // For simulation:
        const updatedClassroom = teacherClassrooms.find(c => c.id === classroomId);
        if (updatedClassroom) {
            const newUpdatedClassroom = { ...updatedClassroom, ...data };
            setTeacherClassrooms(prev => prev.map(c => c.id === classroomId ? newUpdatedClassroom : c));
            setIsLoading(false);
            return newUpdatedClassroom;
        }
        throw new Error("Classroom not found for update simulation.");
      } catch (error) {
        console.error("Simulated error updating classroom:", error);
        setIsLoading(false);
        throw error;
      }
    },
    [token, currentUser, teacherClassrooms, transformBackendTeacherClassroomToFrontend]
  );

  const deleteClassroom = useCallback(
    async (classroomId: string): Promise<void> => {
      if (!token || !currentUser || currentUser.role !== 'TEACHER') {
        throw new Error("Unauthorized or not a teacher.");
      }
      console.log(`Simulating delete classroom ${classroomId}`);
      setIsLoading(true);
      // Simulate API Call
      await new Promise(resolve => setTimeout(resolve, 1000));
      try {
        // This is where you'd make your actual DELETE request
        // const response = await fetch(`${CLASSROOM_API_BASE_URL}/${classroomId}`, {
        //   method: 'DELETE',
        //   headers: { 'Authorization': `Bearer ${token}` },
        // });
        // if (!response.ok) throw new Error('Failed to delete classroom on backend');
        
        setTeacherClassrooms(prev => prev.filter(c => c.id !== classroomId));
        if (currentClassroom?.id === classroomId) {
            setCurrentClassroomState(null);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Simulated error deleting classroom:", error);
        setIsLoading(false);
        throw error;
      }
    },
    [token, currentUser, currentClassroom?.id]
  );

  const removeStudentFromClassroom = useCallback(
    async (classroomId: string, studentId: string): Promise<void> => {
      if (!token || !currentUser || currentUser.role !== 'TEACHER') {
        throw new Error("Unauthorized or not a teacher.");
      }
      console.log(`Simulating remove student ${studentId} from classroom ${classroomId}`);
      setIsLoading(true);
      // Simulate API Call
      await new Promise(resolve => setTimeout(resolve, 1000));
       try {
        // This is where you'd make your actual DELETE request (e.g., /api/classrooms/{classroomId}/students/{studentId})
        // const response = await fetch(`${CLASSROOM_API_BASE_URL}/${classroomId}/students/${studentId}`, {
        //   method: 'DELETE',
        //   headers: { 'Authorization': `Bearer ${token}` },
        // });
        // if (!response.ok) throw new Error('Failed to remove student on backend');
        
        // Optimistically update student count if available or refetch classroom/student list
         setTeacherClassrooms(prevClassrooms =>
           prevClassrooms.map(c =>
             c.id === classroomId ? { ...c, studentCount: Math.max(0, (c.studentCount || 1) - 1) } : c
           )
         );
        setIsLoading(false);
      } catch (error) {
        console.error("Simulated error removing student:", error);
        setIsLoading(false);
        throw error;
      }
    },
    [token, currentUser]
  );
  // --- End of Placeholder Implementations ---


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
        // --- Add the new functions to the context value ---
        updateClassroom,
        deleteClassroom,
        removeStudentFromClassroom,
        // --- End of new functions in value ---
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