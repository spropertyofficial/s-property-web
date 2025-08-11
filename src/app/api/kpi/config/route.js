import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { verifyAdmin } from "@/lib/auth";
import KpiConfig from "@/lib/models/KpiConfig";
import { defaultActivityScores } from "@/lib/kpi/defaults";

const SCOPE = "production";

export async function GET(req) {
  try {
    // Public read: config tidak sensitif, bisa dibaca agent untuk dropdown
    await connectDB();
    let config = await KpiConfig.findOne({ scope: SCOPE });
    if (!config) {
      // Return defaults if not configured
      config = {
        scope: SCOPE,
        activityScores: defaultActivityScores,
        rules: { dailyScoreCap: 0, diminishingThreshold: 0, diminishingFactor: 1 },
        _id: null,
      };
    } else {
      // Convert Map to plain object
      config = {
        ...config.toObject(),
        activityScores: Object.fromEntries(config.activityScores || []),
      };
    }

  return NextResponse.json({ success: true, data: config });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Gagal memuat konfigurasi" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
  const { success, admin } = await verifyAdmin(req);
  if (!success || !["superadmin", "admin"].includes(admin.role)) {
      return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 403 });
    }

    const body = await req.json();
    const { activityScores, rules } = body;

    // Basic validation
    if (!activityScores || typeof activityScores !== "object") {
      return NextResponse.json({ success: false, error: "activityScores tidak valid" }, { status: 400 });
    }
    for (const key of Object.keys(activityScores)) {
      if (typeof key !== "string" || key.trim() === "" || key.length > 100) {
        return NextResponse.json({ success: false, error: `Nama aktivitas tidak valid: ${key}` }, { status: 400 });
      }
      const val = activityScores[key];
      if (typeof val !== "number" || val < 0 || val > 1000) {
        return NextResponse.json({ success: false, error: `Skor tidak valid untuk ${key}` }, { status: 400 });
      }
    }

    if (rules) {
      const { dailyScoreCap, diminishingThreshold, diminishingFactor } = rules;
      if (dailyScoreCap != null && (typeof dailyScoreCap !== "number" || dailyScoreCap < 0)) {
        return NextResponse.json({ success: false, error: "dailyScoreCap tidak valid" }, { status: 400 });
      }
      if (diminishingThreshold != null && (typeof diminishingThreshold !== "number" || diminishingThreshold < 0)) {
        return NextResponse.json({ success: false, error: "diminishingThreshold tidak valid" }, { status: 400 });
      }
      if (diminishingFactor != null && (typeof diminishingFactor !== "number" || diminishingFactor < 0 || diminishingFactor > 1)) {
        return NextResponse.json({ success: false, error: "diminishingFactor harus antara 0..1" }, { status: 400 });
      }
    }

    await connectDB();
    const update = {
      scope: SCOPE,
      activityScores: new Map(Object.entries(activityScores)),
      rules: rules ? rules : { dailyScoreCap: 0, diminishingThreshold: 0, diminishingFactor: 1 },
    };

    const saved = await KpiConfig.findOneAndUpdate({ scope: SCOPE }, update, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });

    return NextResponse.json({ success: true, data: {
      ...saved.toObject(),
      activityScores: Object.fromEntries(saved.activityScores || []),
    }});
  } catch (error) {
    return NextResponse.json({ success: false, error: "Gagal menyimpan konfigurasi" }, { status: 500 });
  }
}
