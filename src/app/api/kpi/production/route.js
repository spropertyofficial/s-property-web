import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ActivityLog from "@/lib/models/ActivityLog";
import Admin from "@/lib/models/Admin";
import { verifyAdmin } from "@/lib/auth";

// Skor untuk setiap jenis aktivitas
const activityScores = {
  "Survei Klien": 3,
  "Listing Baru": 2, // Anda bisa sesuaikan jika listing baru juga dicatat di log
  "Follow Up Klien": 2,
  "Sesi Live": 1,
  "Training Product Knowledge": 1,
};

export async function GET(req) {
  try {
    const { success, admin } = await verifyAdmin(req);
    if (!success || admin.role !== "superadmin") {
      return NextResponse.json(
        { success: false, error: "Akses ditolak" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30", 10);

    await connectDB();

    // Tentukan rentang tanggal
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // Ambil semua aktivitas yang sudah disetujui dalam rentang waktu
    const approvedActivities = await ActivityLog.find({
      status: "Approved",
      date: { $gte: startDate, $lte: endDate },
    }).populate("agent", "name");

    // Ambil semua admin untuk dasar leaderboard
    const allAdmins = await Admin.find().select("name");

    // 1. Kalkulasi untuk Papan Peringkat (Leaderboard)
    const agentStats = allAdmins.map((agent) => {
      const agentActivities = approvedActivities.filter(
        (log) => log.agent._id.toString() === agent._id.toString()
      );

      const stats = {
        name: agent.name,
        newListings: agentActivities.filter(
          (a) => a.activityType === "Listing Baru"
        ).length,
        surveys: agentActivities.filter(
          (a) => a.activityType === "Survei Klien"
        ).length,
        liveSessions: agentActivities.filter(
          (a) => a.activityType === "Sesi Live"
        ).length,
        totalScore: 0,
      };

      // Hitung skor total
      agentActivities.forEach((act) => {
        stats.totalScore += activityScores[act.activityType] || 0;
      });

      return stats;
    });

    // 2. Data untuk Grafik Komposisi (berdasarkan agentStats yang sudah dihitung)
    const compositionData = agentStats;

    // 3. Data untuk Grafik Tren
    const trendData = approvedActivities.reduce((acc, log) => {
      const date = new Date(log.date).toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: {
        leaderboard: agentStats,
        composition: compositionData,
        trend: trendData,
      },
    });
  } catch (error) {
    console.error("KPI Production API Error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
