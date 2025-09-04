/**
 * Mock authentication hook for development
 * TODO: Replace with real authentication system
 */

import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
}

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for existing session
    const checkAuth = () => {
      // For demo purposes, we're not authenticated by default
      // In a real app, you'd check localStorage/cookies/tokens here
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login - always succeeds for demo
    const mockUser: User = {
      id: 'user_123',
      email,
      firstName: 'Иван',
      lastName: 'Иванов',
      profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    };
    
    setUser(mockUser);
    // In a real app, you'd store the token/session here
  };

  const logout = () => {
    setUser(null);
    // In a real app, you'd clear tokens/cookies here
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout
  };
}