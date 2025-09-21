import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import ConversationsList from "./ConversationsList";
import ChatWindow from "./ChatWindow";
import LeadInfoPanel from "./LeadInfoPanel";
import ChatInboxSkeleton from "./components/ChatInboxSkeleton";
import Swal from "sweetalert2";
import { FaTimes, FaTimesCircle } from "react-icons/fa";

export default function ChatInboxPageContent({ currentUser }) {
  // State untuk tracking posisi scroll chat
  const [isAtBottom, setIsAtBottom] = useState(true);
  // State untuk pesan yang baru dikirim (pending)
  const [pendingMessages, setPendingMessages] = useState([]);
  // Fetch conversations from backend
  const {
    data,
    isLoading,
    error,
    refetch: refetchConversations,
  } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await fetch("/api/conversations");
      if (!res.ok) throw new Error("Gagal fetch conversations");
      return res.json();
    },
    refetchInterval: 1500,
  });
  const conversations = data?.conversations || [];
  // Logging conversations setelah data tersedia
  useEffect(() => {
    if (data?.conversations) {
      console.log(
        "[FRONTEND] conversations:",
        data.conversations.map((c) => ({ id: c.lead?._id, unread: c.unread }))
      );
    }
  }, [data]);
  // Pilih percakapan pertama yang punya pesan
  const [selectedId, setSelectedId] = useState(null);

  // Sync selectedId dengan conversations setiap kali conversations berubah
  useEffect(() => {
    if (!selectedId && conversations.length > 0) {
      const firstId =
        conversations.find((c) => c.lastMessage)?.lead?._id ||
        conversations[0]?.lead?._id ||
        null;
      setSelectedId(firstId);
      console.log("[DEBUG] Auto-select first conversation:", firstId);
    } else if (
      selectedId &&
      !conversations.some((c) => c.lead?._id === selectedId)
    ) {
      // Jika selectedId tidak ditemukan di conversations, reset ke percakapan pertama
      const firstId =
        conversations.find((c) => c.lastMessage)?.lead?._id ||
        conversations[0]?.lead?._id ||
        null;
      setSelectedId(firstId);
      console.log("[DEBUG] Reset selectedId, not found. New:", firstId);
    }
  }, [conversations, selectedId]);
  // Mark messages as read whenever selectedId changes (room chat dibuka)
  useEffect(() => {
    if (selectedId) {
      fetch("/api/conversations/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: selectedId }),
      }).then(() => {
        setTimeout(() => {
          refetchConversations();
        }, 200);
      });
    }
  }, [selectedId]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showInfo, setShowInfo] = useState(false);

  // Derived: selected conversation (ringkasan saja)
  const selected = useMemo(() => {
    const sel = conversations.find((c) => c.lead?._id === selectedId) || null;
    console.log("[DEBUG] selectedId:", selectedId, "selected:", sel);
    return sel;
  }, [conversations, selectedId]);
  console.log("[DEBUG] conversations:", conversations);
  // State untuk pesan yang di-fetch dari backend
  const [messages, setMessages] = useState([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [paginationCursor, setPaginationCursor] = useState(null); // timestamp pesan tertua
  const beforeId = messages[0]?._id; // Ambil _id pesan paling awal

  console.log("[DEBUG] selected:", selected);
  console.log("[DEBUG] messages:", messages);

  // Polling messages hanya aktif jika user di bawah chat
  useEffect(() => {
    if (!selected) {
      setMessages([]);
      setHasMore(true);
      return;
    }
    if (!isAtBottom) return; // polling hanya aktif jika user di bawah
    setPaginationCursor(null);
    let firstFetch = true;
    let intervalId;
    const fetchMessages = async () => {
      setIsMessagesLoading(true);
      const params = new URLSearchParams({
        leadId: selected.lead._id,
        limit: "20",
      });
      // Only send 'before' for load more, not for polling
      if (!firstFetch && false) {
        // never send 'before' during polling
        params.append("before", paginationCursor);
      }
      const res = await fetch(`/api/messages?${params.toString()}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.messages)) {
        if (firstFetch) {
          setMessages(data.messages);
          setPaginationCursor(
            data.messages.length > 0 ? data.messages[0]._id : null
          );
          setHasMore(data.messages.length === 20);
          firstFetch = false;
        } else {
          // Merge only new messages (those with _id greater than last in state)
          setMessages((prev) => {
            if (!prev || prev.length === 0) return data.messages;
            const lastId = prev[prev.length - 1]?._id;
            // Find new messages (those not in prev)
            const newMessages = data.messages.filter(
              (msg) => !prev.some((m) => m._id === msg._id)
            );
            return [...prev, ...newMessages];
          });
        }
      }
      setIsMessagesLoading(false);
    };
    fetchMessages();
    intervalId = setInterval(() => {
      fetchMessages();
    }, 2000);
    return () => {
      clearInterval(intervalId);
    };
  }, [selectedId, isAtBottom]);

  // Handler untuk load more pesan lama
  async function handleLoadMore() {
    if (!selected || !hasMore || isMessagesLoading) return;
    const params = new URLSearchParams({
      leadId: selected.lead._id,
      limit: "20",
      before: paginationCursor,
    });
    setIsMessagesLoading(true);
    const res = await fetch(`/api/messages?${params.toString()}`);
    const data = await res.json();
    if (res.ok && Array.isArray(data.messages)) {
      setMessages((prev) => [...data.messages, ...prev]);
      setHasMore(data.messages.length === 20);
      if (data.messages.length > 0) {
        setPaginationCursor(data.messages[0]._id);
      }
    }
    setIsMessagesLoading(false);
  }

  function selectConversation(id) {
    setSelectedId(id);
  }

  async function handleSend(text) {
    if (!selected) return;
    try {
      const res = await fetch("/api/conversations/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: selected.lead._id, message: text }),
      });
      const result = await res.json();
      if (!res.ok) {
        // Tampilkan error dari backend jika ada
        const errorMsg = result?.error || "Gagal mengirim pesan";
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: errorMsg,
        });
        throw new Error(errorMsg);
      }
      // Tambahkan pesan ke pending agar langsung tampil
      if (result.chatMsg) {
        setPendingMessages((prev) => [...prev, result.chatMsg]);
      }
      // Refetch agar sinkron dengan backend
      refetchConversations();
    } catch (err) {
      console.error(err);
    }
  }
  // Filters: hanya tampilkan lead yang punya pesan (lastMessage)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return conversations
      .filter((c) => {
        if (!c.lead || !c.lastMessage) return false;
        if (filter === "mine" && !c.assignedToMe) return false;
        if (filter === "unread" && (c.unread || 0) === 0) return false;
        if (filter === "escalating" && !c.escalating) return false;
        if (!q) return true;
        return (
          c.lead.name.toLowerCase().includes(q) ||
          (c.lead.phone || "").toLowerCase().includes(q) ||
          (c.lastMessageText || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));
  }, [conversations, search, filter]);

  const [escalationMinutes, setEscalationMinutes] = useState(5);
  useEffect(() => {
    async function fetchEscalation() {
      try {
        const res = await fetch("/api/agent-queue");
        if (res.ok) {
          const data = await res.json();
          setEscalationMinutes(data.escalationMinutes ?? 5);
        }
      } catch {}
    }
    fetchEscalation();
  }, []);

  if (isLoading || !currentUser) return <ChatInboxSkeleton />;
  if (error)
    return (
      <div className="p-8 text-center text-red-500">
        Gagal memuat data: {error.message}
      </div>
    );

  return (
    <div className="p-0 md:p-4 bg-slate-100 h-[100svh] md:h-screen overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 md:gap-4 max-w-[1400px] mx-auto h-full min-h-0 overscroll-none">
        {/* Left: Conversations list */}
        <div
          className={`$${
            selectedId ? "hidden" : "flex"
          } lg:flex lg:col-span-3 bg-white border border-slate-200 overflow-hidden flex-col h-full min-h-0`}
        >
          <ConversationsList
            key={currentUser?._id || "no-user"}
            items={filtered}
            selectedId={selectedId}
            onSelect={selectConversation}
            search={search}
            setSearch={setSearch}
            filter={filter}
            setFilter={setFilter}
            currentUser={currentUser}
            escalationMinutes={escalationMinutes}
            refetchConversations={refetchConversations}
          />
        </div>
        <div
          className={`$${
            selectedId ? "flex" : "hidden"
          } lg:flex lg:col-span-6 bg-white border border-slate-200 overflow-hidden flex-col h-full min-h-0`}
        >
          <ChatWindow
            conversation={selected}
            messages={messages}
            onSend={handleSend}
            onBack={() => setSelectedId(null)}
            onToggleInfo={() => setShowInfo(true)}
            refetchConversations={refetchConversations}
            isMessagesLoading={isMessagesLoading}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            isAtBottom={isAtBottom}
            setIsAtBottom={setIsAtBottom}
          />
        </div>

        {/* Right: Lead info */}
        <div className="hidden lg:block lg:col-span-3 bg-white border border-slate-200 overflow-hidden h-full min-h-0">
          <LeadInfoPanel
            conversation={selected}
            // TODO: implementasi assign ke backend jika diperlukan
          />
        </div>

        {/* Mobile Info Overlay */}
        {showInfo && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/20"
              onClick={() => setShowInfo(false)}
            />
            <div className="absolute right-0 top-0 h-full w-full sm:w-[85%] bg-white border-l border-slate-200 flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                <button className="text-2xl" onClick={() => setShowInfo(false)}>
                  <FaTimesCircle />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <LeadInfoPanel
                  conversation={selected}
                  // TODO: implementasi assign ke backend jika diperlukan
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
