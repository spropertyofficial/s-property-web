"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import ConversationsList from "./ui/ConversationsList";
import ChatWindow from "./ui/ChatWindow";
import LeadInfoPanel from "./ui/LeadInfoPanel";
import { initialConversations, initialMessagesById, makeId } from "./ui/mockData";

export default function ChatInboxPage() {
  // State: conversations and messages stored locally (mocked)
  const [conversations, setConversations] = useState(initialConversations());
  const [messagesById, setMessagesById] = useState(initialMessagesById());
  const [selectedId, setSelectedId] = useState(conversations[0]?.id || null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | mine | unread | escalating
  const [showInfo, setShowInfo] = useState(false); // mobile info panel overlay

  // Derived: selected conversation and its messages
  const selected = useMemo(() => conversations.find(c => c.id === selectedId) || null, [conversations, selectedId]);
  const messages = useMemo(() => (selected ? (messagesById[selected.id] || []) : []), [messagesById, selected]);

  // Handlers
  function selectConversation(id) {
    setSelectedId(id);
    setConversations(prev => prev.map(c => c.id === id ? { ...c, unread: 0, lastOpenedAt: Date.now() } : c));
  }

  function handleSend(text) {
    if (!selected) return;
    const msg = {
      id: makeId(),
      sender: "me",
      body: text,
      type: "text",
      ts: Date.now(),
      status: "sending",
    };
    // Add message optimistically
    setMessagesById(prev => ({
      ...prev,
      [selected.id]: [ ...(prev[selected.id] || []), msg ]
    }));
    // Update conversation metadata
    setConversations(prev => prev.map(c => c.id === selected.id ? ({ ...c, lastMessageText: text, lastMessageAt: Date.now(), escalating: false }) : c));
    // Simulate network delivery
    setTimeout(() => {
      setMessagesById(prev => ({
        ...prev,
        [selected.id]: (prev[selected.id] || []).map(m => m.id === msg.id ? { ...m, status: "sent" } : m)
      }));
    }, 700);
  }

  function simulateIncoming(id) {
    const targetId = id || selectedId;
    if (!targetId) return;
    const reply = {
      id: makeId(),
      sender: "lead",
      body: "Halo kak, boleh info lebih lanjut?",
      type: "text",
      ts: Date.now(),
      status: "delivered",
    };
    setMessagesById(prev => ({
      ...prev,
      [targetId]: [ ...(prev[targetId] || []), reply ]
    }));
    setConversations(prev => prev.map(c => c.id === targetId ? ({
      ...c,
      lastMessageText: reply.body,
      lastMessageAt: reply.ts,
      unread: c.id === selectedId ? 0 : (c.unread || 0) + 1,
    }) : c));
  }

  function toggleAssignToMe(convId) {
    setConversations(prev => prev.map(c => c.id === convId ? ({ ...c, assignedToMe: !c.assignedToMe }) : c));
  }

  // Filters
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return conversations
      .filter(c => {
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
      .sort((a,b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));
  }, [conversations, search, filter]);

  // Optional demo: simulate incoming every 20s to a random conversation
  const tickerRef = useRef(null);
  useEffect(() => {
    tickerRef.current = setInterval(() => {
      const pool = conversations;
      if (pool.length === 0) return;
      const idx = Math.floor(Math.random() * pool.length);
      const id = pool[idx].id;
      simulateIncoming(id);
    }, 20000);
    return () => clearInterval(tickerRef.current);
  }, [conversations]);

  return (
  <div className="p-0 md:p-4 bg-slate-100 h-[100svh] md:h-screen overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 md:gap-4 max-w-[1400px] mx-auto h-full min-h-0 overscroll-none">
        {/* Left: Conversations list */}
  <div className={`${selectedId ? 'hidden' : 'flex'} lg:flex lg:col-span-3 bg-white border border-slate-200 overflow-hidden flex-col h-full min-h-0`}>
          <ConversationsList
            items={filtered}
            selectedId={selectedId}
            onSelect={selectConversation}
            search={search}
            setSearch={setSearch}
            filter={filter}
            setFilter={setFilter}
            onSimulateIncoming={() => simulateIncoming()}
          />
        </div>

        {/* Middle: Chat window */}
  <div className={`${selectedId ? 'flex' : 'hidden'} lg:flex lg:col-span-6 bg-white border border-slate-200 overflow-hidden flex-col h-full min-h-0`}>
          <ChatWindow
            conversation={selected}
            messages={messages}
            onSend={handleSend}
            onBack={() => setSelectedId(null)}
            onToggleInfo={() => setShowInfo(true)}
          />
        </div>

        {/* Right: Lead info */}
  <div className="hidden lg:block lg:col-span-3 bg-white border border-slate-200 overflow-hidden h-full min-h-0">
          <LeadInfoPanel
            conversation={selected}
            onToggleAssign={() => selected && toggleAssignToMe(selected.id)}
          />
        </div>

        {/* Mobile Info Overlay */}
        {showInfo && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/20" onClick={() => setShowInfo(false)} />
            <div className="absolute right-0 top-0 h-full w-full sm:w-[85%] bg-white border-l border-slate-200 flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                <div className="font-medium">Detail Prospek</div>
                <button className="text-2xl" onClick={() => setShowInfo(false)}>&times;</button>
              </div>
              <div className="flex-1 overflow-hidden">
                <LeadInfoPanel
                  conversation={selected}
                  onToggleAssign={() => selected && toggleAssignToMe(selected.id)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
