"use client";

import { useAuth } from "@/context/AuthContext";

export default function AgentOnly({ children, fallback = null }) {
  const { isAgent, loading } = useAuth();

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!isAgent()) {
    return fallback;
  }

  return children;
}
