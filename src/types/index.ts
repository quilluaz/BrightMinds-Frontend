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
  activityCount?: number; // Added to match usage in ClassroomCard
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
  gameMode?: "BALLOON" | "TREASURE_HUNT" | "MATCHING" | "IMAGE_MULTIPLE_CHOICE" | "SORTING" | "FOUR_PICS_ONE_WORD"; // Added "FOUR_PICS_ONE_WORD"
  status?: 'not_started' | 'in_progress' | 'completed' | 'PENDING' | 'OVERDUE'; // Added PENDING and OVERDUE from AssignedGameDTO
  score?: number;
}

export interface StudentPerformance {
    studentId: string;
    studentName: string;
    gameId: string;
    score: number;
    completedAt: string;
}

export interface AssignedGame { // This interface seems more detailed, perhaps for specific contexts
    id: string;
    classroomId: string;
    gameId: string;
    assignedAt: string;
    dueDate: string;
    game?: Game; // References the updated Game interface
    classroom?: Classroom;
}


export interface ClassroomDTO { // Primarily for API request/response bodies, might be less detailed than frontend Classroom
    id: string;
    name: string;
    description?: string;
    teacherId: string; // Assuming backend sends teacherId
    teacherName?: string;
    studentCount?: number;
    activityCount?: number; // This seems to be derived or added on frontend from assigned games
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
  // teacherId might be inferred from auth token on backend
}

export interface UpdateClassroomRequestDTO {
  name?: string;
  description?: string;
}

export interface EnrollStudentRequestDTO {
  joinCode: string;
  // studentId might be inferred from auth token on backend
}

export interface AssignGameRequestDTO {
  gameId: string; // This should be the ID of a Game or GameDTO from the library
  dueDate: string;
  // classroomId is usually part of the URL path
}

// This DTO is what you get when listing assigned games.
// It might contain a snapshot of game details or the full game object.
export interface AssignedGameDTO {
  id: string; // ID of the assignment itself
  classroomId: string;
  gameId: string; // ID of the game that was assigned
  gameTitle?: string; // Denormalized for quick display
  assignedAt: string;
  dueDate: string;
  status?: 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'not_started' | 'in_progress'; // Added more statuses for consistency
  game?: GameDTO; // The actual game details from the library (GameDTO)
}

// Represents a game as stored in the game library (potentially without full question data for previews)
export interface GameDTO {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  questions?: GameQuestion[]; // Optional for previews
  gameMode?: "BALLOON" | "TREASURE_HUNT" | "MATCHING" | "IMAGE_MULTIPLE_CHOICE" | "SORTING" | "FOUR_PICS_ONE_WORD";
}

export interface StudentGameAttemptDTO {
  id: string;
  studentId: string;
  assignedGameId: string; // Link to the AssignedGameDTO id
  score: number;
  completedAt: string;
  // Consider adding game details snapshot here if needed, e.g., gameTitle
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
  id: string; // Unique ID for the card instance
  pairId: number; // Identifies which pair this card belongs to
  type: 'word' | 'picture' | 'left' | 'right'; // 'left'/'right' could be for other matching types
  content: string; // The text content (e.g., Tagalog word, English word)
  imageUrl?: string; // URL if it's a picture card
  isFaceUp: boolean;
  isMatched: boolean;
}

export interface MatchingPair { // Represents the original pair data for a level
  id: number; // Unique ID for the pair concept
  word: string; // e.g., Tagalog word
  english: string; // e.g., English translation or related concept for image
  imageUrl: string; // Image associated with the pair
}