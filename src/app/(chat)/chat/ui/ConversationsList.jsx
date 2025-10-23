"use client";
import { useMemo, useState, useEffect } from "react";
import { RxAvatar } from "react-icons/rx";
import { FaSpinner } from "react-icons/fa";
import { ImWarning } from "react-icons/im";
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
  escalationMinutes = 5,
  refetchConversations,
  isLeader = false,
  agentIdsInScope = [],
}) {
  const [loadingClaimId, setLoadingClaimId] = useState(null);
  const [now, setNow] = useState(Date.now());
  const isAdmin = currentUser?.role;

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter: tampilkan hanya lead yang sedang dieskalasi (belum diklaim, sudah di-assign ke agent giliran, WhatsApp), atau milik agent
  const filteredItems = items.filter((item) => {
    // Untuk leader: tampilkan semua percakapan milik sendiri dan anggota tim
    if (isLeader && agentIdsInScope.length > 0) {
      const agentId = item.lead?.agent?._id || item.lead?.agent;
      return agentIdsInScope.includes(agentId);
    }
    // Untuk agent biasa: hanya milik sendiri
    const isAssignedToMe = item.lead?.agent?._id === currentUser?._id || item.lead?.agent === currentUser?._id;
    // Lead WhatsApp yang belum diklaim, sudah di-assign ke agent giliran, dan sedang dalam masa eskalasi
    const isEscalating =
      item.lead?.isClaimed === false &&
      item.lead?.source === "Leads Kantor" &&
      (item.lead?.agent?._id === currentUser?._id || item.lead?.agent === currentUser?._id);
    if (isAssignedToMe || isEscalating) {
      return item;
    }
  });

  const counts = useMemo(
    () => ({
      all: isAdmin ? items.length : filteredItems.length,
      unread: isAdmin
        ? items.filter((i) => (i.unread || 0) > 0).length
        : filteredItems.filter((i) => (i.unread || 0) > 0).length,
    }),
    [filteredItems]
  );

  console.log("filteredItems", filteredItems);
  // Urutkan items dari yang terbaru
  const displayItems = isAdmin ? items : filteredItems;
  const sortedItems = [...displayItems].sort((a, b) => {
    const aTime = getLastMessageTime(a);
    const bTime = getLastMessageTime(b);
    if (!aTime && !bTime) return 0;
    if (!aTime) return 1;
    if (!bTime) return -1;
    return new Date(bTime) - new Date(aTime);
  });
  console.log("sortedItems", sortedItems);
  console.log("currencyUser", currentUser);

  async function handleClaimLead(e, leadId) {
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
    setLoadingClaimId(leadId);
    try {
      const res = await axios.post(`/api/leads/${leadId}/assign`, {
        agentId: currentUser._id,
      });
      if (res.data && res.data.success) {
        Swal.fire({
          icon: "success",
          title: "Lead berhasil diklaim!",
        });
        refetchConversations(); // Refresh daftar percakapan
      } else {
        Swal.fire({
          icon: "warning",
          title: "Gagal klaim lead",
          text: "Ini bukan giliran Anda. Silakan tunggu giliran berikutnya.",
        });
      }
    } catch (err) {
      const message = err.response?.data?.error;
      const status = err.response?.status;

      if (status === 403 || message === "Bukan giliran agent ini") {
        Swal.fire({
          icon: "warning",
          title: "Gagal",
          text: "Ini bukan giliran Anda. Silakan tunggu giliran.",
        });
      } else if (status === 404 || message === "Lead tidak ditemukan") {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: "Lead tidak ditemukan",
        });
      } else if (
        status === 409 ||
        message === "Lead sudah di-assign" ||
        message === "Lead sudah diklaim"
      ) {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: "Lead sudah punya orang lain",
        });
      } else if (message === "agentId kosong") {
        Swal.fire({
          icon: "warning",
          title: "Gagal",
          text: "agentId kosong",
        });
      } else if (message === "Queue agent kosong") {
        Swal.fire({
          icon: "warning",
          title: "Gagal",
          text: "Queue agent kosong",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: message || "Terjadi kesalahan saat klaim lead.",
        });
      }
    } finally {
      setLoadingClaimId(null);
    }
  }
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 flex-shrink-0 bg-white">
        <h2 className="text-lg font-bold text-slate-800">Kotak Masuk</h2>
        {isLeader && (
          <div className="mt-2 mb-2 p-2 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs rounded">
            Anda adalah <b>Leader</b>. Percakapan milik anda dan anggota tim ditampilkan.
          </div>
        )}
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
            { key: "unread", label: `Belum Dibaca (${counts.unread})` },
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
            const isAssignedToMe = item.lead?.agent._id === currentUser?._id;
            const isAdmin = currentUser?.role === "superadmin" || currentUser?.role === "editor";
            const isNotClaimed = item.lead?.isClaimed === false;
            // Helper: tampilkan nama/nomor hanya jika sudah di-assign atau admin
            const displayName =
              isAdmin ||
              (
                (isLeader && agentIdsInScope.includes(item.lead?.agent?._id || item.lead?.agent) && item.lead?.isClaimed === true)
              ) ||
              (
                (!isLeader && isAssignedToMe && item.lead?.isClaimed === true)
              )                ? getDisplayName(item.lead)
                : "(Belum diklaim)";
            // Disabled jika giliran saya, belum diklaim, dan bukan admin
            const isDisabled = isAssignedToMe && isNotClaimed &&( !isAdmin || isLeader === true);

            return (
              <div key={item.lead?._id || item.id} className="relative">
                <button
                  disabled={isDisabled}
                  onClick={() => {
                    if (isNotClaimed && (!isAdmin && isLeader===true)) {
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
                  } ${isDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
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
                    <div className="flex justify-between items-start">
                      <p
                        className={`font-bold truncate ${
                          isAdmin || !!isAssignedToMe
                            ? "text-slate-800"
                            : "text-slate-400 italic"
                        }`}
                      >
                        {displayName}
                      </p>
                      <p className="text-xs text-slate-400 flex-shrink-0 ml-2 text-right">
                        {formatTime(getLastMessageTime(item))}
                      </p>
                    </div>
                    {/* TIMER ESKALASI untuk lead belum diklaim */}
                    {isNotClaimed && (
                      <EscalationTimer
                        leadInAt={item.lead?.assignedAt || item.lead?.leadInAt}
                        escalationMinutes={escalationMinutes}
                      />
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
                    {item.lead.propertyName && (
                      <div className="inline-block px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold mb-1 shadow-sm border border-teal-100">
                        {item.lead.propertyName || item.lead.property?.name}
                      </div>
                    )}
                    {/* Badge nama agent pemilik lead */}
                    {(isAdmin || isLeader) && (
                      <div className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-normal mb-1 ml-1 border border-slate-200 align-middle">
                        {item.lead?.agent?._id === currentUser?._id ? "Saya" : item.lead?.agent?.name || "-"}
                      </div>
                    )}
                    
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
                {isNotClaimed &&
                  item.lead?.source === "Leads Kantor" &&
                  isAssignedToMe &&
                  !isAdmin &&
                  (() => {
                    // Gunakan assignedAt untuk expiry
                    const assignedAt =
                      item.lead?.assignedAt || item.lead?.leadInAt;
                    const nowMs = Date.now();
                    const assignMs = assignedAt
                      ? new Date(assignedAt).getTime()
                      : 0;
                    const minutesSinceAssign = assignedAt
                      ? (nowMs - assignMs) / 1000 / 60
                      : 0;
                    const isExpired = minutesSinceAssign >= escalationMinutes;
                    const isDisabled =
                      loadingClaimId === item.lead._id ||
                      !currentUser ||
                      !currentUser._id ||
                      isExpired;
                    return (
                      <div
                        role="button"
                        tabIndex={0}
                        className={`mx-4 mb-2 px-3 py-1 bg-teal-600 text-white rounded text-xs select-none flex items-center justify-center ${
                          isDisabled
                            ? "opacity-60 cursor-not-allowed"
                            : "cursor-pointer hover:bg-teal-700"
                        }`}
                        onClick={
                          isDisabled
                            ? undefined
                            : (e) => handleClaimLead(e, item.lead?._id)
                        }
                        aria-disabled={isDisabled}
                      >
                        {loadingClaimId === item.lead._id ? (
                          <span className="mr-2">
                            <FaSpinner className="animate-spin h-4 w-4 text-white" />
                          </span>
                        ) : null}
                        {isExpired ? (
                          <span className="ml-">
                            <ImWarning className="inline-block mr-1" />
                            Waktu habis
                          </span>
                        ) : (
                          <span>Klaim Lead</span>
                        )}
                      </div>
                    );
                  })()}
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

// Komponen timer eskalasi
function EscalationTimer({ leadInAt, escalationMinutes = 5 }) {
  // Ubah agar menerima assignedAt, bukan leadInAt
  // Backward compatible: jika assignedAt tidak ada, fallback ke leadInAt
  const assignedAt = leadInAt;
  if (!assignedAt) return null;
  const [totalSeconds, setTotalSeconds] = useState(0);
  useEffect(() => {
    const startMs = new Date(assignedAt).getTime();
    const endMs = startMs + escalationMinutes * 60 * 1000;
    const tick = () => {
      const left = Math.max(0, Math.floor((endMs - Date.now()) / 1000));
      setTotalSeconds(left);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [assignedAt, escalationMinutes]);

  const min = Math.floor(totalSeconds / 60);
  const sec = totalSeconds % 60;
  return (
    <div className="mt-1 text-xs text-orange-600 font-semibold">
      {totalSeconds > 0
        ? `Ditutup dalam ${min.toString().padStart(2, "0")}:${sec
            .toString()
            .padStart(2, "0")}`
        : "Menunggu giliran..."}
    </div>
  );
}

function formatTime(ts) {
  // Untuk waktu pesan (jam:menit)
  if (!ts) return "";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
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
