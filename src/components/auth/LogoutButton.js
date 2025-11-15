"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  ChevronDown,
  User,
  LogOut,
  Shield,
  FileText,
  Bell,
  MessageCircleOff,
  Download,
} from "lucide-react";
import Link from "next/link";
import { FaMessage, FaRegMessage } from "react-icons/fa6";
import Swal from "sweetalert2";

export default function LogoutButton({
  className = "",
  variant = "default",
  showUserInfo = false,
  onLogoutComplete,
}) {
  const { user, logout, isAgent } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEnablingNotif, setIsEnablingNotif] = useState(false);
  const [isTestingNotif, setIsTestingNotif] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const containerRef = useRef(null);

  // Helper: convert base64 public key to Uint8Array
  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData =
      typeof window !== "undefined"
        ? window.atob(base64)
        : Buffer.from(base64, "base64").toString("binary");
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Enable Web Push on this device
  async function enableNotificationsOnThisDevice() {
    try {
      setIsEnablingNotif(true);
      if (typeof window === "undefined") return;
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        await Swal.fire({
          icon: "warning",
          title: "Tidak didukung",
          text: "Browser Anda tidak mendukung Web Push Notifications.",
        });
        return;
      }

      // Ensure Service Worker registration exists and is push-capable
      let registration = await navigator.serviceWorker.getRegistration();
      const ensureNotificationsSW = async () => {
        try {
          const currentUrl = registration?.active?.scriptURL || registration?.installing?.scriptURL || "";
          const isNotifications = currentUrl.endsWith("/notifications-sw.js");
          if (!registration || !isNotifications) {
            if (registration && !isNotifications) {
              try { await registration.unregister(); } catch {}
            }
            registration = await navigator.serviceWorker.register("/notifications-sw.js");
            if (!registration) {
              registration = await navigator.serviceWorker.register("/sw.js");
            }
          }
        } catch (e) {
          // Fallback to serviceWorker.js if exists
          try {
            registration = await navigator.serviceWorker.register("/serviceWorker.js");
          } catch (e2) {
            console.error("Service Worker registration failed", e2);
            await Swal.fire({ icon: "error", title: "Gagal", text: "Gagal mendaftarkan Service Worker." });
            return null;
          }
        }
        return registration;
      };

      registration = await ensureNotificationsSW();
      if (!registration) return;

      // Request permission
      if (!("Notification" in window)) {
        await Swal.fire({ icon: "warning", title: "Tidak didukung", text: "Browser tidak mendukung Notification API." });
        return;
      }
      let permission = Notification.permission;
      if (permission === "default" && typeof Notification.requestPermission === "function") {
        permission = await Notification.requestPermission();
      }
      if (permission !== "granted") {
        await Swal.fire({ icon: "info", title: "Izin ditolak", text: "Aktifkan izin notifikasi di pengaturan browser Anda." });
        return;
      }

      // Fetch VAPID public key
      const vapidRes = await fetch("/api/notifications/vapid-key");
      const vapidJson = await vapidRes.json();
      if (!vapidJson?.success || !vapidJson?.publicKey) {
        await Swal.fire({ icon: "error", title: "VAPID tidak tersedia", text: "Konfigurasi VAPID key tidak ditemukan." });
        return;
      }
      const appServerKey = urlBase64ToUint8Array(vapidJson.publicKey);

      // Check existing subscription
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: appServerKey,
        });
      }

      // Save subscription to backend
      const saveRes = await fetch("/api/notifications/save-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription }),
      });
      const saveJson = await saveRes.json();
      if (!saveRes.ok || !saveJson?.success) {
        throw new Error(saveJson?.error || "Gagal menyimpan subscription");
      }

      await Swal.fire({ icon: "success", title: "Berhasil", text: "Notifikasi aktif untuk perangkat ini." });
    } catch (err) {
      console.error("Enable notifications error:", err);
      await Swal.fire({ icon: "error", title: "Gagal", text: `Gagal mengaktifkan notifikasi: ${err?.message || "Unknown error"}` });
    } finally {
      setIsEnablingNotif(false);
    }
  }

  // Close on outside click and Escape
  useEffect(() => {
    function onDocClick(e) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    }
    function onKey(e) {
      if (e.key === "Escape") setIsDropdownOpen(false);
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", onDocClick);
      window.addEventListener("keydown", onKey);
    }
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [isDropdownOpen]);

  // PWA install prompt handling
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Detect installed state
    const checkInstalled = () => {
      const standalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
      const iosStandalone = typeof navigator !== 'undefined' && 'standalone' in navigator && navigator.standalone;
      setIsInstalled(Boolean(standalone || iosStandalone));
    };
    checkInstalled();

    const onBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setCanInstall(true);
    };
    const onInstalled = () => {
      setCanInstall(false);
      setInstallPrompt(null);
      setIsInstalled(true);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    try {
      if (installPrompt && typeof installPrompt.prompt === 'function') {
        installPrompt.prompt();
        const choice = await installPrompt.userChoice;
        setInstallPrompt(null);
        setCanInstall(false);
        if (choice?.outcome === 'accepted') {
          console.log('PWA install accepted');
        } else {
          console.log('PWA install dismissed');
        }
      } else {
        // Fallback guidance
        await Swal.fire({ icon: "info", title: "Panduan Install", text: "Jika tombol install tidak muncul, gunakan menu browser: Add to Home screen / Install App." });
      }
    } catch (e) {
      console.error('Install app failed', e);
      await Swal.fire({ icon: "error", title: "Gagal", text: "Gagal memulai proses install aplikasi." });
    }
  };

  // Trigger test push notification for the current user
  const testNotification = async () => {
    try {
      setIsTestingNotif(true);
      const res = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Tes Notifikasi',
          body: 'Notifikasi uji dari menu',
          url: '/leads',
          tag: 'test-from-menu',
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Gagal mengirim tes notifikasi');
      await Swal.fire({ icon: "success", title: "Terkirim", text: "Tes notifikasi dikirim. Periksa device ini." });
    } catch (e) {
      console.error('Test notification failed', e);
      await Swal.fire({ icon: "error", title: "Gagal", text: "Gagal mengirim notifikasi uji. Pastikan sudah login dan notifikasi diaktifkan." });
    } finally {
      setIsTestingNotif(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Attempt to remove push subscription for this user before logout
      if (typeof window !== "undefined" && "serviceWorker" in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          const sub = await registration?.pushManager?.getSubscription();
          if (sub) {
            // Send endpoint to backend to remove from user's pushSubscriptions
            fetch("/api/notifications/remove-subscription", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ endpoint: sub.endpoint }),
            }).catch(() => {});
            // Unsubscribe locally so device stops receiving stale pushes if user switches account
            try { await sub.unsubscribe(); } catch {}
          }
        } catch (e) {
          console.warn("Failed cleaning push subscription on logout", e);
        }
      }
      await logout();
      if (onLogoutComplete) {
        onLogoutComplete();
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
      setIsDropdownOpen(false);
    }
  };

  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Mobile version (unchanged)
  if (variant === "mobile") {
    const baseStyles = "px-4 py-2 rounded-md transition-colors font-medium";
    const disabledStyles = "bg-gray-400 cursor-not-allowed";
    const mobileStyles = "w-full bg-red-500 hover:bg-red-600 text-white";

    const buttonStyles = `
      ${baseStyles} 
      ${isLoggingOut ? disabledStyles : mobileStyles} 
      ${className}
    `;

    return (
      <div className="flex flex-col space-y-4">
        {showUserInfo && user && (
          <div className="flex flex-col bg-gradient-to-r from-teal-50 to-cyan-50 p-2 rounded-lg shadow-sm">
            <span className="text-xs font-semibold text-teal-700">
              {user.name}
            </span>
            {isAgent() && user.agentCode && (
              <span className="text-[10px] bg-teal-100 text-teal-600 px-1.5 py-0.5 rounded-full mt-0.5 inline-flex items-center">
                <Shield size={8} className="mr-1" />
                Agent: {user.agentCode}
              </span>
            )}
          </div>
        )}

        {/* Agent-only menu items for mobile */}
        {isAgent() && (
          <>
            <Link
              href="/leads"
              className="w-full px-4 py-2 bg-tosca-100 hover:bg-tosca-200 text-white rounded-md transition-colors font-medium text-center block"
            >
              Leads
            </Link>
            <Link
              href="/chat"
              className="w-full px-4 py-2 bg-tosca-100 hover:bg-tosca-200 text-white rounded-md transition-colors font-medium text-center block"
            >
              Chat
            </Link>
            <Link
              href="/log-activity"
              className="w-full px-4 py-2 bg-tosca-100 hover:bg-tosca-200 text-white rounded-md transition-colors font-medium text-center block"
            >
              Log Aktivitas
            </Link>
            <button
              type="button"
              onClick={enableNotificationsOnThisDevice}
              disabled={isEnablingNotif}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors disabled:opacity-50"
              role="menuitem"
            >
              {isEnablingNotif ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                  <span>Mengaktifkan notifikasi...</span>
                </>
              ) : (
                <>
                  <Bell size={16} className="text-gray-500" />
                  <span>Aktifkan Notifikasi</span>
                </>
              )}
            </button>

            {/* Test notification (mobile) */}
            <button
              type="button"
              onClick={testNotification}
              disabled={isTestingNotif}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors disabled:opacity-50"
              role="menuitem"
            >
              {isTestingNotif ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                  <span>Mengirim tes notifikasi...</span>
                </>
              ) : (
                <>
                  <Bell size={16} className="text-gray-500" />
                  <span>Tes Notifikasi</span>
                </>
              )}
            </button>

            {/* Install PWA (mobile) */}
            {canInstall && !isInstalled && (
              <button
                type="button"
                onClick={handleInstallApp}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                role="menuitem"
              >
                <Download size={16} className="text-gray-500" />
                <span>Install Aplikasi</span>
              </button>
            )}
          </>
        )}

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={buttonStyles}
        >
          {isLoggingOut ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Logging out...</span>
            </div>
          ) : (
            "Logout"
          )}
        </button>
      </div>
    );
  }

  // Desktop version with modern avatar dropdown
  return (
    <div className="relative" ref={containerRef}>
      {/* Avatar Button (click to toggle) */}
      <button
        type="button"
        className="group flex items-center space-x-2 p-1 rounded-full hover:bg-white/10 transition-all duration-200"
        onClick={() => setIsDropdownOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={isDropdownOpen}
      >
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-br from-tosca-200 to-tosca-300 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-200">
            {getUserInitials(user?.name)}
          </div>
          {/* Online indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
        </div>

        {/* Desktop: Show name and chevron */}
        <div className="hidden md:flex items-center space-x-1 text-white">
          <span className="text-sm font-medium truncate max-w-24">
            {user?.name?.split(" ")[0] || "User"}
          </span>
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      <div
        className={`absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 transform transition-all duration-200 origin-top-right ${
          isDropdownOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }`}
        role="menu"
      >
        {/* User Info Section */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-tosca-200 to-tosca-300 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
              {getUserInitials(user?.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              {isAgent() && user.agentCode && (
                <div className="flex items-center mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-tosca-50 text-tosca-700">
                    <Shield size={10} className="mr-1" />
                    Agent: {user.agentCode}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Menu Items for Desktop */}
        {isAgent() && (
          <div className="py-1">
            <Link
              href="/leads"
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
              onClick={() => setIsDropdownOpen(false)}
              role="menuitem"
            >
              <User size={16} className="text-gray-500" />
              <span>Leads</span>
            </Link>
            <Link
              href="/chat"
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
              onClick={() => setIsDropdownOpen(false)}
              role="menuitem"
            >
              <FaRegMessage size={16} className="text-gray-500" />
              <span>Chat</span>
            </Link>
            <Link
              href="/log-activity"
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
              onClick={() => setIsDropdownOpen(false)}
              role="menuitem"
            >
              <FileText size={16} className="text-gray-500" />
              <span>Log Aktivitas</span>
            </Link>

            {/* Enable Web Push on this device */}
            <button
              type="button"
              onClick={enableNotificationsOnThisDevice}
              disabled={isEnablingNotif}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors disabled:opacity-50"
              role="menuitem"
            >
              {isEnablingNotif ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                  <span>Mengaktifkan notifikasi...</span>
                </>
              ) : (
                <>
                  <Bell size={16} className="text-gray-500" />
                  <span>Aktifkan Notifikasi</span>
                </>
              )}
            </button>

            {/* Test notification (desktop) */}
            <button
              type="button"
              onClick={testNotification}
              disabled={isTestingNotif}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors disabled:opacity-50"
              role="menuitem"
            >
              {isTestingNotif ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                  <span>Mengirim tes notifikasi...</span>
                </>
              ) : (
                <>
                  <Bell size={16} className="text-gray-500" />
                  <span>Tes Notifikasi</span>
                </>
              )}
            </button>

            {/* Install PWA (desktop) */}
            {canInstall && !isInstalled && (
              <button
                type="button"
                onClick={handleInstallApp}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                role="menuitem"
              >
                <Download size={16} className="text-gray-500" />
                <span>Install Aplikasi</span>
              </button>
            )}
          </div>
        )}

        {/* Logout Section */}
        <div className="border-t border-gray-100 py-1">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            role="menuitem"
          >
            {isLoggingOut ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent"></div>
                <span>Logging out...</span>
              </>
            ) : (
              <>
                <LogOut size={16} className="text-red-500" />
                <span>Logout</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
