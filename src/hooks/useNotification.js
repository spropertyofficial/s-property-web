/**
 * Custom hook untuk menggunakan sistem notifikasi
 * 
 * Usage:
 * const notify = useNotification();
 * notify.success("Berhasil!");
 * notify.error("Terjadi kesalahan!");
 * notify.warning("Peringatan!");
 * notify.info("Informasi");
 */

import { useCallback } from 'react';

export default function useNotification() {
  const showNotification = useCallback((message, type = "info", duration = 5000) => {
    if (typeof window !== 'undefined' && window.showNotification) {
      window.showNotification(message, type, duration);
    } else {
      // Fallback to console if notification system is not available
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  }, []);

  return {
    success: useCallback((message, duration) => showNotification(message, "success", duration), [showNotification]),
    error: useCallback((message, duration) => showNotification(message, "error", duration), [showNotification]),
    warning: useCallback((message, duration) => showNotification(message, "warning", duration), [showNotification]),
    info: useCallback((message, duration) => showNotification(message, "info", duration), [showNotification]),
    show: showNotification
  };
}
