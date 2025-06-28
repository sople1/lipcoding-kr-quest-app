import { useState, useEffect, useCallback } from 'react';
import { getUserFromToken, isAuthenticated, removeToken, setToken } from '../utils/auth';
import { api } from '../utils/api';
import { UserRole } from '../types';

interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  bio?: string;
  skills?: string[];
  is_matched?: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  bio?: string;
  skills?: string[];
}

interface UseAuthReturn {
  user: AuthUser | null;
  loading: boolean;
  isLoggedIn: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

/**
 * Hook for managing authentication state
 * @returns {UseAuthReturn} Authentication state and user data
 */
export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Check authentication status and load user data
   */
  const checkAuth = useCallback(async () => {
    try {
      if (isAuthenticated()) {
        const userData = getUserFromToken();
        if (userData) {
          // Verify token with server and get fresh user data
          const response = await api.get('/me');
          setUser(response.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      removeToken(); // Remove invalid token
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Login user with credentials
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      const response = await api.post('/login', credentials);
      setToken(response.token);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  }, []);

  /**
   * Register new user
   */
  const signup = useCallback(async (data: SignupData) => {
    try {
      const response = await api.post('/signup', data);
      setToken(response.token);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      removeToken();
      setUser(null);
    } catch (error) {
      throw error;
    }
  }, []);

  /**
   * Refresh user data from server
   */
  const refreshUser = useCallback(async () => {
    try {
      if (isAuthenticated()) {
        const response = await api.get('/me');
        setUser(response.user);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    checkAuth();

    // Listen for storage changes (logout in another tab)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkAuth]);

  return {
    user,
    loading,
    isLoggedIn: !!user,
    login,
    signup,
    logout,
    refreshUser,
  };
};
