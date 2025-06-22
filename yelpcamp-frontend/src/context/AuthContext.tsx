import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, User } from '../services/api';
import { toast } from 'react-toastify';
import { updateIntercomWithBookings, updateIntercomUser } from '../services/intercomService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Update Intercom when user state changes - now with booking data
  useEffect(() => {
    if (user) {
      // Add login timestamp for Intercom tracking
      const userWithLoginTime = {
        ...user,
        last_login_at: Math.floor(Date.now() / 1000)
      };
      updateIntercomWithBookings(userWithLoginTime);
    } else {
      updateIntercomUser(null);
    }
  }, [user]);

  const checkAuthStatus = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data.user);
      }
    } catch (error: any) {
      // Completely suppress 401 errors - they're expected when not authenticated
      // Only log actual errors (network issues, server errors, etc.)
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        console.error('Auth check failed:', error);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.login({ username, password });
      if (response.success && response.data) {
        const userWithSignupSource = {
          ...response.data.user,
          signup_source: 'login_form',
          last_login_at: Math.floor(Date.now() / 1000)
        };
        setUser(userWithSignupSource);
        toast.success(response.message || 'Login successful!');
        return true;
      } else {
        toast.error(response.error || 'Login failed');
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      toast.error(errorMessage);
      return false;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.register({ username, email, password });
      if (response.success && response.data) {
        const userWithSignupSource = {
          ...response.data.user,
          signup_source: 'registration_form',
          last_login_at: Math.floor(Date.now() / 1000)
        };
        setUser(userWithSignupSource);
        toast.success(response.message || 'Registration successful!');
        return true;
      } else {
        toast.error(response.error || 'Registration failed');
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      toast.error(errorMessage);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authAPI.logout();
      setUser(null);
      
      // Shutdown Intercom session on logout using the service
      updateIntercomUser(null);
      
      toast.success('Logged out successfully');
    } catch (error) {
      // Even if the API call fails, we should still clear the user state
      setUser(null);
      
      // Still shutdown Intercom session
      updateIntercomUser(null);
      
      toast.error('Logout failed, but you have been logged out locally');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 