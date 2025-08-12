"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ChevronDown, User, LogOut, Shield, FileText } from "lucide-react";
import Link from "next/link";

export default function LogoutButton({
  className = "",
  variant = "default",
  showUserInfo = false,
  onLogoutComplete,
}) {
  const { user, logout, isAgent } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
      setIsDropdownOpen(false);
    }
  };

  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Mobile version (unchanged)
  if (variant === "mobile") {
    const baseStyles = "px-4 py-2 rounded-md transition-colors font-medium";
    const disabledStyles = "bg-gray-400 cursor-not-allowed";
    const mobileStyles = "w-full bg-red-500 hover:bg-red-600 text-white";

    const buttonStyles = `
      ${baseStyles} 
      ${isLoggingOut ? disabledStyles : mobileStyles} 
      ${className}
    `;

    return (
      <div className="flex flex-col space-y-4">
        {showUserInfo && user && (
          <div className="flex flex-col bg-gradient-to-r from-teal-50 to-cyan-50 p-2 rounded-lg shadow-sm">
            <span className="text-xs font-semibold text-teal-700">
              {user.name}
            </span>
            {isAgent() && user.agentCode && (
              <span className="text-[10px] bg-teal-100 text-teal-600 px-1.5 py-0.5 rounded-full mt-0.5 inline-flex items-center">
                <Shield size={8} className="mr-1" />
                Agent: {user.agentCode}
              </span>
            )}
          </div>
        )}
        
        {/* Agent-only menu items for mobile */}
        {isAgent() && (
          <Link
            href="/log-activity"
            className="w-full px-4 py-2 bg-tosca-100 hover:bg-tosca-200 text-white rounded-md transition-colors font-medium text-center block"
          >
            Log Aktivitas
          </Link>
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

  // Desktop version with modern avatar dropdown
  return (
    <div className="relative">
      {/* Avatar Button */}
      <div
        className="group cursor-pointer"
        onMouseEnter={() => setIsDropdownOpen(true)}
        onMouseLeave={() => setIsDropdownOpen(false)}
      >
        {/* Avatar Circle */}
        <div className="flex items-center space-x-2 p-1 rounded-full hover:bg-white/10 transition-all duration-200">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-tosca-200 to-tosca-300 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-200">
              {getUserInitials(user?.name)}
            </div>
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
          </div>

          {/* Desktop: Show name and chevron */}
          <div className="hidden md:flex items-center space-x-1 text-white">
            <span className="text-sm font-medium truncate max-w-24">
              {user?.name?.split(" ")[0] || "User"}
            </span>
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>

        {/* Dropdown Menu */}
        <div
          className={`absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 transform transition-all duration-200 origin-top-right ${
            isDropdownOpen
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
          }`}
        >
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-tosca-200 to-tosca-300 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                {getUserInitials(user?.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                {isAgent() && user.agentCode && (
                  <div className="flex items-center mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-tosca-50 text-tosca-700">
                      <Shield size={10} className="mr-1" />
                      Agent: {user.agentCode}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items Section */}
          {isAgent() && (
            <div className="py-1">
              <Link
                href="/log-activity"
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                <FileText size={16} className="text-gray-500" />
                <span>Log Aktivitas</span>
              </Link>
            </div>
          )}

          {/* Logout Section */}
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent"></div>
                  <span>Logging out...</span>
                </>
              ) : (
                <>
                  <LogOut size={16} className="text-red-500" />
                  <span>Logout</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
