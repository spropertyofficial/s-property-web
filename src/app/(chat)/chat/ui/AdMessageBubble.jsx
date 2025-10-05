

import React, { useState } from "react";

function formatTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function AdMessageBubble({ message, mine }) {
  // Ambil semua field iklan
  const headline = message.ReferralHeadline || message.referralHeadline;
  const body = message.ReferralBody || message.referralBody;
  const url = message.ReferralSourceUrl || message.referralSourceUrl;
  const adText = message.body;
  const sender = message.ProfileName || "";
  const time = message.ts || message.sentAt || message.createdAt || message.receivedAt;
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpand = () => setIsExpanded((v) => !v);

  // Professional UI/UX: Remove Media ID, sender optional, headline emphasized, body always visible (expand for long), URL as button, clean spacing
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-md w-full px-5 py-4 rounded-2xl shadow-lg border ${
          mine
            ? "bg-teal-600 text-white border-teal-300"
            : "bg-white text-slate-800 border-slate-200"
        }`} 
        style={{ position: "relative", boxShadow: mine ? "0 2px 8px rgba(20, 184, 166, 0.08)" : "0 2px 8px rgba(100,116,139,0.08)" }}
      >
        {/* Headline */}
        {headline && (
          <div className="flex items-center gap-2 mb-2">
            <span className={mine ? "text-white" : "text-teal-600"} style={{ fontWeight: 700, fontSize: "1.1em" }}>📢</span>
            <span className={mine ? "font-bold text-white text-base" : "font-bold text-teal-700 text-base"}>{headline}</span>
          </div>
        )}
        {/* Ad text */}
        {adText && <div className={mine ? "text-sm text-white mb-2" : "text-sm text-teal-900 mb-2 pb-2 border-b-2"}>{adText}</div>}
        {/* Body, always visible, expand for long text */}
        {body && (
          <div className="relative">
            <div className={`text-xs whitespace-pre-line ${isExpanded ? "max-h-none" : "max-h-20 overflow-hidden"} transition-all duration-300`} style={{ color: mine ? "#fff" : "#134e4a" }}>
              {body}
            </div>
            {body.length > 120 && (
              <button
                onClick={toggleExpand}
                className={mine ? "text-white/80 text-xs mt-1 hover:underline" : "text-teal-600 text-xs mt-1 hover:underline"}
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                {isExpanded ? "Sembunyikan detail" : "Lihat detail"}
              </button>
            )}
          </div>
        )}
        {/* URL as button */}
        {url && (
          <div className="mt-3">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={mine ? "inline-block px-3 py-1 rounded bg-white/20 text-xs text-white font-semibold hover:bg-white/30 transition" : "inline-block px-3 py-1 rounded bg-teal-100 text-xs text-teal-700 font-semibold hover:bg-teal-200 transition"}
              style={{ textDecoration: "none" }}
            >
              <span className="mr-1">🔗</span> Kunjungi tautan
            </a>
          </div>
        )}
        {/* Sender & time, subtle at bottom right */}
        <div className="flex justify-end items-center gap-2 mt-4 text-xs opacity-70">
          {sender && <span className={mine ? "text-white/70" : "text-slate-500"}>{sender}</span>}
          <span className={mine ? "text-white/70" : "text-slate-400"}>{formatTime(time)}</span>
        </div>
      </div>
    </div>
  );
}
