import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { User, AuthContextType, LoginResponse } from "../types"; // Ensure path is correct

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
    role: "STUDENT" | "TEACHER",
    teacherCode?: string // Ensure this matches AuthContextType in types/index.ts
  ): Promise<void> => {
    setIsLoading(true);
    try {
      // Construct the request body dynamically
      const requestBody: { [key: string]: any } = { // More specific type for clarity
        firstName,
        lastName,
        email,
        password,
        role,
      };

      // Add teacherCode to the body ONLY if the role is TEACHER and teacherCode is provided
      if (role === "TEACHER" && teacherCode) {
        requestBody.teacherCode = teacherCode;
      } else if (role === "TEACHER" && !teacherCode) {
        // This case should ideally be caught by frontend validation in RegisterPage.tsx
        // If backend strictly requires it, this request will fail.
        console.warn("Attempting to register a TEACHER without a teacherCode.");
      }

      console.log("Registering with body:", JSON.stringify(requestBody)); // For debugging the payload

      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      let errorData: any = null;
      const contentType = response.headers.get("content-type");

      if (!response.ok) {
        // Attempt to get error message from body, prioritizing JSON
        if (contentType && contentType.includes("application/json")) {
          try {
            errorData = await response.json();
          } catch (e) {
            // If JSON parsing fails on an error response, use the statusText or a generic message
            console.error("Failed to parse JSON error response:", e);
            throw new Error(response.statusText || `Registration failed with status: ${response.status}. Malformed JSON error.`);
          }
        } else {
          // For non-JSON error responses (like plain text or HTML error pages from server/proxy)
          const textError = await response.text();
          throw new Error(textError || `Registration failed with status: ${response.status}. Non-JSON response.`);
        }
        // If errorData was parsed as JSON and has a message/error property
        throw new Error(
          errorData?.message ||
          errorData?.error ||
          `Registration failed with status: ${response.status}`
        );
      }

      // Handle successful response (even if body is empty or not JSON for success)
      if (contentType && contentType.includes("application/json")) {
        const successData = await response.json();
        console.log("Registration successful:", successData);
      } else {
        console.log("Registration successful (non-JSON or empty response).");
      }

    } catch (error) {
      console.error("Registration error in AuthContext:", error);
      // Ensure the error thrown is an Error object for consistent handling in UI
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(String(error) || "An unknown registration error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- Login Function (remains unchanged from your last working version) ---
  const login = async (
    email: string,
    password: string
  ): Promise<User | null> => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data: LoginResponse | { message?: string; error?: string } =
        await response.json();
      if (!response.ok) {
        throw new Error(
          (data as { message?: string }).message ||
            (data as { error?: string }).error ||
            `Login failed`
        );
      }
      const loginData = data as LoginResponse;
      setToken(loginData.accessToken);
      setUser(loginData.user);
      console.log("Login successful. Token and user set.");
      return loginData.user;
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
    console.log("User logged out.");
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