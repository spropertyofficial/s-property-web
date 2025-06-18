"use client";

import { useAuth } from "@/context/AuthContext";
import LoginButton from "./LoginButton";
import LogoutButton from "./LogoutButton";

export default function AuthButton({ 
  variant = "default", 
  showUserInfo = false,
  onLogoutComplete,
  className = ""
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className={`px-4 py-2 ${className}`}>
        <div className="animate-pulse bg-gray-300 h-8 w-20 rounded"></div>
      </div>
    );
  }

  return user ? (
    <LogoutButton 
      variant={variant}
      showUserInfo={showUserInfo}
      onLogoutComplete={onLogoutComplete}
      className={className}
    />
  ) : (
    <LoginButton className={className} />
  );
}