"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator && typeof window !== "undefined") {
      console.log("Service Worker API tersedia");

      navigator.serviceWorker
        .register("/serviceWorker.js")
        .then((registration) => {
          console.log("Service Worker berhasil terdaftar:", registration.scope);
        })
        .catch((error) => {
          console.error("Gagal mendaftarkan Service Worker:", error);
        });
    }
  }, []);

  return null;
}
