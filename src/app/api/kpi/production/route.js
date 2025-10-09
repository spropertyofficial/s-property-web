import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ActivityLog from "@/lib/models/ActivityLog";
import User from "@/lib/models/User";
import { verifyAdmin } from "@/lib/auth";
import KpiConfig from "@/lib/models/KpiConfig";
import { defaultActivityScores } from "@/lib/kpi/defaults";
import ActivityType from "@/lib/models/ActivityType";

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
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30", 10);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(
      1,
      Math.min(100, parseInt(searchParams.get("limit") || "10", 10))
    );

    await connectDB();
    const activityScores = await getActivityScores();

    // Ambil daftar Activity Types yang aktif (dinamis)
    const activeTypes = await ActivityType.find({ isActive: true })
      .select("name score")
      .sort({ createdAt: 1 });
    
    const typeList = activeTypes.map((t) => ({
      id: t._id.toString(),
      name: t.name,
      score: typeof t.score === "number" ? t.score : 0,
    }));
    const typeIdByName = typeList.reduce((acc, t) => {
      acc[t.name] = t.id;
      return acc;
    }, {});
    // Score map prioritas: ActivityType.score > KpiConfig(activityScores by name) > defaultActivityScores
    const scoreByTypeId = typeList.reduce((acc, t) => {
      const cfgScore = activityScores[t.name];
      const defScore = defaultActivityScores[t.name];
      acc[t.id] =
        typeof t.score === "number" && t.score > 0
          ? t.score
          : typeof cfgScore === "number"
          ? cfgScore
          : typeof defScore === "number"
          ? defScore
          : 0;
      return acc;
    }, {});

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

    // 1. Kalkulasi untuk Papan Peringkat (Leaderboard) berbasis Activity Types dinamis
    const agentStats = allAgents.map((agent) => {
      const agentActivities = approvedActivities.filter(
        (log) => log.agent && log.agent._id && log.agent._id.toString() === agent._id.toString()
      );

      // Hitung jumlah per tipe (berdasarkan activityTypeId) dan skor
      const counts = {};
      let totalScore = 0;
      for (const log of agentActivities) {
        let typeId = log.activityTypeId ? String(log.activityTypeId) : "";
        if (!typeId && log.activityType && typeIdByName[log.activityType]) {
          typeId = typeIdByName[log.activityType];
        }
        if (!typeId) continue;
        counts[typeId] = (counts[typeId] || 0) + 1;
        const score = scoreByTypeId[typeId] || 0;
        totalScore += score;
      }

      return {
        name: agent.name,
        email: agent.email,
        agentCode: agent.agentCode,
        counts, // { [typeId]: number }
        totalActivities: agentActivities.length,
        totalScore,
      };
    });

    // Sort by total score descending
    agentStats.sort((a, b) => b.totalScore - a.totalScore);

    // 2. Data untuk Grafik Komposisi (dinamis berdasarkan jenis aktivitas aktif)
    const compositionData = {};
    const countsByTypeId = approvedActivities.reduce((acc, log) => {
      let typeId = log.activityTypeId ? String(log.activityTypeId) : "";
      if (!typeId && log.activityType && typeIdByName[log.activityType]) {
        typeId = typeIdByName[log.activityType];
      }
      if (!typeId) return acc;
      acc[typeId] = (acc[typeId] || 0) + 1;
      return acc;
    }, {});
    for (const t of typeList) {
      const count = countsByTypeId[t.id] || 0;
      compositionData[t.name] = count;
    }

    // 3. Data untuk Grafik Tren
    const trendData = approvedActivities.reduce((acc, log) => {
      const date = new Date(log.date).toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Pagination di sisi server untuk leaderboard
    const total = agentStats.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * limit;
    const end = Math.min(start + limit, total);
    const pagedLeaderboard = agentStats.slice(start, end);

    return NextResponse.json({
      success: true,
      data: {
        activityTypes: typeList, // [{id,name,score}]
        leaderboard: pagedLeaderboard,
        composition: compositionData,
        trend: trendData,
        pagination: { page: currentPage, limit, total, totalPages },
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
