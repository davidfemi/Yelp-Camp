import * as React from 'react';
const { createContext, useContext, useState, useEffect } = React;
type ReactNode = React.ReactNode;
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import config from '../config';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStoredAuth();
  }, []);

  const checkStoredAuth = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error checking stored auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${config.API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session-based auth
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.data?.user) {
        // Store user data locally
        await AsyncStorage.setItem('user', JSON.stringify(data.data.user));
        setUser(data.data.user);
        return true;
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
      return false;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${config.API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session-based auth
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.data?.user) {
        // Store user data locally
        await AsyncStorage.setItem('user', JSON.stringify(data.data.user));
        setUser(data.data.user);
        return true;
      } else {
        Alert.alert('Registration Failed', data.message || 'Registration failed');
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 