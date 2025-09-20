"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ChatInboxPageContent from "./ui/ChatInboxPageContent";
import { useAuth } from "@/context/AuthContext";

const queryClient = new QueryClient();

export default function ChatInboxPage() {
  const { user, loading } = useAuth();
  console.log("ChatInboxPage user:", user, "loading:", loading);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6 rounded-lg shadow bg-white animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-2/3 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-full mb-2" />
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="flex gap-2 mt-6">
          <div className="h-10 w-10 bg-gray-200 rounded-full" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      </div>
    </div>
  );
  if (!user) {
    // Show unauthorized page before redirect
    if (typeof window !== "undefined") {
      setTimeout(() => {
        window.location.href = "/login";
      }, 1200);
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-6 rounded-lg shadow bg-white text-center">
          <div className="text-5xl mb-4 text-gray-300">🔒</div>
          <h2 className="text-xl font-bold mb-2 text-gray-700">Akses Terbatas</h2>
          <p className="text-gray-500 mb-4">Anda harus login untuk mengakses halaman chat.</p>
          <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ChatInboxPageContent currentUser={user} />
    </QueryClientProvider>
  );
}