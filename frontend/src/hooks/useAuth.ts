import { useState, useEffect } from 'react';
import { getUserFromToken, isAuthenticated } from '../utils/auth';
import { UserRole } from '../types';

interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  isLoggedIn: boolean;
}

/**
 * Hook for managing authentication state
 * @returns {UseAuthReturn} Authentication state and user data
 */
export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated()) {
        const userData = getUserFromToken();
        setUser(userData);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    checkAuth();

    // Listen for storage changes (logout in another tab)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    user,
    isLoading,
    isLoggedIn: !!user,
  };
};
