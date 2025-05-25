export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: "STUDENT" | "TEACHER";
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  token: string | null;
  isAuthenticated: boolean;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role: "STUDENT" | "TEACHER",
    teacherCode?: string
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
}

export type UserRole = "student" | "teacher";