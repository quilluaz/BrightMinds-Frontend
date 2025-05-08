// User Types
export type UserRole = 'teacher' | 'student';

export interface UserDTO {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  avatarUrl?: string;
  themePreference?: string;
  level?: number;
  currentXp?: number;
  xpToNextLevel?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequestDTO {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
  teacherEnrollmentCode?: string;
}

export interface UpdateUserRequestDTO {
  displayName?: string;
  currentPassword?: string;
  newPassword?: string;
  avatarUrl?: string;
  themePreference?: string;
}

// Classroom Types
export interface ClassroomDTO {
  id: string;
  name: string;
  description?: string;
  teacherId: string;
  teacherName: string;
  uniqueCode: string;
  iconUrl?: string;
  studentCount: number;
  activityCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClassroomRequestDTO {
  name: string;
  description?: string;
  iconUrl?: string;
}

export interface UpdateClassroomRequestDTO {
  name?: string;
  description?: string;
  iconUrl?: string;
}

export interface EnrollStudentRequestDTO {
  classroomCode: string;
}

// Game Types
export interface GameDTO {
  id: string;
  title: string;
  description: string;
  subject: 'tagalog' | 'araling_panlipunan';
  difficulty: 'easy' | 'medium' | 'hard';
  questions: GameQuestionDTO[];
  type: 'quiz' | 'matching';
  baseXp: number;
  createdAt: string;
  updatedAt: string;
}

export interface GameQuestionDTO {
  id: string;
  text: string;
  options: GameQuestionOptionDTO[];
  imageUrl?: string;
  points: number;
}

export interface GameQuestionOptionDTO {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface AssignedGameDTO {
  id: string;
  libraryGameId: string;
  classroomId: string;
  title: string;
  description: string;
  subject: 'tagalog' | 'araling_panlipunan';
  maxAttemptsAllowed?: number;
  dateAssigned: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssignGameRequestDTO {
  libraryGameId: string;
  dueDate?: string;
  maxAttemptsAllowed?: number;
}

// Game Attempt Types
export interface StudentGameAttemptDTO {
  id: string;
  studentId: string;
  assignedGameId: string;
  classroomId: string;
  score: number;
  xpEarned: number;
  timeSpentSeconds: number;
  answers: GameAnswerDTO[];
  createdAt: string;
}

export interface GameAnswerDTO {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
}

// Leaderboard Types
export interface LeaderboardEntryDTO {
  studentId: string;
  studentName: string;
  avatarUrl?: string;
  score: number;
  rank: number;
}

// API Error Types
export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

export interface MatchingPair {
  id: number; // A unique ID for the pair (e.g., 1, 2, 3)
  word: string; // The word content
  imageUrl: string; // URL or path to the image for this pair
}

export interface MatchingCard {
  id: string; // Unique ID for this specific card instance (e.g., "pair-1-word", "pair-1-picture")
  pairId: number; // Links this card back to its pair ID
  type: 'word' | 'picture'; // What this card displays
  content: string; // The text content (for word card or alt text)
  imageUrl?: string; // The image URL (only for picture cards)
  isFaceUp: boolean; // Is the card currently flipped up?
  isMatched: boolean; // Has this card been successfully matched?
}