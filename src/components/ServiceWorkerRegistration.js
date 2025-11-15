"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator && typeof window !== "undefined") {
      console.log("Service Worker API tersedia");

      // Prefer the notifications service worker; fall back to legacy if needed
      navigator.serviceWorker
        .register("/notifications-sw.js")
        .then((registration) => {
          console.log("Service Worker (notifications) terdaftar:", registration.scope);
        })
        .catch(async (error) => {
          console.warn("Gagal daftar notifications-sw.js, fallback ke serviceWorker.js", error);
          try {
            const reg = await navigator.serviceWorker.register("/serviceWorker.js");
            console.log("Service Worker fallback terdaftar:", reg.scope);
          } catch (e2) {
            console.error("Gagal mendaftarkan Service Worker fallback:", e2);
          }
        });

      // Badge message listener (increment/clear per device)
      const onMessage = async (event) => {
        if (!event?.data || typeof navigator.setAppBadge !== 'function') return;
        try {
          const data = event.data;
          const key = 'appBadgeCount';
          const getCount = () => {
            const raw = localStorage.getItem(key);
            const n = Number(raw);
            return Number.isFinite(n) && n >= 0 ? n : 0;
          };
          if (data.type === 'INCREMENT_BADGE') {
            const delta = Number(data.delta) || 1;
            const next = Math.max(0, getCount() + delta);
            localStorage.setItem(key, String(next));
            await navigator.setAppBadge(next).catch(() => {});
          } else if (data.type === 'CLEAR_BADGE') {
            localStorage.setItem(key, '0');
            await navigator.clearAppBadge?.().catch(() => {});
          }
        } catch (_) {}
      };
      navigator.serviceWorker.addEventListener('message', onMessage);

      // Initialize badge from persisted value on load
      try {
        if (typeof navigator.setAppBadge === 'function') {
          const raw = localStorage.getItem('appBadgeCount');
          const n = Number(raw);
          const count = Number.isFinite(n) && n > 0 ? n : 0;
          if (count > 0) {
            navigator.setAppBadge(count).catch(() => {});
          }
        }
      } catch (_) {}

      return () => {
        navigator.serviceWorker.removeEventListener('message', onMessage);
      };
    }
  }, []);

  return null;
}
