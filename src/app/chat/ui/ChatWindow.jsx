"use client";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ChatWindow({ conversation, messages, onSend, showEscalation, onStopEscalation, onBack, onToggleInfo }) {
  const [text, setText] = useState("");
  const scrollerRef = useRef(null);
  const inputRef = useRef(null);
  const [kbOffset, setKbOffset] = useState(0);
  const composerRef = useRef(null);
  const [composerH, setComposerH] = useState(56);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Scroll to bottom on new messages
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [messages, conversation?.id]);

  useEffect(() => {
    // On mobile, focus the input when a chat is opened to bring up the keyboard
    if (!conversation) return;
  const m = typeof window !== 'undefined' && window.innerWidth < 1024;
  if (m) {
      setTimeout(() => {
        try { inputRef.current?.focus({ preventScroll: true }); } catch {}
      }, 0);
    }
  }, [conversation?.id]);

  useEffect(() => {
    // Adjust bottom padding to sit above the soft keyboard using VisualViewport when available
    if (typeof window === 'undefined' || !window.visualViewport) return;
    const vv = window.visualViewport;
    const handler = () => {
      const innerH = window.innerHeight || 0;
      const overlap = Math.max(0, innerH - (vv.height + vv.offsetTop));
      setKbOffset(overlap);
    };
    handler();
    vv.addEventListener('resize', handler);
    vv.addEventListener('scroll', handler);
    return () => {
      vv.removeEventListener('resize', handler);
      vv.removeEventListener('scroll', handler);
    };
  }, []);

  // Track mobile viewport changes
  useEffect(() => {
    const handler = () => setIsMobile(typeof window !== 'undefined' && window.innerWidth < 1024);
    handler();
    window.addEventListener('resize', handler);
    window.addEventListener('orientationchange', handler);
    return () => {
      window.removeEventListener('resize', handler);
      window.removeEventListener('orientationchange', handler);
    };
  }, []);

  // Observe composer height to set spacer
  useEffect(() => {
    if (!composerRef.current) return;
    const el = composerRef.current;
    const update = () => setComposerH(el.offsetHeight || 56);
    update();
    if (typeof ResizeObserver !== 'undefined'){
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => ro.disconnect();
    } else {
      const id = setInterval(update, 300);
      return () => clearInterval(id);
    }
  }, [composerRef.current]);

  function handleSubmit(e){
    e.preventDefault();
    const trimmed = text.trim();
    if(!trimmed) return;
    onSend?.(trimmed);
    setText("");
  }

  if(!conversation){
    return (
      <div className="h-full grid place-items-center text-slate-500">
        <div className="text-5xl mb-4">💬</div>
        <div className="text-center">
          <h2 className="text-xl font-bold">Pilih Percakapan</h2>
          <p className="max-w-xs">Pilih salah satu percakapan dari daftar di sebelah kiri untuk memulai.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-rows-[auto,1fr,auto] h-full min-h-0 overflow-hidden">
      <div className="px-3 py-3 border-b border-slate-200 bg-white flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={onBack} className="lg:hidden mr-2 p-2 rounded-full hover:bg-slate-100"><ArrowLeft/></button>
          <div className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-lg mr-3">{getInitials(conversation.lead.name)}</div>
          <div>
            <div className="font-bold text-slate-800">{conversation.lead.name}</div>
            <div className="text-xs text-slate-500">{conversation.lead.property?.name || conversation.lead.phone}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {conversation.assignedToMe ? (
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Milik Saya</span>
          ) : (
            <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">Tidak Ditugaskan</span>
          )}
          <button onClick={onToggleInfo} className="lg:hidden p-2 rounded-full hover:bg-slate-100" title="Info">ℹ️</button>
        </div>
      </div>

      {showEscalation && (
        <div className="p-2 bg-yellow-100 text-yellow-800 text-sm text-center relative">
          <div className="absolute left-0 top-0 bottom-0 bg-yellow-300 transition-all duration-1000" style={{ width: "50%" }}></div>
          <span className="relative">Harap respons dalam <span className="font-bold">5:00</span> menit atau lead akan dialihkan.</span>
        </div>
      )}

      <div
        ref={scrollerRef}
        className="min-h-0 overflow-y-auto p-4 bg-slate-50 overscroll-contain [overflow-anchor:none]"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {!messages || messages.length===0 ? (
      <div className="h-full grid place-items-center text-slate-500">Belum ada pesan</div>
        ) : messages.map(m => (
          <MessageBubble key={m.id} mine={m.sender==='me'} text={m.body} ts={m.ts} status={m.status} />
        ))}
        {/* Spacer to prevent last message hidden behind fixed composer on mobile */}
        {isMobile && <div style={{ height: composerH }} />}
      </div>

      <form
        ref={composerRef}
        onSubmit={handleSubmit}
        className={`${isMobile ? 'fixed left-0 right-0 z-20' : ''} p-3 border-t bg-white`}
        style={isMobile ? { bottom: `${kbOffset}px` } : undefined}
      >
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            rows={1}
            value={text}
            onChange={e=>setText(e.target.value)}
            placeholder="Tulis pesan..."
    className="flex-1 resize-none rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 max-h-32"
            inputMode="text"
            enterKeyHint="send"
            autoCorrect="on"
            autoCapitalize="sentences"
          />
          <button type="submit" className="px-5 py-2 rounded-lg bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 disabled:opacity-50 active:scale-95" disabled={!text.trim()}>Kirim</button>
        </div>
      </form>
    </div>
  );
}

function MessageBubble({ mine, text, ts, status }){
  return (
    <div className={`flex ${mine?"justify-end":"justify-start"} mb-2`}>
      <div className={`max-w-md p-3 rounded-lg ${mine?"chat-bubble-agent":"chat-bubble-lead"}`}>
        <div className="whitespace-pre-wrap text-sm">{text}</div>
        <div className={`mt-1 text-[10px] ${mine?"text-white/70":"text-slate-400"}`}>
          {formatTime(ts)}{mine?` • ${status}`:""}
        </div>
      </div>
    </div>
  );
}

function formatTime(ts){
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getInitials(name){
  return name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();
}
