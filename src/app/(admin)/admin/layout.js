"use client";

import { usePathname } from "next/navigation";
import AdminLayout from "@/components/admin/layout/AdminLayout";

export default function AdminLayoutWrapper({ children }) {
  const pathname = usePathname();

  // Jika login page, render tanpa AdminLayout
  if (pathname === "/admin/login") {
    return (
      <>
        <main>{children}</main>
      </>
    );
  }

  // Untuk halaman admin lainnya
  return (
    <>
      <main>
        <AdminLayout>{children}</AdminLayout>
      </main>
    </>
  );
}
