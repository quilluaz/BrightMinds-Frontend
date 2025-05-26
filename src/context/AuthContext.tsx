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
      role?: UserRole;
    };
    if (
      parsedUser?.id &&
      parsedUser.email &&
      parsedUser.firstName &&
      parsedUser.lastName
    ) {
      return {
        ...parsedUser,
        name: `${parsedUser.firstName} ${parsedUser.lastName}`.trim(),
      };
    }
    localStorage.removeItem("authUser");
    return null;
  } catch (error) {
    console.error("Failed to parse user from localStorage:", error);
    localStorage.removeItem("authUser");
    return null;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = getTokenFromLocalStorage();
    const storedUser = getUserFromLocalStorage();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setCurrentUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (token) localStorage.setItem("authToken", token);
    else localStorage.removeItem("authToken");

    if (currentUser) {
      const { name, ...userToStore } = currentUser;
      localStorage.setItem("authUser", JSON.stringify(userToStore));
    } else {
      localStorage.removeItem("authUser");
    }
  }, [token, currentUser]);

  const handleAuthResponse = (backendUser: BackendUserResponse): User => {
    return {
      id: backendUser.id,
      email: backendUser.email,
      firstName: backendUser.firstName,
      lastName: backendUser.lastName,
      name: `${backendUser.firstName || ""} ${
        backendUser.lastName || ""
      }`.trim(),
    };
  };

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
    []
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
      }}>
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
