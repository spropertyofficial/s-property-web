"use client";

import { AuthProvider } from "@/context/AuthContext";

export default function ChatLayout({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
