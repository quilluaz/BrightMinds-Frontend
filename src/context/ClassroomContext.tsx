import React, { createContext, useState, useContext } from 'react';
import { Classroom, Game, StudentPerformance, LeaderboardEntry, StudentClassroom } from '../types';
import { useAuth } from './AuthContext';

interface ClassroomContextType {
  teacherClassrooms: Classroom[];
  studentClassrooms: StudentClassroom[];
  games: Game[];
  studentPerformances: StudentPerformance[];
  currentClassroom: Classroom | null;
  createClassroom: (name: string, description?: string) => Promise<Classroom>;
  joinClassroom: (code: string) => Promise<void>;
  setCurrentClassroom: (classroomId: string) => void;
  getClassroomGames: (classroomId: string) => Game[];
  getClassroomLeaderboard: (classroomId: string) => LeaderboardEntry[];
  addGameToClassroom: (classroomId: string, gameId: string) => Promise<void>;
  submitGameResults: (classroomId: string, gameId: string, score: number) => Promise<void>;
}

const ClassroomContext = createContext<ClassroomContextType | undefined>(undefined);

// Mock data
const MOCK_CLASSROOMS: Classroom[] = [
  {
    id: 'class-1',
    name: 'Masayang Tagalog Class',
    description: 'Learn Tagalog in a fun way!',
    teacherId: '1',
    teacherName: 'Teacher Demo',
    code: 'TAG123',
    iconUrl: '📚',
    studentCount: 25,
    activityCount: 8
  },
  {
    id: 'class-2',
    name: 'Araling Panlipunan: Luzon',
    description: 'Learn about Luzon regions and culture',
    teacherId: '1',
    teacherName: 'Teacher Demo',
    code: 'AP456',
    iconUrl: '🌏',
    studentCount: 22,
    activityCount: 5
  }
];

const MOCK_STUDENT_CLASSROOMS: StudentClassroom[] = [
  {
    classroomId: 'class-1',
    classroomName: 'Masayang Tagalog Class',
    teacherName: 'Teacher Demo',
    iconUrl: '📚'
  }
];

const MOCK_GAMES: Game[] = [
  {
    id: 'game-1',
    title: 'Tukuyin ang Pangngalan (Identify the Noun)',
    description: 'Practice identifying nouns in Tagalog sentences',
    subject: 'tagalog',
    questions: [
      {
        id: 'q1',
        text: 'Alin ang pangngalan sa pangungusap: "Ang batang si Juan ay kumakain ng mansanas."',
        options: [
          { id: 'a', text: 'batang', isCorrect: false },
          { id: 'b', text: 'Juan', isCorrect: true },
          { id: 'c', text: 'kumakain', isCorrect: false },
          { id: 'd', text: 'mansanas', isCorrect: true }
        ]
      },
      // More questions would be defined here
    ]
  },
  {
    id: 'game-2',
    title: 'Mga Rehiyon ng Luzon (Regions of Luzon)',
    description: 'Learn about the different regions in Luzon',
    subject: 'araling_panlipunan',
    questions: [
      {
        id: 'q1',
        text: 'Ano ang kabisera ng Rehiyon ng Ilocos?',
        options: [
          { id: 'a', text: 'Laoag', isCorrect: false },
          { id: 'b', text: 'Vigan', isCorrect: false },
          { id: 'c', text: 'San Fernando', isCorrect: true },
          { id: 'd', text: 'Dagupan', isCorrect: false }
        ]
      },
      // More questions would be defined here
    ]
  }
];

const MOCK_PERFORMANCES: StudentPerformance[] = [
  {
    studentId: '2',
    studentName: 'Student Demo',
    gameId: 'game-1',
    score: 85,
    completedAt: '2025-04-10T14:30:00Z'
  }
];

