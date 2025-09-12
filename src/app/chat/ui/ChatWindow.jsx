"use client";
import { ArrowLeft, Files, Images, Video } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FaPlay, FaPause, FaPaperclip, FaVideo } from "react-icons/fa";

export default function ChatWindow({ conversation, messages, onSend, showEscalation, onStopEscalation, onBack, onToggleInfo, refetchConversations }) {
  // Untuk auto-resize textarea maksimal 6 baris
  const maxRows = 6;
  const [inputRows, setInputRows] = useState(1);
  function handleInputChange(e) {
    setText(e.target.value);
    // Hitung jumlah baris
    const lines = e.target.value.split('\n').length;
    setInputRows(Math.min(maxRows, lines));
  }
  // Debug: tampilkan isi conversation di console
  console.log('[ChatWindow] conversation:', conversation);
  useEffect(() => {
    if (!conversation || !messages || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.direction === "inbound" && lastMsg.status === "received") {
      fetch("/api/conversations/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: conversation.lead._id })
      }).then(() => {
        if (typeof refetchConversations === "function") {
          refetchConversations();
        }
      });
    }
  }, [messages, conversation?.id, refetchConversations]);
  const [text, setText] = useState("");
  const scrollerRef = useRef(null);
  const inputRef = useRef(null);
  const [kbOffset, setKbOffset] = useState(0);
  const composerRef = useRef(null);
  const [composerH, setComposerH] = useState(56);
  const [isMobile, setIsMobile] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  const [showAttachmentType, setShowAttachmentType] = useState(false);
  const [attachmentType, setAttachmentType] = useState(null);
  const [attachmentPreviews, setAttachmentPreviews] = useState([]); // array of {url, type, name, caption}
  const [attachmentFiles, setAttachmentFiles] = useState([]); // array of File
  const fileInputRef = useRef();
  const [activePreviewIdx, setActivePreviewIdx] = useState(0);

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
    if (attachmentFiles.length > 0 && attachmentType) {
      // Kirim satu per satu, hanya file pertama dengan caption
      const sendAll = async () => {
        for (let i = 0; i < attachmentFiles.length; i++) {
          const file = attachmentFiles[i];
          const caption = i === 0 ? text : "";
          await handleSendMedia({ file, type: file.type, text: caption });
        }
        setAttachmentPreviews([]);
        setAttachmentFiles([]);
        setAttachmentType(null);
        setText("");
      };
      sendAll();
      return;
    }
    if (!trimmed) return;
    onSend?.(trimmed);
    setText("");
  }

  function handlePreviewImg(url) { setPreviewImg(url); }
  function closePreviewImg() { setPreviewImg(null); }
  function handleAttachmentClick(e) {
    setShowAttachmentType(true);
  }
  function closeAttachmentType() { setShowAttachmentType(false); }
  function handleAttachmentTypeSelect(type) {
    setAttachmentType(type);
    setShowAttachmentType(false);
    setTimeout(() => fileInputRef.current?.click(), 100); // trigger file input
  }

  // Di ChatWindow.jsx
  async function handleSendMedia({ file, type, text }) {
    if (!file || !type) return;
    // Konversi file ke base64
    const toBase64 = file => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const base64 = await toBase64(file);
    // Kirim ke backend
    const res = await fetch("/api/conversations/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leadId: conversation.lead._id,
        message: text || "",
        mediaFile: base64,
        mediaType: type,
      })
    });
    const data = await res.json();
    if (data.success) {
      // Optionally, refetch chat
      if (typeof refetchConversations === "function") refetchConversations();
    } else {
      alert(data.error || "Gagal mengirim media");
    }
  }

  function handleFileChange(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setAttachmentFiles(prev => [...prev, ...files]);
    setAttachmentType(attachmentType); // tetap simpan tipe
    // Preview semua file
    const previews = files.map(file => {
      if (file.type.startsWith('image')) {
        return { url: URL.createObjectURL(file), type: 'image', name: file.name };
      } else if (file.type.startsWith('video')) {
        return { url: URL.createObjectURL(file), type: 'video', name: file.name };
      } else if (file.type === 'application/pdf') {
        return { url: '', type: 'document', name: file.name };
      } else {
        return { url: '', type: 'document', name: file.name };
      }
    });
    setAttachmentPreviews(prev => [...prev, ...previews]);
    e.target.value = "";
  }

  function handleRemovePreview(idx) {
    setAttachmentPreviews(prev => prev.filter((_, i) => i !== idx));
    setAttachmentFiles(prev => prev.filter((_, i) => i !== idx));
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
      {/* Modal preview gambar */}
      {previewImg && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center" onClick={closePreviewImg}>
          <img src={previewImg} alt="Preview" className="max-w-max max-h-[80%] rounded-lg shadow-lg" onClick={e => e.stopPropagation()} />
          <button className="absolute top-4 right-4 text-white text-2xl bg-black/50 rounded-full px-3 py-1" onClick={closePreviewImg}>&times;</button>
        </div>
      )}

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
        ) : (
          // Kelompokkan pesan per tanggal
          (() => {
            const groups = {};
            messages.forEach(m => {
              const d = new Date(m.ts || m.sentAt || m.createdAt || m.receivedAt);
              const dateStr = isNaN(d.getTime()) ? "" : d.toLocaleDateString("id-ID", { year: 'numeric', month: 'long', day: 'numeric' });
              if (!groups[dateStr]) groups[dateStr] = [];
              groups[dateStr].push(m);
            });
            return Object.entries(groups).map(([date, msgs]) => (
              <div key={date}>
                <div className="flex justify-center my-4">
                  <span className="px-4 py-1 rounded-full bg-slate-200 text-xs text-slate-700 font-semibold shadow">{date}</span>
                </div>
                {msgs.map(m => (
                  <MessageBubble 
                    key={m._id ? m._id : m.twilioSid ? `pending-${m.twilioSid}` : `pending-${Math.random()}`}
                    {...m} 
                    mine={m.direction === "outbound"} 
                    text={m.body} 
                    onPreviewImg={handlePreviewImg}
                  />
                ))}
              </div>
            ));
          })()
        )}
        {/* Spacer to prevent last message hidden behind fixed composer on mobile */}
        {isMobile && <div style={{ height: composerH }} />}
      </div>

      {/* Tampilkan preview di composer sebelum kirim */}
      <form
        ref={composerRef}
        onSubmit={handleSubmit}
        className={`${isMobile ? 'fixed left-0 right-0 z-20' : ''} p-3 border-t bg-white`}
        style={isMobile ? { bottom: `${kbOffset}px` } : undefined}
      >
        <div className="flex items-end gap-2" style={{ position: 'relative' }}>
          {/* Button lampiran */}
          <div style={{ position: 'relative' }}>
            <button type="button" className="p-2 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300" title="Lampirkan file" onClick={handleAttachmentClick}>
              <FaPaperclip />
            </button>
            {/* Popup pilihan tipe lampiran di atas button, scoped ke button */}
            {showAttachmentType && (
              <div
                className="absolute z-50 left-[30%] bottom-12 w-44"
                onClick={closeAttachmentType}
              >
                <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col gap-2 w-fit" onClick={e => e.stopPropagation()}>
                  <button className="py-2 px-4 rounded bg-teal-600 text-white font-semibold hover:bg-teal-700 w-fit" onClick={() => handleAttachmentTypeSelect('image')}><Images /></button>
                  <button className="py-2 px-4 rounded bg-teal-600 text-white font-semibold hover:bg-teal-700 w-fit" onClick={() => handleAttachmentTypeSelect('video')}><Video/></button>
                  <button className="py-2 px-4 rounded bg-teal-600 text-white font-semibold hover:bg-teal-700 w-fit" onClick={() => handleAttachmentTypeSelect('document')}><Files /></button>
                  <button className="mt-2 text-xs text-slate-500 hover:underline" onClick={closeAttachmentType}>Batal</button>
                </div>
              </div>
            )}
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              accept={attachmentType === 'image' ? 'image/*' : attachmentType === 'video' ? 'video/*' : attachmentType === 'document' ? '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar' : ''}
              multiple
              onChange={handleFileChange}
            />
          </div>
          {/* Input chat/kolom caption */}
          {attachmentPreviews.length > 0 ? (
            <textarea
              ref={inputRef}
              rows={inputRows}
              value={text}
              onChange={handleInputChange}
              placeholder="Keterangan (opsional)"
              className="flex-1 resize-none rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              style={{maxHeight: `${maxRows * 24}px`, overflowY: inputRows === maxRows ? 'auto' : 'hidden'}}
              inputMode="text"
              enterKeyHint="send"
              autoCorrect="on"
              autoCapitalize="sentences"
            />
          ) : (
            <textarea
              ref={inputRef}
              rows={inputRows}
              value={text}
              onChange={handleInputChange}
              placeholder="Tulis pesan..."
              className="flex-1 resize-none rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              style={{maxHeight: `${maxRows * 24}px`, overflowY: inputRows === maxRows ? 'auto' : 'hidden'}}
              inputMode="text"
              enterKeyHint="send"
              autoCorrect="on"
              autoCapitalize="sentences"
            />
          )}
          {/* Tampilkan preview di composer sebelum kirim */}
          {attachmentPreviews.length > 0 && (
            <div className="fixed left-0 right-0 bottom-[72px] z-30 flex justify-center pointer-events-none">
              <div className="bg-white rounded-xl shadow-lg border border-slate-300 px-4 py-3 w-full max-w-lg flex flex-col gap-2 pointer-events-auto">
                <div className="flex gap-3 overflow-x-auto pb-2 items-center">
                  {attachmentPreviews.map((preview, idx) => (
                    <div
                      key={idx}
                      className={`relative flex flex-col items-center min-w-[110px] max-w-[140px] cursor-pointer ${activePreviewIdx === idx ? 'border-2 border-teal-500' : 'border'} rounded-lg bg-white`}
                      onClick={() => setActivePreviewIdx(idx)}
                    >
                      {preview.type === 'image' && (
                        <img src={preview.url} alt="preview" className="w-[100px] h-[100px] object-cover rounded-lg" />
                      )}
                      {preview.type === 'video' && (
                        <video src={preview.url} controls className="w-[100px] h-[100px] rounded-lg object-cover" />
                      )}
                      {preview.type === 'document' && (
                        <span className="inline-block px-3 py-2 bg-slate-200 rounded text-xs text-slate-700 border w-[100px] text-center">{preview.name}</span>
                      )}
                      <button type="button" className="absolute top-2 right-2 bg-black/60 text-white rounded-full px-2 py-0.5 text-xs" onClick={e => { e.stopPropagation(); handleRemovePreview(idx); }}>&times;</button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 justify-end mt-1">
                  <button type="button" className="px-3 py-1 rounded bg-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-300" onClick={() => {
                    setAttachmentPreviews([]);
                    setAttachmentFiles([]);
                    setAttachmentType(null);
                    setActivePreviewIdx(0);
                  }}>Batal</button>
                  <button type="button" className="px-3 py-1 rounded bg-teal-500 text-white text-xs font-bold hover:bg-teal-600" onClick={() => fileInputRef.current?.click()}>+ Tambah</button>
                </div>
              </div>
            </div>
          )}
          <button type="submit" className="px-5 py-2 rounded-lg bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 disabled:opacity-50 active:scale-95" disabled={!text.trim()}>Kirim</button>
        </div>
      </form>
    </div>
  );
}

function SimpleAudioPlayer({ url }) {
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateTime = () => setCurrentTime(audio.currentTime);
    const setAudioDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setPlaying(false);
      setCurrentTime(0); // Reset ke awal setelah selesai
    };
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', setAudioDuration);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', setAudioDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    if (playing) audioRef.current?.play();
    else audioRef.current?.pause();
  }, [playing]);

  function togglePlay() {
    if (!playing && currentTime === duration) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
    setPlaying(p => !p);
  }

  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={togglePlay} className="p-2 rounded-full bg-teal-600 text-white">
        {playing ? <FaPause /> : <FaPlay />}
      </button>
      <audio ref={audioRef} src={url} preload="metadata" style={{ display: 'none' }} />
      <span className="text-xs text-slate-500 min-w-[40px]">{formatAudioTime(currentTime)} / {formatAudioTime(duration)}</span>
    </div>
  );
}

