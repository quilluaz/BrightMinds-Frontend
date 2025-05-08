import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo purposes
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Teacher Demo',
    email: 'teacher@brightminds.com',
    role: 'teacher',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=teacher'
  },
  {
    id: '2',
    name: 'Student Demo',
    email: 'student@brightminds.com',
    role: 'student',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=student'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('brightminds_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user by email (simplified for demo)
      const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // In a real app, we would verify the password here
      
      setCurrentUser(user);
      localStorage.setItem('brightminds_user', JSON.stringify(user));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string, 
    email: string, 
    password: string, 
    role: UserRole
  ): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if email already exists
      if (MOCK_USERS.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('Email already in use');
      }
      
      // Create new user (simplified for demo)
      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        role,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`
      };
      
      // In a real app, we would save the user to the database here
      
      setCurrentUser(newUser);
      localStorage.setItem('brightminds_user', JSON.stringify(newUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    setCurrentUser(null);
    localStorage.removeItem('brightminds_user');
  };

  return (
    <AuthContext.Provider 
      value={{ 
        currentUser, 
        isLoading, 
        login, 
        register, 
        logout, 
        isAuthenticated: !!currentUser 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};