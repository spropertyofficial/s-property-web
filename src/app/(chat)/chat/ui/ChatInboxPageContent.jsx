import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import ConversationsList from "./ConversationsList";
import ChatWindow from "./ChatWindow";
import LeadInfoPanel from "./LeadInfoPanel";
import ChatInboxSkeleton from "./components/ChatInboxSkeleton";

export default function ChatInboxPageContent() {
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
  // Extract messagesById from backend data
  const messagesById = useMemo(() => {
    const map = {};
    conversations.forEach((conv) => {
      if (conv.lead && conv.messages) {
        map[conv.lead._id] = conv.messages;
      }
    });
    return map;
  }, [conversations]);
  const [selectedId, setSelectedId] = useState(
    conversations[0]?.lead?._id || null
  );
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
  // TODO: fetch currentUser dari context/auth
  const [currentUser, setCurrentUser] = useState(null);
  console.log("[Page Chat] currentUser", currentUser);
  useEffect(() => {
    // Contoh: fetch user login dari endpoint /api/auth/me
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          // Jika response berbentuk { user: {...} }
          if (data.user && data.user._id) {
            setCurrentUser(data.user);
          } else {
            setCurrentUser(data);
          }
        }
      } catch {}
    }
    fetchUser();
  }, []);

  // Derived: selected conversation and its messages
  const selected = useMemo(
    () => conversations.find((c) => c.lead?._id === selectedId) || null,
    [conversations, selectedId]
  );
  console.log("[FRONTEND] selected conversation:", selected);
  const messages = useMemo(() => {
    if (!selected) return [];
    const base = messagesById[selected.lead._id] || [];
    const baseIds = new Set(base.map((m) => m._id));
    // Gabungkan pesan pending jika leadId sama, tapi filter yang _id-nya sudah ada di base
    const pendings = pendingMessages.filter(
      (m) => m.lead === selected.lead._id && (!m._id || !baseIds.has(m._id))
    );
    return [...base, ...pendings];
  }, [messagesById, selected, pendingMessages]);

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
      if (!res.ok) throw new Error("Gagal mengirim pesan");
      const result = await res.json();
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
  // Bersihkan pendingMessages setelah data dari backend terupdate
  useEffect(() => {
    if (!selected) return;
    // Jika pesan dari backend sudah memuat pesan yang sama, hapus dari pending
    const base = messagesById[selected.lead._id] || [];
    setPendingMessages((prev) =>
      prev.filter((pm) => {
        // Jika pesan dengan twilioSid/id sudah ada di base, hapus dari pending
        if (!pm.twilioSid) return true;
        return !base.some((bm) => bm.twilioSid === pm.twilioSid);
      })
    );
  }, [messagesById, selected]);

  // Filters
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return conversations
      .filter((c) => {
        if (!c.lead) return false;
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
          />
        </div>

        {/* Middle: Chat window */}
        <div
          className={`${
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
                <div className="font-medium">Detail Prospek</div>
                <button className="text-2xl" onClick={() => setShowInfo(false)}>
                  &times;
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                {/* <LeadInfoPanel
                  conversation={selected}
                  // TODO: implementasi assign ke backend jika diperlukan
                /> */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
