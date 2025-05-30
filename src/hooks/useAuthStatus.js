"use client";

import { useAuth } from '@/context/AuthContext';

export const useAuthStatus = () => {
  const { user, loading, isAgent } = useAuth();

  return {
    isAuthenticated: !!user,
    isAgent: isAgent(),
    user,
    loading,
    isGuest: !user && !loading
  };
};