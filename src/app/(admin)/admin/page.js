"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import QuickActions from "./components/QuickActions";
import RecentActivity from "./components/RecentActivity";
import AnalyticsOverview from "./components/AnalyticsOverview";
import UpcomingTasks from "./components/UpcomingTasks";
import CalendarWidget from "./components/CalendarWidget";
import RecentListings from "./components/RecentListings";
import AdminFooter from "./components/AdminFooter";
import StatsOverview from "./components/StatsOverview";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    residentials: 0,
    clusters: 0,
    units: 0,
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch residential stats
      const resResidentials = await fetch("/api/residential");
      const residentialsData = await resResidentials.json();

      // In a real app, you would fetch clusters and units data from their respective endpoints
      // For now, we'll use placeholder data

      setStats({
        residentials: residentialsData.residentials?.length || 0,
        clusters: 12, // Placeholder
        units: 48, // Placeholder
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      Swal.fire({
        title: "Error!",
        text: "Gagal mengambil data statistik",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#131414",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300
        }`}
      >
        <div className="p-6">
          {/* Header */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-500">Dashboard</h1>
              <div className="text-sm text-gray-300">
                Selamat datang di Panel Admin S-Property
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <StatsOverview stats={stats} loading={loading} />

          {/* Quick Actions */}
          <QuickActions />

          {/* Recent Activity and Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <RecentActivity loading={loading} />
            <AnalyticsOverview loading={loading} />
          </div>

          {/* Upcoming Tasks */}
          <UpcomingTasks loading={loading} />

          {/* Calendar and Recent Listings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <CalendarWidget loading={loading} />
            <RecentListings loading={loading} />
          </div>

          {/* Footer */}
          <AdminFooter />
        </div>
      </div>
    </div>
  );
}
