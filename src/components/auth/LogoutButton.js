"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function LogoutButton({ 
  className = "", 
  variant = "default", 
  showUserInfo = false,
  onLogoutComplete 
}) {
  const { user, logout, isAgent } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      if (onLogoutComplete) {
        onLogoutComplete();
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Base styles for different variants
  const variants = {
    default: "bg-red-500 hover:bg-red-600 text-white",
    mobile: "w-full bg-red-500 hover:bg-red-600 text-white",
    minimal: "text-red-500 hover:text-red-600 hover:bg-red-50"
  };

  const baseStyles = "px-4 py-2 rounded-md transition-colors font-medium";
  const disabledStyles = "bg-gray-400 cursor-not-allowed";
  
  const buttonStyles = `
    ${baseStyles} 
    ${isLoggingOut ? disabledStyles : variants[variant]} 
    ${className}
  `;

  return (
    <div className="flex items-center space-x-4">
      {showUserInfo && user && (
        <div className="flex flex-col">
          <span className="text-sm text-gray-600 font-medium">
            {user.name}
          </span>
          {isAgent() && user.agentCode && (
            <span className="text-xs text-gray-500">
              Agent: {user.agentCode}
            </span>
          )}
        </div>
      )}
      
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={buttonStyles}
      >
        {isLoggingOut ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span>Logging out...</span>
          </div>
        ) : (
          "Logout"
        )}
      </button>
    </div>
  );
}