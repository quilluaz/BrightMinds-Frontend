export type UserRole = "STUDENT" | "TEACHER";

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role?: UserRole;
}

export interface BackendUserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
}

export interface LoginRequestData {
  email: string;
  password: string;
}

export interface RegisterRequestData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  teacherCode?: string;
}

export interface BackendLoginResponse {
  accessToken: string;
  user: BackendUserResponse;
}

export interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  token: string | null;
  isAuthenticated: boolean;
  register: (data: RegisterRequestData) => Promise<void>;
  login: (data: LoginRequestData) => Promise<User | null>;
  logout: () => void;
}

export interface Classroom {
  id: number;
  name: string;
  description?: string;
  teacherId: number;
  joinCode?: string;
}

export interface StudentClassroom {
  classroomId: number;
  classroomName: string;
  teacherName: string;
  iconUrl?: string;
}

export interface QuestionOption {
  id: number;
  text: string;
  isCorrect: boolean;
}
export interface GameQuestion {
  id: number;
  text: string;
  imageUrl?: string;
  options: QuestionOption[];
}

export interface Game {
  id: number;
  title: string;
  description?: string;
  subject?: string;
  questions: GameQuestion[];
  gameMode: "BALLOON" | "TREASURE_HUNT" | "MATCHING" | "IMAGE_MULTIPLE_CHOICE" | "SORTING";
}

export interface StudentPerformanceDto {
    studentId: number;
    studentName: string;
    classroomId: number;
    assignmentId: number;
    score: number;
    completedAt: string;
}

export interface AssignmentDto {
    id: number;
    classroomId: number;
    quizId: number;
    assignedAt: string;
    dueDate: string;
}

export interface Assignment extends AssignmentDto {
  classroom?: Classroom;
  quiz?: Game;
}

export interface ClassroomDto {
    id: number;
    name: string;
    description?: string;
    teacherId: number;
    studentIds?: number[];
    joinCode?: string;
}

export interface MatchSortPair {
  left: string;
  right: string;
}

export interface MatchSortQuestion {
  id: number;
  prompt: string;
  image?: string;
  pairs: MatchSortPair[];
  type: "MATCHING" | "SORTING";
}

export interface MatchingCard {
  id: string;
  pairId: number;
  type: 'word' | 'picture' | 'left' | 'right';
  content: string;
  imageUrl?: string;
  isFaceUp: boolean;
  isMatched: boolean;
}