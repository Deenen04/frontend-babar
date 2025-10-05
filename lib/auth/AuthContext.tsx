'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// User interface
export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  is_active?: boolean;
}

// Auth context interface
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Storage keys
const STORAGE_KEYS = {
  USER: 'auth_user',
  TOKEN: 'auth_token',
} as const;

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Initialize authentication state
  const initializeAuth = async () => {
    try {
      setIsLoading(true);

      // Check if user data exists in localStorage
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);

      if (storedUser && storedToken) {
        const userData = JSON.parse(storedUser);
        setUser(userData);

        // Verify token is still valid (optional - could make API call here)
        // For now, we'll assume stored data is valid
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      // Clear corrupted data
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);

      // TODO: Replace with actual API call
      // This is a mock implementation - integrate with your authentication API
      const response = await mockLoginAPI(email, password);

      // Store user data and token
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);

      // Update state
      setUser(response.user);

    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Clear stored data
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);

    // Clear state
    setUser(null);
  };

  // Update user data
  const updateUser = (userData: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...userData };

    // Update state
    setUser(updatedUser);

    // Update stored data
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
  };

  // Context value
  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

// Mock login API (replace with real implementation)
async function mockLoginAPI(email: string, password: string) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock validation
  if (email === 'demo@example.com' && password === 'password') {
    return {
      user: {
        id: 'demo-user-id',
        email: 'demo@example.com',
        first_name: 'Demo',
        last_name: 'User',
        role: 'admin',
        is_active: true,
      },
      token: 'demo-jwt-token-' + Date.now(),
    };
  }

  throw new Error('Invalid credentials');
}

export default AuthContext;
