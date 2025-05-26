import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import {
  User,
  LoginRequestData,
  RegisterRequestData,
  BackendLoginResponse,
  AuthContextType,
  BackendUserResponse,
  UserRole,
} from "../types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_BASE_URL = "http://localhost:8080/api/auth";

const getTokenFromLocalStorage = (): string | null =>
  localStorage.getItem("authToken");

const getUserFromLocalStorage = (): User | null => {
  const userJson = localStorage.getItem("authUser");
  if (!userJson) return null;
  try {
    const parsedUser = JSON.parse(userJson) as Omit<User, "name"> & {
      firstName: string;
      lastName: string;
      role: UserRole;
      avatarUrl?: string;
    };
    if (
      parsedUser?.id &&
      parsedUser.email &&
      parsedUser.firstName &&
      parsedUser.lastName &&
      parsedUser.role
    ) {
      return {
        id: parsedUser.id,
        email: parsedUser.email,
        firstName: parsedUser.firstName,
        lastName: parsedUser.lastName,
        name: `${parsedUser.firstName} ${parsedUser.lastName}`.trim(),
        role: parsedUser.role,
        avatarUrl: parsedUser.avatarUrl,
      };
    }
    localStorage.removeItem("authUser");
    return null;
  } catch (error) {
    localStorage.removeItem("authUser");
    return null;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(getUserFromLocalStorage);
  const [token, setToken] = useState<string | null>(getTokenFromLocalStorage);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }

    if (currentUser) {
      const { name, ...userToStore } = currentUser;
      localStorage.setItem("authUser", JSON.stringify(userToStore));
    } else {
      localStorage.removeItem("authUser");
    }
  }, [token, currentUser]);

  const handleAuthResponse = useCallback((backendUser: BackendUserResponse): User => {
    if (!backendUser.role) {
      throw new Error("User role not provided by backend.");
    }
    return {
      id: backendUser.id,
      email: backendUser.email,
      firstName: backendUser.firstName,
      lastName: backendUser.lastName,
      name: `${backendUser.firstName || ""} ${
        backendUser.lastName || ""
      }`.trim(),
      role: backendUser.role,
    };
  }, []);

  const register = useCallback(
    async (registerData: RegisterRequestData): Promise<void> => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(registerData),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Registration failed: ${response.statusText}`
          );
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const login = useCallback(
    async (loginData: LoginRequestData): Promise<User | null> => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(loginData),
        });
        const responseBody = await response.json();
        if (!response.ok) {
          throw new Error(
            responseBody.message ||
              responseBody.error ||
              `Login failed: ${response.statusText}`
          );
        }
        const backendLoginResp = responseBody as BackendLoginResponse;
        
        if (!backendLoginResp.user || !backendLoginResp.user.role) {
            throw new Error("Incomplete user data received from server.");
        }

        const user = handleAuthResponse(backendLoginResp.user);

        setToken(backendLoginResp.accessToken);
        setCurrentUser(user);
        return user;
      } catch (error) {
        setToken(null);
        setCurrentUser(null);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [handleAuthResponse]
  );

  const logout = useCallback(() => {
    setToken(null);
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        isLoading,
        isAuthenticated: !!token && !!currentUser,
        register,
        login,
        logout,
        setCurrentUser, 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};