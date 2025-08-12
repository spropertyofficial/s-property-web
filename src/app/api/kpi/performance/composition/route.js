import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import SaleRecord from "@/lib/models/SaleRecord";

// GET /api/kpi/performance/composition?period=YYYY-MM&by=project|agent|unitType
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period");
  const by = (searchParams.get("by") || "assettype").toLowerCase();
    if (!period) {
      return NextResponse.json({ success: false, error: "parameter period (YYYY-MM) wajib" }, { status: 400 });
    }
    const [y, m] = period.split("-").map(Number);
    if (!y || !m) {
      return NextResponse.json({ success: false, error: "format period tidak valid" }, { status: 400 });
    }

    const start = new Date(Date.UTC(y, m - 1, 1));
    const end = new Date(Date.UTC(y, m, 1));

  const match = { status: "Closing", tanggalClosing: { $gte: start, $lt: end } };

    const pipeline = [{ $match: match }];

    if (by === "agent") {
      pipeline.push(
        {
          $lookup: {
            from: "users",
            localField: "agentId",
            foreignField: "_id",
            as: "agent",
          },
        },
        { $unwind: { path: "$agent", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: "$agentId",
            label: { $first: { $ifNull: ["$agent.name", "Tanpa Agen"] } },
            pendapatanTotal: { $sum: "$hargaPropertiTerjual" },
            unitTerjual: { $sum: 1 },
          },
        }
      );
    } else if (by === "unittype" || by === "unittype") {
      pipeline.push({
        $group: {
          _id: { $ifNull: ["$unitType", "-"] },
          label: { $first: { $ifNull: ["$unitType", "-"] } },
          pendapatanTotal: { $sum: "$hargaPropertiTerjual" },
          unitTerjual: { $sum: 1 },
        },
      });
    } else if (by === "assettype" || by === "assetType") {
      pipeline.push(
        {
          $lookup: {
            from: "categoryassettypes",
            localField: "assetTypeId",
            foreignField: "_id",
            as: "atype",
          },
        },
        { $unwind: { path: "$atype", preserveNullAndEmptyArrays: true } },
        {
          $addFields: { compLabel: { $ifNull: ["$atype.name", "-"] } },
        },
        {
          $group: {
            _id: "$compLabel",
            label: { $first: "$compLabel" },
            pendapatanTotal: { $sum: "$hargaPropertiTerjual" },
            unitTerjual: { $sum: 1 },
          },
        }
      );
    } else {
      // by project (default): gunakan projectName jika tidak ada projectId
      pipeline.push(
        {
          $lookup: {
            from: "properties",
            localField: "projectId",
            foreignField: "_id",
            as: "prop",
          },
        },
        { $unwind: { path: "$prop", preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            compLabel: { $ifNull: ["$projectName", "$prop.name"] },
          },
        },
        {
          $group: {
            _id: "$compLabel",
            label: { $first: "$compLabel" },
            pendapatanTotal: { $sum: "$hargaPropertiTerjual" },
            unitTerjual: { $sum: 1 },
          },
        }
      );
    }

    pipeline.push({ $sort: { pendapatanTotal: -1 } });

    const rows = await SaleRecord.aggregate(pipeline);
    return NextResponse.json({ success: true, period, by, items: rows });
  } catch (error) {
    console.error("GET /api/kpi/performance/composition error:", error);
    return NextResponse.json({ success: false, error: "Gagal membuat komposisi" }, { status: 500 });
  }
}
