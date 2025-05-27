"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import AdminSidebar from "@/app/(admin)/admin/components/AdminSidebar";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking authentication..."); // Debug log

      try {
        // Make a request to verify token server-side
        const response = await fetch("/api/admin/verify", {
          method: "GET",
          credentials: "include", // Important: include cookies
        });

        console.log("Auth check response:", response.status); // Debug log

        if (response.ok) {
          console.log("Authentication successful"); // Debug log
          setIsAuthenticated(true);
        } else {
          console.log("Authentication failed, redirecting to login"); // Debug log
          router.push("/admin/login");
        }
      } catch (error) {
        console.error("Auth check error:", error); // Debug log
        router.push("/admin/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Konfirmasi Logout",
      text: "Apakah Anda yakin ingin keluar?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Logout",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        // Call logout API to clear server-side cookie
        await fetch("/api/admin/logout", {
          method: "POST",
          credentials: "include",
        });
      } catch (error) {
        console.error("Logout error:", error);
      }

      Swal.fire({
        title: "Berhasil Logout",
        text: "Anda telah keluar dari sistem",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        router.push("/admin/login");
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Akan redirect ke login
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar handleLogout={handleLogout} />
      <div className="flex-1 ml-64 transition-all duration-300">{children}</div>
    </div>
  );
}
