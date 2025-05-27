"use client";

import { usePathname } from "next/navigation";
import AdminLayout from "@/components/admin/layout/AdminLayout";

export default function AdminLayoutWrapper({ children }) {
  const pathname = usePathname();

  // Jika login page, render tanpa AdminLayout
  if (pathname === "/admin/login") {
    return (
      <html lang="id">
        <body>{children}</body>
      </html>
    );
  }

  // Untuk halaman admin lainnya
  return (
    <html lang="id">
      <body>
        <AdminLayout>{children}</AdminLayout>
      </body>
    </html>
  );
}