export const ClassroomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [teacherClassrooms, setTeacherClassrooms] = useState<Classroom[]>(MOCK_CLASSROOMS);
  const [studentClassrooms, setStudentClassrooms] = useState<StudentClassroom[]>(MOCK_STUDENT_CLASSROOMS);
  const [games, setGames] = useState<Game[]>(MOCK_GAMES);
  const [studentPerformances, setStudentPerformances] = useState<StudentPerformance[]>(MOCK_PERFORMANCES);
  const [currentClassroom, setCurrentClassroomState] = useState<Classroom | null>(null);

  const createClassroom = async (name: string, description?: string): Promise<Classroom> => {
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!currentUser) {
      throw new Error('User must be logged in to create a classroom');
    }
    
    // Generate a random 6-character code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const newClassroom: Classroom = {
      id: `class-${Date.now()}`,
      name,
      description,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      code,
      studentCount: 0,
      activityCount: 0
    };
    
    setTeacherClassrooms(prev => [...prev, newClassroom]);
    return newClassroom;
  };

  const joinClassroom = async (code: string): Promise<void> => {
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!currentUser) {
      throw new Error('User must be logged in to join a classroom');
    }
    
    const classroom = teacherClassrooms.find(c => c.code === code);
    if (!classroom) {
      throw new Error('Invalid classroom code');
    }
    
    // Check if already joined
    if (studentClassrooms.some(sc => sc.classroomId === classroom.id)) {
      throw new Error('You are already a member of this classroom');
    }
    
    const studentClassroom: StudentClassroom = {
      classroomId: classroom.id,
      classroomName: classroom.name,
      teacherName: classroom.teacherName,
      iconUrl: classroom.iconUrl
    };
    
    setStudentClassrooms(prev => [...prev, studentClassroom]);
  };

  const setCurrentClassroom = (classroomId: string): void => {
    const classroom = teacherClassrooms.find(c => c.id === classroomId);
    setCurrentClassroomState(classroom || null);
  };

  const getClassroomGames = (classroomId: string): Game[] => {
    // In a real app, we would filter games by classroom ID
    // For demo purposes, return all games
    return games;
  };

  const getClassroomLeaderboard = (classroomId: string): LeaderboardEntry[] => {
    // Simulate generating a leaderboard for the classroom
    return [
      { studentId: '2', studentName: 'Student Demo', score: 850, rank: 1, avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=student' },
      { studentId: '3', studentName: 'Maria Santos', score: 720, rank: 2, avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=maria' },
      { studentId: '4', studentName: 'Juan Cruz', score: 650, rank: 3, avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=juan' },
      { studentId: '5', studentName: 'Ana Reyes', score: 580, rank: 4, avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=ana' },
      { studentId: '6', studentName: 'Carlos Lim', score: 520, rank: 5, avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=carlos' }
    ];
  };

  const addGameToClassroom = async (classroomId: string, gameId: string): Promise<void> => {
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    // In a real app, we would add the game to the classroom
  };

  const submitGameResults = async (classroomId: string, gameId: string, score: number): Promise<void> => {
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!currentUser) {
      throw new Error('User must be logged in to submit game results');
    }
    
    const newPerformance: StudentPerformance = {
      studentId: currentUser.id,
      studentName: currentUser.name,
      gameId,
      score,
      completedAt: new Date().toISOString()
    };
    
    setStudentPerformances(prev => [...prev, newPerformance]);
  };

  return (
    <ClassroomContext.Provider
      value={{
        teacherClassrooms,
        studentClassrooms,
        games,
        studentPerformances,
        currentClassroom,
        createClassroom,
        joinClassroom,
        setCurrentClassroom,
        getClassroomGames,
        getClassroomLeaderboard,
        addGameToClassroom,
        submitGameResults
      }}
    >
      {children}
    </ClassroomContext.Provider>
  );
};

export const useClassroom = (): ClassroomContextType => {
  const context = useContext(ClassroomContext);
  if (context === undefined) {
    throw new Error('useClassroom must be used within a ClassroomProvider');
  }
  return context;
};