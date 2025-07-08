"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import AdminSidebar from "@/app/(admin)/admin/components/AdminSidebar";
import { FaBell, FaUser, FaSignOutAlt } from "react-icons/fa";
import "./AdminLayout.css";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
    <div className="min-h-screen bg-gray-50 admin-layout-container">
      {/* Sidebar */}
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div
        className={`admin-main-content transition-all duration-300 ease-in-out ${
          sidebarOpen ? "ml-64" : "ml-16"
        }`}
      >
        {/* Top Header */}
        <header className="admin-header bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="page-title">
                <h1 className="text-xl font-bold text-gray-900">
                  {getPageTitle(pathname)}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {getPageDescription(pathname)}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <button className="admin-button p-2 text-gray-400 hover:text-gray-600 relative transition-colors">
                  <FaBell className="text-lg" />
                  <span className="notification-badge absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </button>
                
                <div className="flex items-center gap-2 text-gray-700">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <FaUser className="text-sm text-white" />
                  </div>
                  <span className="text-sm font-medium">Admin</span>
                </div>
                
                <button 
                  onClick={handleLogout}
                  className="admin-button p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-gray-100"
                  title="Logout"
                >
                  <FaSignOutAlt className="text-lg" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 content-fade-in">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="mobile-overlay fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

// Helper functions for dynamic page titles
function getPageTitle(pathname) {
  const routes = {
    '/admin': 'Dashboard',
    '/admin/perumahan': 'Manajemen Perumahan',
    '/admin/ruko': 'Manajemen Ruko',
    '/admin/apartemen': 'Manajemen Apartemen',
    '/admin/tanah': 'Manajemen Tanah',
    '/admin/kavling': 'Manajemen Kavling',
    '/admin/manage-categories/asset-types': 'Tipe Aset',
    '/admin/manage-categories/market-status': 'Status Pasar',
    '/admin/manage-categories/listing-status': 'Status Listing',
    '/admin/manage-users': 'Manajemen Admin',
    '/admin/analytics': 'Analytics',
    '/admin/settings': 'Pengaturan',
  };
  
  return routes[pathname] || 'Admin Panel';
}

function getPageDescription(pathname) {
  const descriptions = {
    '/admin': 'Selamat datang di Panel Admin S-Property',
    '/admin/perumahan': 'Kelola data perumahan dan properti residensial',
    '/admin/ruko': 'Kelola data ruko dan properti komersial',
    '/admin/apartemen': 'Kelola data apartemen dan kondominium',
    '/admin/tanah': 'Kelola data tanah dan lahan kosong',
    '/admin/kavling': 'Kelola data kavling dan plot tanah',
    '/admin/manage-categories/asset-types': 'Kelola kategori tipe aset properti',
    '/admin/manage-categories/market-status': 'Kelola status pasar properti',
    '/admin/manage-categories/listing-status': 'Kelola status listing properti',
    '/admin/manage-users': 'Kelola pengguna dan administrator',
    '/admin/analytics': 'Lihat laporan dan analisis data',
    '/admin/settings': 'Pengaturan sistem dan konfigurasi',
  };
  
  return descriptions[pathname] || 'Panel administrasi sistem';
}
