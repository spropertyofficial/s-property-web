"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ChatInboxPageContent from "./ui/ChatInboxPageContent";
import { useAuth } from "@/context/AuthContext";

const queryClient = new QueryClient();

export default function ChatInboxPage() {
  const { user, loading } = useAuth();
  console.log("ChatInboxPage user:", user, "loading:", loading);

  if (loading) return <div>Loading...</div>;
  if (!user) {
    
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ChatInboxPageContent />
    </QueryClientProvider>
  );
}