function MessageBubble({ mine, text, ts, status, sentAt, createdAt, receivedAt, mediaUrls, mediaTypes, ...payload }){
  // Pilih waktu pesan yang valid
  const time = ts || sentAt || createdAt || receivedAt;
  // Ambil fungsi preview dari props jika ada
  const { onPreviewImg } = payload;
  // Pastikan bubble tetap dirender meski text kosong jika ada media
  const hasMedia = mediaUrls && mediaUrls.length > 0;
  const hasText = text && text.trim().length > 0;
  if (!hasMedia && !hasText) return null;
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-md px-4 py-3 rounded-2xl shadow-md border ${mine ? "bg-teal-600 text-white border-teal-300" : "bg-white text-slate-800 border-slate-200"}`}
      >
        {/* Tampilkan media jika ada */}
        {hasMedia && mediaUrls.map((url, idx) => {
          const type = mediaTypes[idx] || "";
          if (type.startsWith("image")) {
            return (
              <span key={url} className="mb-2 block cursor-pointer" onClick={() => onPreviewImg?.(url)}>
                <Image src={url} alt="media" width={200} height={200} className="max-w-xs max-h-60 rounded transition-transform hover:scale-105" />
              </span>
            );
          }
          if (type.startsWith("video")) {
            return <video key={url} src={url} controls className="mb-2 max-w-xs max-h-60 rounded" />;
          }
          if (type.startsWith("audio")) {
            return <SimpleAudioPlayer key={url} url={url} />;
          }
          if (type === "application/pdf") {
            return <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="mb-2 block text-blue-600 underline">Lihat PDF</a>;
          }
          // Default: link download
          return <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="mb-2 block text-blue-600 underline">Download File</a>;
        })}
        {hasText && <div className="whitespace-pre-wrap text-sm">{text}</div>}
        <div className={`mt-1 text-[10px] ${mine ? "text-white/70" : "text-slate-400"}`}>
          {formatTime(time)}{mine ? ` • ${status}` : ""}
        </div>
      </div>
    </div>
  );
}

function formatTime(ts){
  // Untuk waktu pesan (jam:menit)
  if (!ts) return "";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatAudioTime(secs) {
  // Untuk audio player (menit:detik)
  if (!secs || isNaN(secs)) return "00:00";
  const min = Math.floor(secs / 60);
  const sec = Math.floor(secs % 60);
  return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

function getInitials(name){
  return name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();
}
