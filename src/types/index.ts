export type UserRole = "STUDENT" | "TEACHER";

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface BackendUserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
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
  setCurrentUser?: React.Dispatch<React.SetStateAction<User | null>>;
}

export interface Classroom {
  id: string;
  name: string;
  description?: string;
  teacherId: string;
  teacherName: string;
  code: string;
  iconUrl?: string;
  studentCount: number;
  activityCount: number;
}

export interface StudentClassroom {
  classroomId: string;
  classroomName: string;
  teacherName: string;
  iconUrl?: string;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}
export interface GameQuestion {
  id: string;
  text: string;
  imageUrl?: string;
  options: QuestionOption[];
}

export interface Game {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  questions: GameQuestion[];
  gameMode?: "BALLOON" | "TREASURE_HUNT" | "MATCHING" | "IMAGE_MULTIPLE_CHOICE" | "SORTING";
  status?: 'not_started' | 'in_progress' | 'completed';
  score?: number;
}

export interface StudentPerformance {
    studentId: string;
    studentName: string;
    gameId: string;
    score: number;
    completedAt: string;
}

export interface AssignedGame {
    id: string;
    classroomId: string;
    gameId: string;
    assignedAt: string;
    dueDate: string;
    game?: Game;
    classroom?: Classroom;
}


export interface ClassroomDTO {
    id: string;
    name: string;
    description?: string;
    teacherId: string;
    teacherName?: string;
    studentCount?: number;
    activityCount?: number;
    uniqueCode?: string;
    iconUrl?: string;
}

export interface LeaderboardEntry {
  studentId: string;
  studentName: string;
  score: number;
  rank: number;
  avatarUrl?: string;
}

export interface CreateClassroomRequestDTO {
  name: string;
  description?: string;
}

export interface UpdateClassroomRequestDTO {
  name?: string;
  description?: string;
}

export interface EnrollStudentRequestDTO {
  joinCode: string;
}

export interface AssignGameRequestDTO {
  gameId: string;
  dueDate: string;
}

export interface AssignedGameDTO {
  id: string;
  classroomId: string;
  gameId: string;
  gameTitle?: string;
  assignedAt: string;
  dueDate: string;
  status?: 'PENDING' | 'COMPLETED' | 'OVERDUE';
}

export interface GameDTO {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  questions?: GameQuestion[];
}

export interface StudentGameAttemptDTO {
  id: string;
  studentId: string;
  assignedGameId: string;
  score: number;
  completedAt: string;
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

export interface MatchingPair {
  id: number;
  word: string;
  english: string;
  imageUrl: string;
}