"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ChatInboxPageContent from "./ui/ChatInboxPageContent";

const queryClient = new QueryClient();

export default function ChatInboxPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChatInboxPageContent />
    </QueryClientProvider>
  );
}