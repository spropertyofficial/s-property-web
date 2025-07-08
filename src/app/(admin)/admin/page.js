// src/app/(admin)/admin/page.js
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import useNotification from "@/hooks/useNotification";
import Swal from "sweetalert2";
import QuickActions from "./components/QuickActions";
import RecentActivity from "./components/RecentActivity";
import AnalyticsOverview from "./components/AnalyticsOverview";
import UpcomingTasks from "./components/UpcomingTasks";
import CalendarWidget from "./components/CalendarWidget";
import RecentListings from "./components/RecentListings";
import AdminFooter from "./components/AdminFooter";
import StatsOverview from "./components/StatsOverview";
import "./styles/dashboard.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    residentials: 0,
    clusters: 0,
    units: 0,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const notify = useNotification();

  useEffect(() => {
    // Fetch stats only once when component mounts
    const loadStats = async () => {
      try {
        // Only fetch data once, no dependencies that could cause re-renders
        const response = await fetch("/api/properties");
        if (response.ok) {
          const data = await response.json();
          setStats({
            residentials: data.properties?.length || 0,
            clusters: 0, 
            units: 0, 
          });
        }
      } catch (error) {
        console.error("Error loading stats:", error);
        // Use simple fallback without notification dependency
        setStats({
          residentials: 0,
          clusters: 0,
          units: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []); // Empty dependency - runs only once

  const testNotifications = () => {
    notify.success("Ini adalah notifikasi sukses!");
    setTimeout(() => {
      notify.warning("Ini adalah notifikasi peringatan!");  
    }, 1000);
    setTimeout(() => {
      notify.error("Ini adalah notifikasi error!");
    }, 2000);
    setTimeout(() => {
      notify.info("Ini adalah notifikasi info!");
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <StatsOverview stats={stats} loading={loading} />

      {/* Notification Test Section */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Notification System</h3>
        <button
          onClick={testNotifications}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Test All Notifications
        </button>
      </section>

      {/* Quick Actions */}
      <section>
        <QuickActions />
      </section>

      {/* Analytics and Activity Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RecentActivity loading={loading} />
        <AnalyticsOverview loading={loading} />
      </div>

      {/* Tasks and Calendar Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <UpcomingTasks loading={loading} />
        </div>
        <CalendarWidget loading={loading} />
      </div>

      {/* Recent Listings */}
      <RecentListings loading={loading} />

      {/* Footer */}
      <AdminFooter />
    </div>
  );
}
