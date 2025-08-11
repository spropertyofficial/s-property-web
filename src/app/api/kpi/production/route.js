import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ActivityLog from "@/lib/models/ActivityLog";
import User from "@/lib/models/User";
import { verifyAdmin } from "@/lib/auth";
import KpiConfig from "@/lib/models/KpiConfig";
import { defaultActivityScores } from "@/lib/kpi/defaults";

async function getActivityScores() {
  try {
    await connectDB();
    const cfg = await KpiConfig.findOne({ scope: "production" });
    if (!cfg || !cfg.activityScores || cfg.activityScores.size === 0) {
      return defaultActivityScores;
    }
    return Object.fromEntries(cfg.activityScores);
  } catch {
    return defaultActivityScores;
  }
}

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
  const activityScores = await getActivityScores();

    // Tentukan rentang tanggal
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // Ambil semua aktivitas yang sudah disetujui dalam rentang waktu
    const approvedActivities = await ActivityLog.find({
      status: "Approved",
      date: { $gte: startDate, $lte: endDate },
    }).populate("agent", "name email agentCode");

    // Ambil semua users (agents) untuk dasar leaderboard
    const allAgents = await User.find({}).select("name email agentCode");
    
    console.log("All Agents:", allAgents.length);
    console.log("Approved Activities:", approvedActivities.length);

    // 1. Kalkulasi untuk Papan Peringkat (Leaderboard)
    const agentStats = allAgents.map((agent) => {
      const agentActivities = approvedActivities.filter(
        (log) => log.agent._id.toString() === agent._id.toString()
      );

      const stats = {
        name: agent.name,
        email: agent.email,
        agentCode: agent.agentCode,
        newListings: agentActivities.filter(
          (a) => a.activityType === "Listing Baru"
        ).length,
        surveys: agentActivities.filter(
          (a) => a.activityType === "Survei Klien"
        ).length,
        followUps: agentActivities.filter(
          (a) => a.activityType === "Follow Up Klien"
        ).length,
        liveSessions: agentActivities.filter(
          (a) => a.activityType === "Sesi Live"
        ).length,
        training: agentActivities.filter(
          (a) => a.activityType === "Training Product Knowledge"
        ).length,
        totalActivities: agentActivities.length,
        totalScore: 0,
      };

      // Hitung skor total
      agentActivities.forEach((act) => {
        stats.totalScore += activityScores[act.activityType] || 0;
      });

      return stats;
    });

    // Sort by total score descending
    agentStats.sort((a, b) => b.totalScore - a.totalScore);

    // 2. Data untuk Grafik Komposisi (agregat berdasarkan jenis aktivitas)
    const compositionData = {
      "Survei Klien": approvedActivities.filter(a => a.activityType === "Survei Klien").length,
      "Listing Baru": approvedActivities.filter(a => a.activityType === "Listing Baru").length,
      "Follow Up Klien": approvedActivities.filter(a => a.activityType === "Follow Up Klien").length,
      "Sesi Live": approvedActivities.filter(a => a.activityType === "Sesi Live").length,
      "Training Product Knowledge": approvedActivities.filter(a => a.activityType === "Training Product Knowledge").length,
    };

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
