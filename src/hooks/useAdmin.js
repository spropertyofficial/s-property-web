"use client";

import { useState, useEffect, createContext, useContext } from "react";

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const response = await fetch("/api/admin/verify", {
          credentials: "include",
        });
        
        if (response.ok) {
          const data = await response.json();
          setAdmin(data.user);
        }
      } catch (error) {
        console.error("Error fetching admin info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminInfo();
  }, []);

  return (
    <AdminContext.Provider value={{ admin, loading, setAdmin }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return context;
};
