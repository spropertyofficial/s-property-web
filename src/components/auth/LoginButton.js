"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function LoginButton() {
  const { user, logout, loading, isAgent } = useAuth();

  if (loading) {
    return <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>;
  }

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">
          {user.name} {isAgent() && `(${user.agentCode})`}
        </span>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="bg-tosca-400 text-white px-4 py-2 rounded-md hover:bg-tosca-500 transition-colors"
    >
      Login Agent
    </Link>
  );
}
