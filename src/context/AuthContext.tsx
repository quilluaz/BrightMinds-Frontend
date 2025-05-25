import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { User, AuthContextType, LoginResponse } from "../types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Helper Functions for Local Storage ---
const getTokenFromLocalStorage = (): string | null =>
  localStorage.getItem("authToken");

const getUserFromLocalStorage = (): User | null => {
  const userJson = localStorage.getItem("authUser");
  if (userJson) {
    try {
      return JSON.parse(userJson) as User;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      localStorage.removeItem("authUser"); // Clear corrupted data
      return null;
    }
  }
  return null;
};

// --- AuthProvider Component ---
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() =>
    getUserFromLocalStorage()
  );
  const [token, setToken] = useState<string | null>(() =>
    getTokenFromLocalStorage()
  );
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = !!token && !!user;

  // Effect to synchronize auth state with localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }

    if (user) {
      localStorage.setItem("authUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("authUser");
    }
  }, [token, user]);

  // --- Register Function ---
  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role: "STUDENT" | "TEACHER"
  ): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          role,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `Registration failed with status: ${response.status}`
        );
      }
      console.log("Registration successful:", data);
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // --- Login Function ---
  const login = async (
    email: string,
    password: string
  ): Promise<User | null> => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        // Backend login endpoint
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }), // Body as per LoginRequestDto
      });

      // Expects LoginResponse structure
      const data: LoginResponse | { message?: string; error?: string } =
        await response.json();

      if (!response.ok) {
        // Backend returns error messages in the body for AuthException
        throw new Error(
          (data as { message?: string }).message ||
            (data as { error?: string }).error ||
            `Login failed`
        );
      }

      const loginData = data as LoginResponse;
      setToken(loginData.accessToken);
      setUser(loginData.user); // User role here will be uppercase from backend
      console.log("Login successful. Token and user set.");
      return loginData.user; // Return user for immediate use in components
    } catch (error) {
      console.error("Login error:", error);
      setToken(null);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // --- Logout Function ---
  const logout = () => {
    setToken(null);
    setUser(null);
    // localStorage is cleared by the useEffect hook
    console.log("User logged out.");
    // Navigation after logout can be handled in components or by a route redirect
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        register,
        login,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Custom Hook to use AuthContext ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
