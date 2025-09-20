"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log("🔍 Checking auth...");
      let response = await fetch("/api/auth/me");
      console.log("📡 Auth response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Auth data received:", data);
        setUser(data.user);
      } else {
        const errorData = await response.json();
        console.log("❌ Auth failed:", errorData);
      }

      response = await fetch("/api/admin/me");
      if(response.ok) {
        const data = await response.json();
        console.log("✅ Admin auth data received:", data);
        setUser(data);
      } else {
        const errorData = await response.json();
        console.log("❌ Admin auth failed:", errorData);
      }
    } catch (error) {
      console.error("🚫 Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        if (typeof window !== "undefined" && data.token) {
          localStorage.setItem("auth-token", data.token);
        }
        return {
          success: true,
          message: data.message,
          requirePasswordChange: !!data.requirePasswordChange,
        };
      } else {
        return {
          success: false,
          message: data.message,
          requirePasswordChange: !!data.requirePasswordChange,
        };
      }
    } catch (error) {
      return { success: false, message: "Login failed. Please try again." };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return {
        success: false,
        message: "Registration failed. Please try again.",
      };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isAgent = () => {
    return ["agent", "semi-agent", "sales-inhouse"].includes(user?.type);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAgent,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
