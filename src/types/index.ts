export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: "STUDENT" | "TEACHER"; 
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role: "STUDENT" | "TEACHER"
  ) => Promise<void>;
  // Add login, logout, etc. as needed for future functionality
  // login: (email: string, password: string) => Promise<void>; // Example for login
  // logout: () => void; // Example for logout
}

export type UserRole = "student" | "teacher"; 