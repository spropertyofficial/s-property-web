"use client";
import { useMemo } from "react";
import { RxAvatar } from "react-icons/rx";

export default function ConversationsList({
  items,
  selectedId,
  onSelect,
  search,
  setSearch,
  filter,
  setFilter,
  onSimulateIncoming,
}) {
  const counts = useMemo(
    () => ({
      all: items.length,
      unread: items.filter((i) => (i.unread || 0) > 0).length,
      mine: items.filter((i) => i.assignedToMe).length,
      escalating: items.filter((i) => i.escalating).length,
    }),
    [items]
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 flex-shrink-0 bg-white">
        <h2 className="text-lg font-bold text-slate-800">Kotak Masuk</h2>
        <div className="mt-3 flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari percakapan..."
            className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
          />
          <button
            className="px-3 py-2 text-sm border rounded-lg hover:bg-slate-50"
            onClick={onSimulateIncoming}
          >
            Simulasi
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs">
          {[
            { key: "all", label: `Semua (${counts.all})` },
            { key: "mine", label: `Milik Saya (${counts.mine})` },
            { key: "unread", label: `Belum Dibaca (${counts.unread})` },
            { key: "escalating", label: `Eskalasi (${counts.escalating})` },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-2.5 py-1.5 rounded-full border ${
                filter === f.key
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-white hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div id="conversation-list" className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            Tidak ada percakapan
          </div>
        ) : (
          items.map((item) => (
            <button
              key={item.lead?._id || item.id}
              onClick={() => onSelect(item.lead?._id || item.id)}
              className={`relative w-full text-left flex items-center gap-3 p-4 border-b border-slate-100 hover:bg-slate-50 ${
                selectedId === (item.lead?._id || item.id) ? "bg-teal-50" : ""
              }`}
            >
              {selectedId === (item.lead?._id || item.id) && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-teal-600" />
              )}
              {/* Avatar user */}
              <div className="w-12 h-12 flex items-center justify-center">
                <RxAvatar className="w-10 h-10 text-teal-600" />
              </div>
              <div className="flex-1 min-w-0">
                {/* Nama user */}
                <div className="flex justify-between items-start">
                  <p className="font-bold text-slate-800 truncate">
                    {getDisplayName(item.lead)}
                  </p>
                  <p className="text-xs text-slate-400 flex-shrink-0 ml-2">
                    {item.timestamp || formatTime(item.lastMessageAt)}
                  </p>
                </div>
                {/* Pesan terakhir */}
                <div className="flex justify-between items-end mt-1">
                  <p className="text-sm text-slate-500 truncate">
                    {item.lastMessageText || (item.messages && item.messages.length > 0 ? item.messages[item.messages.length - 1].body : "")}
                  </p>
                  {(item.unread || 0) > 0 && (
                    <div className="w-5 h-5 bg-teal-500 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                      {item.unread}
                    </div>
                  )}
                </div>
                {item.isNewAssignment && (
                  <div className="mt-2 text-xs font-bold text-red-600 animate-pulse">
                    🔥 TUGAS BARU
                  </div>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function formatTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getDisplayName(lead) {
  if (!lead) return "?";
  if (!lead.name || lead.name.trim() === "" || lead.name === "Prospek WhatsApp" || lead.name === "-") {
    return lead.contact || "?";
  }
  return lead.name;
}
