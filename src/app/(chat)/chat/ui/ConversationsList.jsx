"use client";
import { useMemo, useState } from "react";
import { RxAvatar } from "react-icons/rx";
import Swal from "sweetalert2";
import axios from "axios";

export default function ConversationsList({
  items,
  selectedId,
  onSelect,
  search,
  setSearch,
  filter,
  setFilter,
  onSimulateIncoming,
  currentUser,
}) {
  const [loadingClaimId, setLoadingClaimId] = useState(null);

  const counts = useMemo(
    () => ({
      all: items.length,
      unread: items.filter((i) => (i.unread || 0) > 0).length,
      mine: items.filter((i) => i.assignedToMe).length,
      escalating: items.filter((i) => i.escalating).length,
    }),
    [items]
  );

  // Urutkan items dari yang terbaru
  const sortedItems = [...items].sort((a, b) => {
    const aTime = getLastMessageTime(a);
    const bTime = getLastMessageTime(b);
    if (!aTime && !bTime) return 0;
    if (!aTime) return 1;
    if (!bTime) return -1;
    return new Date(bTime) - new Date(aTime);
  });
  console.log("sortedItems", sortedItems);
  console.log("currencyUser", currentUser);

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
        {sortedItems.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            Tidak ada percakapan
          </div>
        ) : (
          sortedItems.map((item) => {
            const isAssignedToMe = item.lead?.agent === currentUser?._id;
            const isAdmin = currentUser?.type === "admin";
            const isUnassigned = !item.lead?.agent;
            return (
              <div key={item.lead?._id || item.id} className="relative">
                <button
                  disabled={isUnassigned && !isAdmin}
                  onClick={() => {
                    if (isUnassigned && !isAdmin) {
                      Swal.fire({
                        icon: "info",
                        title: "Klaim dulu lead ini untuk membuka percakapan!",
                      });
                      return;
                    }
                    onSelect(item.lead?._id || item.id);
                  }}
                  className={`relative w-full text-left flex items-center gap-3 p-4 border-b border-slate-100 hover:bg-slate-50 ${
                    selectedId === (item.lead?._id || item.id)
                      ? "bg-teal-50"
                      : ""
                  } ${isUnassigned && !isAdmin ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {selectedId === (item.lead?._id || item.id) && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-teal-600" />
                  )}
                  {/* Avatar user */}
                  <div className="w-12 h-12 flex items-center justify-center">
                    <RxAvatar className="w-10 h-10 text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0 relative">
                    {/* Nama user dan nomor hanya jika sudah di-assign atau admin */}
                    {(isAdmin || !isUnassigned) ? (
                      <div className="flex justify-between items-start">
                        <p className="font-bold text-slate-800 truncate">
                          {getDisplayName(item.lead)}
                        </p>
                        <p className="text-xs text-slate-400 flex-shrink-0 ml-2 text-right">
                          {formatTime(getLastMessageTime(item))}
                        </p>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start">
                        <p className="font-bold text-slate-400 italic">(Belum diklaim)</p>
                        <p className="text-xs text-slate-400 flex-shrink-0 ml-2 text-right">
                          {formatTime(getLastMessageTime(item))}
                        </p>
                      </div>
                    )}
                    {/* Pesan terakhir */}
                    <div className="flex justify-between items-end mt-1">
                      <p className="text-sm text-slate-500 truncate pr-8">
                        {item.lastMessageText ||
                          (item.messages && item.messages.length > 0
                            ? item.messages[item.messages.length - 1].body
                            : "")}
                      </p>
                    </div>
                    {/* Notif pesan belum dibaca di pojok kanan bawah */}
                    {(item.unread || 0) > 0 && (
                      <div className="absolute bottom-2 right-2 w-5 h-5 bg-teal-500 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0 shadow">
                        {item.unread}
                      </div>
                    )}
                    {item.isNewAssignment && (
                      <div className="mt-2 text-xs font-bold text-red-600 animate-pulse">
                        🔥 TUGAS BARU
                      </div>
                    )}
                  </div>
                </button>
                {/* Tombol klaim lead di luar button utama agar tetap bisa diakses */}
                {isUnassigned && !isAdmin && (
                  <div
                    role="button"
                    tabIndex={0}
                    className={`mx-4 mb-2 px-3 py-1 bg-teal-600 text-white rounded text-xs select-none flex items-center justify-center ${
                      loadingClaimId === item.lead._id || !currentUser || !currentUser._id
                        ? "opacity-60 cursor-not-allowed"
                        : "cursor-pointer hover:bg-teal-700"
                    }`}
                    onClick={async (e) => {
                      if (loadingClaimId || !currentUser || !currentUser._id) {
                        if (!currentUser || !currentUser._id) {
                          Swal.fire({
                            icon: "error",
                            title: "User belum siap, silakan tunggu...",
                          });
                        }
                        return;
                      }
                      e.stopPropagation();
                      setLoadingClaimId(item.lead._id);
                      try {
                        const res = await axios.post(
                          `/api/leads/${item.lead._id}/assign`,
                          {
                            agentId: currentUser._id,
                          }
                        );
                        if (res.data.success) {
                          Swal.fire({
                            icon: "success",
                            title: "Lead berhasil diklaim!",
                          });
                          // if (typeof window !== "undefined") window.location.reload();
                        } else {
                          Swal.fire({
                            icon: "error",
                            title: res.data.error || "Gagal klaim lead",
                          });
                        }
                      } catch (err) {
                        Swal.fire({
                          icon: "error",
                          title: "Gagal klaim lead",
                        });
                      } finally {
                        setLoadingClaimId(null);
                      }
                    }}
                    onKeyDown={e => {
                      if ((e.key === "Enter" || e.key === " ") && !loadingClaimId && currentUser && currentUser._id) {
                        e.preventDefault();
                        e.stopPropagation();
                        e.target.click();
                      }
                    }}
                    aria-disabled={loadingClaimId === item.lead._id || !currentUser || !currentUser._id}
                  >
                    {loadingClaimId === item.lead._id ? (
                      <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                      </svg>
                    ) : null}
                    Klaim Lead
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  function getLastMessageTime(item) {
    if (item.lastMessageAt) return item.lastMessageAt;
    if (item.messages && item.messages.length > 0) {
      const lastMsg = item.messages[item.messages.length - 1];
      return lastMsg.sentAt || lastMsg.timestamp || null;
    }
    return null;
  }
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
  if (
    !lead.name ||
    lead.name.trim() === "" ||
    lead.name === "Prospek WhatsApp" ||
    lead.name === "-"
  ) {
    return lead.contact || "?";
  }
  return lead.name;
}
